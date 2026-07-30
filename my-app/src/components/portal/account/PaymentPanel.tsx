"use client";

import { useState } from "react";
import { CreditCard, PlusCircle, Trash2 } from "lucide-react";
import {
  accountCardStyle,
  dashedAddStyle,
  defaultBadgeStyle,
} from "./accountStyles";

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  isDefault: boolean;
};

const INITIAL: PaymentMethod[] = [
  {
    id: "visa",
    brand: "Visa",
    last4: "4242",
    exp: "04 / 28",
    isDefault: true,
  },
  {
    id: "mc",
    brand: "Mastercard",
    last4: "8813",
    exp: "11 / 27",
    isDefault: false,
  },
];

/**
 * Account → Payment tab. Mock cards only — no Stripe wiring in V1.
 */
export default function PaymentPanel() {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL);
  const [hint, setHint] = useState<string | null>(null);

  const onAdd = () => {
    setHint("Adding cards lands with Stripe deposit checkout.");
    window.setTimeout(() => setHint(null), 2800);
  };

  const onRemove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {methods.map((m) => (
        <div key={m.id} style={accountCardStyle}>
          <div
            style={{
              display: "flex",
              gap: 13,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 46,
                height: 32,
                borderRadius: 7,
                background: "var(--blue-deep)",
                display: "grid",
                placeItems: "center",
                flex: "0 0 46px",
              }}
            >
              <CreditCard size={17} color="#fff" aria-hidden />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "var(--blue-deep)",
                  }}
                >
                  {m.brand} •••• {m.last4}
                </span>
                {m.isDefault && <span style={defaultBadgeStyle}>DEFAULT</span>}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12.5,
                  color: "var(--ink-500)",
                  marginTop: 2,
                }}
              >
                Expires {m.exp}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(m.id)}
              aria-label={`Remove ${m.brand} ending in ${m.last4}`}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 8,
                minWidth: 44,
                minHeight: 44,
                display: "grid",
                placeItems: "center",
                borderRadius: 8,
                color: "var(--ink-300)",
                transition: "color 0.15s ease, background 0.15s ease",
              }}
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
        </div>
      ))}

      {methods.length === 0 && (
        <p
          style={{
            margin: "0 0 4px",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--ink-500)",
            textAlign: "center",
          }}
        >
          No payment methods on file.
        </p>
      )}

      <button type="button" onClick={onAdd} style={dashedAddStyle}>
        <PlusCircle size={18} aria-hidden />
        Add a payment method
      </button>

      {hint && (
        <p
          role="status"
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink-500)",
            textAlign: "center",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
