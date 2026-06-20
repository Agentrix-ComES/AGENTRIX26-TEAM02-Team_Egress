import { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  useEffect(() => {
    localStorage.setItem("signup_role", "User");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4">
      <div className="mb-6 text-center max-w-sm">
        <h1 className="text-xl font-semibold">Create a traveller account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign up to plan and manage your Sri Lanka itinerary.
        </p>
      </div>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" />
      <p className="text-xs text-muted-foreground mt-6">
        Admin? <a href="/admin/sign-up" className="underline underline-offset-4">Create an admin account</a>.
      </p>
    </div>
  );
}
