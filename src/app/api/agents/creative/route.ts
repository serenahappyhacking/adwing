import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildCreativeGraph } from "@/agents/graph";
import { mockAdCopyBatch } from "@/agents/mock-data";

const isDemoMode = !process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 2000));
    return NextResponse.json({
      runId: "demo-creative",
      demo: true,
      adCopyBatch: mockAdCopyBatch,
      iterations: 2,
    });
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Safely parse body (may be empty)
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // No body sent — that's fine
  }

  const agentRun = await db.agentRun.create({
    data: {
      userId,
      crewType: "CREATIVE",
      status: "RUNNING",
      startedAt: new Date(),
      input: JSON.stringify(body),
    },
  });

  try {
    let adCopyBatch;
    let creativeIterations = 0;

    {
      const latestIntelRun = await db.agentRun.findFirst({
        where: { userId, crewType: "INTELLIGENCE", status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
      });

      const store = await db.store.findFirst({ where: { userId } });
      const products = store
        ? await db.product.findMany({ where: { storeId: store.id }, take: 10 })
        : [];

      const intelOutput = latestIntelRun?.output
        ? JSON.parse(latestIntelRun.output as string)
        : null;

      const graph = buildCreativeGraph();
      const result = await graph.invoke({
        userId,
        storeId: store?.id,
        adAccountIds: [],
        planTier: "GROWTH",
        productCatalog: products.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? "",
          price: p.price ?? 0,
          productType: p.productType ?? "",
          tags: typeof p.tags === "string" ? p.tags.split(",").filter(Boolean) : [],
          imageUrl: p.imageUrl ?? undefined,
        })),
        salesData: [],
        accountHealth: intelOutput?.accountHealth ?? null,
        competitorInsight: intelOutput?.competitorInsight ?? null,
      });

      adCopyBatch = result.adCopyBatch;
      creativeIterations = result.creativeIterations ?? 0;
    }

    // Save generated ad copies to DB
    if (adCopyBatch?.variants) {
      for (const variant of adCopyBatch.variants) {
        await db.adCopy.create({
          data: {
            agentRunId: agentRun.id,
            headline: variant.headline,
            primaryText: variant.primaryText,
            description: variant.description,
            cta: variant.cta,
            hook: variant.hook,
            format: variant.format,
            language: variant.language,
            qualityScore: variant.qualityScore,
            metadata: JSON.stringify({
              hypothesis: variant.hypothesis,
              targetAudience: variant.targetAudience,
            }),
          },
        });
      }
    }

    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: JSON.stringify({ adCopyBatch }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      demo: isDemoMode,
      adCopyBatch,
      iterations: creativeIterations,
    });
  } catch (error) {
    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: "Creative agent failed", runId: agentRun.id },
      { status: 500 }
    );
  }
}
