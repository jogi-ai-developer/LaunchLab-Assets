export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface Campaign {
  id: string | number;
  input: {
    product: string;
    audience: string;
    budget: number;
  };
  campaignIdeas: Array<{
    title: string;
    description: string;
  }>;
  suggestedChannels: string[];
  adCopies: Array<{
    type: string;
    headline: string;
    body: string;
    cta: string;
  }>;
  channelScores: Array<{
    channel: string;
    score: number;
  }>;
  budgetTier: string;
  budgetAllocation: Record<string, number>;
  risk: {
    level: RiskLevel;
    reason: string;
  };
  createdAt: string;
}

interface CampaignListResponse {
  campaigns: Campaign[];
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const result = await requestJson<CampaignListResponse>("/api/campaigns");
  return Array.isArray(result.campaigns) ? result.campaigns : [];
}

export function getCampaign(id: string | number): Promise<Campaign> {
  return requestJson<Campaign>(`/api/campaigns/${encodeURIComponent(id)}`);
}