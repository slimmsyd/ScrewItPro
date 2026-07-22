import type { Metadata } from "next";

/**
 * /checkout/success: deposit-paid confirmation landing.
 * Placeholder surface for the M2 booking flow; wired once Stripe is live.
 */
export const metadata: Metadata = {
  title: "Deposit received",
  robots: { index: false, follow: false },
};

const shell: React.CSSProperties = {
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
  return (
    <div style={shell}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h1 style={{ fontSize: 26, marginBottom: 10, color: "#04209b" }}>
        Deposit received
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "#545b7a" }}>
        Thanks. Your deposit is confirmed and we&apos;ve saved your card for the
        balance at delivery. We'll be in touch with next steps.
      </p>
      {order && (
        <p style={{ marginTop: 20, fontSize: 13, color: "#9aa1bc" }}>
          Order reference: {order}
        </p>
      )}
    </div>
  );
}
