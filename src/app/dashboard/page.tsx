"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  async function runAgent(crew: string) {
    setRunningAgent(crew);
    try {
      await fetch(`/api/agents/${crew}`, { method: "POST" });
    } catch (error) {
      console.error(`${crew} agent failed:`, error);
    }
    setRunningAgent(null);
  }

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
              <span className="text-4xl font-bold text-green-500">--</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Run audit to calculate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spend (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="mt-1 text-xs text-muted-foreground">Connect ad accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ROAS (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="mt-1 text-xs text-muted-foreground">Connect ad accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ad Copies Generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="mt-1 text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agents</CardTitle>
          <CardDescription>
            Run individual crews or the full pipeline
          </CardDescription>
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
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.agents.map((agent) => (
                    <Badge key={agent} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => runAgent(item.crew)}
                  disabled={runningAgent !== null}
                >
                  {runningAgent === item.crew ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Running...
                    </span>
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
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No agent runs yet. Click &quot;Run&quot; above to get started.
          </div>
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
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Run the Intelligence Crew to surface alerts and opportunities.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
