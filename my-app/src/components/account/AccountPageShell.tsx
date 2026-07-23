"use client";

import type { ReactNode } from "react";
import CustomerAppShell from "@/components/portal/CustomerAppShell";

/**
 * Shared signed-in chrome for account portal shells (Jobs, Account).
 * Bridges to CustomerAppShell (customer domain — no marketing nav).
 */
export default function AccountPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return <CustomerAppShell>{children}</CustomerAppShell>;
}
