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
import {
  computeQuoteTotals,
  type TravelRateCard,
} from "@/lib/quote/pricing";
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
import { fetchServiceAreaConfig } from "@/lib/config/service-area-client";

/** TX-only soft wall: outside radius is bookable; non-TX is not. */
function isTxPlace(place: ResolvedPlace | null): boolean {
  if (!place) return false;
  if (place.state && place.state.toUpperCase() !== "TX") return false;
  return true;
}

type QuoteContextValue = {
  draft: QuoteDraft;
  totals: QuoteTotals;
  hydrated: boolean;
  /** Hub + farFee for travel preview (from public service-area). */
  travelRates: TravelRateCard | null;
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
  const [travelRates, setTravelRates] = useState<TravelRateCard | null>(null);

  // sessionStorage hydrate after mount (client-only; avoid SSR mismatch)
  useEffect(() => {
    const saved = loadQuoteDraft();
    const timer = window.setTimeout(() => {
      setDraft(saved);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Public hub + farFee for Model 1 travel preview on totals
  useEffect(() => {
    let cancelled = false;
    fetchServiceAreaConfig().then((c) => {
      if (cancelled) return;
      setTravelRates({
        lat: c.lat,
        lng: c.lng,
        radiusMiles: c.radiusMiles,
        farFee: c.farFee,
        exceptions: c.exceptions ?? [],
      });
    });
    return () => {
      cancelled = true;
    };
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

  const totals = useMemo(
    () => computeQuoteTotals(draft, travelRates),
    [draft, travelRates]
  );

  // Model 1 soft wall: outside radius bookable; ZIP refuse blocks delivery.
  const canProceedFromWhere = Boolean(
    isTxPlace(draft.deliveryAddress) &&
      totals.travelAllowed &&
      !totals.zipRefused &&
      (draft.pickupMode === "ship" ? true : isTxPlace(draft.pickupAddress))
  );

  const canProceedFromItems = draft.items.length > 0;

  const value = useMemo<QuoteContextValue>(
    () => ({
      draft,
      totals,
      hydrated,
      travelRates,
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
      travelRates,
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
