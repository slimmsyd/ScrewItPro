"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useMember } from "@/components/providers/MemberProvider";
import { portalHomeFor, JOIN_PATH } from "@/lib/site";

function ForbiddenBody() {
  const params = useSearchParams();
  const reason = params.get("reason");
  const { user, status } = useMember();
  const home = portalHomeFor(user?.role ?? "customer");

  let title = "You don't have access";
  let body =
    "This area isn't available for your account. Head back to your portal or sign in with a different account.";

  if (reason === "suspended") {
    title = "Account suspended";
    body =
      "Your account has been suspended. Contact support if you think this is a mistake.";
  } else if (reason === "not_available") {
    title = "Portal not available yet";
    body =
      "Technician and driver portals are not live yet. We'll open them when ops tools ship.";
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "var(--font-body)",
        background: "var(--gray-50)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--border-default)",
          padding: 32,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-300)",
          }}
        >
          403
        </p>
        <h1
          style={{
            margin: "10px 0 0",
            fontFamily: "var(--font-display)",
            fontSize: 28,
            color: "var(--blue-deep)",
            fontWeight: 400,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 15,
            color: "var(--ink-500)",
            lineHeight: 1.55,
          }}
        >
          {body}
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {status === "anonymous" || status === "loading" ? (
            <Link
              href={`${JOIN_PATH}?mode=login`}
              style={primaryLink}
            >
              Sign in
            </Link>
          ) : (
            <Link href={home} style={primaryLink}>
              Go to my portal
            </Link>
          )}
          <Link
            href="/"
            style={{
              color: "var(--blue-electric)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Marketing home
          </Link>
        </div>
      </div>
    </main>
  );
}

const primaryLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 48,
  borderRadius: 9,
  background: "var(--blue-deep)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  textDecoration: "none",
};

export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
          Loading…
        </main>
      }
    >
      <ForbiddenBody />
    </Suspense>
  );
}
