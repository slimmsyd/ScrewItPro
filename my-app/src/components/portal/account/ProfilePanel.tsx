"use client";

import { useState } from "react";
import { Camera, Check, Lock, Mail, Phone, User } from "lucide-react";
import type { MemberUser } from "@/lib/member";
import { memberInitials } from "@/components/quote/QuoteAccountMenu";
import {
  accountCardStyle,
  capsLabelStyle,
  fieldBoxStyle,
  fieldInputStyle,
  fieldLabelStyle,
  ghostBtnStyle,
  primaryBtnStyle,
} from "./accountStyles";

/**
 * Account → Profile tab.
 * Session-backed name/email; phone local. Password 2-step deferred (idle only).
 */
export default function ProfilePanel({ user }: { user: MemberUser }) {
  const initials = memberInitials(user);
  const [fullName, setFullName] = useState(user.name?.trim() || "");
  const [phone, setPhone] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const onSave = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={accountCardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt=""
              width={64}
              height={64}
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                objectFit: "cover",
                flex: "0 0 64px",
              }}
            />
          ) : (
            <span
              aria-hidden
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-body)",
                fontSize: 22,
                fontWeight: 800,
                flex: "0 0 64px",
              }}
            >
              {initials}
            </span>
          )}
          <div style={{ flex: "1 1 140px", minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--blue-deep)",
              }}
            >
              {fullName || "Your name"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: "var(--ink-500)",
                marginTop: 2,
              }}
            >
              {user.email}
            </div>
          </div>
          <button
            type="button"
            style={{
              ...ghostBtnStyle,
              height: 38,
              minHeight: 38,
              padding: "0 14px",
              fontSize: 13,
            }}
            aria-label="Change profile photo (coming soon)"
            title="Coming soon"
          >
            <Camera size={16} aria-hidden />
            Change
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="account-full-name" style={fieldLabelStyle}>
          Full name
        </label>
        <div style={fieldBoxStyle}>
          <User size={17} color="var(--ink-300)" aria-hidden />
          <input
            id="account-full-name"
            type="text"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={fieldInputStyle}
            placeholder="Your full name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="account-email" style={fieldLabelStyle}>
          Email
        </label>
        <div style={fieldBoxStyle}>
          <Mail size={17} color="var(--ink-300)" aria-hidden />
          <input
            id="account-email"
            type="email"
            name="email"
            value={user.email}
            readOnly
            style={{
              ...fieldInputStyle,
              color: "var(--ink-700)",
              cursor: "default",
            }}
            aria-readonly="true"
          />
        </div>
      </div>

      <div>
        <label htmlFor="account-phone" style={fieldLabelStyle}>
          Phone
        </label>
        <div style={fieldBoxStyle}>
          <Phone size={17} color="var(--ink-300)" aria-hidden />
          <input
            id="account-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={fieldInputStyle}
            placeholder="(713) 555-0148"
          />
        </div>
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
      >
        <button type="button" onClick={onSave} style={primaryBtnStyle}>
          <Check size={16} aria-hidden />
          Save changes
        </button>
        {savedFlash && (
          <span
            role="status"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--status-success)",
            }}
          >
            Saved locally
          </span>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border-default)",
          paddingTop: 20,
          marginTop: 4,
        }}
      >
        <div style={{ ...capsLabelStyle, marginBottom: 12 }}>
          Password &amp; security
        </div>
        <div
          style={{
            ...accountCardStyle,
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--gray-50)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 40px",
            }}
          >
            <Lock size={19} color="var(--blue-steel)" aria-hidden />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                fontWeight: 700,
                color: "var(--blue-deep)",
              }}
            >
              Password
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--ink-500)",
              }}
            >
              Change password — coming soon
            </div>
          </div>
          <button
            type="button"
            disabled
            style={{
              ...ghostBtnStyle,
              height: 38,
              minHeight: 38,
              padding: "0 14px",
              fontSize: 13,
              opacity: 0.55,
              cursor: "not-allowed",
            }}
            title="Password change ships in a later phase"
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}
