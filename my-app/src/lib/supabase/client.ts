import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

/**
 * Browser Supabase client (anon key + RLS).
 * Use in Client Components only.
 */
export function createClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey
  );
}
