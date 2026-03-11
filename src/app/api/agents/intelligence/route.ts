import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildIntelligenceGraph } from "@/agents/graph";
import { mockAccountHealth, mockCompetitorInsight } from "@/agents/mock-data";

const isDemoMode = !process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({
      runId: "demo-intelligence",
      demo: true,
      accountHealth: mockAccountHealth,
      competitorInsight: mockCompetitorInsight,
    });
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const agentRun = await db.agentRun.create({
    data: {
      userId,
      crewType: "INTELLIGENCE",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    let accountHealth;
    let competitorInsight;

    {
      const store = await db.store.findFirst({ where: { userId } });
      const adAccounts = await db.adAccount.findMany({ where: { userId } });
      const products = store
        ? await db.product.findMany({ where: { storeId: store.id }, take: 20 })
        : [];

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

      accountHealth = result.accountHealth;
      competitorInsight = result.competitorInsight;

      if (store && accountHealth) {
        await db.store.update({
          where: { id: store.id },
          data: { healthScore: accountHealth.overallScore },
        });
      }
    }

    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: JSON.stringify({ accountHealth, competitorInsight }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      demo: isDemoMode,
      accountHealth,
      competitorInsight,
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
