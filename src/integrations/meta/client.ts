import { db } from "@/lib/db";

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

interface MetaInsight {
  campaign_id: string;
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  ctr: string;
  cpc: string;
  cpm: string;
}

interface MetaAdLibraryResult {
  id: string;
  page_name: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_captions?: string[];
  ad_delivery_start_time: string;
  ad_delivery_stop_time?: string;
  publisher_platforms?: string[];
}

export class MetaAdsClient {
  private accessToken: string;
  private accountId: string;
  private baseUrl = "https://graph.facebook.com/v21.0";

  constructor(accountId: string, accessToken: string) {
    this.accountId = accountId;
    this.accessToken = accessToken;
  }

  static async fromAdAccountId(adAccountId: string): Promise<MetaAdsClient> {
    const account = await db.adAccount.findUniqueOrThrow({
      where: { id: adAccountId },
    });
    return new MetaAdsClient(account.accountId, account.accessToken);
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams({
      access_token: this.accessToken,
      ...params,
    });
    const url = `${this.baseUrl}${endpoint}?${searchParams}`;
    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Meta API error: ${JSON.stringify(error)}`);
    }

    return res.json();
  }

  async getCampaigns(): Promise<MetaCampaign[]> {
    const data = await this.request<{ data: MetaCampaign[] }>(
      `/act_${this.accountId}/campaigns`,
      {
        fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
        limit: "100",
      }
    );
    return data.data;
  }

  async getCampaignInsights(
    campaignId: string,
    dateRange: { since: string; until: string }
  ): Promise<MetaInsight[]> {
    const data = await this.request<{ data: MetaInsight[] }>(
      `/${campaignId}/insights`,
      {
        fields: "campaign_id,impressions,clicks,spend,actions,action_values,ctr,cpc,cpm",
        time_range: JSON.stringify(dateRange),
        time_increment: "1",
        level: "campaign",
      }
    );
    return data.data;
  }

  async getAccountInsights(days = 90): Promise<MetaInsight[]> {
    const until = new Date().toISOString().split("T")[0];
    const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
    const data = await this.request<{ data: MetaInsight[] }>(
      `/act_${this.accountId}/insights`,
      {
        fields: "campaign_id,impressions,clicks,spend,actions,action_values,ctr,cpc,cpm",
        time_range: JSON.stringify({ since, until }),
        time_increment: "1",
        level: "campaign",
      }
    );
    return data.data;
  }

  async searchAdLibrary(
    searchTerms: string,
    country = "US",
    limit = 50
  ): Promise<MetaAdLibraryResult[]> {
    const data = await this.request<{ data: MetaAdLibraryResult[] }>(
      "/ads_archive",
      {
        search_terms: searchTerms,
        ad_reached_countries: `["${country}"]`,
        ad_type: "POLITICAL_AND_ISSUE_ADS",
        fields:
          "id,page_name,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_captions,ad_delivery_start_time,ad_delivery_stop_time,publisher_platforms",
        limit: limit.toString(),
      }
    );
    return data.data;
  }

  async syncCampaigns(adAccountId: string): Promise<number> {
    const campaigns = await this.getCampaigns();

    for (const campaign of campaigns) {
      await db.campaign.upsert({
        where: {
          id: `meta_${campaign.id}`,
        },
        create: {
          id: `meta_${campaign.id}`,
          adAccountId,
          platformCampaignId: campaign.id,
          name: campaign.name,
          status: campaign.status === "ACTIVE" ? "ACTIVE" : "PAUSED",
          objective: campaign.objective,
          dailyBudget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
          lifetimeBudget: campaign.lifetime_budget
            ? parseFloat(campaign.lifetime_budget) / 100
            : null,
        },
        update: {
          name: campaign.name,
          status: campaign.status === "ACTIVE" ? "ACTIVE" : "PAUSED",
          dailyBudget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
        },
      });
    }

    return campaigns.length;
  }
}
