"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <p className="text-muted-foreground">
            View and manage campaigns across all connected ad platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Sync Campaigns</Button>
          <Button>Create Campaign</Button>
        </div>
      </div>

      {/* Platform Filters */}
      <div className="flex gap-2">
        <Badge variant="default" className="cursor-pointer">All</Badge>
        <Badge variant="outline" className="cursor-pointer">Meta</Badge>
        <Badge variant="outline" className="cursor-pointer">Google</Badge>
        <Badge variant="outline" className="cursor-pointer">TikTok</Badge>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Connect your ad accounts to see campaigns here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 font-medium">Platform</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium text-right">Budget</th>
                  <th className="pb-3 pr-4 font-medium text-right">Spend</th>
                  <th className="pb-3 pr-4 font-medium text-right">ROAS</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    No campaigns yet. Connect your ad accounts in Settings to import campaigns.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
