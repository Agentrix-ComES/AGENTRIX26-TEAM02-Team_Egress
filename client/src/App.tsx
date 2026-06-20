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
import { SignInPage } from "@/pages/sign-in";
import { SignUpPage } from "@/pages/sign-up";
import { AuthSync } from "@/components/auth/AuthSync";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <BrowserRouter>
        <AuthSync />
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
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
