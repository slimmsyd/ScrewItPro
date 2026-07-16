import { z } from "zod";
import { getEnvStatus } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Inbound lead capture (quote dialog, hero address bar, contact).
 * Mirrors waitlist.ts conventions. Each capture dual-writes:
 *   1. Supabase `inquiries` table (source of truth)
 *   2. n8n webhook → Excel (optional / gated by N8N_INQUIRY_WEBHOOK_URL)
 */

export const inquirySources = [
  "quote_dialog",
  "hero_address",
  "contact",
  "other",
] as const;
export type InquirySource = (typeof inquirySources)[number];

export const inquirySchema = z.object({
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
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  service: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  pickupAddress: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  deliveryAddress: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  source: z.enum(inquirySources).default("quote_dialog"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryResult = {
  id: string;
  email: string;
  name: string | null;
  service: string | null;
  source: InquirySource;
  createdAt: string;
};

export function isInquiryBackendReady(): boolean {
  const status = getEnvStatus();
  return status.supabase.configured && status.supabase.serviceRoleConfigured;
}

/** Insert a lead and return the created row. */
export async function createInquiry(raw: InquiryInput): Promise<InquiryResult> {
  if (!isInquiryBackendReady()) {
    throw new InquiryConfigError(
      "Inquiry storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const parsed = inquirySchema.parse(raw);
  const emailNormalized = parsed.email.trim().toLowerCase();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      name: parsed.name,
      email: parsed.email,
      email_normalized: emailNormalized,
      phone: parsed.phone,
      service: parsed.service,
      message: parsed.message,
      pickup_address: parsed.pickupAddress,
      delivery_address: parsed.deliveryAddress,
      source: parsed.source,
    })
    .select("id, email, name, service, source, created_at")
    .single();

  if (error || !data) {
    throw new InquiryDbError(error?.message ?? "Failed to save inquiry", error?.code);
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name ?? null,
    service: data.service ?? null,
    source: data.source as InquirySource,
    createdAt: data.created_at,
  };
}

export class InquiryConfigError extends Error {
  readonly code = "inquiry_not_configured" as const;
  constructor(message: string) {
    super(message);
    this.name = "InquiryConfigError";
  }
}

export class InquiryDbError extends Error {
  readonly code = "inquiry_db_error" as const;
  readonly dbCode?: string;
  constructor(message: string, dbCode?: string) {
    super(message);
    this.name = "InquiryDbError";
    this.dbCode = dbCode;
  }
}
