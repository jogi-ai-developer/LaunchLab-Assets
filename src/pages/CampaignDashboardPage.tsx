import { ChevronDown, ChevronUp, ExternalLink, Plus, ShieldAlert, TrendingUp } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { MOCK_CAMPAIGNS, type MockCampaign, type RiskLevel } from "@/data/mockCampaigns";
import { ActionLink, LaunchLabShell, PageEyebrow } from "@/components/LaunchLabShell";
import { formatCurrency } from "@/components/CampaignResults";

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors = { LOW: "border-emerald-200 bg-emerald-50 text-emerald-700", MEDIUM: "border-amber-200 bg-amber-50 text-amber-700", HIGH: "border-red-200 bg-red-50 text-red-700" };
  const dots = { LOW: "bg-emerald-500", MEDIUM: "bg-amber-500", HIGH: "bg-red-500" };
  return <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold tracking-[0.06em] ${colors[level]}`} data-testid={`status-campaign-risk-${level.toLowerCase()}`}><span className={`h-1.5 w-1.5 rounded-full ${dots[level]}`} />{level} RISK</span>;
}

function StatCard({ label, value, detail, accent, icon }: { label: string; value: string; detail: string; accent?: boolean; icon: React.ReactNode }) {
  return <div className={`rounded-lg border p-5 shadow-[0_2px_10px_rgba(35,45,65,0.025)] ${accent ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`} data-testid={`card-stat-${label.toLowerCase().replaceAll(" ", "-")}`}><div className="flex items-start justify-between"><p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p><span className={accent ? "text-primary-foreground/80" : "text-primary"}>{icon}</span></div><p className={`mt-5 text-3xl font-extrabold tracking-[-0.05em] ${accent ? "text-primary-foreground" : "text-foreground"}`} data-testid={`text-stat-${label.toLowerCase().replaceAll(" ", "-")}`}>{value}</p><p className={`mt-1 text-xs ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{detail}</p></div>;
}

function CampaignDetail({ campaign }: { campaign: MockCampaign }) {
  return <div className="grid gap-5 border-t border-border bg-muted/35 px-5 py-5 sm:grid-cols-3 sm:px-6" data-testid={`panel-campaign-details-${campaign.id}`}><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Campaign summary</p><p className="text-xs leading-5 text-muted-foreground">A focused launch for <strong className="text-foreground">{campaign.product}</strong>, built to reach <strong className="text-foreground">{campaign.audience}</strong> with a {campaign.risk.toLowerCase()} risk profile.</p></div><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Priority channels</p><ul className="space-y-1 text-xs text-muted-foreground">{campaign.channels.map((channel) => <li key={channel}>{channel}</li>)}</ul></div><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Risk note</p><p className="text-xs leading-5 text-muted-foreground">{campaign.riskNote}</p></div></div>;
}

export default function CampaignDashboardPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const campaigns = useMemo(() => MOCK_CAMPAIGNS, []);
  const averageBudget = Math.round(campaigns.reduce((total, campaign) => total + campaign.budget, 0) / campaigns.length);
  const highRisk = campaigns.filter((campaign) => campaign.risk === "HIGH").length;

  useEffect(() => {
    document.title = "Campaign Dashboard | LaunchLab";
    const description = "Review campaign history, budgets, and risk levels in the LaunchLab workspace.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  const toggleCampaign = (campaignId: string) => setExpandedId((current) => current === campaignId ? null : campaignId);

  return (
    <LaunchLabShell>
      <main className="mx-auto max-w-[1380px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-9 flex flex-col justify-between gap-5 border-b border-border pb-9 sm:flex-row sm:items-end">
          <div><PageEyebrow>Workspace overview</PageEyebrow><h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-5xl">Campaign dashboard.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">A clear record of the strategies your team has generated.</p></div>
          <ActionLink href="/" testId="link-generate-new-campaign"><Plus size={14} /> Generate campaign</ActionLink>
        </div>
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <StatCard label="Total campaigns" value={String(campaigns.length)} detail="All time generated" accent icon={<TrendingUp size={17} />} />
          <StatCard label="Average budget" value={formatCurrency(averageBudget)} detail="Across active campaign plans" icon={<span className="font-mono text-sm">$</span>} />
          <StatCard label="High-risk campaigns" value={String(highRisk)} detail="Worth reviewing before launch" icon={<ShieldAlert size={17} />} />
        </div>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2"><span className="h-px w-5 bg-primary" /><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Recent activity</p></div><h2 className="text-xl font-extrabold tracking-[-0.03em]">Campaign history</h2></div><p className="text-xs text-muted-foreground">Showing {campaigns.length} campaign plans</p></div>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_10px_rgba(35,45,65,0.025)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead><tr className="border-b border-border bg-muted/30"><th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Product</th><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Audience</th><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Budget</th><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Risk</th><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Date</th><th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Action</th></tr></thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const expanded = expandedId === campaign.id;
                    return <Fragment key={campaign.id}><tr className={`border-b border-border/70 transition-colors hover:bg-muted/25 ${expanded ? "bg-muted/20" : ""}`} data-testid={`row-campaign-${campaign.id}`}><td className="px-5 py-4"><p className="text-sm font-extrabold">{campaign.product}</p><p className="mt-0.5 text-xs text-muted-foreground">{campaign.tagline}</p></td><td className="px-4 py-4 text-sm text-muted-foreground">{campaign.audience}</td><td className="px-4 py-4 font-mono text-xs font-medium">{formatCurrency(campaign.budget)}</td><td className="px-4 py-4"><RiskBadge level={campaign.risk} /></td><td className="px-4 py-4 text-sm text-muted-foreground">{campaign.date}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => toggleCampaign(campaign.id)} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary transition-colors hover:text-primary/70" data-testid={`button-view-campaign-${campaign.id}`}>{expanded ? "Close" : "View"}{expanded ? <ChevronUp size={14} /> : <ExternalLink size={13} />}</button></td></tr>{expanded && <tr><td colSpan={6}><CampaignDetail campaign={campaign} /></td></tr>}</Fragment>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">Select View to expand a campaign plan summary and its recommended channels.</p>
        </section>
      </main>
    </LaunchLabShell>
  );
}
