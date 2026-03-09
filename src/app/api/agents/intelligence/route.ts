import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildIntelligenceGraph } from "@/agents/graph";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Create agent run record
  const agentRun = await db.agentRun.create({
    data: {
      userId,
      crewType: "INTELLIGENCE",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    // Gather store data
    const store = await db.store.findFirst({ where: { userId } });
    const adAccounts = await db.adAccount.findMany({ where: { userId } });

    const products = store
      ? await db.product.findMany({
          where: { storeId: store.id },
          take: 20,
        })
      : [];

    // Build and run the intelligence graph
    const graph = buildIntelligenceGraph();
    const result = await graph.invoke({
      userId,
      storeId: store?.id,
      adAccountIds: adAccounts.map((a) => a.id),
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
    });

    // Update health score on store
    if (store && result.accountHealth) {
      await db.store.update({
        where: { id: store.id },
        data: { healthScore: result.accountHealth.overallScore },
      });
    }

    // Complete agent run
    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: JSON.stringify({
          accountHealth: result.accountHealth,
          competitorInsight: result.competitorInsight,
        }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      accountHealth: result.accountHealth,
      competitorInsight: result.competitorInsight,
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
      { error: "Intelligence agent failed", runId: agentRun.id },
      { status: 500 }
    );
  }
}
