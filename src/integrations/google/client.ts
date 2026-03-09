import { db } from "@/lib/db";

interface GoogleCampaign {
  resourceName: string;
  id: string;
  name: string;
  status: string;
  advertisingChannelType: string;
  campaignBudget: string;
}

interface GoogleCampaignMetrics {
  campaign: { id: string };
  metrics: {
    impressions: string;
    clicks: string;
    costMicros: string;
    conversions: number;
    conversionsValue: number;
    ctr: number;
    averageCpc: string;
    averageCpm: string;
  };
  segments: { date: string };
}

export class GoogleAdsClient {
  private accessToken: string;
  private customerId: string;
  private developerToken: string;
  private baseUrl = "https://googleads.googleapis.com/v17";

  constructor(customerId: string, accessToken: string, developerToken: string) {
    this.customerId = customerId;
    this.accessToken = accessToken;
    this.developerToken = developerToken;
  }

  static async fromAdAccountId(adAccountId: string): Promise<GoogleAdsClient> {
    const account = await db.adAccount.findUniqueOrThrow({
      where: { id: adAccountId },
    });
    return new GoogleAdsClient(
      account.accountId,
      account.accessToken,
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN!
    );
  }

  private async query<T>(gaql: string): Promise<T[]> {
    const url = `${this.baseUrl}/customers/${this.customerId}/googleAds:searchStream`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "developer-token": this.developerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: gaql }),
    });

    if (!res.ok) {
      throw new Error(`Google Ads API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.flatMap((batch: { results: T[] }) => batch.results);
  }

  async getCampaigns(): Promise<GoogleCampaign[]> {
    return this.query<GoogleCampaign>(`
      SELECT
        campaign.resource_name,
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.campaign_budget
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.id
    `);
  }

  async getCampaignMetrics(days = 90): Promise<GoogleCampaignMetrics[]> {
    const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
    const until = new Date().toISOString().split("T")[0];
    return this.query<GoogleCampaignMetrics>(`
      SELECT
        campaign.id,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc,
        metrics.average_cpm,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
        AND campaign.status != 'REMOVED'
    `);
  }

  async syncCampaigns(adAccountId: string): Promise<number> {
    const campaigns = await this.getCampaigns();

    for (const campaign of campaigns) {
      await db.campaign.upsert({
        where: { id: `google_${campaign.id}` },
        create: {
          id: `google_${campaign.id}`,
          adAccountId,
          platformCampaignId: campaign.id,
          name: campaign.name,
          status: campaign.status === "ENABLED" ? "ACTIVE" : "PAUSED",
          objective: campaign.advertisingChannelType,
        },
        update: {
          name: campaign.name,
          status: campaign.status === "ENABLED" ? "ACTIVE" : "PAUSED",
        },
      });
    }

    return campaigns.length;
  }
}
