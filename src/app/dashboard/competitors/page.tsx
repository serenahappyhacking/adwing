"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompetitorData {
  competitors: Array<{
    name: string;
    adCount: number;
    topHooks: string[];
    formats: string[];
    estimatedSpend?: string;
  }>;
  trends: Array<{
    trend: string;
    relevance: string;
    examples: string[];
  }>;
  gaps: string[];
}

export default function CompetitorsPage() {
  const [data, setData] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState(false);

  async function runScan() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/intelligence", { method: "POST" });
      const result = await res.json();
      if (result.competitorInsight) {
        setData(result.competitorInsight);
      }
    } catch (error) {
      console.error("Competitor scan failed:", error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competitor Intelligence</h2>
          <p className="text-muted-foreground">
            See what&apos;s working in your niche and find untapped opportunities
          </p>
        </div>
        <Button onClick={runScan} disabled={loading}>
          {loading ? "Scanning..." : "Run Competitor Scan"}
        </Button>
      </div>

      {data ? (
        <>
          {/* Competitors */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.competitors.map((comp) => (
              <Card key={comp.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <CardDescription>
                    {comp.adCount} ads tracked
                    {comp.estimatedSpend && ` | Est. ${comp.estimatedSpend}/mo`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Top Hooks</p>
                    <ul className="mt-1 space-y-1">
                      {comp.topHooks.map((hook) => (
                        <li key={hook} className="text-sm">&quot;{hook}&quot;</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Formats</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {comp.formats.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Niche Trends</CardTitle>
              <CardDescription>What&apos;s working right now in your category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trends.map((trend) => (
                  <div key={trend.trend} className="flex items-start gap-3 rounded-lg border p-4">
                    <Badge
                      variant={
                        trend.relevance === "high"
                          ? "default"
                          : trend.relevance === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {trend.relevance}
                    </Badge>
                    <div>
                      <p className="font-medium">{trend.trend}</p>
                      <ul className="mt-1 space-y-1">
                        {trend.examples.map((ex) => (
                          <li key={ex} className="text-sm text-muted-foreground">
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gaps */}
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
              <CardDescription>Opportunities competitors are missing</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.gaps.map((gap) => (
                  <li key={gap} className="flex items-start gap-2 text-sm">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {gap}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <svg className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              Run a competitor scan to discover what&apos;s working in your niche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
