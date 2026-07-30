"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Gift,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Settings,
  User,
  X,
} from "lucide-react";
import { memberInitials } from "@/components/quote/QuoteAccountMenu";
import { useMember } from "@/components/providers/MemberProvider";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ASSETS, JOIN_PATH, QUOTE_PATH } from "@/lib/site";
import {
  PORTAL_HOME_HREF,
  PORTAL_NAV_SHIPPED,
  portalActiveKey,
  type PortalNavItem,
} from "@/components/portal/portalNav";

const ICONS = {
  LayoutDashboard,
  Package,
  User,
  Bell,
  Gift,
  Headphones,
} as const;

/**
 * Customer-domain app shell (state, not church).
 * Left sidebar on desktop; hamburger drawer on mobile.
 * Progressive nav — only links for routes that exist.
 */
export default function CustomerAppShell({
  children,
  fullBleed = false,
  jobsCount,
}: {
  children: ReactNode;
  /** Support chat: no main padding, white canvas */
  fullBleed?: boolean;
  /** Optional active-job count for My Jobs pill */
  jobsCount?: number;
}) {
  const pathname = usePathname();
  const active = portalActiveKey(pathname);
  const narrow = useIsMobile(900);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const sidebar = (
    <PortalSidebar
      active={active}
      jobsCount={jobsCount}
      onNavigate={() => setDrawerOpen(false)}
    />
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: narrow ? "column" : "row",
        background: fullBleed ? "#fff" : "var(--gray-50)",
        fontFamily: "var(--font-body)",
      }}
    >
      {narrow ? (
        <>
          <header
            style={{
              height: 56,
              flex: "0 0 56px",
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
              onClick={() => setDrawerOpen((o) => !o)}
              style={iconBtnStyle}
            >
              {drawerOpen ? (
                <X size={20} color="var(--ink-700)" />
              ) : (
                <Menu size={20} color="var(--ink-700)" />
              )}
            </button>
            <PortalLogo href={PORTAL_HOME_HREF} height={21} />
            <Link
              href={QUOTE_PATH}
              style={{
                marginLeft: "auto",
                height: 34,
                padding: "0 12px",
                borderRadius: 9,
                background: "var(--blue-electric)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 6px 14px -6px rgba(29,110,254,.6)",
              }}
            >
              <Plus size={14} color="#fff" />
              Quote
            </Link>
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
                  top: 56,
                  border: "none",
                  padding: 0,
                  background: "rgba(4, 20, 90, 0.28)",
                  zIndex: 45,
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: 56,
                  left: 0,
                  bottom: 0,
                  width: 280,
                  maxWidth: "86vw",
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
            width: 208,
            flex: "0 0 208px",
            alignSelf: "stretch",
            minHeight: "100dvh",
            position: "sticky",
            top: 0,
            height: "100dvh",
          }}
        >
          {sidebar}
        </div>
      )}

      <div
        className="scr"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: narrow ? "calc(100dvh - 56px)" : "100dvh",
          overflowY: fullBleed ? "hidden" : "auto",
          background: fullBleed ? "#fff" : "var(--gray-50)",
          padding: fullBleed ? 0 : narrow ? "24px 16px 40px" : "32px 36px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PortalSidebar({
  active,
  jobsCount,
  onNavigate,
}: {
  active: ReturnType<typeof portalActiveKey>;
  jobsCount?: number;
  onNavigate?: () => void;
}) {
  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        borderRight: "1px solid var(--border-default)",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "16px 10px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: "2px 8px 16px" }}>
        <PortalLogo href={PORTAL_HOME_HREF} height={21} />
      </div>

      <Link
        href={QUOTE_PATH}
        onClick={onNavigate}
        style={{
          height: 38,
          borderRadius: 9,
          border: "none",
          background: "var(--blue-electric)",
          color: "#fff",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          textDecoration: "none",
          boxShadow: "0 6px 14px -6px rgba(29,110,254,.6)",
          flex: "0 0 auto",
        }}
      >
        <Plus size={15} color="#fff" />
        New quote
      </Link>

      <nav
        aria-label="Account"
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: "1 1 auto",
        }}
      >
        {PORTAL_NAV_SHIPPED.map((item) => (
          <NavRow
            key={item.key}
            item={item}
            on={active === item.key}
            count={item.showCount ? jobsCount : undefined}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <PortalProfileFooter onNavigate={onNavigate} />
    </aside>
  );
}

function NavRow({
  item,
  on,
  count,
  onNavigate,
}: {
  item: PortalNavItem;
  on: boolean;
  count?: number;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: on ? "var(--blue-50)" : "transparent",
        textDecoration: "none",
      }}
    >
      <Icon
        size={17}
        color={on ? "var(--blue-electric)" : "var(--ink-500)"}
        strokeWidth={2}
      />
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: on ? 700 : 500,
          color: on ? "var(--blue-deep)" : "var(--ink-700)",
        }}
      >
        {item.label}
      </span>
      {typeof count === "number" && count > 0 && (
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-body)",
            fontSize: 10.5,
            fontWeight: 700,
            color: on ? "var(--blue-deep)" : "var(--ink-500)",
            background: on ? "#fff" : "var(--gray-50)",
            borderRadius: 999,
            padding: "0 7px",
            lineHeight: "16px",
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function PortalLogo({ href, height }: { href: string; height: number }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
      }}
    >
      <Image
        src={ASSETS.logoElectric}
        alt="ScrewIt Pros"
        width={height}
        height={height}
        style={{ borderRadius: 6, objectFit: "cover" }}
      />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: height * 0.72,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          color: "var(--blue-deep)",
        }}
      >
        ScrewIt <span style={{ color: "var(--blue-steel)" }}>Pros</span>
      </span>
    </Link>
  );
}

function PortalProfileFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { status, user, signOut } = useMember();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (status === "loading") {
    return (
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--gray-100)",
          padding: "12px 8px 0",
        }}
      >
        <div
          style={{
            height: 42,
            borderRadius: 10,
            background: "var(--gray-50)",
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--gray-100)",
          padding: "12px 8px 0",
        }}
      >
        <Link
          href={`${JOIN_PATH}?mode=login`}
          onClick={onNavigate}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 40,
            borderRadius: 10,
            border: "1.5px solid var(--border-default)",
            background: "#fff",
            color: "var(--blue-deep)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const initials = memberInitials(user);
  const displayName =
    user.name?.trim() || user.email.split("@")[0] || "Account";

  return (
    <div
      ref={rootRef}
      style={{
        marginTop: "auto",
        borderTop: "1px solid var(--gray-100)",
        position: "relative",
        padding: "10px 8px 0",
      }}
    >
      {menuOpen && (
        <div
          id={menuId}
          role="menu"
          style={{
            position: "absolute",
            bottom: 56,
            left: 8,
            right: 8,
            background: "#fff",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "0 18px 44px -16px rgba(4,20,90,.4)",
            padding: 6,
            zIndex: 30,
          }}
        >
          <MenuLink
            href="/account"
            icon={User}
            label="View profile"
            onClick={() => {
              setMenuOpen(false);
              onNavigate?.();
            }}
          />
          <MenuLink
            href="/account"
            icon={Settings}
            label="Settings"
            onClick={() => {
              setMenuOpen(false);
              onNavigate?.();
            }}
          />
          <div
            style={{
              height: 1,
              background: "var(--gray-100)",
              margin: "5px 2px",
            }}
          />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              void signOut();
              onNavigate?.();
            }}
            style={{
              ...menuItemStyle,
              width: "100%",
              border: "none",
              background: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <LogOut size={16} color="var(--ink-500)" />
            <span style={menuLabelStyle}>Sign out</span>
          </button>
        </div>
      )}

      <button
        type="button"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => setMenuOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "6px",
          borderRadius: 10,
          background: menuOpen ? "var(--blue-50)" : "transparent",
          border: "none",
          width: "100%",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            width={30}
            height={30}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              objectFit: "cover",
              flex: "0 0 30px",
            }}
          />
        ) : (
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 800,
              flex: "0 0 30px",
            }}
          >
            {initials}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
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
              fontSize: 11,
              color: "var(--ink-300)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.email}
          </div>
        </div>
        {menuOpen ? (
          <ChevronDown size={15} color="var(--ink-300)" />
        ) : (
          <ChevronUp size={15} color="var(--ink-300)" />
        )}
      </button>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} role="menuitem" onClick={onClick} style={menuItemStyle}>
      <Icon size={16} color="var(--ink-500)" />
      <span style={menuLabelStyle}>{label}</span>
    </Link>
  );
}

const menuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 10px",
  borderRadius: 8,
  textDecoration: "none",
};

const menuLabelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  fontWeight: 600,
  color: "var(--ink-900)",
};

const iconBtnStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "1px solid var(--border-default)",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  padding: 0,
  flex: "0 0 36px",
};
