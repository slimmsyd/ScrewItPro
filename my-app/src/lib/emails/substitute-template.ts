/**
 * Minimal {{var}} substitution for admin-editable email templates.
 * Unknown keys become empty string. Does not evaluate expressions.
 */

export type TemplateVars = Record<string, string | number | null | undefined>;

const VAR_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function substituteTemplate(
  template: string,
  vars: TemplateVars
): string {
  return template.replace(VAR_RE, (_match, key: string) => {
    const v = vars[key];
    if (v == null) return "";
    return String(v);
  });
}

/** Escape HTML entities after substitution for user-derived fields. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Build vars for HTML body: escape all string values except URL keys
 * (hrefs need raw https URLs).
 */
export function htmlSafeVars(
  vars: TemplateVars,
  urlKeys: ReadonlySet<string> = new Set(["trackUrl", "jobsUrl"])
): TemplateVars {
  const out: TemplateVars = {};
  for (const [k, v] of Object.entries(vars)) {
    if (v == null) {
      out[k] = "";
      continue;
    }
    const s = String(v);
    out[k] = urlKeys.has(k) ? s : escapeHtml(s);
  }
  return out;
}
