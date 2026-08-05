/**
 * Single source of truth for post-book "what happens next" copy.
 * Used by confirmation, My Jobs next-step, track, and booking email.
 *
 * Hub street address may be refined by ops — edit HUB_INTAKE only.
 */
import { BUSINESS } from "@/lib/seo/business";
import type { CustomerOrderStatus } from "./types";

export type PortalNextStep = {
  title: string;
  body: string;
  cta: string;
};

/** Houston hub intake — update lines when CEO/ops locks a street address. */
export const HUB_INTAKE = {
  name: "ScrewIt Pros Houston Hub",
  /**
   * Display lines (no invented street until ops confirms).
   * Prefer: ["123 Example St", "Houston, TX 77002"]
   */
  lines: [
    "Houston, TX · service area hub",
    `Ship-to / drop-off street: email ${BUSINESS.careEmail} with your order number if you need the current address.`,
  ] as readonly string[],
  /** How the customer should mark boxes */
  labelTemplate: (orderNumber: string) =>
    `ScrewIt Pros · Order ${orderNumber}`,
  packingTips: [
    "Keep all hardware bags taped to or inside the main box.",
    "Photograph any damage before you ship or drop off.",
    "Use the order number on every box and on the packing slip.",
  ] as readonly string[],
  supportEmail: BUSINESS.careEmail,
} as const;

/** Primary next-step language for each customer status (honest CTAs only). */
const NEXT_BY_STATUS: Record<CustomerOrderStatus, PortalNextStep> = {
  booked: {
    title: "Get your items to our hub",
    body: "Label every box with your order number (SIP-…). Ship or drop off at our Houston hub — instructions are on this page and in your confirmation email. We assemble, QC, then white-glove deliver.",
    cta: "Track order",
  },
  pickup_scheduled: {
    title: "Be ready for pickup",
    body: "Have items accessible in the window we confirmed. We'll notify you if anything changes.",
    cta: "Track order",
  },
  picked_up: {
    title: "On the way to the workshop",
    body: "No action needed — we'll update you when assembly starts.",
    cta: "Track order",
  },
  in_workshop: {
    title: "We're building it",
    body: "Our pros are assembling and QC'ing your pieces. We'll email you when delivery scheduling opens.",
    cta: "Track order",
  },
  assembled_inspected: {
    title: "QC complete",
    body: "Built and inspected. We'll reach out to lock delivery details — no action required in the app yet.",
    cta: "Track order",
  },
  out_for_delivery: {
    title: "Out for delivery",
    body: "Your build is on the truck. Clear a path to the room and keep your phone handy.",
    cta: "Track order",
  },
  delivered: {
    title: "Enjoy your furniture",
    body: "Need a tweak or have photos to share? Message support anytime.",
    cta: "View order",
  },
};

export function nextStepForStatus(status: CustomerOrderStatus): PortalNextStep {
  return NEXT_BY_STATUS[status];
}

/** Short hub blurb for emails when full address block is separate. */
export function hubHintSummary(): string {
  return `${HUB_INTAKE.name}: ${HUB_INTAKE.lines[0]}. Label boxes with your order number and ship or drop off — full steps are in this email.`;
}

/** Plain-text hub + packing block for emails. */
export function hubIntakeEmailText(orderNumber: string): string {
  const label = HUB_INTAKE.labelTemplate(orderNumber);
  return [
    "YOUR NEXT STEP — GET ITEMS TO THE HUB",
    HUB_INTAKE.name,
    ...HUB_INTAKE.lines,
    "",
    `Mark every box: ${label}`,
    "",
    "Packing tips:",
    ...HUB_INTAKE.packingTips.map((t) => `• ${t}`),
    "",
    `Questions? ${HUB_INTAKE.supportEmail}`,
  ].join("\n");
}

/** HTML fragment (inner) for hub intake — already escaped static copy. */
export function hubIntakeEmailHtml(orderNumber: string): string {
  const label = HUB_INTAKE.labelTemplate(orderNumber);
  const lines = HUB_INTAKE.lines
    .map(
      (l) =>
        `<p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#2a3050;">${escapeBasic(l)}</p>`
    )
    .join("");
  const tips = HUB_INTAKE.packingTips
    .map(
      (t) =>
        `<li style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#2a3050;">${escapeBasic(t)}</li>`
    )
    .join("");
  return `
    <p style="margin:16px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#1d6efe;">Your next step</p>
    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#04209b;">Get your items to our hub</p>
    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0b1030;">${escapeBasic(HUB_INTAKE.name)}</p>
    ${lines}
    <p style="margin:12px 0 8px;font-size:14px;line-height:1.5;color:#2a3050;">Mark every box: <strong>${escapeBasic(label)}</strong></p>
    <ul style="margin:0 0 12px;padding-left:18px;">${tips}</ul>
    <p style="margin:0 0 14px;font-size:13px;color:#545b7a;">Questions? ${escapeBasic(HUB_INTAKE.supportEmail)}</p>
  `;
}

function escapeBasic(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
