"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MemberUser } from "@/lib/member";
import { useLocale } from "@/components/providers/LocaleProvider";

/** Initials for avatar chip — name words first, else email local-part. */
export function memberInitials(user: MemberUser): string {
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const local = user.email.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase();
}

/**
 * Placeholder while MemberProvider is still fetching /api/auth/session.
 * Same outer footprint as the real chip so the header does not flash "Sign in".
 */
export function QuoteAccountMenuSkeleton() {
  return (
    <div
      aria-hidden
      style={{
        flex: "0 0 auto",
        marginLeft: 8,
        height: 40,
        minWidth: 64,
        borderRadius: 999,
        border: "1px solid var(--border-default)",
        background: "var(--gray-50)",
        display: "inline-flex",
        alignItems: "center",
        padding: "0 12px 0 4px",
        gap: 8,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--gray-100)",
          flex: "0 0 auto",
        }}
      />
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 2,
          background: "var(--gray-100)",
          flex: "0 0 auto",
        }}
      />
    </div>
  );
}

/**
 * Signed-in account chip for the quote shell header.
 * Matches mock: deep-blue initials circle + chevron; menu = email + Sign out.
 * Uses existing MemberUser + signOut from MemberProvider — no new auth.
 */
export default function QuoteAccountMenu({
  user,
  onSignOut,
}: {
  user: MemberUser;
  onSignOut: () => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = memberInitials(user);
  const label = user.name?.trim() || user.email;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        flex: "0 0 auto",
        /* Air from Save & exit — keeps chip readable without reshaping it */
        marginLeft: 8,
      }}
    >
      <button
        type="button"
        aria-label={`Account menu for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 40,
          /* A bit more width/character; blue circle size unchanged */
          padding: "0 12px 0 4px",
          border: "1px solid var(--border-default)",
          borderRadius: 999,
          background: "#fff",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--blue-deep)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
        <ChevronDown
          size={16}
          color="var(--ink-500)"
          style={{
            marginRight: 6,
            transition: "transform 150ms",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "#fff",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "0 12px 32px -12px rgba(4, 32, 155, 0.2)",
            padding: 8,
            zIndex: 50,
          }}
        >
          <div
            style={{
              padding: "8px 10px 10px",
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--ink-500)",
              borderBottom: "1px solid var(--gray-100)",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={user.email}
          >
            {user.email}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 10px",
              border: "none",
              borderRadius: 8,
              background: "transparent",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink-700)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {t("common.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
