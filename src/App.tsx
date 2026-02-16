import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import ActivityTemplatesPage from "./pages/ActivityTemplatesPage";
import SeriesToursPage from "./pages/SeriesToursPage";
import DestinationsPage from "./pages/DestinationsPage";
import TeamMembersPage from "./pages/TeamMembersPage";
import BusinessRulesPage from "./pages/BusinessRulesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <Route path="/definitions/destinations" element={<DestinationsPage />} />
              <Route path="/definitions/team" element={<TeamMembersPage />} />
              <Route path="/definitions/rules" element={<BusinessRulesPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </PreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
