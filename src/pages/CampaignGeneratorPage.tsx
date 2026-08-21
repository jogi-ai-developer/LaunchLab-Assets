import { ArrowRight, Check, ClipboardList, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { CampaignResults } from "@/components/CampaignResults";
import { ActionLink, LaunchLabShell, PageEyebrow } from "@/components/LaunchLabShell";
import { createCampaign, type Campaign } from "@/lib/campaign-api";

export default function CampaignGeneratorPage() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Campaign Generator | LaunchLab";
    const description = "Turn your product, audience and budget into a ready-to-launch campaign with LaunchLab.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!product.trim() || !audience.trim()) {
      setError("Add a product and target audience before generating your campaign.");
      return;
    }

    const numericBudget = Number(budget);
    if (!budget.trim() || !Number.isFinite(numericBudget) || numericBudget <= 0) {
      setError("Enter a valid budget greater than 0.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const campaign = await createCampaign({
        product: product.trim(),
        audience: audience.trim(),
        budget: numericBudget,
      });
      setResult(campaign);
    } catch {
      setError("Unable to generate campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LaunchLabShell>
      <main className="mx-auto max-w-[1380px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border pb-9 lg:flex-row lg:items-end">
          <div>
            <PageEyebrow>Campaign generator</PageEyebrow>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-5xl">Build your next campaign.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Turn your product, audience and budget into a ready-to-launch campaign.</p>
          </div>
          <div className="hidden items-center gap-3 text-right lg:flex">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Brief to report</p>
              <p className="mt-1 text-sm font-semibold">A sharper starting point</p>
            </div>
            <Sparkles size={22} className="text-primary" />
          </div>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[330px_minmax(0,1fr)] xl:gap-10">
          <aside className="rounded-lg border border-border bg-card p-5 shadow-[0_2px_10px_rgba(35,45,65,0.025)] sm:p-6 lg:sticky lg:top-[92px]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><h2 className="text-sm font-extrabold">Campaign brief</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">A focused brief is all we need to get started.</p></div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ClipboardList size={15} /></span>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block"><span className="mb-1.5 block text-xs font-bold">Product</span><input data-testid="input-product" value={product} onChange={(event) => setProduct(event.target.value)} placeholder="What are you taking to market?" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold">Target audience</span><input data-testid="input-target-audience" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="College students aged 18–24" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold">Budget</span><input data-testid="input-budget" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="₹10,000" inputMode="numeric" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-primary focus:ring-2 focus:ring-primary/15" /><span className="mt-1.5 block text-[11px] text-muted-foreground">Your total working media budget.</span></label>
              <button type="submit" disabled={loading || !product.trim() || !audience.trim() || !budget.trim()} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45" data-testid="button-generate-campaign">
                {loading ? <><LoaderCircle size={15} className="animate-spin" /> Generating plan</> : <>Generate campaign <ArrowRight size={15} /></>}
              </button>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert" data-testid="state-campaign-generation-error">
                  <p className="font-extrabold">{error}</p>
                  <p className="mt-1 text-red-700/80">Something went wrong while generating your campaign. Please try again.</p>
                </div>
              )}
            </form>
            <div className="mt-7 border-t border-border pt-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Your report includes</p>
              <ul className="space-y-2.5">
                {["Campaign direction and ideas", "Channel mix with budget guidance", "Two ready-to-use ad variants", "Risk assessment"].map((item) => <li className="flex items-center gap-2 text-xs text-muted-foreground" key={item}><Check size={13} className="shrink-0 text-primary" />{item}</li>)}
              </ul>
            </div>
          </aside>

          <section aria-live="polite">
            {!loading && !result && <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/45 px-7 text-center" data-testid="empty-campaign-results"><span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"><Sparkles size={20} /></span><h2 className="text-lg font-extrabold tracking-[-0.02em]">Your campaign will appear here</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Add a few details about your product, audience, and budget. LaunchLab will turn the brief into a focused plan.</p><div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-muted-foreground"><span>Clear direction</span><span>Channel guidance</span><span>Ready-to-use copy</span></div></div>}
            {loading && <div className="min-h-[520px] rounded-lg border border-border bg-card p-6" data-testid="loading-campaign-results"><div className="mb-8 h-5 w-44 animate-pulse rounded bg-muted" /><div className="space-y-6">{[1, 2, 3, 4, 5].map((item) => <div className="space-y-3" key={item}><div className="h-3 w-24 animate-pulse rounded bg-muted" /><div className="h-14 w-full animate-pulse rounded-md bg-muted/70" /></div>)}</div><p className="mt-8 text-center text-xs font-semibold text-muted-foreground">Analysing audience, channels, and budget fit…</p></div>}
            {result && <CampaignResults result={result} />}
          </section>
        </div>
        <div className="mt-9 flex justify-end"><ActionLink href="/admin" testId="link-view-dashboard">View campaign history</ActionLink></div>
      </main>
    </LaunchLabShell>
  );
}
