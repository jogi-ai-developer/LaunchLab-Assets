import { BarChart3, ChevronRight, Command, Grid2X2, Plus, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

interface LaunchLabShellProps {
  children: React.ReactNode;
}

export function LaunchLabShell({ children }: LaunchLabShellProps) {
  const [location] = useLocation();
  const isDashboard = location === "/admin";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-[68px] max-w-[1380px] items-center gap-6 px-5 sm:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            data-testid="link-brand"
            aria-label="LaunchLab home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Command size={16} strokeWidth={2.4} />
            </span>
            <span className="text-[15px] font-extrabold tracking-[-0.03em]">LaunchLab</span>
          </Link>

          <div className="hidden h-5 w-px bg-border sm:block" />
          <p className="hidden text-xs font-medium text-muted-foreground sm:block">Campaign planning workspace</p>

          <nav className="ml-auto flex items-center gap-1.5" aria-label="Primary navigation">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                !isDashboard ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid="link-campaign-generator"
            >
              <Grid2X2 size={14} />
              <span className="hidden sm:inline">Campaign Generator</span>
              <span className="sm:hidden">Generator</span>
            </Link>
            <Link
              href="/admin"
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                isDashboard ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid="link-dashboard"
            >
              <BarChart3 size={14} />
              Dashboard
            </Link>
          </nav>

        </div>
      </header>
      {children}
    </div>
  );
}

export function PageEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
      <span className="h-px w-5 bg-primary" />
      {children}
    </p>
  );
}

export function SectionLabel({ children, number }: { children: React.ReactNode; number: string }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="font-mono text-[10px] font-medium text-primary">{number}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{children}</span>
    </div>
  );
}

export function ActionLink({ href, children, testId }: { href: string; children: React.ReactNode; testId: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-primary/75"
      data-testid={testId}
    >
      {children}
      <ChevronRight size={14} />
    </Link>
  );
}

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground ${small ? "h-6 w-6" : "h-8 w-8"}`}>
      {small ? <Plus size={14} strokeWidth={2.5} /> : <Sparkles size={16} strokeWidth={2} />}
    </span>
  );
}
