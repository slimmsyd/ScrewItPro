/**
 * Shared HTML email chrome for ScrewIt Pros transactional email.
 *
 * Templates are plain HTML-string functions (no react-email dependency) so they
 * render with the existing sendEmail() and can be previewed in-browser at
 * /dev/emails before any Resend credential exists. Colors mirror the site's
 * brand tokens from globals.css (inlined here because email clients strip
 * <style> and CSS variables).
 */

/** Brand palette (inlined — email clients do not support CSS variables). */
export const brand = {
  blueDeep: "#04209b",
  blueElectric: "#1d6efe",
  blue50: "#eef3ff",
  blue100: "#dce7ff",
  ink900: "#0b1030",
  ink700: "#2a3050",
  ink500: "#545b7a",
  gray200: "#d8ddeb",
  gray100: "#e9edf6",
  gray50: "#f4f6fb",
  white: "#ffffff",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export type LayoutOptions = {
  /** Preview/preheader text shown in the inbox list before the body. */
  preheader?: string;
  /** Absolute base URL for links (defaults to the public app URL). */
  appUrl?: string;
};

/**
 * Wrap body HTML in the branded shell (header wordmark + footer).
 * `bodyHtml` should be the inner content only.
 */
export function renderLayout(bodyHtml: string, options: LayoutOptions = {}): string {
  const appUrl =
    options.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://screwitpros.com";
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "ScrewIt Pros";
  const year = new Date().getFullYear();
  const preheader = options.preheader ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${appName}</title>
</head>
<body style="margin:0;padding:0;background:${brand.gray50};font-family:${FONT_STACK};color:${brand.ink700};-webkit-font-smoothing:antialiased;">
${
  preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
        preheader
      )}</div>`
    : ""
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.gray50};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${brand.white};border:1px solid ${brand.gray200};border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:${brand.blueDeep};padding:22px 32px;">
            <a href="${appUrl}" style="text-decoration:none;color:${brand.white};font-size:19px;font-weight:700;letter-spacing:-0.02em;">
              ${appName}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:${brand.gray50};border-top:1px solid ${brand.gray200};">
            <p style="margin:0;font-size:12px;line-height:1.6;color:${brand.ink500};">
              ${appName} — furniture assembly &amp; white-glove delivery, Houston metro.<br />
              If You Don't Want to Do It, ScrewIt!
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:${brand.ink500};">
              &copy; ${year} ${appName}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** A primary CTA button (bulletproof-ish table button for email clients). */
export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0;">
  <tr>
    <td style="border-radius:10px;background:${brand.blueElectric};">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:${brand.white};text-decoration:none;border-radius:10px;">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`;
}

/** Heading used at the top of the body. */
export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:${brand.blueDeep};">${escapeHtml(
    text
  )}</h1>`;
}

/** Body paragraph. */
export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${brand.ink700};">${html}</p>`;
}

/** Escape untrusted text for safe HTML interpolation. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
