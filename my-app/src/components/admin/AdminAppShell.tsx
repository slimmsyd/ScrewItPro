"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BarChart3,
  CalendarDays,
  Columns3,
  CreditCard,
  HardHat,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_SIGNIN_PATH, ASSETS } from "@/lib/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  ADMIN_NAV,
  ADMIN_SHELL_HOME,
  adminActiveKey,
  adminPageTitle,
  type AdminNavIcon,
  type AdminNavItem,
} from "@/components/admin/adminNav";

const ICONS: Record<
  AdminNavIcon,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  LayoutDashboard,
  Package,
  Columns3,
  CalendarDays,
  Users,
  HardHat,
  CreditCard,
  BarChart3,
  Inbox,
  Settings,
  Mail,
};

const SECTION_LABEL: Record<string, string> = {
  ops: "Operations",
  people: "People",
  money: "Money",
  system: "System",
};

/**
 * Admin ops shell - kit sidebar IA + progressive shipped links.
 * Access is never decided here; the server layout already ran requireAdmin.
 */
export default function AdminAppShell({
  children,
  email,
}: {
  children: ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const active = adminActiveKey(pathname);
  const title = adminPageTitle(active);
  const narrow = useIsMobile(960);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rail, setRail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  async function signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* env missing - still leave */
    }
    router.replace(ADMIN_SIGNIN_PATH);
    router.refresh();
  }

  const sidebar = (
    <AdminSidebar
      active={active}
      email={email}
      rail={!narrow && rail}
      onNavigate={() => setDrawerOpen(false)}
      onToggleRail={() => setRail((r) => !r)}
      onSignOut={signOut}
      showRailToggle={!narrow}
    />
  );

  const sideW = rail && !narrow ? 64 : 220;

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: narrow ? "column" : "row",
        background: "#F4F6FB",
        fontFamily: "var(--font-body)",
        color: "var(--ink-700)",
        overflow: "hidden",
      }}
    >
      {narrow ? (
        <>
          <header
            style={{
              height: 52,
              flex: "0 0 52px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 14px",
              background: "#fff",
              borderBottom: "1px solid var(--border-default)",
              zIndex: 40,
            }}
          >
            <button
              type="button"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              className="sip-admin-focus"
              onClick={() => setDrawerOpen((o) => !o)}
              style={iconBtn}
            >
              {drawerOpen ? (
                <X size={18} color="var(--ink-700)" />
              ) : (
                <Menu size={18} color="var(--ink-700)" />
              )}
            </button>
            <AdminWordmark href={ADMIN_SHELL_HOME} />
            <span
              style={{
                marginLeft: "auto",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ink-900)",
              }}
            >
              {title}
            </span>
          </header>
          {drawerOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu overlay"
                onClick={() => setDrawerOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  top: 52,
                  border: "none",
                  padding: 0,
                  background: "rgba(11,16,48,.36)",
                  zIndex: 45,
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: 52,
                  left: 0,
                  bottom: 0,
                  width: 260,
                  maxWidth: "88vw",
                  zIndex: 50,
                  boxShadow: "0 18px 44px -16px rgba(4,20,90,.4)",
                }}
              >
                {sidebar}
              </div>
            </>
          )}
        </>
      ) : (
        <div
          style={{
            width: sideW,
            flex: `0 0 ${sideW}px`,
            alignSelf: "stretch",
            height: "100dvh",
            transition: "width .16s ease",
          }}
        >
          {sidebar}
        </div>
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {!narrow && (
          <header
            style={{
              height: 52,
              flex: "0 0 52px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 22px",
              background: "#fff",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "var(--ink-900)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h1>
            <span
              style={{
                fontSize: 12,
                color: "var(--ink-500)",
                fontWeight: 500,
              }}
            >
              Houston hub · admin
            </span>
          </header>
        )}
        <main
          className="scr"
          style={{
            flex: 1,
            minHeight: 0,
            // Settings v2 is a flush rail+pane surface (design handoff).
            overflowY:
              pathname?.startsWith("/admin/settings") ? "hidden" : "auto",
            padding: pathname?.startsWith("/admin/settings")
              ? 0
              : narrow
                ? "16px 14px 32px"
                : "18px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: pathname?.startsWith("/admin/settings") ? 0 : 14,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({
  active,
  email,
  rail,
  onNavigate,
  onToggleRail,
  onSignOut,
  showRailToggle,
}: {
  active: ReturnType<typeof adminActiveKey>;
  email: string;
  rail: boolean;
  onNavigate?: () => void;
  onToggleRail?: () => void;
  onSignOut: () => void;
  showRailToggle: boolean;
}) {
  let lastSection: string | undefined;

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        padding: rail ? "14px 8px" : "14px 10px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: rail ? "2px 0 14px" : "2px 8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: rail ? "center" : "flex-start",
        }}
      >
        {rail ? (
          <Link href={ADMIN_SHELL_HOME} onClick={onNavigate} title="Admin home">
            <Image
              src={ASSETS.logoDeep}
              alt="ScrewIt Pros"
              width={28}
              height={28}
              style={{ borderRadius: 7 }}
            />
          </Link>
        ) : (
          <AdminWordmark href={ADMIN_SHELL_HOME} onClick={onNavigate} />
        )}
      </div>

      <nav
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {ADMIN_NAV.map((item) => {
          const showSec =
            !rail && item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <div key={item.key}>
              {showSec && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ink-300)",
                    padding: "12px 10px 6px",
                  }}
                >
                  {SECTION_LABEL[item.section!] ?? item.section}
                </div>
              )}
              <NavRow
                item={item}
                active={active === item.key}
                rail={rail}
                onNavigate={onNavigate}
              />
            </div>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--gray-100)",
          paddingTop: 12,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {!rail && (
          <div
            style={{
              padding: "0 10px",
              fontSize: 11.5,
              color: "var(--ink-500)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={email}
          >
            {email}
          </div>
        )}
        <button
          type="button"
          className="sip-admin-focus"
          onClick={onSignOut}
          title="Sign out"
          style={{
            ...navBase,
            justifyContent: rail ? "center" : "flex-start",
            border: "none",
            background: "transparent",
            width: "100%",
            cursor: "pointer",
            color: "var(--ink-700)",
          }}
        >
          <LogOut size={16} color="var(--ink-500)" />
          {!rail && <span>Sign out</span>}
        </button>
      </div>

      {showRailToggle && (
        <button
          type="button"
          aria-label={rail ? "Expand sidebar" : "Collapse sidebar"}
          className="sip-admin-focus"
          onClick={onToggleRail}
          style={{
            position: "absolute",
            top: 20,
            right: -11,
            width: 22,
            height: 22,
            borderRadius: 99,
            background: "#fff",
            border: "1px solid var(--border-default)",
            display: "grid",
            placeItems: "center",
            zIndex: 12,
            boxShadow: "0 2px 6px rgba(11,16,48,.1)",
            cursor: "pointer",
            padding: 0,
            fontSize: 10,
            color: "var(--ink-500)",
            fontWeight: 700,
          }}
        >
          {rail ? "›" : "‹"}
        </button>
      )}
    </aside>
  );
}

function NavRow({
  item,
  active,
  rail,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  rail: boolean;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon];
  const color = active ? "var(--blue-deep)" : "var(--ink-500)";
  const style: CSSProperties = {
    ...navBase,
    justifyContent: rail ? "center" : "flex-start",
    background: active ? "var(--blue-50)" : "transparent",
    color: active ? "var(--blue-deep)" : "var(--ink-700)",
    fontWeight: active ? 700 : 500,
    opacity: item.shipped ? 1 : 0.55,
    cursor: item.shipped ? "pointer" : "not-allowed",
    position: "relative",
  };

  const inner = (
    <>
      <Icon size={16} color={color} strokeWidth={2} />
      {!rail && (
        <>
          <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>
          {!item.shipped && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--ink-300)",
              }}
            >
              Soon
            </span>
          )}
        </>
      )}
      {rail && !item.shipped && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: 99,
            background: "var(--status-warning, #C47B1A)",
          }}
        />
      )}
    </>
  );

  if (!item.shipped) {
    return (
      <div
        style={style}
        title={`${item.label} - not shipped yet`}
        aria-disabled="true"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="sip-admin-focus"
      title={rail ? item.label : undefined}
      style={{ ...style, textDecoration: "none" }}
    >
      {inner}
    </Link>
  );
}

function AdminWordmark({
  href,
  onClick,
}: {
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
      }}
    >
      <Image
        src={ASSETS.logoDeep}
        alt=""
        width={26}
        height={26}
        style={{ borderRadius: 7 }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "var(--blue-deep)",
          letterSpacing: "-0.02em",
        }}
      >
        ScrewIt Admin
      </span>
    </Link>
  );
}

const navBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "7px 10px",
  borderRadius: 8,
  fontSize: 12.5,
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
};

const iconBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 9,
  border: "1px solid var(--border-default)",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  padding: 0,
};
