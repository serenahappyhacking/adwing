import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildAdWingGraph } from "@/agents/graph";

/**
 * Full pipeline endpoint — runs all 3 crews in sequence.
 * Used for the weekly strategy cycle.
 */
export async function POST(req: NextRequest) {
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

    // Save ad copies
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

    // Update store health score
    if (store && result.accountHealth) {
      await db.store.update({
        where: { id: store.id },
        data: { healthScore: result.accountHealth.overallScore },
      });
    }

    await db.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "COMPLETED",
        output: JSON.stringify({
          accountHealth: result.accountHealth,
          competitorInsight: result.competitorInsight,
          adCopyCount: result.adCopyBatch?.variants.length ?? 0,
          strategyReport: result.strategyReport,
          budgetRecommendation: result.budgetRecommendation,
        }),
        completedAt: new Date(),
        durationMs: Date.now() - agentRun.startedAt!.getTime(),
      },
    });

    return NextResponse.json({
      runId: agentRun.id,
      accountHealth: result.accountHealth,
      competitorInsight: result.competitorInsight,
      adCopyBatch: result.adCopyBatch,
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
      { error: "Pipeline failed", runId: agentRun.id },
      { status: 500 }
    );
  }
}
