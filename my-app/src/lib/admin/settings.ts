import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  coverageFromTravelPricing,
  evaluateTravelPricing,
} from "@/lib/quote/travel-pricing";

/** Product defaults - win over kit seed (70% deposit / 30 mi). */
export const DEFAULT_DEPOSIT_PERCENT = 30;
export const DEFAULT_RADIUS_MILES = 40;
export const DEFAULT_HUB_ADDRESS = "Houston, TX";

export const WINDOWS = ["8 - 11a", "11a - 2p", "2 - 5p", "5 - 8p"] as const;
export const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const LEG_KEYS = [
  "pickup",
  "intake",
  "build",
  "qc",
  "deliver",
] as const;
export type LegKey = (typeof LEG_KEYS)[number];

export const LEG_LABELS: Record<LegKey, string> = {
  pickup: "Pickup",
  intake: "Intake",
  build: "Build",
  qc: "QC",
  deliver: "Deliver",
};

export const DEFAULT_DURATIONS: Record<LegKey, number> = {
  pickup: 60,
  intake: 30,
  build: 120,
  qc: 30,
  deliver: 90,
};

const durationsSchema = z.object({
  pickup: z.number().min(15).max(480),
  intake: z.number().min(15).max(480),
  build: z.number().min(15).max(480),
  qc: z.number().min(15).max(480),
  deliver: z.number().min(15).max(480),
});

const tierSchema = z.object({
  to: z.number().min(1).max(500),
  fee: z.number().min(0).max(10_000),
});

const exceptionSchema = z.object({
  zip: z.string().max(12),
  mode: z.enum(["surcharge", "refuse"]),
  why: z.string().max(200),
});

/** Kit-aligned ops rules - stored for admin; not all keys drive booking yet. */
export const opsRulesSchema = z.object({
  closedDays: z.array(z.string()).max(7),
  capPerWindow: z.number().min(1).max(50),
  durations: durationsSchema,
  baseRate: z.number().min(0).max(50_000),
  perItem: z.number().min(0).max(50_000),
  membership: z.number().min(0).max(50_000),
  driveMinutes: z.number().min(10).max(300),
  tiers: z.array(tierSchema).min(1).max(8),
  farFee: z.number().min(0).max(10_000),
  exceptions: z.array(exceptionSchema).max(50),
});

export type OpsRules = z.infer<typeof opsRulesSchema>;

export const hubSchema = z.object({
  address: z.string().min(1).max(200),
  radius_miles: z.number().min(5).max(200),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius_m: z.number().optional(),
  timezone: z.string().optional(),
});

export const adminSettingsSchema = z.object({
  deposit_percent: z.number().min(5).max(100),
  hub: hubSchema,
  ops: opsRulesSchema,
});

export type AdminSettings = z.infer<typeof adminSettingsSchema>;

export const adminSettingsPatchSchema = z
  .object({
    deposit_percent: z.number().min(5).max(100).optional(),
    hub: hubSchema.partial().optional(),
    ops: opsRulesSchema.partial().optional(),
  })
  .refine(
    (v) =>
      v.deposit_percent !== undefined ||
      v.hub !== undefined ||
      v.ops !== undefined,
    { message: "at least one of deposit_percent, hub, or ops is required" }
  );

export type AdminSettingsPatch = z.infer<typeof adminSettingsPatchSchema>;

export const DEFAULT_OPS: OpsRules = {
  closedDays: ["Sun"],
  capPerWindow: 3,
  durations: { ...DEFAULT_DURATIONS },
  baseRate: 89,
  perItem: 35,
  membership: 29,
  driveMinutes: 45,
  tiers: [
    { to: 15, fee: 0 },
    { to: 40, fee: 20 },
  ],
  farFee: 45,
  exceptions: [],
};

function asNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return fallback;
}

function parseHub(raw: unknown): AdminSettings["hub"] {
  const o =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const radius_miles = asNumber(o.radius_miles, DEFAULT_RADIUS_MILES);
  return {
    address:
      typeof o.address === "string" && o.address.trim()
        ? o.address.trim()
        : DEFAULT_HUB_ADDRESS,
    radius_miles,
    lat: typeof o.lat === "number" ? o.lat : undefined,
    lng: typeof o.lng === "number" ? o.lng : undefined,
    radius_m:
      typeof o.radius_m === "number"
        ? o.radius_m
        : Math.round(radius_miles * 1609.34),
    timezone:
      typeof o.timezone === "string" ? o.timezone : "America/Chicago",
  };
}

function parseDeposit(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && !Number.isNaN(Number(raw))) return Number(raw);
  return asNumber(raw, DEFAULT_DEPOSIT_PERCENT);
}

function parseOps(raw: unknown): OpsRules {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_OPS, durations: { ...DEFAULT_DURATIONS } };
  }
  const o = raw as Record<string, unknown>;
  const durationsRaw =
    o.durations && typeof o.durations === "object"
      ? (o.durations as Record<string, unknown>)
      : {};
  const tiers = Array.isArray(o.tiers)
    ? o.tiers
        .filter((t) => t && typeof t === "object")
        .map((t) => {
          const row = t as Record<string, unknown>;
          return {
            to: asNumber(row.to, 15),
            fee: asNumber(row.fee, 0),
          };
        })
    : DEFAULT_OPS.tiers;
  const exceptions = Array.isArray(o.exceptions)
    ? o.exceptions
        .filter((e) => e && typeof e === "object")
        .map((e) => {
          const row = e as Record<string, unknown>;
          return {
            zip: typeof row.zip === "string" ? row.zip : "",
            mode: row.mode === "refuse" ? ("refuse" as const) : ("surcharge" as const),
            why: typeof row.why === "string" ? row.why : "",
          };
        })
    : [];

  const closedDays = Array.isArray(o.closedDays)
    ? o.closedDays.filter((d): d is string => typeof d === "string")
    : DEFAULT_OPS.closedDays;

  const merged = {
    closedDays,
    capPerWindow: asNumber(o.capPerWindow, DEFAULT_OPS.capPerWindow),
    durations: {
      pickup: asNumber(durationsRaw.pickup, DEFAULT_DURATIONS.pickup),
      intake: asNumber(durationsRaw.intake, DEFAULT_DURATIONS.intake),
      build: asNumber(durationsRaw.build, DEFAULT_DURATIONS.build),
      qc: asNumber(durationsRaw.qc, DEFAULT_DURATIONS.qc),
      deliver: asNumber(durationsRaw.deliver, DEFAULT_DURATIONS.deliver),
    },
    baseRate: asNumber(o.baseRate, DEFAULT_OPS.baseRate),
    perItem: asNumber(o.perItem, DEFAULT_OPS.perItem),
    membership: asNumber(o.membership, DEFAULT_OPS.membership),
    driveMinutes: asNumber(o.driveMinutes, DEFAULT_OPS.driveMinutes),
    tiers: tiers.length ? tiers : DEFAULT_OPS.tiers,
    farFee: asNumber(o.farFee, DEFAULT_OPS.farFee),
    exceptions,
  };

  const parsed = opsRulesSchema.safeParse(merged);
  return parsed.success
    ? parsed.data
    : { ...DEFAULT_OPS, durations: { ...DEFAULT_DURATIONS } };
}

export type CoverageResult =
  | { ok: true; fee: number; label: string }
  | { ok: false; fee: 0; label: string };

/**
 * Coverage preview for Settings "Check an address".
 * Model 1 via evaluateTravelPricing — free inside radius; outside = farFee + bookable.
 * Distance tiers in ops_rules are reserved (not used for fee math under Model 1).
 */
export function coverageFor(
  miles: number,
  radiusMiles: number,
  tiers: { to: number; fee: number }[],
  farFee: number,
  exceptions: { zip: string; mode: "surcharge" | "refuse"; why: string }[],
  testZip?: string
): CoverageResult {
  return coverageFromTravelPricing(
    evaluateTravelPricing({
      miles,
      radiusMiles,
      tiers,
      farFee,
      exceptions,
      zip: testZip,
    })
  );
}

export function money(n: number): string {
  return `$${Number(n).toFixed(2)}`;
}

/**
 * Load admin settings from app_settings (service role).
 * Keys: deposit_percent, hub, ops_rules.
 */
export async function fetchAdminSettings(): Promise<AdminSettings> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_settings")
    .select("key, value")
    .in("key", ["deposit_percent", "hub", "ops_rules"]);

  if (error) {
    throw new Error(`app_settings_read_failed: ${error.message}`);
  }

  const map = new Map<string, unknown>();
  for (const row of data ?? []) {
    map.set(row.key as string, row.value);
  }

  return adminSettingsSchema.parse({
    deposit_percent: parseDeposit(map.get("deposit_percent")),
    hub: parseHub(map.get("hub")),
    ops: parseOps(map.get("ops_rules")),
  });
}

export async function patchAdminSettings(
  patch: AdminSettingsPatch
): Promise<AdminSettings> {
  const current = await fetchAdminSettings();
  const next: AdminSettings = {
    deposit_percent:
      patch.deposit_percent !== undefined
        ? patch.deposit_percent
        : current.deposit_percent,
    hub: {
      ...current.hub,
      ...patch.hub,
    },
    ops: {
      ...current.ops,
      ...patch.ops,
      durations: {
        ...current.ops.durations,
        ...(patch.ops?.durations ?? {}),
      },
      tiers: patch.ops?.tiers ?? current.ops.tiers,
      exceptions: patch.ops?.exceptions ?? current.ops.exceptions,
      closedDays: patch.ops?.closedDays ?? current.ops.closedDays,
    },
  };

  if (patch.hub?.radius_miles !== undefined || next.hub.radius_m == null) {
    next.hub.radius_m = Math.round(next.hub.radius_miles * 1609.34);
  }

  const parsed = adminSettingsSchema.parse(next);
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const writes: { key: string; value: unknown }[] = [];
  if (patch.deposit_percent !== undefined) {
    writes.push({ key: "deposit_percent", value: parsed.deposit_percent });
  }
  if (patch.hub !== undefined) {
    writes.push({ key: "hub", value: parsed.hub });
  }
  if (patch.ops !== undefined) {
    writes.push({ key: "ops_rules", value: parsed.ops });
  }

  // Full save from Settings UI always sends all three - also allow partial.
  // When client saves everything, it will send all fields.
  for (const w of writes) {
    const { error } = await admin.from("app_settings").upsert(
      { key: w.key, value: w.value, updated_at: now },
      { onConflict: "key" }
    );
    if (error) throw new Error(`${w.key}_upsert_failed: ${error.message}`);
  }

  return parsed;
}

/** Full replace used by Settings Save (all sections). Soft-geocodes hub address. */
export async function saveAdminSettings(
  body: AdminSettings
): Promise<AdminSettings> {
  const parsed = adminSettingsSchema.parse(body);
  let hub = {
    ...parsed.hub,
    radius_m: Math.round(parsed.hub.radius_miles * 1609.34),
  };

  // Soft geocode: update lat/lng when address present. Never invent downtown on failure.
  try {
    const { geocodeAddress } = await import("@/lib/google");
    const geo = (await geocodeAddress(hub.address)) as {
      status?: string;
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    if (geo.status === "OK" && geo.results?.[0]?.geometry?.location) {
      const loc = geo.results[0].geometry.location;
      hub = { ...hub, lat: loc.lat, lng: loc.lng };
    } else {
      console.warn(
        "[admin/settings] geocode soft-fail status=",
        geo.status ?? "unknown"
      );
    }
  } catch (e) {
    console.warn("[admin/settings] geocode soft-fail", e);
  }

  const withMeters: AdminSettings = {
    ...parsed,
    hub,
  };
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const rows: { key: string; value: unknown; updated_at: string }[] = [
    {
      key: "deposit_percent",
      value: withMeters.deposit_percent,
      updated_at: now,
    },
    { key: "hub", value: withMeters.hub, updated_at: now },
    { key: "ops_rules", value: withMeters.ops, updated_at: now },
  ];
  for (const row of rows) {
    const { error } = await admin.from("app_settings").upsert(
      {
        key: row.key,
        value: row.value as object | number,
        updated_at: row.updated_at,
      },
      { onConflict: "key" }
    );
    if (error) throw new Error(`${row.key}_upsert_failed: ${error.message}`);
  }
  return withMeters;
}
