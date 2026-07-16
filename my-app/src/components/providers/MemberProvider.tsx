"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deriveMemberStatus,
  type MemberStatus,
  type MemberUser,
} from "@/lib/member";
import { publicEnv } from "@/lib/env";

type SessionApiUser = {
  email?: string;
  name?: string;
  picture?: string;
  provider?: string;
  position?: number | null;
};

type MemberContextValue = {
  status: MemberStatus;
  user: MemberUser | null;
  loading: boolean;
  /** Re-fetch session + waitlist position (call after join / sign-out). */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const MemberContext = createContext<MemberContextValue | null>(null);

function mapUser(raw: SessionApiUser | null | undefined): MemberUser | null {
  if (!raw?.email) return null;
  return {
    email: raw.email,
    name: raw.name ?? "",
    picture: raw.picture ?? "",
    provider: raw.provider ?? "email",
    position:
      typeof raw.position === "number" && raw.position > 0
        ? raw.position
        : null,
  };
}

async function fetchSessionUser(): Promise<MemberUser | null> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: SessionApiUser | null };
    return mapUser(data.user);
  } catch {
    return null;
  }
}

function isSupabasePublicReady() {
  return Boolean(
    publicEnv.supabaseUrl?.trim() && publicEnv.supabaseAnonKey?.trim()
  );
}

export default function MemberProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MemberUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchSessionUser();
    setUser(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next = await fetchSessionUser();
      if (!cancelled) {
        setUser(next);
        setLoading(false);
      }
    })();

    // Keep multi-tab login/logout in sync when Supabase is configured.
    let unsubscribe: (() => void) | undefined;
    if (isSupabasePublicReady()) {
      try {
        // Dynamic import keeps SSR clean if env is missing at build time.
        void import("@/lib/supabase/client").then(({ createClient }) => {
          if (cancelled) return;
          try {
            const supabase = createClient();
            const { data } = supabase.auth.onAuthStateChange(() => {
              void refresh();
            });
            unsubscribe = () => data.subscription.unsubscribe();
          } catch {
            /* not configured at runtime */
          }
        });
      } catch {
        /* ignore */
      }
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    if (isSupabasePublicReady()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("[member] signOut failed", err);
      }
    }
    setUser(null);
    setLoading(false);
    await refresh();
  }, [refresh]);

  const status = useMemo(
    () => deriveMemberStatus(user, loading),
    [user, loading]
  );

  const value = useMemo<MemberContextValue>(
    () => ({
      status,
      user,
      loading,
      refresh,
      signOut,
    }),
    [status, user, loading, refresh, signOut]
  );

  return (
    <MemberContext.Provider value={value}>{children}</MemberContext.Provider>
  );
}

export function useMember(): MemberContextValue {
  const ctx = useContext(MemberContext);
  if (!ctx) {
    throw new Error("useMember must be used within MemberProvider");
  }
  return ctx;
}

/**
 * Safe hook for optional use outside provider (defaults to anonymous).
 * Prefer useMember inside the app tree.
 */
export function useMemberOptional(): MemberContextValue {
  const ctx = useContext(MemberContext);
  return (
    ctx ?? {
      status: "anonymous",
      user: null,
      loading: false,
      refresh: async () => {},
      signOut: async () => {},
    }
  );
}
