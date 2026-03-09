import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildStrategyGraph } from "@/agents/graph";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const agentRun = await db.agentRun.create({
    data: {
      userId,
      crewType: "STRATEGY",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    // Get latest intelligence and creative outputs
    const [intelRun, creativeRun] = await Promise.all([
      db.agentRun.findFirst({
        where: { userId, crewType: "INTELLIGENCE", status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
      }),
      db.agentRun.findFirst({
        where: { userId, crewType: "CREATIVE", status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    const intelOutput = intelRun?.output ? JSON.parse(intelRun.output as string) : null;
    const creativeOutput = creativeRun?.output ? JSON.parse(creativeRun.output as string) : null;

    const graph = buildStrategyGraph();
    const result = await graph.invoke({
      userId,
      adAccountIds: [],
      planTier: "GROWTH",
      productCatalog: [],
      salesData: [],
      accountHealth: intelOutput?.accountHealth ?? null,
      competitorInsight: intelOutput?.competitorInsight ?? null,
      adCopyBatch: creativeOutput?.adCopyBatch ?? null,
    });

    // Save strategy report
    if (result.strategyReport) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());

      await db.strategyReport.create({
        data: {
          userId,
          weekStart,
          healthScore: result.strategyReport.healthScore,
          totalSpend: result.strategyReport.keyMetrics.totalSpend,
          totalRevenue: result.strategyReport.keyMetrics.totalRevenue,
          overallRoas: result.strategyReport.keyMetrics.overallRoas,
          recommendations: JSON.stringify(result.strategyReport.recommendations),
          budgetAllocations: JSON.stringify(result.budgetRecommendation),
          testSuggestions: JSON.stringify(result.strategyReport.testSuggestions),
        },
      });
    }

    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: JSON.stringify({
          strategyReport: result.strategyReport,
          budgetRecommendation: result.budgetRecommendation,
        }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      strategyReport: result.strategyReport,
      budgetRecommendation: result.budgetRecommendation,
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
      { error: "Strategy agent failed", runId: agentRun.id },
      { status: 500 }
    );
  }
}
