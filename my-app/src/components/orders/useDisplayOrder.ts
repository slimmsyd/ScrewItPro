"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MockOrder } from "@/lib/orders";
import {
  applySnapshotToOrder,
  loadBookedSnapshot,
  BOOKED_SNAPSHOT_KEY,
} from "@/lib/orders";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === BOOKED_SNAPSHOT_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(BOOKED_SNAPSHOT_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string {
  return "";
}

/**
 * Mock order shell + optional session snapshot from quote booking.
 * Image URLs (and live line items) flow from paste-lookup → draft → snapshot → here.
 */
export function useDisplayOrder(base: MockOrder): MockOrder {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    // `raw` invalidates when sessionStorage snapshot changes (same-tab via save before nav).
    void raw;
    return applySnapshotToOrder(base, loadBookedSnapshot());
  }, [base, raw]);
}
