/**
 * Transactional email templates for ScrewIt Pros.
 *
 * Each template is a pure function: data in → { subject, html, text } out.
 * They render with no external service, so /dev/emails can preview every design
 * before Resend credentials exist. Live sending is handled by dispatchEmail().
 */

import {
  brand,
  button,
  escapeHtml,
  heading,
  paragraph,
  renderLayout,
} from "./layout";

/**
 * Stable identifier for a template, carried by the rendered email itself.
 *
 * Lives on the template (not the call site) so a code can never be mismatched
 * to the body it labels. Persisted to `email_log.template_code`, where it is
 * both the diagnostic discriminator and the reminder idempotency key
 * ("has code X already been sent for order Y?"). Codes are therefore append-only
 * and must never be renamed once a row exists carrying one.
 */
export type EmailTemplateCode =
  | "waitlist-confirmation"
  | "inquiry-ack"
  | "new-lead-notice"
  | "verification"
  | "welcome"
  | "booking-confirmation";

export type RenderedEmail = {
  code: EmailTemplateCode;
  subject: string;
  html: string;
  text: string;
};

/* ------------------------------------------------------------------ */
/* Waitlist confirmation                                              */
/* ------------------------------------------------------------------ */

export type WaitlistConfirmationData = {
  name?: string | null;
  position?: number | null;
};

export function waitlistConfirmation(
  data: WaitlistConfirmationData = {}
): RenderedEmail {
  const greeting = data.name ? `Hi ${escapeHtml(data.name)},` : "Hi there,";
  const spot =
    data.position && data.position > 0
      ? paragraph(
          `You're currently <strong style="color:${brand.blueDeep};">#${data.position}</strong> in line. We'll email you the moment your spot opens up.`
        )
      : paragraph(
          "We'll email you the moment your spot opens up. No need to check back."
        );

  const body = `
    ${heading("You're on the list! 🎉")}
    ${paragraph(greeting)}
    ${paragraph(
      "Thanks for joining the ScrewIt Pros private beta. We're building the easiest way to get flat-pack furniture assembled and delivered, fully built and placed in your home."
    )}
    ${spot}
    ${paragraph(
      `In the meantime, here's how it works: you buy the furniture, ship it to our Houston hub, and we assemble, QC, and white-glove deliver it. That's it.`
    )}
    ${button("Visit ScrewIt Pros", process.env.NEXT_PUBLIC_APP_URL ?? "https://screwitpros.com")}
  `;

  return {
    code: "waitlist-confirmation",
    subject: "You're on the ScrewIt Pros waitlist ✅",
    html: renderLayout(body, {
      preheader: "Your spot is saved. Here's what happens next.",
    }),
    text: [
      "You're on the list!",
      "",
      data.name ? `Hi ${data.name},` : "Hi there,",
      "",
      "Thanks for joining the ScrewIt Pros private beta.",
      data.position && data.position > 0
        ? `You're currently #${data.position} in line. We'll email you when your spot opens up.`
        : "We'll email you when your spot opens up.",
      "",
      "How it works: you buy the furniture, ship it to our Houston hub, and we assemble, QC, and white-glove deliver it.",
    ].join("\n"),
  };
}

/* ------------------------------------------------------------------ */
/* Inquiry acknowledgement (customer-facing)                          */
/* ------------------------------------------------------------------ */

export type InquiryAckData = {
  name?: string | null;
  service?: string | null;
};

export function inquiryAck(data: InquiryAckData = {}): RenderedEmail {
  const greeting = data.name ? `Hi ${escapeHtml(data.name)},` : "Hi there,";
  const svc = data.service
    ? paragraph(
        `You asked about: <strong style="color:${brand.blueDeep};">${escapeHtml(
          data.service
        )}</strong>.`
      )
    : "";

  const body = `
    ${heading("We got your request 👍")}
    ${paragraph(greeting)}
    ${paragraph(
      "Thanks for reaching out to ScrewIt Pros. A team member will review your request and get back to you shortly with next steps."
    )}
    ${svc}
    ${paragraph(
      "If you need to add anything, just reply to this email and it comes straight to us."
    )}
  `;

  return {
    code: "inquiry-ack",
    subject: "We received your ScrewIt Pros request",
    html: renderLayout(body, {
      preheader: "Thanks! A team member will be in touch shortly.",
    }),
    text: [
      "We got your request",
      "",
      data.name ? `Hi ${data.name},` : "Hi there,",
      "",
      "Thanks for reaching out to ScrewIt Pros. A team member will review your request and get back to you shortly.",
      data.service ? `You asked about: ${data.service}.` : "",
      "",
      "Need to add anything? Just reply to this email.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/* ------------------------------------------------------------------ */
/* Internal new-lead notification (team-facing)                       */
/* ------------------------------------------------------------------ */

export type NewLeadData = {
  name?: string | null;
  email: string;
  service?: string | null;
  message?: string | null;
  source?: string | null;
};

export function newLeadNotice(data: NewLeadData): RenderedEmail {
  const rows: Array<[string, string]> = [
    ["Name", data.name || "Not provided"],
    ["Email", data.email],
    ["Service", data.service || "Not provided"],
    ["Source", data.source || "Not provided"],
    ["Message", data.message || "Not provided"],
  ];

  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${brand.gray200};border-radius:10px;overflow:hidden;">
    ${rows
      .map(
        ([k, v], i) => `<tr style="background:${i % 2 ? brand.gray50 : brand.white};">
        <td style="padding:11px 14px;font-size:13px;font-weight:600;color:${brand.ink500};width:110px;vertical-align:top;">${escapeHtml(
          k
        )}</td>
        <td style="padding:11px 14px;font-size:14px;color:${brand.ink900};">${escapeHtml(
          v
        )}</td>
      </tr>`
      )
      .join("")}
  </table>`;

  const body = `
    ${heading("New lead captured 🔔")}
    ${paragraph("A new inquiry just came in through the site.")}
    ${table}
    <div style="height:16px;"></div>
    ${paragraph(
      `Reply directly to <a href="mailto:${escapeHtml(
        data.email
      )}" style="color:${brand.blueElectric};">${escapeHtml(data.email)}</a> to follow up.`
    )}
  `;

  return {
    code: "new-lead-notice",
    subject: `New lead: ${data.name || data.email}${
      data.service ? ` (${data.service})` : ""
    }`,
    html: renderLayout(body, { preheader: `New inquiry from ${data.email}` }),
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
  };
}

/* ------------------------------------------------------------------ */
/* Email verification (stub — wired live in Sprint 1 auth work)       */
/* ------------------------------------------------------------------ */

export type VerificationData = {
  name?: string | null;
  verifyUrl: string;
};

export function verification(data: VerificationData): RenderedEmail {
  const greeting = data.name ? `Hi ${escapeHtml(data.name)},` : "Hi there,";
  const body = `
    ${heading("Confirm your email")}
    ${paragraph(greeting)}
    ${paragraph(
      "Please confirm your email address to activate your ScrewIt Pros account. This link expires in 24 hours."
    )}
    ${button("Confirm email", data.verifyUrl)}
    ${paragraph(
      `If the button doesn't work, paste this into your browser:<br /><span style="color:${brand.ink500};word-break:break-all;">${escapeHtml(
        data.verifyUrl
      )}</span>`
    )}
  `;
  return {
    code: "verification",
    subject: "Confirm your ScrewIt Pros email",
    html: renderLayout(body, { preheader: "One click to activate your account." }),
    text: `${greeting}\n\nConfirm your email to activate your account:\n${data.verifyUrl}\n\nThis link expires in 24 hours.`,
  };
}

/* ------------------------------------------------------------------ */
/* Welcome (stub — sent after verification in Sprint 1)               */
/* ------------------------------------------------------------------ */

export type WelcomeData = {
  name?: string | null;
};

export function welcome(data: WelcomeData = {}): RenderedEmail {
  const greeting = data.name ? `Hi ${escapeHtml(data.name)},` : "Welcome!";
  const body = `
    ${heading("Welcome to ScrewIt Pros 🛠️")}
    ${paragraph(greeting)}
    ${paragraph(
      "Your account is active. You're all set to book furniture assembly and white-glove delivery across the Houston metro."
    )}
    ${button("Get started", process.env.NEXT_PUBLIC_APP_URL ?? "https://screwitpros.com")}
  `;
  return {
    code: "welcome",
    subject: "Welcome to ScrewIt Pros 🎉",
    html: renderLayout(body, { preheader: "Your account is ready." }),
    text: `${greeting}\n\nYour ScrewIt Pros account is active. You're all set to book assembly + white-glove delivery.`,
  };
}

/* ------------------------------------------------------------------ */
/* Booking confirmation (customer — soft-gate or paid book)           */
/* ------------------------------------------------------------------ */

export type BookingConfirmationData = {
  customerName?: string | null;
  orderNumber: string;
  trackUrl: string;
  jobsUrl: string;
  deliveryLine?: string | null;
  itemSummary?: string | null;
  depositFormatted?: string | null;
  /** Soft-gate vs real deposit note */
  paymentNote?: string | null;
  hubHint?: string | null;
};

/** Default hub copy when none provided. */
export const BOOKING_HUB_HINT_DEFAULT =
  "Ship or drop your items to our Houston hub — we'll assemble, QC, and white-glove deliver.";

/**
 * Code default for booking-confirmation.
 * Prefer DB email_templates when present (see render-booking-confirmation).
 */
export function bookingConfirmation(
  data: BookingConfirmationData
): RenderedEmail {
  const name = data.customerName?.trim();
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const orderNumber = escapeHtml(data.orderNumber);
  const itemLine = data.itemSummary?.trim()
    ? paragraph(
        `Build: <strong style="color:${brand.blueDeep};">${escapeHtml(
          data.itemSummary.trim()
        )}</strong>`
      )
    : "";
  const delivery = data.deliveryLine?.trim()
    ? paragraph(`Delivery: ${escapeHtml(data.deliveryLine.trim())}`)
    : "";
  const deposit = data.depositFormatted?.trim()
    ? paragraph(
        `Deposit (shown on quote): <strong>${escapeHtml(
          data.depositFormatted.trim()
        )}</strong>`
      )
    : "";
  const paymentNote = data.paymentNote?.trim()
    ? paragraph(
        `<em style="color:${brand.ink500};">${escapeHtml(
          data.paymentNote.trim()
        )}</em>`
      )
    : "";
  const hub = paragraph(
    escapeHtml(data.hubHint?.trim() || BOOKING_HUB_HINT_DEFAULT)
  );

  const body = `
    ${heading("You're booked! 🎉")}
    ${paragraph(greeting)}
    ${paragraph(
      `Your ScrewIt Pros job is confirmed. Order number: <strong style="color:${brand.blueDeep};">${orderNumber}</strong>.`
    )}
    ${itemLine}
    ${delivery}
    ${deposit}
    ${paymentNote}
    ${hub}
    ${button("Track your order", data.trackUrl)}
    ${paragraph(
      `Or open <a href="${escapeHtml(data.jobsUrl)}" style="color:${brand.blueElectric};">My Jobs</a> anytime.`
    )}
  `;

  return {
    code: "booking-confirmation",
    subject: `You're booked! Order ${data.orderNumber}`,
    html: renderLayout(body, {
      preheader: `Order ${data.orderNumber} is on the calendar.`,
    }),
    text: [
      "You're booked!",
      "",
      name ? `Hi ${name},` : "Hi there,",
      "",
      `Your ScrewIt Pros job is confirmed. Order number: ${data.orderNumber}.`,
      data.itemSummary?.trim() ? `Build: ${data.itemSummary.trim()}` : "",
      data.deliveryLine?.trim() ? `Delivery: ${data.deliveryLine.trim()}` : "",
      data.depositFormatted?.trim()
        ? `Deposit (shown on quote): ${data.depositFormatted.trim()}`
        : "",
      data.paymentNote?.trim() || "",
      data.hubHint?.trim() || BOOKING_HUB_HINT_DEFAULT,
      "",
      `Track: ${data.trackUrl}`,
      `My Jobs: ${data.jobsUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/** Default mustache strings for email_templates seed (inner body HTML). */
export const BOOKING_CONFIRMATION_SEED = {
  subject: "You're booked! Order {{orderNumber}}",
  htmlBody: [
    "<h1 style=\"margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:#04209b;\">You're booked! 🎉</h1>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\">Hi {{customerName}},</p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\">Your ScrewIt Pros job is confirmed. Order number: <strong style=\"color:#04209b;\">{{orderNumber}}</strong>.</p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\">Build: <strong style=\"color:#04209b;\">{{itemSummary}}</strong></p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\">Delivery: {{deliveryLine}}</p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\">Deposit (shown on quote): <strong>{{depositFormatted}}</strong></p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#545b7a;\"><em>{{paymentNote}}</em></p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\">{{hubHint}}</p>",
    "<p style=\"margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;\"><a href=\"{{trackUrl}}\" style=\"color:#1d6efe;\">Track your order</a> · <a href=\"{{jobsUrl}}\" style=\"color:#1d6efe;\">My Jobs</a></p>",
  ].join("\n"),
  textBody: [
    "You're booked!",
    "",
    "Hi {{customerName}},",
    "",
    "Your ScrewIt Pros job is confirmed. Order number: {{orderNumber}}.",
    "Build: {{itemSummary}}",
    "Delivery: {{deliveryLine}}",
    "Deposit (shown on quote): {{depositFormatted}}",
    "{{paymentNote}}",
    "{{hubHint}}",
    "",
    "Track: {{trackUrl}}",
    "My Jobs: {{jobsUrl}}",
  ].join("\n"),
} as const;

/* ------------------------------------------------------------------ */
/* Preview registry — powers /dev/emails                              */
/* ------------------------------------------------------------------ */

/** Every template with sample data, for the in-browser preview gallery. */
const previewSamples: ReadonlyArray<{
  label: string;
  render: () => RenderedEmail;
}> = [
  {
    label: "Waitlist confirmation",
    render: () => waitlistConfirmation({ name: "Jordan", position: 42 }),
  },
  {
    label: "Inquiry acknowledgement (customer)",
    render: () =>
      inquiryAck({ name: "Jordan", service: "Large furniture assembly" }),
  },
  {
    label: "New lead notice (internal)",
    render: () =>
      newLeadNotice({
        name: "Jordan Rivera",
        email: "jordan@example.com",
        service: "White-glove delivery",
        message: "Need a sectional assembled and placed upstairs.",
        source: "quote_dialog",
      }),
  },
  {
    label: "Email verification",
    render: () =>
      verification({
        name: "Jordan",
        verifyUrl: "https://screwitpros.com/auth/confirm?token=sample-token",
      }),
  },
  {
    label: "Welcome",
    render: () => welcome({ name: "Jordan" }),
  },
  {
    label: "Booking confirmation",
    render: () =>
      bookingConfirmation({
        customerName: "Jordan",
        orderNumber: "SIP-10042",
        trackUrl: "https://screwitpros.com/customer/orders/SIP-10042/track",
        jobsUrl: "https://screwitpros.com/customer/jobs",
        deliveryLine: "Yale St, 77008",
        itemSummary: "HEMNES dresser · 1 item",
        depositFormatted: "$74.70",
        paymentNote: "No deposit was charged (demo book path).",
      }),
  },
];

// `key` is DERIVED from what the template actually returns rather than written
// alongside it, so a preview can never be labelled with a code it doesn't render.
export const emailPreviews = previewSamples.map((sample) => ({
  ...sample,
  key: sample.render().code,
}));

export type EmailPreviewKey = EmailTemplateCode;
