import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { fetchMe, syncUser, type CurrentUser } from "@/lib/api";

interface CurrentUserContextValue {
  user: CurrentUser | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const syncedFor = useRef<boolean>(false);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null);
      syncedFor.current = false;
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!syncedFor.current) {
        const requestedRole = localStorage.getItem("signup_role") ?? undefined;
        await syncUser(getToken, requestedRole);
        localStorage.removeItem("signup_role");
        syncedFor.current = true;
      }
      setUser(await fetchMe(getToken));
    } catch (err) {
      console.error("Failed to load current user", err);
      setError(err as Error);
      setUser(null);
      toast.error("Failed to load your account.");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    refresh();
  }, [isLoaded, refresh]);

  const value = useMemo(
    () => ({ user, loading, error, refresh }),
    [user, loading, error, refresh],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
