import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PreferencesPanel } from '@/components/PreferencesPanel';
import { ApiModeToggle } from '@/components/ApiModeToggle';
import { ApiExpectationsPanel } from '@/components/ApiExpectationsPanel';
import { HelpWidget } from '@/components/HelpWidget';
import { Plane } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export default function AppLayout() {
  const { config } = useTenant();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border px-3 py-2 flex items-center justify-between bg-card shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Plane className="w-4 h-4 text-primary" />
              <h1 className="text-sm font-semibold text-foreground tracking-tight">Ops-Admin</h1>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {config.displayName}
              </span>
              <span className="text-[8px] font-mono text-muted-foreground bg-secondary/50 px-1 py-0.5 rounded uppercase">
                {config.environment}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ApiModeToggle />
              <ThemeSelector />
              <PreferencesPanel />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          {/* Dev-only API Expectations panel */}
          {config.environment !== 'prod' && (
            <div className="border-t border-border px-4 py-1">
              <ApiExpectationsPanel />
            </div>
          )}
        </div>
        <HelpWidget />
      </div>
    </SidebarProvider>
  );
}
