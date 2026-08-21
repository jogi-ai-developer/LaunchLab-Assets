import { ArrowUpRight, Check, Copy, Flag, Lightbulb, Megaphone, ShieldAlert, Target } from "lucide-react";
import { useState } from "react";
import type { Campaign } from "@/lib/campaign-api";
import { SectionLabel } from "./LaunchLabShell";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

export const formatCurrency = (amount: number) => inrFormatter.format(amount);

function getRecommendedChannels(result: Campaign) {
  const allocatedChannels = new Set(Object.keys(result.budgetAllocation));
  return result.channelScores.filter(({ channel }) => allocatedChannels.has(channel));
}

function RiskBadge({ level }: { level: Campaign["risk"]["level"] }) {
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

export function CampaignResults({ result }: { result: Campaign }) {
  const [copied, setCopied] = useState<string | null>(null);
  const recommendedChannels = getRecommendedChannels(result);
  const budgetEntries = Object.entries(result.budgetAllocation);
  const budgetTotal = budgetEntries.reduce((total, [, amount]) => total + Number(amount), 0);
  const copyVariant = async (variant: Campaign["adCopies"][number], label: string) => {
    await navigator.clipboard?.writeText(`${variant.headline}\n\n${variant.body}\n\n${variant.cta}`);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="space-y-4" data-testid="content-campaign-results">
      <ReportCard>
        <SectionLabel number="01">Campaign overview</SectionLabel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-extrabold tracking-[-0.03em] text-foreground sm:text-2xl" data-testid="text-overview-direction">{result.input.product} launch plan</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">A {result.budgetTier.toLowerCase()}-budget campaign plan for {result.input.audience}, built from the generated brief and LaunchLab's scored channel mix.</p>
          </div>
          <RiskBadge level={result.risk.level} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted/55 p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Target size={13} className="text-primary" /> Primary goal</div>
            <p className="mt-2 text-sm font-semibold">Reach {result.input.audience} with a focused channel mix.</p>
          </div>
          <div className="rounded-md bg-muted/55 p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Flag size={13} className="text-primary" /> Working timeline</div>
            <p className="mt-2 text-sm font-semibold">{formatCurrency(result.input.budget)} working budget · {result.budgetTier} tier</p>
          </div>
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="02">Campaign ideas</SectionLabel>
        <div className="grid gap-3 md:grid-cols-3">
          {result.campaignIdeas.map((idea, index) => (
            <div className="rounded-md border border-border bg-background p-4" key={`${idea.title}-${index}`} data-testid={`card-campaign-idea-${index + 1}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-primary">0{index + 1}</span>
                <Lightbulb size={16} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold leading-5">{idea.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{idea.description}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="03">Recommended channels</SectionLabel>
        <div className="space-y-4">
          {recommendedChannels.map((channel) => (
            <div key={channel.channel} data-testid={`row-channel-${channel.channel.toLowerCase().replaceAll(" ", "-")}`}>
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold sm:w-28">{channel.channel}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${channel.score}%` }} />
                </div>
                <span className="w-12 text-right font-mono text-[11px] font-medium text-muted-foreground">{channel.score}/100</span>
              </div>
              <p className="ml-[108px] mt-1 text-[11px] text-muted-foreground sm:ml-[124px]">Selected for this budget tier based on audience fit.</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="04">Budget allocation</SectionLabel>
        <div className="space-y-3.5">
          {budgetEntries.map(([category, amount]) => {
            const percentage = budgetTotal > 0 ? (Number(amount) / budgetTotal) * 100 : 0;
            return (
            <div className="grid grid-cols-[minmax(115px,1fr)_1.4fr_auto] items-center gap-3 sm:grid-cols-[150px_1fr_auto_auto]" key={category} data-testid={`row-budget-${category.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`}>
              <span className="text-xs font-semibold">{category}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, percentage)}%` }} /></div>
              <span className="font-mono text-xs font-medium">{formatCurrency(Number(amount))}</span>
              <span className="hidden w-8 text-right font-mono text-[10px] text-muted-foreground sm:block">{Math.round(percentage)}%</span>
            </div>
            );
          })}
        </div>
      </ReportCard>

      <ReportCard>
        <SectionLabel number="05">Ad copy variants</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          {result.adCopies.map((variant, index) => {
            const label = `Variant ${index === 0 ? "A" : "B"}`;
            return (
            <article className="rounded-md border border-border bg-background p-4" key={`${variant.type}-${index}`} data-testid={`card-ad-copy-${label.toLowerCase().replace(" ", "-")}`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><Megaphone size={15} className="text-primary" /><span className="text-xs font-extrabold">{label}</span><span className="border-l border-border pl-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{variant.type}</span></div>
                <button type="button" className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => copyVariant(variant, label)} data-testid={`button-copy-${label.toLowerCase().replace(" ", "-")}`} aria-label={`Copy ${label}`}>
                  {copied === label ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
              </div>
              <h3 className="text-sm font-extrabold leading-5">{variant.headline}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{variant.body}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{variant.cta}<ArrowUpRight size={13} /></div>
            </article>
            );
          })}
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
              <li className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{result.risk.reason}</li>
            </ul>
          </div>
          <div className="rounded-md border border-primary/15 bg-primary/[0.055] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Recommended next move</p>
            <p className="mt-2 text-sm font-semibold leading-5">Review this risk note before launch and monitor the earliest performance signals.</p>
          </div>
        </div>
      </ReportCard>
    </div>
  );
}
