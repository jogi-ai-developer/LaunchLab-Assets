import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Layers3,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ActionLink, LaunchLabShell, PageEyebrow } from "@/components/LaunchLabShell";
import { formatCurrency } from "@/components/CampaignResults";
import { getCampaign, getCampaigns, type Campaign, type RiskLevel } from "@/lib/campaign-api";

const riskLevels: RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];
const riskFilters: Array<"ALL" | RiskLevel> = ["ALL", ...riskLevels];

const riskMeta: Record<RiskLevel, { label: string; color: string; dot: string; icon: typeof ShieldCheck }> = {
  LOW: {
    label: "Low risk",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    icon: ShieldCheck,
  },
  MEDIUM: {
    label: "Medium risk",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: Activity,
  },
  HIGH: {
    label: "High risk",
    color: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    icon: ShieldAlert,
  },
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const meta = riskMeta[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold tracking-[0.06em] ${meta.color}`}
      data-testid={`status-campaign-risk-${level.toLowerCase()}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {level} RISK
    </span>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  const key = label.toLowerCase().replaceAll(" ", "-");
  return (
    <article
      className={`relative overflow-hidden rounded-lg border p-5 shadow-[0_2px_12px_rgba(35,45,65,0.035)] ${
        accent ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
      }`}
      data-testid={`card-stat-${key}`}
    >
      <div className="flex items-start justify-between">
        <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {label}
        </p>
        <span className={accent ? "text-primary-foreground/80" : "text-primary"}>{icon}</span>
      </div>
      <p
        className={`mt-5 text-3xl font-extrabold tracking-[-0.055em] ${
          accent ? "text-primary-foreground" : "text-foreground"
        }`}
        data-testid={`text-stat-${key}`}
      >
        {value}
      </p>
      <p className={`mt-1 text-xs ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{detail}</p>
      {accent && <span className="absolute -bottom-8 -right-6 h-24 w-24 rounded-full border border-primary-foreground/10" />}
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatBudget(value: number) {
  return formatCurrency(Math.round(Number.isFinite(value) ? value : 0));
}

function getRecommendedChannels(campaign: Campaign) {
  return Object.keys(campaign.budgetAllocation);
}

function LoadingRows() {
  return (
    <div className="divide-y divide-border/70" aria-label="Loading campaigns" data-testid="state-campaigns-loading">
      {[1, 2, 3, 4].map((row) => (
        <div className="grid grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-5 py-5 sm:px-6" key={row}>
          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center" data-testid="state-campaigns-empty">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
        <Layers3 size={19} />
      </span>
      <h2 className="mt-4 text-base font-extrabold">No campaigns yet</h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">Generate your first campaign to see it appear here.</p>
      <ActionLink href="/" testId="link-empty-generate-campaign">
        Generate a campaign
      </ActionLink>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center" data-testid="state-campaigns-error">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
        <AlertCircle size={19} />
      </span>
      <h2 className="mt-4 text-base font-extrabold">Unable to load campaigns</h2>
      <p className="mt-1 text-sm text-muted-foreground">Check the backend connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        data-testid="button-retry-campaigns"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </div>
  );
}

function InsightBar({ label, value, max, detail }: { label: string; value: number; max: number; detail: string }) {
  const width = max > 0 ? Math.max(5, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1.5" data-testid={`insight-bar-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{detail}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Insights({ campaigns }: { campaigns: Campaign[] }) {
  const channelInsights = useMemo(() => {
    const byChannel = new Map<string, { count: number; scoreTotal: number }>();
    campaigns.forEach((campaign) => {
      const recommended = new Set(getRecommendedChannels(campaign));
      campaign.channelScores
        .filter(({ channel }) => recommended.has(channel))
        .forEach(({ channel, score }) => {
        const current = byChannel.get(channel) ?? { count: 0, scoreTotal: 0 };
        byChannel.set(channel, { count: current.count + 1, scoreTotal: current.scoreTotal + score });
        });
    });
    return Array.from(byChannel.entries())
      .map(([channel, data]) => ({ channel, ...data, averageScore: Math.round(data.scoreTotal / data.count) }))
      .sort((a, b) => b.count - a.count || b.averageScore - a.averageScore)
      .slice(0, 5);
  }, [campaigns]);

  const riskCounts = useMemo(
    () =>
      riskLevels.map((level) => ({
        level,
        count: campaigns.filter((campaign) => campaign.risk.level === level).length,
      })),
    [campaigns],
  );
  const maxRiskCount = Math.max(...riskCounts.map((item) => item.count), 1);
  const budgets = campaigns.map((campaign) => campaign.input.budget);
  const minBudget = Math.min(...budgets);
  const maxBudget = Math.max(...budgets);
  const averageBudget = budgets.reduce((sum, budget) => sum + budget, 0) / budgets.length;

  return (
    <section className="mt-10" data-testid="section-campaign-insights">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <PageEyebrow>Signal check</PageEyebrow>
          <h2 className="text-xl font-extrabold tracking-[-0.035em]">What the archive is telling us</h2>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">Calculated from saved campaign records</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <article className="rounded-lg border border-border bg-card p-5 shadow-[0_2px_12px_rgba(35,45,65,0.025)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Top 5 channels</p>
              <p className="mt-1 text-xs text-muted-foreground">Most consistently scored in plans</p>
            </div>
            <BarChart3 size={17} className="text-primary" />
          </div>
          <div className="space-y-4">
            {channelInsights.map((item, index) => (
              <InsightBar
                key={item.channel}
                label={`${index + 1}. ${item.channel}`}
                value={item.count}
                max={channelInsights[0]?.count ?? 1}
                detail={`${item.averageScore}/100 avg`}
              />
            ))}
          </div>
        </article>
        <article className="rounded-lg border border-border bg-card p-5 shadow-[0_2px_12px_rgba(35,45,65,0.025)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Risk distribution</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all generated plans</p>
            </div>
            <ShieldAlert size={17} className="text-primary" />
          </div>
          <div className="space-y-4">
            {riskCounts.map(({ level, count }) => (
              <InsightBar key={level} label={riskMeta[level].label} value={count} max={maxRiskCount} detail={`${count} ${count === 1 ? "plan" : "plans"}`} />
            ))}
          </div>
        </article>
        <article className="rounded-lg border border-border bg-card p-5 shadow-[0_2px_12px_rgba(35,45,65,0.025)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Budget range</p>
              <p className="mt-1 text-xs text-muted-foreground">Min, max, and mean investment</p>
            </div>
            <CircleDollarSign size={17} className="text-primary" />
          </div>
          <div className="space-y-4">
            {[
              ["Minimum", minBudget],
              ["Maximum", maxBudget],
              ["Average", averageBudget],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between border-b border-border/70 pb-3 last:border-0 last:pb-0" key={label}>
                <span className="text-xs font-semibold">{label}</span>
                <span className="font-mono text-sm font-medium">{formatBudget(Number(value))}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function CampaignDetailModal({ campaign, loading, error, onClose }: { campaign: Campaign | null; loading: boolean; error: boolean; onClose: () => void }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!campaign && !loading && !error) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [campaign, error, loading]);

  if (!campaign && !loading && !error) return null;

  const allocationEntries = campaign ? Object.entries(campaign.budgetAllocation) : [];
  const allocationTotal = allocationEntries.reduce((sum, [, amount]) => sum + Number(amount), 0);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/25 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-[0_18px_60px_rgba(21,31,50,0.18)] sm:max-h-[88dvh] sm:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-detail-title"
        data-testid="panel-campaign-details"
      >
        <div className="flex items-start justify-between gap-5 border-b border-border px-5 py-5 sm:px-7">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
              <span className="h-px w-5 bg-primary" />
              Campaign record
            </p>
            <h2 id="campaign-detail-title" className="text-xl font-extrabold tracking-[-0.04em]">
              {campaign ? campaign.input.product : "Loading campaign"}
            </h2>
            {campaign && <p className="mt-1 text-xs text-muted-foreground">{campaign.input.audience}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Close campaign details"
            data-testid="button-close-campaign-details"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-6 sm:px-7">
          {loading && (
            <div className="space-y-5" data-testid="state-campaign-detail-loading">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => <div className="h-32 animate-pulse rounded-lg bg-muted" key={item} />)}
              </div>
              <div className="h-44 animate-pulse rounded-lg bg-muted" />
            </div>
          )}
          {!loading && error && (
            <div className="flex min-h-48 flex-col items-center justify-center text-center" data-testid="state-campaign-detail-error">
              <AlertCircle size={20} className="text-red-600" />
              <p className="mt-3 text-sm font-bold">Unable to load this campaign</p>
              <p className="mt-1 text-xs text-muted-foreground">Check the backend connection and try again.</p>
            </div>
          )}
          {!loading && !error && campaign && (
            <div className="space-y-4">
              <DetailSection number="00" title="Campaign overview">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Audience", campaign.input.audience, <Target size={15} />],
                    ["Budget", formatBudget(campaign.input.budget), <CircleDollarSign size={15} />],
                    ["Budget tier", campaign.budgetTier || "Unspecified", <Layers3 size={15} />],
                    ["Created", formatDate(campaign.createdAt), <CalendarDays size={15} />],
                  ].map(([label, value, icon]) => (
                    <div className="rounded-lg border border-border bg-card p-4" key={String(label)}>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{icon}{label}</div>
                      <p className="mt-2 truncate text-sm font-extrabold" title={String(value)}>{value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 rounded-lg border border-border/80 bg-muted/25 px-4 py-3 text-xs leading-5 text-muted-foreground">
                  A saved launch plan for <strong className="text-foreground">{campaign.input.product}</strong>, built to reach <strong className="text-foreground">{campaign.input.audience}</strong>.
                </p>
              </DetailSection>

              <DetailSection number="01" title="Campaign ideas">
                <div className="grid gap-3 md:grid-cols-3">
                  {campaign.campaignIdeas.map((idea, index) => (
                    <article className="rounded-lg border border-border bg-card p-4" key={`${idea.title}-${index}`} data-testid={`detail-idea-${index + 1}`}>
                      <span className="font-mono text-[11px] text-primary">0{index + 1}</span>
                      <h3 className="mt-3 text-sm font-extrabold leading-5">{idea.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{idea.description}</p>
                    </article>
                  ))}
                </div>
              </DetailSection>

              <DetailSection number="02" title="Recommended channels">
                <div className="grid gap-3 lg:grid-cols-2">
                  {campaign.channelScores.filter(({ channel }) => getRecommendedChannels(campaign).includes(channel)).map(({ channel, score }) => {
                    const allocated = campaign.budgetAllocation[channel];
                    return (
                      <div className="rounded-lg border border-border bg-card p-4" key={channel} data-testid={`detail-channel-${channel.toLowerCase().replaceAll(" ", "-")}`}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-extrabold">{channel}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{score}/100</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} /></div>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Final recommendation</span>
                          <span className="font-mono">{formatBudget(allocated)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DetailSection>

              <DetailSection number="03" title="Budget allocation">
                <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                  <div className="space-y-4">
                    {allocationEntries.map(([channel, amount]) => {
                      const percent = allocationTotal > 0 ? (Number(amount) / allocationTotal) * 100 : 0;
                      return (
                        <div className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr_auto] items-center gap-3" key={channel} data-testid={`detail-budget-${channel.toLowerCase().replaceAll(" ", "-")}`}>
                          <span className="truncate text-xs font-semibold">{channel}</span>
                          <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/75" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>
                          <span className="font-mono text-xs font-medium">{formatBudget(Number(amount))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DetailSection>

              <DetailSection number="04" title="A/B ad copies">
                <div className="grid gap-3 md:grid-cols-2">
                  {campaign.adCopies.map((copy, index) => (
                    <article className="rounded-lg border border-border bg-card p-4 sm:p-5" key={`${copy.type}-${index}`} data-testid={`detail-ad-copy-${index + 1}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-extrabold"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 font-mono text-[10px] text-primary">{index === 0 ? "A" : "B"}</span>Variant {index === 0 ? "A" : "B"}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy.type}</span>
                      </div>
                      <h3 className="mt-5 text-sm font-extrabold leading-5">{copy.headline}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{copy.body}</p>
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{copy.cta}<ArrowUpRight size={13} /></div>
                    </article>
                  ))}
                </div>
              </DetailSection>

              <DetailSection number="05" title="Risk review">
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex gap-3">
                    <AlertCircle size={17} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-extrabold">Risk reason</p>
                      <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">{campaign.risk.reason}</p>
                    </div>
                  </div>
                  <RiskBadge level={campaign.risk.level} />
                </div>
              </DetailSection>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section data-testid={`detail-section-${number}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="font-mono text-[10px] font-medium text-primary">{number}</span>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function CampaignDashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | RiskLevel>("ALL");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    document.title = "Campaign Dashboard | LaunchLab";
    const description = "Review saved campaign history, budgets, channels, and risk levels in the LaunchLab workspace.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setHasError(false);
    getCampaigns()
      .then((result) => {
        if (active) setCampaigns(result);
      })
      .catch(() => {
        if (active) {
          setCampaigns([]);
          setHasError(true);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retryCount]);

  const summary = useMemo(() => {
    const totalBudget = campaigns.reduce((total, campaign) => total + campaign.input.budget, 0);
    return {
      totalBudget,
      averageBudget: campaigns.length ? totalBudget / campaigns.length : 0,
      highRisk: campaigns.filter((campaign) => campaign.risk.level === "HIGH").length,
    };
  }, [campaigns]);

  const visibleCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesRisk = riskFilter === "ALL" || campaign.risk.level === riskFilter;
      const matchesSearch =
        !query ||
        campaign.input.product.toLowerCase().includes(query) ||
        campaign.input.audience.toLowerCase().includes(query);
      return matchesRisk && matchesSearch;
    });
  }, [campaigns, riskFilter, search]);

  const openCampaignDetails = async (id: string | number) => {
    setSelectedCampaign(null);
    setDetailError(false);
    setDetailLoading(true);
    try {
      const campaign = await getCampaign(id);
      setSelectedCampaign(campaign);
    } catch {
      setDetailError(true);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedCampaign(null);
    setDetailError(false);
    setDetailLoading(false);
  };

  return (
    <LaunchLabShell>
      <main className="mx-auto max-w-[1380px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div>
            <PageEyebrow>Workspace overview</PageEyebrow>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-5xl">Campaign dashboard.</h1>
              {!isLoading && !hasError && campaigns.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                  <Check size={12} />
                  Live archive
                </span>
              )}
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">A clear record of the strategies your team has generated, with the signal to decide what deserves another look.</p>
          </div>
          <ActionLink href="/" testId="link-generate-new-campaign">
            Generate campaign
          </ActionLink>
        </div>

        {!isLoading && !hasError && campaigns.length > 0 && (
          <>
            <div className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total campaigns" value={String(campaigns.length)} detail="Saved in the archive" accent icon={<TrendingUp size={17} />} />
              <StatCard label="Total budget" value={formatBudget(summary.totalBudget)} detail="Across all campaign plans" icon={<CircleDollarSign size={17} />} />
              <StatCard label="Average budget" value={formatBudget(summary.averageBudget)} detail="Per generated plan" icon={<Target size={17} />} />
              <StatCard label="High-risk campaigns" value={String(summary.highRisk)} detail="Worth reviewing before launch" icon={<ShieldAlert size={17} />} />
            </div>

            <Insights campaigns={campaigns} />

            <section className="mt-12" data-testid="section-campaign-history">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <PageEyebrow>Recent activity</PageEyebrow>
                  <h2 className="text-xl font-extrabold tracking-[-0.035em]">Campaign history</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{visibleCampaigns.length}</span> of {campaigns.length} campaign {campaigns.length === 1 ? "plan" : "plans"}
                </p>
              </div>
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-[0_2px_12px_rgba(35,45,65,0.025)] md:flex-row md:items-center">
                <label className="relative min-w-0 flex-1">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search product or audience"
                    className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    aria-label="Search product or audience"
                    data-testid="input-search-campaigns"
                  />
                </label>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <SlidersHorizontal size={14} className="shrink-0 text-muted-foreground" />
                  {riskFilters.map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      onClick={() => setRiskFilter(filter)}
                      className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        riskFilter === filter ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      aria-pressed={riskFilter === filter}
                      data-testid={`button-filter-${filter.toLowerCase()}`}
                    >
                      {filter === "ALL" ? "All" : `${filter[0]}${filter.slice(1).toLowerCase()}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_12px_rgba(35,45,65,0.025)]">
                {visibleCampaigns.length === 0 ? (
                  <div className="flex min-h-48 flex-col items-center justify-center px-6 py-12 text-center" data-testid="state-campaigns-no-results">
                    <Search size={19} className="text-muted-foreground" />
                    <p className="mt-3 text-sm font-extrabold">No matching campaigns</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try a different search or risk filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["Product", "Audience", "Budget", "Risk", "Channels", "Created", ""].map((heading) => (
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground first:pl-5 last:pr-5" key={heading || "action"}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleCampaigns.map((campaign) => (
                          <tr className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/25" key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                            <td className="px-4 py-4 first:pl-5">
                              <p className="max-w-[220px] truncate text-sm font-extrabold" title={campaign.input.product} data-testid={`text-campaign-product-${campaign.id}`}>{campaign.input.product}</p>
                              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">ID {campaign.id}</p>
                            </td>
                            <td className="max-w-[220px] truncate px-4 py-4 text-sm text-muted-foreground" title={campaign.input.audience}>{campaign.input.audience}</td>
                            <td className="px-4 py-4 font-mono text-xs font-medium">{formatBudget(campaign.input.budget)}</td>
                            <td className="px-4 py-4"><RiskBadge level={campaign.risk.level} /></td>
                              <td className="px-4 py-4 text-xs text-muted-foreground">{getRecommendedChannels(campaign).length} {getRecommendedChannels(campaign).length === 1 ? "channel" : "channels"}</td>
                            <td className="px-4 py-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{formatDate(campaign.createdAt)}</span></td>
                            <td className="px-4 py-4 text-right last:pr-5">
                              <button
                                type="button"
                                onClick={() => void openCampaignDetails(campaign.id)}
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-extrabold text-primary transition-colors hover:bg-primary/8 hover:text-primary/75 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                data-testid={`button-view-campaign-${campaign.id}`}
                              >
                                View
                                <ExternalLink size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground"><ChevronRight size={13} className="text-primary" />Select View to inspect the saved campaign plan, channel scores, copy, and risk reason.</p>
            </section>
          </>
        )}

        {isLoading && (
          <div className="space-y-8" data-testid="state-campaigns-loading-page">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => <div className="h-32 animate-pulse rounded-lg border border-border bg-card" key={item} />)}
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card"><LoadingRows /></div>
          </div>
        )}

        {!isLoading && hasError && <div className="rounded-lg border border-border bg-card shadow-[0_2px_12px_rgba(35,45,65,0.025)]"><ErrorState onRetry={() => setRetryCount((count) => count + 1)} /></div>}
        {!isLoading && !hasError && campaigns.length === 0 && <div className="rounded-lg border border-border bg-card shadow-[0_2px_12px_rgba(35,45,65,0.025)]"><EmptyState /></div>}
      </main>
      <CampaignDetailModal campaign={selectedCampaign} loading={detailLoading} error={detailError} onClose={closeDetails} />
    </LaunchLabShell>
  );
}