"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, MapPin, User } from "lucide-react";
import type { MemberUser } from "@/lib/member";
import ProfilePanel from "./ProfilePanel";
import AddressesPanel from "./AddressesPanel";
import PaymentPanel from "./PaymentPanel";

export type AccountTabKey = "profile" | "addresses" | "payment";

const TABS: {
  key: AccountTabKey;
  label: string;
  icon: typeof User;
  hash: string;
}[] = [
  { key: "profile", label: "Profile", icon: User, hash: "profile" },
  { key: "addresses", label: "Addresses", icon: MapPin, hash: "addresses" },
  { key: "payment", label: "Payment", icon: CreditCard, hash: "payment" },
];

function tabFromHash(hash: string): AccountTabKey {
  const h = hash.replace(/^#/, "").toLowerCase();
  if (h === "addresses" || h === "address") return "addresses";
  if (h === "payment" || h === "payments") return "payment";
  return "profile";
}

/**
 * Centered Account silo: Profile / Addresses / Payment tabs.
 * Hash deep-links (#addresses, #payment) for quote account menu.
 */
export default function AccountTabsView({ user }: { user: MemberUser }) {
  const [tab, setTab] = useState<AccountTabKey>("profile");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTab(tabFromHash(window.location.hash));

    const onHash = () => setTab(tabFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selectTab = useCallback((key: AccountTabKey) => {
    setTab(key);
    const entry = TABS.find((t) => t.key === key);
    if (entry && typeof window !== "undefined") {
      const next = `#${entry.hash}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
    }
  }, []);

  return (
    <div className="screen-anim" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: 30,
            letterSpacing: "-0.015em",
            color: "var(--blue-deep)",
            margin: 0,
          }}
        >
          Account
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14.5,
            color: "var(--ink-500)",
            margin: "5px 0 0",
            lineHeight: 1.5,
          }}
        >
          Manage your details, addresses, and payment.
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>
        <div
          role="tablist"
          aria-label="Account sections"
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 22,
            borderBottom: "1px solid var(--border-default)",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const on = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`account-tab-${key}`}
                aria-selected={on}
                aria-controls={`account-panel-${key}`}
                tabIndex={on ? 0 : -1}
                onClick={() => selectTab(key)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "0 4px 12px",
                  margin: "0 12px 0 0",
                  minHeight: 44,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: on ? 700 : 600,
                  color: on ? "var(--blue-deep)" : "var(--ink-500)",
                  borderBottom: `2px solid ${on ? "var(--blue-electric)" : "transparent"}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "color 0.15s ease, border-color 0.15s ease",
                }}
              >
                <Icon
                  size={16}
                  color={on ? "var(--blue-electric)" : "var(--ink-300)"}
                  aria-hidden
                />
                {label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`account-panel-${tab}`}
          aria-labelledby={`account-tab-${tab}`}
        >
          {tab === "profile" && <ProfilePanel user={user} />}
          {tab === "addresses" && <AddressesPanel />}
          {tab === "payment" && <PaymentPanel />}
        </div>
      </div>
    </div>
  );
}
