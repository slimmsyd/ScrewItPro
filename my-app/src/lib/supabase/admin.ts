import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client - bypasses RLS.
 * Server-only. Never import from Client Components.
 */
export function createAdminClient() {
 if (!publicEnv.supabaseUrl) {
 throw new Error(
 "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL."
 );
 }

 return createClient(
 publicEnv.supabaseUrl,
 serverEnv.supabaseServiceRoleKey,
 {
 auth: {
 autoRefreshToken: false,
 persistSession: false,
 },
 }
 );
}
