import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">AdWing</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
        <div className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
          AI-powered advertising for Shopify sellers
        </div>
        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
          Your AI Media Buyer at{" "}
          <span className="text-primary">1/30th the Cost</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          AdWing automates your entire ad workflow: competitor analysis, ad copy
          generation, budget optimization, and performance reporting. All from
          one dashboard, powered by multi-agent AI.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/auth/signin">
            <Button size="lg">Start 7-Day Free Trial</Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline">
              See How It Works
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. Works with Meta, Google & TikTok Ads.
        </p>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            TRUSTED BY SHOPIFY SELLERS SPENDING $1K-$50K/MO ON ADS
          </p>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { metric: "15%+", label: "Avg ROAS Improvement" },
              { metric: "10hrs", label: "Saved Per Week" },
              { metric: "$99/mo", label: "vs $3-5K Media Buyer" },
              { metric: "24/7", label: "Always-On Optimization" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.metric}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold">4 AI Crews Working for You</h2>
          <p className="mt-4 text-muted-foreground">
            Not a single chatbot — a coordinated multi-agent system that reads your data,
            scouts competitors, generates creatives, and optimizes spend.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Intelligence Crew",
              description:
                "Connects to your ad accounts and Shopify store. Analyzes 90 days of data to build a performance baseline. Weekly health score with actionable alerts.",
              features: ["Performance audit", "Product-level ROAS", "Anomaly detection"],
            },
            {
              title: "Creative Crew",
              description:
                "Generates 10+ ad variants per cycle with headlines, hooks, and copy. Uses reflexion — an AI evaluator scores and refines output until it meets quality standards.",
              features: ["10+ variants per cycle", "Brand voice matching", "A/B test generation"],
            },
            {
              title: "Strategy Crew",
              description:
                "Recommends budget allocation, campaign structure changes, and audience strategies. Produces weekly reports with before/after comparisons.",
              features: ["Budget optimization", "Audience planning", "Test prioritization"],
            },
            {
              title: "Competitor Scan",
              description:
                "Scans Meta Ad Library and public data to surface what's working in your niche. Identifies gaps competitors are missing.",
              features: ["Ad creative tracking", "Trend identification", "Gap analysis"],
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-8"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
              <ul className="mt-4 space-y-2">
                {feature.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">5 Minutes to Value</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Connect Your Store",
                description: "Install from Shopify App Store. Connect your ad accounts (Meta, Google, TikTok).",
              },
              {
                step: "2",
                title: "AI Runs Initial Audit",
                description: "Intelligence Crew analyzes 90 days of data. Get your Account Health Score in 2-5 minutes.",
              },
              {
                step: "3",
                title: "Review & Approve",
                description: "AI proposes ad copy, budget changes, and strategies. You preview and approve before anything goes live.",
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <h2 className="text-center text-3xl font-bold">Simple, Transparent Pricing</h2>
        <p className="mt-4 text-center text-muted-foreground">
          7-day free trial. No credit card required. Cancel anytime.
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "$49",
              description: "For stores getting started with ads",
              features: [
                "Up to $3K/mo ad spend",
                "Meta + Google",
                "300 ad copy generations/mo",
                "1 competitor niche",
                "Weekly strategy reports",
                "1 Shopify store",
              ],
            },
            {
              name: "Growth",
              price: "$99",
              description: "For growing D2C brands",
              popular: true,
              features: [
                "Up to $20K/mo ad spend",
                "Meta + Google + TikTok",
                "1,000 ad copy generations/mo",
                "5 competitor niches",
                "Daily strategy reports",
                "5+ A/B test variants",
              ],
            },
            {
              name: "Scale",
              price: "$199",
              description: "For scaling operations",
              features: [
                "Unlimited ad spend",
                "All platforms",
                "Unlimited generations",
                "Unlimited competitor scan",
                "Real-time reports",
                "3 Shopify stores",
                "White-label reports",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-8 ${
                plan.popular ? "border-primary shadow-lg ring-1 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <Link href="/auth/signin">
                <Button
                  className="mt-6 w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Start Free Trial
                </Button>
              </Link>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            Stop Wasting Ad Spend. Start Growing.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join Shopify sellers who replaced their media buyer with AdWing.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="mt-8">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary" />
            <span className="font-semibold text-foreground">AdWing</span>
          </div>
          <p>AI-Powered Advertising Automation for Shopify D2C Sellers</p>
          <p>&copy; {new Date().getFullYear()} AdWing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
