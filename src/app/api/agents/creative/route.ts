import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildCreativeGraph } from "@/agents/graph";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

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
    // Get the latest intelligence run for context
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

    // Save generated ad copies to DB
    if (result.adCopyBatch?.variants) {
      for (const variant of result.adCopyBatch.variants) {
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
        output: JSON.stringify({ adCopyBatch: result.adCopyBatch }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      adCopyBatch: result.adCopyBatch,
      iterations: result.creativeIterations,
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
