"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { useTranslation } from "@/i18n/context";

export default function LandingPage() {
  const { t } = useTranslation();

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
              {t("landing.nav.features")}
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              {t("landing.nav.pricing")}
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              {t("landing.nav.howItWorks")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost">{t("landing.nav.signIn")}</Button>
            </Link>
            <Link href="/auth/signin">
              <Button>{t("landing.cta.trial")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
        <div className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
          {t("landing.badge")}
        </div>
        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
          {t("landing.hero.title1")}
          <span className="text-primary">{t("landing.hero.highlight")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("landing.hero.subtitle")}
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/auth/signin">
            <Button size="lg">{t("landing.cta.trial")}</Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline">
              {t("landing.cta.how")}
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("landing.cta.noCreditCard")}
        </p>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {t("landing.social.trusted")}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { metric: "15%+", labelKey: "landing.social.roas" as const },
              { metric: "10hrs", labelKey: "landing.social.saved" as const },
              { metric: "$99/mo", labelKey: "landing.social.cost" as const },
              { metric: "24/7", labelKey: "landing.social.always" as const },
            ].map((stat) => (
              <div key={stat.labelKey}>
                <div className="text-3xl font-bold text-primary">{stat.metric}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t("landing.features.title")}</h2>
          <p className="mt-4 text-muted-foreground">
            {t("landing.features.subtitle")}
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {[
            {
              titleKey: "landing.features.intel.title" as const,
              descKey: "landing.features.intel.desc" as const,
              featureKeys: ["landing.features.intel.f1", "landing.features.intel.f2", "landing.features.intel.f3"] as const,
            },
            {
              titleKey: "landing.features.creative.title" as const,
              descKey: "landing.features.creative.desc" as const,
              featureKeys: ["landing.features.creative.f1", "landing.features.creative.f2", "landing.features.creative.f3"] as const,
            },
            {
              titleKey: "landing.features.strategy.title" as const,
              descKey: "landing.features.strategy.desc" as const,
              featureKeys: ["landing.features.strategy.f1", "landing.features.strategy.f2", "landing.features.strategy.f3"] as const,
            },
            {
              titleKey: "landing.features.competitor.title" as const,
              descKey: "landing.features.competitor.desc" as const,
              featureKeys: ["landing.features.competitor.f1", "landing.features.competitor.f2", "landing.features.competitor.f3"] as const,
            },
          ].map((feature) => (
            <div
              key={feature.titleKey}
              className="rounded-lg border bg-card p-8"
            >
              <h3 className="text-xl font-semibold">{t(feature.titleKey)}</h3>
              <p className="mt-2 text-muted-foreground">{t(feature.descKey)}</p>
              <ul className="mt-4 space-y-2">
                {feature.featureKeys.map((fk) => (
                  <li key={fk} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t(fk)}
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
          <h2 className="text-center text-3xl font-bold">{t("landing.howItWorks.title")}</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: "1", titleKey: "landing.howItWorks.step1.title" as const, descKey: "landing.howItWorks.step1.desc" as const },
              { step: "2", titleKey: "landing.howItWorks.step2.title" as const, descKey: "landing.howItWorks.step2.desc" as const },
              { step: "3", titleKey: "landing.howItWorks.step3.title" as const, descKey: "landing.howItWorks.step3.desc" as const },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <h2 className="text-center text-3xl font-bold">{t("landing.pricing.title")}</h2>
        <p className="mt-4 text-center text-muted-foreground">
          {t("landing.pricing.subtitle")}
        </p>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              nameKey: "landing.pricing.starter" as const,
              price: "$49",
              descKey: "landing.pricing.starter.desc" as const,
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
              nameKey: "landing.pricing.growth" as const,
              price: "$99",
              descKey: "landing.pricing.growth.desc" as const,
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
              nameKey: "landing.pricing.scale" as const,
              price: "$199",
              descKey: "landing.pricing.scale.desc" as const,
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
              key={plan.nameKey}
              className={`rounded-lg border p-8 ${
                plan.popular ? "border-primary shadow-lg ring-1 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {t("landing.pricing.growth.popular")}
                </div>
              )}
              <h3 className="text-xl font-semibold">{t(plan.nameKey)}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{t("landing.pricing.month")}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t(plan.descKey)}</p>
              <Link href="/auth/signin">
                <Button
                  className="mt-6 w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {t("landing.pricing.startTrial")}
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
            {t("landing.finalCta.title")}
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            {t("landing.finalCta.subtitle")}
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="mt-8">
              {t("landing.finalCta.button")}
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
          <p>{t("landing.footer.tagline")}</p>
          <p>&copy; {new Date().getFullYear()} AdWing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
