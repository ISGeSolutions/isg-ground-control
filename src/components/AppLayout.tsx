import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PreferencesPanel } from '@/components/PreferencesPanel';
import { Plane } from 'lucide-react';

export default function AppLayout() {
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
                Departure Ground Handling
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSelector />
              <PreferencesPanel />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
