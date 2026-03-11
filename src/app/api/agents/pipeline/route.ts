import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildAdWingGraph } from "@/agents/graph";
import {
  mockAccountHealth,
  mockCompetitorInsight,
  mockAdCopyBatch,
  mockStrategyReport,
  mockBudgetRecommendation,
} from "@/agents/mock-data";

const isDemoMode = !process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 3000));
    return NextResponse.json({
      runId: "demo-pipeline",
      demo: true,
      accountHealth: mockAccountHealth,
      competitorInsight: mockCompetitorInsight,
      adCopyBatch: mockAdCopyBatch,
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
      crewType: "FULL_PIPELINE",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    let accountHealth;
    let competitorInsight;
    let adCopyBatch;
    let strategyReport;
    let budgetRecommendation;

    {
      const store = await db.store.findFirst({ where: { userId } });
      const adAccounts = await db.adAccount.findMany({ where: { userId } });
      const subscription = await db.subscription.findUnique({ where: { userId } });

      const products = store
        ? await db.product.findMany({ where: { storeId: store.id }, take: 20 })
        : [];

      const graph = buildAdWingGraph();
      const result = await graph.invoke({
        userId,
        storeId: store?.id,
        adAccountIds: adAccounts.map((a) => a.id),
        planTier: (subscription?.plan as "STARTER" | "GROWTH" | "SCALE") ?? "STARTER",
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
      adCopyBatch = result.adCopyBatch;
      strategyReport = result.strategyReport;
      budgetRecommendation = result.budgetRecommendation;
    }

    // Save ad copies
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

    // Save strategy report
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
        output: JSON.stringify({
          accountHealth,
          competitorInsight,
          adCopyCount: adCopyBatch?.variants.length ?? 0,
          strategyReport,
          budgetRecommendation,
        }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      demo: isDemoMode,
      accountHealth,
      competitorInsight,
      adCopyBatch,
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
      { error: "Pipeline failed", runId: agentRun.id },
      { status: 500 }
    );
  }
}
