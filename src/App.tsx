import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import CampaignDashboardPage from '@/pages/CampaignDashboardPage';
import CampaignGeneratorPage from '@/pages/CampaignGeneratorPage';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">LaunchLab</p>
        <h1 className="mt-3 text-3xl font-extrabold">Page not found.</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <a className="mt-5 inline-flex text-sm font-bold text-primary hover:text-primary/70" href="/">
          Return to campaign generator
        </a>
      </div>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={CampaignGeneratorPage} />
        <Route path="/admin" component={CampaignDashboardPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;
