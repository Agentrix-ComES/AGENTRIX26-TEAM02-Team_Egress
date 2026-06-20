import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppShell } from "@/components/layout/app-shell";
import { LandingPage } from "@/pages/landing";
import { OverviewPage } from "@/pages/overview";
import { PlanTripPage } from "@/pages/plan-trip";
import { WorkspacePage } from "@/pages/workspace";
import { AlertsPage } from "@/pages/alerts";
import { BotPreviewPage } from "@/pages/bot-preview";
import { AdminPage } from "@/pages/admin";
import { SettingsPage } from "@/pages/settings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/plan" element={<PlanTripPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/chat" element={<Navigate to="/workspace" replace />} />
            <Route path="/timeline" element={<Navigate to="/workspace" replace />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/bot" element={<BotPreviewPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
