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
  | "welcome";

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
];

// `key` is DERIVED from what the template actually returns rather than written
// alongside it, so a preview can never be labelled with a code it doesn't render.
export const emailPreviews = previewSamples.map((sample) => ({
  ...sample,
  key: sample.render().code,
}));

export type EmailPreviewKey = EmailTemplateCode;
