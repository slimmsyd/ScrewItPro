"use client";

import type { ReactNode } from "react";
import OrdersShell from "@/components/orders/OrdersShell";

/**
 * Shared signed-in chrome for account portal shells (Jobs, Account).
 * Reuses post-book OrdersShell so avatar menu stays consistent.
 */
export default function AccountPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return <OrdersShell ctaLabel="Get another quote">{children}</OrdersShell>;
}
