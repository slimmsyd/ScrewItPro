import { z } from "zod";
import { getEnvStatus } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const waitlistProviders = ["email", "google", "apple"] as const;
export type WaitlistProvider = (typeof waitlistProviders)[number];

export const waitlistSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(254)
    .email("Invalid email")
    .transform((v) => v.toLowerCase()),
  name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  picture: z
    .union([z.string().url().max(2048), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  provider: z.enum(waitlistProviders).default("email"),
  source: z.string().trim().max(64).default("join"),
  /** When set, links waitlist lead → profiles / auth.users after account create */
  convertedUserId: z.string().uuid().optional().nullable(),
});

export type WaitlistSignupInput = z.infer<typeof waitlistSignupSchema>;

export type WaitlistResult = {
  id: string;
  email: string;
  position: number;
  created: boolean;
  provider: WaitlistProvider;
};

export function isWaitlistBackendReady(): boolean {
  const status = getEnvStatus();
  return status.supabase.configured && status.supabase.serviceRoleConfigured;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Upsert a waitlist entry and return stable queue position (1-based by created_at).
 * Idempotent on email_normalized - re-joins keep original spot and refresh profile fields.
 */
export async function upsertWaitlistEntry(
  raw: WaitlistSignupInput
): Promise<WaitlistResult> {
  if (!isWaitlistBackendReady()) {
    throw new WaitlistConfigError(
      "Waitlist storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const parsed = waitlistSignupSchema.parse(raw);
  const emailNormalized = normalizeEmail(parsed.email);
  const picture =
    parsed.picture && parsed.picture.length > 0 ? parsed.picture : null;
  const name = parsed.name?.trim() || null;

  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("waitlist_entries")
    .select("id, email, provider, created_at")
    .eq("email_normalized", emailNormalized)
    .maybeSingle();

  if (existingError) {
    throw new WaitlistDbError(existingError.message, existingError.code);
  }

  let id: string;
  let created: boolean;
  let provider: WaitlistProvider;

  const conversion =
    parsed.convertedUserId != null
      ? { converted_user_id: parsed.convertedUserId }
      : {};

  if (existing) {
    const nextProvider =
      existing.provider === "email" && parsed.provider !== "email"
        ? parsed.provider
        : (existing.provider as WaitlistProvider);

    const baseUpdate = {
      email: parsed.email,
      name: name ?? undefined,
      picture: picture ?? undefined,
      provider: nextProvider,
      source: parsed.source,
    };

    let { data: updated, error: updateError } = await supabase
      .from("waitlist_entries")
      .update({ ...baseUpdate, ...conversion })
      .eq("id", existing.id)
      .select("id, email, provider")
      .single();

    // Older DBs may lack converted_user_id - retry without linking
    if (updateError && parsed.convertedUserId) {
      ({ data: updated, error: updateError } = await supabase
        .from("waitlist_entries")
        .update(baseUpdate)
        .eq("id", existing.id)
        .select("id, email, provider")
        .single());
    }

    if (updateError || !updated) {
      throw new WaitlistDbError(
        updateError?.message ?? "Failed to update waitlist entry",
        updateError?.code
      );
    }

    id = updated.id;
    created = false;
    provider = updated.provider as WaitlistProvider;
  } else {
    const baseInsert = {
      email: parsed.email,
      email_normalized: emailNormalized,
      name,
      picture,
      provider: parsed.provider,
      source: parsed.source,
    };

    let { data: inserted, error: insertError } = await supabase
      .from("waitlist_entries")
      .insert({ ...baseInsert, ...conversion })
      .select("id, email, provider, created_at")
      .single();

    if (insertError && parsed.convertedUserId && insertError.code !== "23505") {
      ({ data: inserted, error: insertError } = await supabase
        .from("waitlist_entries")
        .insert(baseInsert)
        .select("id, email, provider, created_at")
        .single());
    }

    if (insertError || !inserted) {
      // Race: unique conflict - re-fetch and treat as existing
      if (insertError?.code === "23505") {
        const { data: raced, error: raceError } = await supabase
          .from("waitlist_entries")
          .select("id, email, provider")
          .eq("email_normalized", emailNormalized)
          .single();
        if (raceError || !raced) {
          throw new WaitlistDbError(
            raceError?.message ?? "Failed to resolve waitlist conflict",
            raceError?.code
          );
        }
        id = raced.id;
        created = false;
        provider = raced.provider as WaitlistProvider;
        const position = await getWaitlistPosition(emailNormalized);
        return {
          id,
          email: parsed.email,
          position,
          created,
          provider,
        };
      }
      throw new WaitlistDbError(
        insertError?.message ?? "Failed to insert waitlist entry",
        insertError?.code
      );
    }

    id = inserted.id;
    created = true;
    provider = inserted.provider as WaitlistProvider;
  }

  const position = await getWaitlistPosition(emailNormalized);

  return {
    id,
    email: parsed.email,
    position,
    created,
    provider,
  };
}

/** 1-based rank by created_at ascending (earlier signups = lower number). */
export async function getWaitlistPosition(
  emailNormalized: string
): Promise<number> {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(emailNormalized);

  const { data: row, error: rowError } = await supabase
    .from("waitlist_entries")
    .select("created_at")
    .eq("email_normalized", normalized)
    .maybeSingle();

  if (rowError) {
    throw new WaitlistDbError(rowError.message, rowError.code);
  }
  if (!row) {
    return 0;
  }

  const { count, error: countError } = await supabase
    .from("waitlist_entries")
    .select("id", { count: "exact", head: true })
    .lte("created_at", row.created_at);

  if (countError) {
    throw new WaitlistDbError(countError.message, countError.code);
  }

  return count ?? 0;
}

export class WaitlistConfigError extends Error {
  readonly code = "waitlist_not_configured" as const;
  constructor(message: string) {
    super(message);
    this.name = "WaitlistConfigError";
  }
}

export class WaitlistDbError extends Error {
  readonly code = "waitlist_db_error" as const;
  readonly dbCode?: string;
  constructor(message: string, dbCode?: string) {
    super(message);
    this.name = "WaitlistDbError";
    this.dbCode = dbCode;
  }
}
