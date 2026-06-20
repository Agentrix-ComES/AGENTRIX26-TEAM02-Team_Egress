import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

export function AuthSync() {
  const { getToken, isSignedIn } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (isSignedIn && !hasSynced.current) {
        try {
          const token = await getToken();
          const response = await fetch("http://localhost:8000/api/ai/users/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            console.log("User synchronized with backend Postgres database via Kong.");
            hasSynced.current = true;
          } else {
            console.error("Failed to sync user via Kong Gateway", await response.text());
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
