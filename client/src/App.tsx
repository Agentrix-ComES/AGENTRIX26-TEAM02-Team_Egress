import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import { CurrentUserProvider, useCurrentUser } from "@/hooks/use-current-user";
import { AppShell } from "@/components/layout/app-shell";
import { AdminShell } from "@/components/layout/admin-shell";
import { LandingPage } from "@/pages/landing";
import { OverviewPage } from "@/pages/overview";
import { PlanTripPage } from "@/pages/plan-trip";
import { WorkspacePage } from "@/pages/workspace";
import { AlertsPage } from "@/pages/alerts";
import { BotPreviewPage } from "@/pages/bot-preview";
import { AdminPage } from "@/pages/admin";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminServicesPage } from "@/pages/admin/services";
import { AdminProductsPage } from "@/pages/admin/products";
import { SettingsPage } from "@/pages/settings";
import { SignInPage } from "@/pages/sign-in";
import { SignUpPage } from "@/pages/sign-up";
import { AdminSignInPage } from "@/pages/admin-sign-in";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function RoleGate({ role, children }: { role: "Admin" | "User"; children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  if (loading || !user) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (user.role !== role) {
    return <Navigate to={user.role === "Admin" ? "/admin" : "/app"} replace />;
  }
  return <>{children}</>;
}

function RootRoute() {
  const { user, loading } = useCurrentUser();
  return (
    <>
      <SignedOut><LandingPage /></SignedOut>
      <SignedIn>
        {loading || !user ? (
          <div className="grid place-items-center min-h-screen text-muted-foreground">
            Loading your account…
          </div>
        ) : (
          <Navigate to={user.role === "Admin" ? "/admin" : "/app"} replace />
        )}
      </SignedIn>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <BrowserRouter>
        <CurrentUserProvider>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/admin/sign-in/*" element={<AdminSignInPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <RoleGate role="User">
                    <AppShell />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route path="/app" element={<OverviewPage />} />
              <Route path="/plan" element={<PlanTripPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/chat" element={<Navigate to="/workspace" replace />} />
              <Route path="/timeline" element={<Navigate to="/workspace" replace />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/bot" element={<BotPreviewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <RoleGate role="Admin">
                    <AdminShell />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
            </Route>
          </Routes>
        </CurrentUserProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
