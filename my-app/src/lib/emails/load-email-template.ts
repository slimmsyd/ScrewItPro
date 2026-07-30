/**
 * Load admin-editable email template row (service role).
 * Falls back to null when table missing / not configured.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnvStatus } from "@/lib/env";

export type EmailTemplateRow = {
  code: string;
  name: string;
  subject_template: string;
  html_body_template: string;
  text_body_template: string;
  is_active: boolean;
  version: number;
};

export async function loadEmailTemplate(
  code: string
): Promise<EmailTemplateRow | null> {
  const status = getEnvStatus();
  if (!status.supabase.configured || !status.supabase.serviceRoleConfigured) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select(
        "code, name, subject_template, html_body_template, text_body_template, is_active, version"
      )
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        // PGRST205 = table missing from schema cache
        console.info(
          `[email:templates] load ${code}: ${error.code ?? ""} ${error.message}`
        );
      }
      return null;
    }

    return data as EmailTemplateRow;
  } catch (e) {
    console.info(
      `[email:templates] load threw for ${code}`,
      e instanceof Error ? e.message : e
    );
    return null;
  }
}
