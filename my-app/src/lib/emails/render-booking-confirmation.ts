/**
 * Resolve booking-confirmation: DB email_templates first, else code default.
 */
import {
  bookingConfirmation,
  BOOKING_HUB_HINT_DEFAULT,
  type BookingConfirmationData,
  type RenderedEmail,
} from "./templates";
import { loadEmailTemplate } from "./load-email-template";
import {
  htmlSafeVars,
  substituteTemplate,
  type TemplateVars,
} from "./substitute-template";
import { renderLayout } from "./layout";

export async function renderBookingConfirmation(
  data: BookingConfirmationData
): Promise<RenderedEmail> {
  const vars: TemplateVars = {
    customerName: data.customerName?.trim() || "there",
    orderNumber: data.orderNumber,
    trackUrl: data.trackUrl,
    jobsUrl: data.jobsUrl,
    deliveryLine: data.deliveryLine?.trim() || "—",
    itemSummary: data.itemSummary?.trim() || "Your build",
    depositFormatted: data.depositFormatted?.trim() || "—",
    paymentNote: data.paymentNote?.trim() || "",
    hubHint: data.hubHint?.trim() || BOOKING_HUB_HINT_DEFAULT,
  };

  const row = await loadEmailTemplate("booking-confirmation");
  if (
    row?.subject_template &&
    row.html_body_template &&
    row.text_body_template
  ) {
    const safe = htmlSafeVars(vars);
    const subject = substituteTemplate(row.subject_template, vars);
    const innerHtml = substituteTemplate(row.html_body_template, safe);
    const text = substituteTemplate(row.text_body_template, vars);
    return {
      code: "booking-confirmation",
      subject,
      html: renderLayout(innerHtml, {
        preheader: `Order ${data.orderNumber} is on the calendar.`,
      }),
      text,
    };
  }

  return bookingConfirmation(data);
}
