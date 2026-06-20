import { SignIn } from "@clerk/clerk-react";
import { ShieldCheck } from "lucide-react";

export function AdminSignInPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-zinc-100">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 mb-3">
            <ShieldCheck className="h-6 w-6 text-indigo-300" />
          </div>
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Authorised personnel only. Sign in to manage the platform.
          </p>
        </div>
        <SignIn
          routing="path"
          path="/admin/sign-in"
          forceRedirectUrl="/admin"
          appearance={{ elements: { footerAction: { display: "none" } } }}
        />
        <div className="space-y-1 text-center text-xs text-zinc-500">
          <p>Admin accounts are provisioned by configuration. Sign-up is disabled.</p>
          <p>
            Not an admin?{" "}
            <a href="/sign-in" className="text-zinc-300 underline underline-offset-4">
              Use the traveller sign-in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
