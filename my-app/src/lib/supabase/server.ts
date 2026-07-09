import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

/**
 * Server Supabase client with cookie session (anon key + RLS + user session).
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function createClient() {
 if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
 throw new Error(
 "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
 );
 }

 const cookieStore = await cookies();

 return createServerClient(
 publicEnv.supabaseUrl,
 publicEnv.supabaseAnonKey,
 {
 cookies: {
 getAll() {
 return cookieStore.getAll();
 },
 setAll(cookiesToSet) {
 try {
 cookiesToSet.forEach(({ name, value, options }) =>
 cookieStore.set(name, value, options)
 );
 } catch {
 // Called from a Server Component - middleware can refresh sessions.
 }
 },
 },
 }
 );
}
