import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMockOrder } from "@/lib/orders";

/**
 * /checkout/success: deposit-paid confirmation landing.
 * When the order id matches a design-handoff mock (e.g. SIP-4471), send the
 * customer to the post-book confirmation UI. Real Stripe UUID orders keep
 * this interim page until human order numbers + snapshot data land.
 */
export const metadata: Metadata = {
  title: "Deposit received",
  robots: { index: false, follow: false },
};

const shell: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  maxWidth: 560,
  margin: "0 auto",
  padding: "80px 24px",
  textAlign: "center",
  color: "#0b1030",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  if (order && getMockOrder(order)) {
    redirect(`/orders/${order.trim()}`);
  }

  return (
    <div style={shell}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h1 style={{ fontSize: 26, marginBottom: 10, color: "#04209b" }}>
        Deposit received
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "#545b7a" }}>
        Thanks. Your deposit is confirmed and we&apos;ve saved your card for the
        balance at delivery. We&apos;ll be in touch with next steps.
      </p>
      {order && (
        <p style={{ marginTop: 20, fontSize: 13, color: "#9aa1bc" }}>
          Order reference: {order}
        </p>
      )}
      <p style={{ marginTop: 28 }}>
        <Link
          href="/orders/SIP-4471"
          style={{
            color: "#1d6efe",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Preview confirmation experience
        </Link>
      </p>
    </div>
  );
}
