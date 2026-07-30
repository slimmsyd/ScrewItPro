import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ code: string }> };

/**
 * GET/PATCH /api/admin/email-templates/[code]
 * Admin-only read/update of DB email template rows (service role).
 */

const patchSchema = z.object({
  subject_template: z.string().min(1).max(500).optional(),
  html_body_template: z.string().min(1).max(50000).optional(),
  text_body_template: z.string().min(1).max(20000).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    const status =
      admin.reason === "unauthenticated"
        ? 401
        : admin.reason === "not_configured"
          ? 503
          : 403;
    return NextResponse.json(
      { ok: false, error: admin.reason },
      { status }
    );
  }

  const { code } = await context.params;
  if (!code?.trim()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select(
        "code, name, subject_template, html_body_template, text_body_template, description, is_active, version, updated_at"
      )
      .eq("code", code.trim())
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: "templates_fetch_failed", message: error.message },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, template: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "orders_not_configured" },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    const status =
      admin.reason === "unauthenticated"
        ? 401
        : admin.reason === "not_configured"
          ? 503
          : 403;
    return NextResponse.json(
      { ok: false, error: admin.reason },
      { status }
    );
  }

  const { code } = await context.params;
  if (!code?.trim()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const input = patchSchema.parse(raw);
    const updates: Record<string, unknown> = {
      ...input,
      updated_by: admin.userId,
    };
    // bump version when content changes
    if (
      input.subject_template != null ||
      input.html_body_template != null ||
      input.text_body_template != null
    ) {
      // version increment via RPC-free: fetch then +1
    }

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("email_templates")
      .select("version")
      .eq("code", code.trim())
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    if (
      input.subject_template != null ||
      input.html_body_template != null ||
      input.text_body_template != null
    ) {
      updates.version = (existing.version as number) + 1;
    }

    const { data, error } = await supabase
      .from("email_templates")
      .update(updates)
      .eq("code", code.trim())
      .select(
        "code, name, subject_template, html_body_template, text_body_template, description, is_active, version, updated_at"
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          error: "templates_update_failed",
          message: error?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, template: data });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_input",
          message: e.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 }
      );
    }
    console.error("[api/admin/email-templates]", e);
    return NextResponse.json(
      { ok: false, error: "templates_update_failed" },
      { status: 500 }
    );
  }
}
