import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildStrategyGraph } from "@/agents/graph";
import { mockStrategyReport, mockBudgetRecommendation } from "@/agents/mock-data";

const isDemoMode = !process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({
      runId: "demo-strategy",
      demo: true,
      strategyReport: mockStrategyReport,
      budgetRecommendation: mockBudgetRecommendation,
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
      crewType: "STRATEGY",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    let strategyReport;
    let budgetRecommendation;

    {
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

      strategyReport = result.strategyReport;
      budgetRecommendation = result.budgetRecommendation;
    }

    if (strategyReport) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());

      await db.strategyReport.create({
        data: {
          userId,
          weekStart,
          healthScore: strategyReport.healthScore,
          totalSpend: strategyReport.keyMetrics.totalSpend,
          totalRevenue: strategyReport.keyMetrics.totalRevenue,
          overallRoas: strategyReport.keyMetrics.overallRoas,
          recommendations: JSON.stringify(strategyReport.recommendations),
          budgetAllocations: JSON.stringify(budgetRecommendation),
          testSuggestions: JSON.stringify(strategyReport.testSuggestions),
        },
      });
    }

    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: JSON.stringify({ strategyReport, budgetRecommendation }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      demo: isDemoMode,
      strategyReport,
      budgetRecommendation,
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
