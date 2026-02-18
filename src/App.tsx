import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiClientProvider } from "@/contexts/ApiClientContext";
import { LocalisationProvider } from "@/contexts/LocalisationContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import ActivityTemplatesPage from "./pages/ActivityTemplatesPage";
import SeriesToursPage from "./pages/SeriesToursPage";
import TeamMembersPage from "./pages/TeamMembersPage";
import BusinessRulesPage from "./pages/BusinessRulesPage";
import LocalisationPage from "./pages/LocalisationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TenantProvider>
      <AuthProvider>
        <ApiClientProvider isAdmin={true /* TODO: derive from auth user roles */}>
          <LocalisationProvider>
            <ThemeProvider>
              <PreferencesProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route element={<AppLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/definitions/activities" element={<ActivityTemplatesPage />} />
                        <Route path="/definitions/series" element={<SeriesToursPage />} />
                        <Route path="/definitions/team" element={<TeamMembersPage />} />
                        <Route path="/definitions/rules" element={<BusinessRulesPage />} />
                        <Route path="/settings/localisation" element={<LocalisationPage />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </PreferencesProvider>
            </ThemeProvider>
          </LocalisationProvider>
        </ApiClientProvider>
      </AuthProvider>
    </TenantProvider>
  </QueryClientProvider>
);

export default App;
