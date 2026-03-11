"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AccountHealth, AdCopyBatch, StrategyReport } from "@/types";

interface AgentResult {
  runId: string;
  demo?: boolean;
  error?: string;
  accountHealth?: AccountHealth;
  competitorInsight?: unknown;
  adCopyBatch?: AdCopyBatch;
  budgetRecommendation?: unknown;
  strategyReport?: StrategyReport;
}

function getAccountHealth(results: Record<string, AgentResult | null>): AccountHealth | undefined {
  return results.intelligence?.accountHealth ?? results.pipeline?.accountHealth;
}

function getStrategyReport(results: Record<string, AgentResult | null>): StrategyReport | undefined {
  return results.strategy?.strategyReport ?? results.pipeline?.strategyReport;
}

function getAdCopyBatch(results: Record<string, AgentResult | null>): AdCopyBatch | undefined {
  return results.creative?.adCopyBatch ?? results.pipeline?.adCopyBatch;
}

export default function DashboardPage() {
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AgentResult | null>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  async function runAgent(crew: string) {
    setRunningAgent(crew);
    setErrors((prev) => ({ ...prev, [crew]: null }));
    setResults((prev) => ({ ...prev, [crew]: null }));

    try {
      const res = await fetch(`/api/agents/${crew}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [crew]: data.error || `Failed (${res.status})` }));
      } else {
        setResults((prev) => ({ ...prev, [crew]: data }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [crew]: error instanceof Error ? error.message : "Network error",
      }));
    }
    setRunningAgent(null);
  }

  const accountHealth = getAccountHealth(results);
  const strategyReport = getStrategyReport(results);
  const adCopyBatch = getAdCopyBatch(results);

  return (
    <div className="space-y-6">
      {/* Health Score & Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Health Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-500">
                {accountHealth ? String(accountHealth.overallScore) : "--"}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {accountHealth ? "Last updated just now" : "Run audit to calculate"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spend (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {strategyReport
                ? `$${strategyReport.keyMetrics.totalSpend.toLocaleString()}`
                : "--"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {strategyReport ? "From strategy report" : "Connect ad accounts"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ROAS (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {strategyReport
                ? `${strategyReport.keyMetrics.overallRoas.toFixed(2)}x`
                : "--"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {strategyReport ? "From strategy report" : "Connect ad accounts"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ad Copies Generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {adCopyBatch ? String(adCopyBatch.variants.length) : "0"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {adCopyBatch ? "Generated just now" : "This month"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo mode banner */}
      {Object.values(results).some((r) => r?.demo) && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <strong>Demo Mode:</strong> Showing sample data. Add{" "}
          <code className="rounded bg-yellow-100 px-1">ANTHROPIC_API_KEY</code> to{" "}
          <code className="rounded bg-yellow-100 px-1">.env</code> for live AI agent results.
        </div>
      )}

      {/* AI Agents */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agents</CardTitle>
          <CardDescription>Run individual crews or the full pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                crew: "intelligence",
                name: "Intelligence Crew",
                description: "Analyze ad accounts & Shopify data",
                agents: ["Account Analyst", "Market Scanner"],
              },
              {
                crew: "creative",
                name: "Creative Crew",
                description: "Generate ad copy variants",
                agents: ["Copywriter", "Evaluator (Reflexion)"],
              },
              {
                crew: "strategy",
                name: "Strategy Crew",
                description: "Budget & audience recommendations",
                agents: ["Budget Optimizer", "Strategy Reporter"],
              },
              {
                crew: "pipeline",
                name: "Full Pipeline",
                description: "Run all crews in sequence",
                agents: ["All agents"],
              },
            ].map((item) => (
              <div key={item.crew} className="rounded-lg border p-4">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.agents.map((agent) => (
                    <Badge key={agent} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>

                {/* Error message */}
                {errors[item.crew] && (
                  <p className="mt-2 text-xs text-red-600">{errors[item.crew]}</p>
                )}

                {/* Success message */}
                {results[item.crew] && !errors[item.crew] && (
                  <p className="mt-2 text-xs text-green-600">
                    Completed {results[item.crew]?.demo ? "(demo)" : ""}
                  </p>
                )}

                <Button
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => runAgent(item.crew)}
                  disabled={runningAgent !== null}
                >
                  {runningAgent === item.crew ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Running...
                    </span>
                  ) : results[item.crew] ? (
                    "Run Again"
                  ) : (
                    "Run"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Runs</CardTitle>
          <CardDescription>History of your AI agent executions</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(results).filter((k) => results[k]).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(results)
                .filter(([, v]) => v)
                .map(([crew, result]) => (
                  <div key={crew} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <span className="font-medium capitalize">{crew}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        Run #{result?.runId?.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result?.demo && (
                        <Badge variant="outline" className="text-xs">
                          Demo
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No agent runs yet. Click &quot;Run&quot; above to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Opportunities</CardTitle>
          <CardDescription>
            Anomalies and improvement suggestions from the Intelligence Crew
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountHealth ? (
            <div className="space-y-2">
              {accountHealth.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 text-sm ${
                    alert.severity === "critical"
                      ? "border-red-200 bg-red-50 text-red-800"
                      : alert.severity === "medium"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                      : "border-blue-200 bg-blue-50 text-blue-800"
                  }`}
                >
                  <span className="font-medium capitalize">{alert.severity}:</span> {alert.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Run the Intelligence Crew to surface alerts and opportunities.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
