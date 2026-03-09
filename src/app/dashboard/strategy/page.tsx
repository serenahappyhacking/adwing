"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StrategyData {
  strategyReport: {
    healthScore: number;
    summary: string;
    keyMetrics: {
      totalSpend: number;
      totalRevenue: number;
      overallRoas: number;
      totalConversions: number;
    };
    recommendations: Array<{
      priority: string;
      category: string;
      title: string;
      description: string;
      expectedImpact: string;
    }>;
    testSuggestions: Array<{
      name: string;
      hypothesis: string;
      variant: string;
      expectedLift: string;
      priority: number;
    }>;
  };
  budgetRecommendation: {
    allocations: Array<{
      platform: string;
      campaignName: string;
      currentBudget: number;
      recommendedBudget: number;
      reason: string;
    }>;
    totalBudget: number;
    projectedRoas: number;
  };
}

export default function StrategyPage() {
  const [data, setData] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(false);

  async function runStrategy() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/strategy", { method: "POST" });
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Strategy agent failed:", error);
    }
    setLoading(false);
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Strategy & Optimization</h2>
          <p className="text-muted-foreground">
            AI-powered budget allocation and campaign strategy recommendations
          </p>
        </div>
        <Button onClick={runStrategy} disabled={loading}>
          {loading ? "Generating Report..." : "Generate Strategy Report"}
        </Button>
      </div>

      {data?.strategyReport ? (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Strategy Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{data.strategyReport.summary}</p>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{data.strategyReport.healthScore}</p>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{fmt(data.strategyReport.keyMetrics.totalSpend)}</p>
                  <p className="text-xs text-muted-foreground">Total Spend</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{fmt(data.strategyReport.keyMetrics.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{data.strategyReport.keyMetrics.overallRoas.toFixed(1)}x</p>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Prioritized actions to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.strategyReport.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                    <Badge
                      variant={
                        rec.priority === "high"
                          ? "destructive"
                          : rec.priority === "medium"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rec.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {rec.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                      <p className="mt-2 text-xs text-primary">
                        Expected impact: {rec.expectedImpact}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation */}
          {data.budgetRecommendation && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Reallocation</CardTitle>
                <CardDescription>
                  Total Budget: {fmt(data.budgetRecommendation.totalBudget)} | Projected ROAS:{" "}
                  {data.budgetRecommendation.projectedRoas.toFixed(1)}x
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.budgetRecommendation.allocations.map((alloc, i) => {
                    const change = alloc.recommendedBudget - alloc.currentBudget;
                    const changePercent =
                      alloc.currentBudget > 0
                        ? ((change / alloc.currentBudget) * 100).toFixed(0)
                        : "N/A";
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{alloc.campaignName}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {alloc.platform}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              {fmt(alloc.currentBudget)}
                            </span>
                            <span className="font-semibold">{fmt(alloc.recommendedBudget)}</span>
                            <span
                              className={`text-xs font-medium ${
                                change > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {change > 0 ? "+" : ""}
                              {changePercent}%
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{alloc.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>A/B Test Priority Matrix</CardTitle>
              <CardDescription>Tests ranked by expected impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.strategyReport.testSuggestions
                  .sort((a, b) => b.priority - a.priority)
                  .map((test, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{test.name}</p>
                        <Badge>Priority {test.priority}/10</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {test.hypothesis}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Variant: {test.variant}</span>
                        <span>Expected Lift: {test.expectedLift}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <svg className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              Run the Intelligence crew first, then generate your strategy report.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
