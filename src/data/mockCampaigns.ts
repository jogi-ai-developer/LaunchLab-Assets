export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface MockCampaign {
  id: string;
  product: string;
  tagline: string;
  audience: string;
  budget: number;
  risk: RiskLevel;
  date: string;
  channels: string[];
  riskNote: string;
}

export const MOCK_CAMPAIGNS: MockCampaign[] = [
  {
    id: "campaign-01",
    product: "Protein Bar",
    tagline: "Fuel Your Day",
    audience: "College students, 18–24",
    budget: 10000,
    risk: "LOW",
    date: "Aug 14, 2026",
    channels: ["Instagram", "YouTube", "Google Search"],
    riskNote: "Well-funded with good audience signal. Proceed with confidence.",
  },
  {
    id: "campaign-02",
    product: "Skincare Serum",
    tagline: "Clearer in 30",
    audience: "Urban professionals, 25–34",
    budget: 24000,
    risk: "MEDIUM",
    date: "Aug 12, 2026",
    channels: ["Instagram", "Meta Ads", "Creator partnerships"],
    riskNote: "Keep the first test focused on proof-led creative before expanding.",
  },
  {
    id: "campaign-03",
    product: "Running Shoes",
    tagline: "Start Where You Are",
    audience: "First-time runners, 22–38",
    budget: 32500,
    risk: "LOW",
    date: "Aug 09, 2026",
    channels: ["YouTube", "Google Search", "Instagram"],
    riskNote: "Budget supports a healthy creative test. Protect the strongest audience segment.",
  },
  {
    id: "campaign-04",
    product: "Coffee Subscription",
    tagline: "Better Mornings",
    audience: "Remote teams and home brewers",
    budget: 14800,
    risk: "HIGH",
    date: "Aug 05, 2026",
    channels: ["Meta Ads", "Email", "Search"],
    riskNote: "Review differentiation and retention assumptions before launch.",
  },
  {
    id: "campaign-05",
    product: "Yoga Mat Pro",
    tagline: "Ground Yourself",
    audience: "Women, 28–45, wellness-focused",
    budget: 19500,
    risk: "LOW",
    date: "Aug 01, 2026",
    channels: ["Instagram", "Pinterest", "Creator partnerships"],
    riskNote: "Good fit for visual proof and creator-led demonstrations.",
  },
];
