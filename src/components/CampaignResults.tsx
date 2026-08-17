import { ArrowUpRight, Check, Copy, Flag, Lightbulb, Megaphone, ShieldAlert, Target } from "lucide-react";
import { useState } from "react";
import { SectionLabel } from "./LaunchLabShell";

export interface CampaignResult {
  product: string;
  audience: string;
  budget: number;
  overview: {
    direction: string;
    summary: string;
    primaryGoal: string;
    timeline: string;
  };
  ideas: string[];
  channels: { name: string; score: number; rationale: string }[];
  budgetAllocation: { category: string; amount: number; pct: number }[];
  adCopy: { label: string; type: string; headline: string; body: string; cta: string }[];
  risk: { level: "LOW" | "MEDIUM" | "HIGH"; factors: string[]; recommendation: string };
}

export const formatCurrency = (amount: number) => `$${amount.toLocaleString("en-US")}`;

export function createCampaignResult(product: string, audience: string, budgetText: string): CampaignResult {
  const budget = Number(budgetText.replace(/[^0-9]/g, "")) || 10000;
  return {
    product,
    audience,
    budget,
    overview: {
      direction: "Performance + awareness hybrid",
      summary: `A two-phase launch for ${product} aimed at ${audience}. Build recognition through useful social content, then convert intent with retargeting and search.`,
      primaryGoal: "Drive first-time purchases with a 3× ROAS target",
      timeline: "6 weeks",
    },
    ideas: [
      `"Real results" stories featuring ${audience} sharing honest first-use moments`,
      `A behind-the-scenes series showing how ${product} earns its place in a daily routine`,
      `A limited launch offer with a clear deadline and a proof-led landing page`,
    ],
    channels: [
      { name: "Instagram", score: 92, rationale: "High visual intent and strong audience density" },
      { name: "YouTube", score: 81, rationale: "Useful for demonstrations, reviews, and recall" },
      { name: "Google Search", score: 74, rationale: "Captures high-intent category and branded queries" },
      { name: "Meta Ads", score: 68, rationale: "Broad reach with detailed audience testing" },
      { name: "LinkedIn", score: 34, rationale: "Lower match for this audience profile" },
    ],
    budgetAllocation: [
      { category: "Paid social", amount: Math.round(budget * 0.4), pct: 40 },
      { category: "Search / PPC", amount: Math.round(budget * 0.25), pct: 25 },
      { category: "Content production", amount: Math.round(budget * 0.2), pct: 20 },
      { category: "Creator seeding", amount: Math.round(budget * 0.1), pct: 10 },
      { category: "Reserve / testing", amount: Math.round(budget * 0.05), pct: 5 },
    ],
    adCopy: [
      {
        label: "Variant A",
        type: "Benefit-led",
        headline: `The ${product} built for people who care about results.`,
        body: `Stop settling for products that overpromise. ${product} is designed to make a measurable difference in the moments that matter.`,
        cta: "Shop now",
      },
      {
        label: "Variant B",
        type: "Urgency-led",
        headline: `Your next better habit starts with ${product}.`,
        body: `${audience} are making the switch to something that fits real life. Start today while the launch offer is live.`,
        cta: "Claim the offer",
      },
    ],
    risk: {
      level: budget < 15000 ? "MEDIUM" : "LOW",
      factors: [
        budget < 15000 ? "Budget is below the recommended minimum for meaningful A/B testing" : "Budget supports multi-channel creative testing",
        "New product with limited existing brand recall data",
        "Competitive category requires a clear differentiation message",
      ],
      recommendation:
        budget < 15000
          ? "Focus the first two weeks on one core channel to generate a learnable signal before spreading spend."
          : "Proceed with the planned channel mix and set a week-two review to reallocate toward the strongest signal.",
    },
  };
}

function RiskBadge({ level }: { level: CampaignResult["risk"]["level"] }) {
  const meta = {
    LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
    MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
    HIGH: "border-red-200 bg-red-50 text-red-700",
  }[level];
  const dot = { LOW: "bg-emerald-500", MEDIUM: "bg-amber-500", HIGH: "bg-red-500" }[level];
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] ${meta}`} data-testid={`status-risk-${level.toLowerCase()}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {level} RISK
    </span>
  );
}

function ReportCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-border bg-card p-5 shadow-[0_2px_10px_rgba(35,45,65,0.025)] sm:p-6 ${className}`}>{children}</section>;
}

export function CampaignResults({ result }: { result: CampaignResult }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copyVariant = async (variant: CampaignResult["adCopy"][number]) => {
    await navigator.clipboard?.writeText(`${variant.headline}\n\n${variant.body}\n\n${variant.cta}`);
    setCopied(variant.label);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="space-y-4" data-testid="content-campaign-results">
      <ReportCard>
        <SectionLabel number="01">Campaign overview</SectionLabel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-extrabold tracking-[-0.03em] text-foreground sm:text-2xl" data-testid="text-overview-direction">{result.overview.direction}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{result.overview.summary}</p>
          </div>
          <RiskBadge level={result.risk.level} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted/55 p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Target size={13} className="text-primary" /> Primary goal</div>
            <p className="mt-2 text-sm font-semibold">{result.overview.primaryGoal}</p>
          </div>
          <div className="rounded-md bg-muted/55 p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Flag size={13} className="text-primary" /> Working timeline</div>
            <p className="mt-2 text-sm font-semibold">{result.overview.timeline}</p>
          </div>
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="02">Campaign ideas</SectionLabel>
        <div className="grid gap-3 md:grid-cols-3">
          {result.ideas.map((idea, index) => (
            <div className="rounded-md border border-border bg-background p-4" key={idea} data-testid={`card-campaign-idea-${index + 1}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-primary">0{index + 1}</span>
                <Lightbulb size={16} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold leading-5">{idea}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="03">Recommended channels</SectionLabel>
        <div className="space-y-4">
          {result.channels.map((channel) => (
            <div key={channel.name} data-testid={`row-channel-${channel.name.toLowerCase().replaceAll(" ", "-")}`}>
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold sm:w-28">{channel.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${channel.score}%` }} />
                </div>
                <span className="w-12 text-right font-mono text-[11px] font-medium text-muted-foreground">{channel.score}/100</span>
              </div>
              <p className="ml-[108px] mt-1 text-[11px] text-muted-foreground sm:ml-[124px]">{channel.rationale}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="04">Budget allocation</SectionLabel>
        <div className="space-y-3.5">
          {result.budgetAllocation.map((item) => (
            <div className="grid grid-cols-[minmax(115px,1fr)_1.4fr_auto] items-center gap-3 sm:grid-cols-[150px_1fr_auto_auto]" key={item.category} data-testid={`row-budget-${item.category.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`}>
              <span className="text-xs font-semibold">{item.category}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${item.pct * 2.5}%` }} /></div>
              <span className="font-mono text-xs font-medium">{formatCurrency(item.amount)}</span>
              <span className="hidden w-8 text-right font-mono text-[10px] text-muted-foreground sm:block">{item.pct}%</span>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="05">Ad copy variants</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          {result.adCopy.map((variant) => (
            <article className="rounded-md border border-border bg-background p-4" key={variant.label} data-testid={`card-ad-copy-${variant.label.toLowerCase().replace(" ", "-")}`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><Megaphone size={15} className="text-primary" /><span className="text-xs font-extrabold">{variant.label}</span><span className="border-l border-border pl-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{variant.type}</span></div>
                <button type="button" className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => copyVariant(variant)} data-testid={`button-copy-${variant.label.toLowerCase().replace(" ", "-")}`} aria-label={`Copy ${variant.label}`}>
                  {copied === variant.label ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
              </div>
              <h3 className="text-sm font-extrabold leading-5">{variant.headline}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{variant.body}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{variant.cta}<ArrowUpRight size={13} /></div>
            </article>
          ))}
        </div>
      </ReportCard>

      <ReportCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionLabel number="06">Campaign risk</SectionLabel>
          <RiskBadge level={result.risk.level} />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-muted-foreground" /><h2 className="text-sm font-extrabold">What to watch</h2></div>
            <ul className="space-y-2">
              {result.risk.factors.map((factor) => <li className="flex gap-2 text-xs leading-5 text-muted-foreground" key={factor}><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{factor}</li>)}
            </ul>
          </div>
          <div className="rounded-md border border-primary/15 bg-primary/[0.055] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Recommended next move</p>
            <p className="mt-2 text-sm font-semibold leading-5">{result.risk.recommendation}</p>
          </div>
        </div>
      </ReportCard>
    </div>
  );
}
