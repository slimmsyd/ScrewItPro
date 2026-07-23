"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MockOrder } from "@/lib/orders";
import {
  resolveDisplayOrder,
  BOOKED_SNAPSHOT_KEY,
  BOOKED_SNAPSHOT_EVENT,
} from "@/lib/orders";
import { loadQuoteDraft, QUOTE_DRAFT_KEY } from "@/lib/quote/draft-storage";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (
      e.key === BOOKED_SNAPSHOT_KEY ||
      e.key === QUOTE_DRAFT_KEY ||
      e.key === null
    ) {
      onStoreChange();
    }
  };
  const onCustom = () => onStoreChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOKED_SNAPSHOT_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOKED_SNAPSHOT_EVENT, onCustom);
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    const booked = sessionStorage.getItem(BOOKED_SNAPSHOT_KEY) ?? "";
    const draft = sessionStorage.getItem(QUOTE_DRAFT_KEY) ?? "";
    // Combined version string so either store invalidates the hook.
    return `${booked.length}:${booked.slice(0, 64)}|${draft.length}:${draft.slice(0, 64)}`;
  } catch {
    return "";
  }
}

function getServerSnapshot(): string {
  return "";
}

/**
 * Mock order shell + booked snapshot and/or live quote draft.
 * Image URLs flow: paste-lookup → draft.photoDataUrl → snapshot.imageUrl → OrderItemThumb.
 */
export function useDisplayOrder(base: MockOrder): MockOrder {
  const version = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    void version;
    return resolveDisplayOrder(base, loadQuoteDraft());
  }, [base, version]);
}
