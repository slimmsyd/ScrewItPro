"use client";

import { useState } from "react";
import { Briefcase, Home, Pencil, PlusCircle } from "lucide-react";
import {
  accountCardStyle,
  dashedAddStyle,
  defaultBadgeStyle,
} from "./accountStyles";

type Address = {
  id: string;
  label: string;
  line: string;
  kind: "home" | "work" | "other";
  isDefault: boolean;
};

const ADDRESSES: Address[] = [
  {
    id: "home",
    label: "Home",
    line: "2118 Yale St, Houston, TX 77008",
    kind: "home",
    isDefault: true,
  },
  {
    id: "work",
    label: "Work",
    line: "801 Texas Ave, Houston, TX 77002",
    kind: "work",
    isDefault: false,
  },
];

/**
 * Account → Addresses tab. Mock cards only; Add is a local stub for V1.
 */
export default function AddressesPanel() {
  const [hint, setHint] = useState<string | null>(null);

  const onAdd = () => {
    setHint("Add address form ships with the jobs backend.");
    window.setTimeout(() => setHint(null), 2800);
  };

  const onEdit = (id: string) => {
    setHint(
      `Edit “${ADDRESSES.find((a) => a.id === id)?.label ?? "address"}” — coming soon.`
    );
    window.setTimeout(() => setHint(null), 2800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ADDRESSES.map((a) => (
        <div key={a.id} style={accountCardStyle}>
          <div
            style={{
              display: "flex",
              gap: 13,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--blue-50)",
                display: "grid",
                placeItems: "center",
                flex: "0 0 40px",
              }}
            >
              {a.kind === "work" ? (
                <Briefcase size={19} color="var(--blue-electric)" aria-hidden />
              ) : (
                <Home size={19} color="var(--blue-electric)" aria-hidden />
              )}
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
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--blue-deep)",
                  }}
                >
                  {a.label}
                </span>
                {a.isDefault && <span style={defaultBadgeStyle}>DEFAULT</span>}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  color: "var(--ink-500)",
                  marginTop: 3,
                  lineHeight: 1.45,
                }}
              >
                {a.line}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEdit(a.id)}
              aria-label={`Edit ${a.label} address`}
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
              <Pencil size={16} aria-hidden />
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={onAdd} style={dashedAddStyle}>
        <PlusCircle size={18} aria-hidden />
        Add an address
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
