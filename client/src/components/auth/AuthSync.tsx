import { syncUser } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function AuthSync() {
  const { getToken, isSignedIn } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    async function run() {
      if (!isSignedIn || hasSynced.current) return;
      try {
        const requestedRole = localStorage.getItem("signup_role") ?? undefined;
        await syncUser(getToken, requestedRole);
        toast.success("Account synced successfully!");
        hasSynced.current = true;
        localStorage.removeItem("signup_role");
      } catch (err) {
        console.error("Failed to sync user via Kong Gateway", err);
        toast.error("Failed to sync account.");
      }
    }
    run();
  }, [isSignedIn, getToken]);

  return null;
}
