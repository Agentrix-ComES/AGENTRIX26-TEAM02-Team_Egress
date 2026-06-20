import { useState, useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function SignUpPage() {
  const [role, setRole] = useState<string>("User");

  useEffect(() => {
    localStorage.setItem("signup_role", role);
  }, [role]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950 py-12">
      <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm w-full max-w-sm">
        <h3 className="text-lg font-medium mb-4 text-center">Account Role</h3>
        <RadioGroup defaultValue="User" value={role} onValueChange={setRole} className="flex gap-4 justify-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="User" id="r1" />
            <Label htmlFor="r1">User</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Admin" id="r2" />
            <Label htmlFor="r2">Admin</Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Select your role before completing the sign up below.
        </p>
      </div>

      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  );
}
