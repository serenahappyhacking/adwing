"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Step = "store" | "ads" | "audit" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("store");
  const [shopDomain, setShopDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  async function connectShopify() {
    if (!shopDomain) return;
    setLoading(true);
    // In production, this would redirect to Shopify OAuth
    window.location.href = `/api/shopify/connect?shop=${shopDomain}.myshopify.com`;
  }

  function connectMeta() {
    window.location.href = "/api/meta/connect";
  }

  async function runInitialAudit() {
    setStep("audit");
    // Simulate audit progress
    for (let i = 0; i <= 100; i += 5) {
      setAuditProgress(i);
      await new Promise((r) => setTimeout(r, 200));
    }

    // Trigger the intelligence agent
    try {
      await fetch("/api/agents/intelligence", { method: "POST" });
    } catch {
      // Continue even if audit fails — user can run it later
    }

    setStep("complete");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Set Up Your AdWing</CardTitle>
          <CardDescription>
            {step === "store" && "Step 1 of 3: Connect your Shopify store"}
            {step === "ads" && "Step 2 of 3: Connect your ad accounts"}
            {step === "audit" && "Step 3 of 3: Running initial audit..."}
            {step === "complete" && "You're all set!"}
          </CardDescription>
          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {["store", "ads", "audit"].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  ["store", "ads", "audit", "complete"].indexOf(step) > i
                    ? "bg-primary"
                    : step === s
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === "store" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Shopify Store URL</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="your-store"
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">
                    .myshopify.com
                  </span>
                </div>
              </div>
              <Button onClick={connectShopify} className="w-full" disabled={loading || !shopDomain}>
                {loading ? "Connecting..." : "Connect Shopify Store"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("ads")}>
                Skip for now
              </Button>
            </div>
          )}

          {step === "ads" && (
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={connectMeta}>
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">
                  f
                </div>
                Connect Meta (Facebook/Instagram)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white text-xs font-bold">
                  G
                </div>
                Connect Google Ads (Coming in Phase 3)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-black text-white text-xs font-bold">
                  T
                </div>
                Connect TikTok Ads (Coming in Phase 4)
              </Button>
              <Button onClick={runInitialAudit} className="w-full">
                Continue to Audit
              </Button>
            </div>
          )}

          {step === "audit" && (
            <div className="space-y-6 py-8 text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <div>
                <p className="font-medium">Intelligence Crew is analyzing your data...</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This typically takes 2-5 minutes
                </p>
              </div>
              <div className="mx-auto w-full max-w-xs">
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${auditProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{auditProgress}% complete</p>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-6 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">Your AdWing is ready!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Head to your dashboard to see insights and start generating ads.
                </p>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
