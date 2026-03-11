"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdVariant {
  headline: string;
  primaryText: string;
  description?: string;
  cta: string;
  hook: string;
  format: string;
  qualityScore?: number;
  hypothesis?: string;
  targetAudience?: string;
}

export default function CreativePage() {
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  async function generateAdCopy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Failed (${res.status})`);
      } else if (data.adCopyBatch?.variants) {
        setVariants(data.adCopyBatch.variants);
        setIterations(data.iterations ?? 0);
        setIsDemo(data.demo ?? false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setLoading(false);
  }

  function getScoreColor(score?: number) {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ad Creative Generator</h2>
          <p className="text-muted-foreground">
            Generate high-converting ad copy powered by the Creative Crew (Copywriter + Evaluator reflexion loop)
          </p>
        </div>
        <Button onClick={generateAdCopy} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating...
            </span>
          ) : (
            "Generate Ad Copy"
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Error: {error}
        </div>
      )}

      {isDemo && variants.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <strong>Demo Mode:</strong> Showing sample ad copies. Add{" "}
          <code className="rounded bg-yellow-100 px-1">ANTHROPIC_API_KEY</code> to{" "}
          <code className="rounded bg-yellow-100 px-1">.env</code> for AI-generated results.
        </div>
      )}

      {iterations > 0 && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          Creative Crew completed {iterations} reflexion iteration(s). Generated {variants.length} approved variants.
        </div>
      )}

      {variants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {variants.map((variant, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{variant.headline}</CardTitle>
                    <CardDescription className="mt-1">
                      Hook: &quot;{variant.hook}&quot;
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{variant.format.replace("_", " ")}</Badge>
                    {variant.qualityScore !== undefined && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getScoreColor(
                          variant.qualityScore
                        )}`}
                      >
                        {variant.qualityScore.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Primary Text</p>
                  <p className="mt-1 text-sm">{variant.primaryText}</p>
                </div>
                {variant.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm">{variant.description}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge>{variant.cta}</Badge>
                  {variant.targetAudience && (
                    <span className="text-xs text-muted-foreground">
                      Target: {variant.targetAudience}
                    </span>
                  )}
                </div>
                {variant.hypothesis && (
                  <div className="rounded bg-muted p-2 text-xs text-muted-foreground">
                    Testing: {variant.hypothesis}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1">
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <svg className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              Click &quot;Generate Ad Copy&quot; to create your first batch of ad variants.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The Creative Crew will generate 10+ variants with quality scoring.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
