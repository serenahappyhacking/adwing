import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../card";
import { Button } from "../button";
import { Badge } from "../badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card content area.</p>
      </CardContent>
    </Card>
  ),
};

export const HealthScoreCard: Story = {
  name: "Health Score",
  render: () => (
    <Card className="w-[200px]">
      <CardHeader className="pb-2">
        <CardDescription>Health Score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-green-500">72</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Last updated just now</p>
      </CardContent>
    </Card>
  ),
};

export const MetricCards: Story = {
  name: "Dashboard Metric Cards",
  render: () => (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Health Score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-green-500">72</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Last updated just now</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Spend (30d)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$12,450</div>
          <p className="mt-1 text-xs text-muted-foreground">From strategy report</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>ROAS (30d)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">3.12x</div>
          <p className="mt-1 text-xs text-muted-foreground">From strategy report</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Ad Copies Generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">5</div>
          <p className="mt-1 text-xs text-muted-foreground">Generated just now</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const AgentCrewCard: Story = {
  name: "Agent Crew Runner",
  render: () => (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[
        {
          name: "Intelligence Crew",
          description: "Analyze ad accounts & Shopify data",
          agents: ["Account Analyst", "Market Scanner"],
          completed: true,
          demo: true,
        },
        {
          name: "Creative Crew",
          description: "Generate ad copy variants",
          agents: ["Copywriter", "Evaluator (Reflexion)"],
          completed: false,
          demo: false,
        },
        {
          name: "Strategy Crew",
          description: "Budget & audience recommendations",
          agents: ["Budget Optimizer", "Strategy Reporter"],
          completed: false,
          demo: false,
        },
        {
          name: "Full Pipeline",
          description: "Run all crews in sequence",
          agents: ["All agents"],
          completed: false,
          demo: false,
        },
      ].map((item) => (
        <div key={item.name} className="rounded-lg border p-4">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {item.agents.map((agent) => (
              <Badge key={agent} variant="secondary" className="text-xs">
                {agent}
              </Badge>
            ))}
          </div>
          {item.completed && (
            <p className="mt-2 text-xs text-green-600">
              Completed {item.demo ? "(demo)" : ""}
            </p>
          )}
          <Button size="sm" className="mt-3 w-full">
            {item.completed ? "Run Again" : "Run"}
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const AdVariantCard: Story = {
  name: "Ad Copy Variant",
  render: () => (
    <Card className="w-[400px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Transform Your Skin in 7 Days</CardTitle>
            <CardDescription className="mt-1">
              Hook: &quot;What if your skincare actually worked?&quot;
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">SINGLE IMAGE</Badge>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
              8.2/10
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Primary Text</p>
          <p className="mt-1 text-sm">
            Tired of products that promise everything and deliver nothing? Our clinically-proven
            formula uses 3 active ingredients that work synergistically to restore your natural
            glow. Join 50,000+ happy customers.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Description</p>
          <p className="mt-1 text-sm">
            Clinically proven. Dermatologist recommended. 30-day money-back guarantee.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Badge>SHOP_NOW</Badge>
          <span className="text-xs text-muted-foreground">
            Target: Women 25-44, skincare enthusiasts
          </span>
        </div>
        <div className="rounded bg-muted p-2 text-xs text-muted-foreground">
          Testing: Specificity (7 days) + social proof (50K customers) drives urgency
        </div>
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
  ),
};

export const AlertCard: Story = {
  name: "Alerts & Opportunities",
  render: () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Alerts & Opportunities</CardTitle>
        <CardDescription>
          Anomalies and improvement suggestions from the Intelligence Crew
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <span className="font-medium">critical:</span> Facebook ad frequency exceeding 3.5
            — creative fatigue risk
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            <span className="font-medium">warning:</span> CPA increased 23% week-over-week on
            Meta campaigns
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <span className="font-medium">info:</span> Google Shopping ROAS trending upward
            (+12%)
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const BudgetAllocationCard: Story = {
  name: "Budget Reallocation",
  render: () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Budget Reallocation</CardTitle>
        <CardDescription>
          Total Budget: $12,450 | Projected ROAS: 3.5x
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { name: "Google Shopping", platform: "GOOGLE", current: 3735, recommended: 5603, reason: "Highest ROAS (4.2x)" },
            { name: "Meta — Prospecting", platform: "META", current: 4980, recommended: 3113, reason: "CPA trending up, reduce exposure" },
            { name: "Meta — Retargeting", platform: "META", current: 0, recommended: 1868, reason: "New: recover abandoned carts" },
          ].map((alloc) => {
            const change = alloc.recommended - alloc.current;
            const pct = alloc.current > 0 ? ((change / alloc.current) * 100).toFixed(0) : "New";
            return (
              <div key={alloc.name} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{alloc.name}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{alloc.platform}</Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ${alloc.current.toLocaleString()}
                    </span>
                    <span className="font-semibold">${alloc.recommended.toLocaleString()}</span>
                    <span className={`text-xs font-medium ${change > 0 ? "text-green-600" : "text-red-600"}`}>
                      {typeof pct === "string" && pct === "New" ? "New" : `${change > 0 ? "+" : ""}${pct}%`}
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
  ),
};

export const OnboardingStep: Story = {
  name: "Onboarding Flow",
  render: () => (
    <div className="flex items-center justify-center bg-muted/50 p-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Set Up Your AdWing</CardTitle>
          <CardDescription>Step 2 of 3: Connect your ad accounts</CardDescription>
          <div className="mt-4 flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-primary" />
            <div className="h-1.5 flex-1 rounded-full bg-primary/50" />
            <div className="h-1.5 flex-1 rounded-full bg-muted" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">f</div>
              Connect Meta (Facebook/Instagram)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white text-xs font-bold">G</div>
              Connect Google Ads (Coming Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-black text-white text-xs font-bold">T</div>
              Connect TikTok Ads (Coming Soon)
            </Button>
            <Button className="w-full">Continue to Audit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const DemoBanner: Story = {
  name: "Demo Mode Banner",
  render: () => (
    <div className="w-full max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
      <strong>Demo Mode:</strong> Showing sample data. Add{" "}
      <code className="rounded bg-yellow-100 px-1">ANTHROPIC_API_KEY</code> to{" "}
      <code className="rounded bg-yellow-100 px-1">.env</code> for live AI agent results.
    </div>
  ),
};

export const CompetitorCard: Story = {
  name: "Competitor Intelligence",
  render: () => (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      {[
        {
          name: "GlowSkin Co.",
          adCount: 47,
          spend: "$15K-25K/mo",
          hooks: ["Your skin deserves better than chemicals", "The 5-minute morning routine"],
          formats: ["Single Image", "Video", "Carousel"],
        },
        {
          name: "PureBeauty",
          adCount: 32,
          spend: "$8K-15K/mo",
          hooks: ["The 30-second routine that changed everything", "Dermatologists hate this trick"],
          formats: ["Video", "UGC"],
        },
      ].map((comp) => (
        <Card key={comp.name}>
          <CardHeader>
            <CardTitle className="text-lg">{comp.name}</CardTitle>
            <CardDescription>
              {comp.adCount} ads tracked | Est. {comp.spend}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Top Hooks</p>
              <ul className="mt-1 space-y-1">
                {comp.hooks.map((hook) => (
                  <li key={hook} className="text-sm">&quot;{hook}&quot;</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Formats</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {comp.formats.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
