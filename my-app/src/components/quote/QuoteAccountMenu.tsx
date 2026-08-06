"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Shield,
  User,
} from "lucide-react";
import type { MemberUser } from "@/lib/member";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  accountMenuFor,
  type AccountMenuIcon,
  type AccountMenuLink,
} from "@/lib/auth/account-menu";

const ICONS: Record<
  AccountMenuIcon,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  LayoutDashboard,
  User,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  Inbox,
  Shield,
};

/** Initials for avatar chip - name words first, else email local-part. */
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
 * Signed-in account chip + role-aware dropdown.
 * Destinations come from accountMenuFor(role) - menu is navigation only, not authz.
 */
export default function QuoteAccountMenu({
  user,
  onSignOut,
  /** Optional badge on My Jobs, e.g. "2 active" when we know job count */
  jobsBadge,
}: {
  user: MemberUser;
  onSignOut: () => void;
  jobsBadge?: string;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = memberInitials(user);
  const displayName = user.name?.trim() || user.email.split("@")[0] || "Account";
  const hasPhoto = Boolean(user.picture?.trim());
  const role = user.role ?? "customer";
  const menu = accountMenuFor(role, { isSuperAdmin: user.isSuperAdmin });

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

  const close = () => setOpen(false);

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        flex: "0 0 auto",
        marginLeft: 8,
      }}
    >
      <button
        type="button"
        aria-label={`Account menu for ${displayName}, ${menu.roleLabel}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 40,
          padding: "0 12px 0 4px",
          border: `1px solid ${open ? "var(--blue-electric)" : "var(--border-default)"}`,
          borderRadius: 999,
          background: "#fff",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          boxShadow: open ? "0 0 0 3px rgba(29, 110, 254, 0.12)" : "none",
          transition: "border-color 150ms, box-shadow 150ms",
        }}
      >
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar URL, not a local asset
          <img
            src={user.picture}
            alt=""
            width={36}
            height={36}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              flex: "0 0 36px",
              background: "var(--blue-deep)",
            }}
          />
        ) : (
          <span
            aria-hidden
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1,
              flex: "0 0 36px",
            }}
          >
            {initials}
          </span>
        )}
        <ChevronDown
          size={16}
          color="var(--ink-500)"
          style={{
            marginRight: 2,
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
            top: "calc(100% + 10px)",
            right: 0,
            width: 268,
            background: "#fff",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "0 18px 44px -16px rgba(4, 20, 90, 0.4)",
            padding: 8,
            zIndex: 50,
          }}
        >
          {/* Identity header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "10px 10px 12px",
            }}
          >
            {hasPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt=""
                width={40}
                height={40}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flex: "0 0 40px",
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 800,
                  flex: "0 0 40px",
                }}
              >
                {initials}
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--blue-deep)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--ink-500)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={user.email}
              >
                {user.email}
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color:
                    role === "admin"
                      ? "var(--blue-deep)"
                      : role === "customer"
                        ? "var(--ink-500)"
                        : "var(--ink-700)",
                  background:
                    role === "admin" ? "var(--blue-50)" : "var(--gray-100)",
                  borderRadius: 99,
                  padding: "2px 8px",
                }}
              >
                {menu.roleLabel}
              </span>
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: "var(--gray-100)",
              margin: "0 2px 6px",
            }}
          />

          {menu.sections.map((section, si) => (
            <div key={section.title ?? `sec-${si}`}>
              {section.title ? (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ink-300)",
                    padding: "8px 10px 4px",
                  }}
                >
                  {section.title}
                </div>
              ) : null}
              {section.items.map((item, ii) => {
                if (item.kind === "note") {
                  return (
                    <p
                      key={`note-${si}-${ii}`}
                      style={{
                        margin: "4px 10px 10px",
                        fontSize: 12.5,
                        lineHeight: 1.45,
                        color: "var(--ink-500)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {item.text}
                    </p>
                  );
                }
                const badge =
                  item.badgeKey === "jobs" && jobsBadge ? jobsBadge : undefined;
                return (
                  <MenuRowLink
                    key={item.href + item.label}
                    item={item}
                    badge={badge}
                    onNavigate={close}
                  />
                );
              })}
              {si < menu.sections.length - 1 ? (
                <div
                  style={{
                    height: 1,
                    background: "var(--gray-100)",
                    margin: "6px 2px",
                  }}
                />
              ) : null}
            </div>
          ))}

          <div
            style={{
              height: 1,
              background: "var(--gray-100)",
              margin: "6px 2px",
            }}
          />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onSignOut();
            }}
            style={rowButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={17} color="var(--ink-500)" strokeWidth={2} />
            <span style={{ flex: 1, textAlign: "left" }}>
              {t("common.signOut")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

const rowButtonStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 11,
  padding: "9px 10px",
  border: "none",
  borderRadius: 8,
  background: "transparent",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  fontWeight: 600,
  color: "var(--ink-900)",
  cursor: "pointer",
};

function MenuRowLink({
  item,
  badge,
  onNavigate,
}: {
  item: AccountMenuLink;
  badge?: string;
  onNavigate: () => void;
}) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      role="menuitem"
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 10px",
        borderRadius: 8,
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--ink-900)",
        transition: "background 120ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--gray-50)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon size={17} color="var(--ink-500)" strokeWidth={2} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge ? (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--blue-deep)",
            background: "var(--blue-50)",
            borderRadius: 999,
            padding: "1px 8px",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
