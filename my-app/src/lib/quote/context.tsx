"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadQuoteDraft,
  saveQuoteDraft,
} from "@/lib/quote/draft-storage";
import { computeQuoteTotals } from "@/lib/quote/pricing";
import type {
  EntryMode,
  PickupMode,
  QuoteDraft,
  QuoteItem,
  QuoteTotals,
} from "@/lib/quote/types";
import {
  EMPTY_DRAFT,
  SCREWIT_HUB_PLACE,
} from "@/lib/quote/types";
import type { ResolvedPlace } from "@/lib/places";

type QuoteContextValue = {
  draft: QuoteDraft;
  totals: QuoteTotals;
  hydrated: boolean;
  setPickupAddress: (place: ResolvedPlace | null) => void;
  setDeliveryAddress: (place: ResolvedPlace | null) => void;
  setShipToHub: (ship: boolean) => void;
  setPickupMode: (mode: PickupMode) => void;
  setEntryMode: (mode: EntryMode) => void;
  addItem: (item: QuoteItem) => void;
  removeItem: (id: string) => void;
  replaceDraft: (partial: Partial<QuoteDraft>) => void;
  seedFromHero: (pickup: ResolvedPlace, deliver: ResolvedPlace) => void;
  canProceedFromWhere: boolean;
  canProceedFromItems: boolean;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

function emptyDraft(): QuoteDraft {
  return { ...EMPTY_DRAFT, items: [] };
}

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);

  // sessionStorage hydrate after mount (client-only; avoid SSR mismatch)
  useEffect(() => {
    const saved = loadQuoteDraft();
    const timer = window.setTimeout(() => {
      setDraft(saved);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveQuoteDraft(draft);
  }, [draft, hydrated]);

  const update = useCallback((fn: (prev: QuoteDraft) => QuoteDraft) => {
    setDraft((prev) => fn(prev));
  }, []);

  const setPickupAddress = useCallback(
    (place: ResolvedPlace | null) => {
      update((d) => ({
        ...d,
        pickupAddress: place,
        shipToHub: place?.placeId === SCREWIT_HUB_PLACE.placeId,
      }));
    },
    [update]
  );

  const setDeliveryAddress = useCallback(
    (place: ResolvedPlace | null) => {
      update((d) => ({ ...d, deliveryAddress: place }));
    },
    [update]
  );

  const setShipToHub = useCallback(
    (ship: boolean) => {
      update((d) => ({
        ...d,
        shipToHub: ship,
        pickupMode: ship
          ? "ship"
          : d.pickupMode === "ship"
            ? "pickup"
            : d.pickupMode,
        pickupAddress: ship
          ? SCREWIT_HUB_PLACE
          : d.shipToHub
            ? null
            : d.pickupAddress,
      }));
    },
    [update]
  );

  const setPickupMode = useCallback(
    (mode: PickupMode) => {
      update((d) => {
        if (mode === "ship") {
          return {
            ...d,
            pickupMode: "ship",
            shipToHub: true,
            pickupAddress: SCREWIT_HUB_PLACE,
          };
        }
        return {
          ...d,
          pickupMode: "pickup",
          shipToHub: false,
          pickupAddress:
            d.pickupAddress?.placeId === SCREWIT_HUB_PLACE.placeId
              ? null
              : d.pickupAddress,
        };
      });
    },
    [update]
  );

  const setEntryMode = useCallback(
    (mode: EntryMode) => {
      update((d) => ({ ...d, entryMode: mode }));
    },
    [update]
  );

  const addItem = useCallback(
    (item: QuoteItem) => {
      update((d) => ({ ...d, items: [...d.items, item] }));
    },
    [update]
  );

  const removeItem = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        items: d.items.filter((i) => i.id !== id),
      }));
    },
    [update]
  );

  const replaceDraft = useCallback((partial: Partial<QuoteDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const seedFromHero = useCallback(
    (pickup: ResolvedPlace, deliver: ResolvedPlace) => {
      setDraft((prev) => ({
        ...prev,
        pickupAddress: pickup,
        deliveryAddress: deliver,
        shipToHub: false,
        pickupMode: "pickup",
      }));
    },
    []
  );

  const totals = useMemo(() => computeQuoteTotals(draft), [draft]);

  const canProceedFromWhere = Boolean(
    draft.deliveryAddress?.inServiceArea &&
      (draft.pickupMode === "ship"
        ? true
        : draft.pickupAddress?.inServiceArea)
  );

  const canProceedFromItems = draft.items.length > 0;

  const value = useMemo<QuoteContextValue>(
    () => ({
      draft,
      totals,
      hydrated,
      setPickupAddress,
      setDeliveryAddress,
      setShipToHub,
      setPickupMode,
      setEntryMode,
      addItem,
      removeItem,
      replaceDraft,
      seedFromHero,
      canProceedFromWhere,
      canProceedFromItems,
    }),
    [
      draft,
      totals,
      hydrated,
      setPickupAddress,
      setDeliveryAddress,
      setShipToHub,
      setPickupMode,
      setEntryMode,
      addItem,
      removeItem,
      replaceDraft,
      seedFromHero,
      canProceedFromWhere,
      canProceedFromItems,
    ]
  );

  return (
    <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
  );
}

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error("useQuote must be used within QuoteProvider");
  }
  return ctx;
}
