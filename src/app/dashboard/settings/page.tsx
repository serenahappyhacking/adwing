"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your Shopify store and ad platform connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <span className="text-lg font-bold text-green-700">S</span>
              </div>
              <div>
                <p className="font-medium">Shopify Store</p>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/onboarding"}>
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-lg font-bold text-blue-700">f</span>
              </div>
              <div>
                <p className="font-medium">Meta Ads (Facebook/Instagram)</p>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/api/meta/connect"}>
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <span className="text-lg font-bold text-red-700">G</span>
              </div>
              <div>
                <p className="font-medium">Google Ads</p>
                <p className="text-sm text-muted-foreground">Coming in Phase 3</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-lg font-bold text-gray-700">T</span>
              </div>
              <div>
                <p className="font-medium">TikTok Ads</p>
                <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your AdWing plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Free Trial</p>
              <p className="text-sm text-muted-foreground">
                7 days remaining. Upgrade to continue using AdWing.
              </p>
            </div>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Customize how AI agents work for your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Strategy Cycle</p>
              <p className="text-sm text-muted-foreground">
                Automatically run the full pipeline every Monday
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Reports</p>
              <p className="text-sm text-muted-foreground">
                Receive weekly strategy reports via email
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Anomaly Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when spend or ROAS changes significantly
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
