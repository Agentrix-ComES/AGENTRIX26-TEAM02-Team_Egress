import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function AuthSync() {
  const { getToken, isSignedIn } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (isSignedIn && !hasSynced.current) {
        try {
          const token = await getToken();
          const requestedRole = localStorage.getItem("signup_role");
          
          const response = await fetch(`${API_URL}/users/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: requestedRole ? JSON.stringify({ requested_role: requestedRole }) : undefined
          });
          
          if (response.ok) {
            console.log("User synchronized with backend Postgres database via Kong.");
            toast.success("Account synced successfully!");
            hasSynced.current = true;
            localStorage.removeItem("signup_role"); // clear after sync
          } else {
            console.error("Failed to sync user via Kong Gateway", await response.text());
            toast.error("Failed to sync account.");
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
    }

    syncUser();
  }, [isSignedIn, getToken]);

  return null;
}
