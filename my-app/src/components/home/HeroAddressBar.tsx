"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  MapPin,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";
import { isGoogleMapsConfigured } from "@/lib/google";
import {
  fetchPlacePredictions,
  resolvePlace,
  type PlaceSuggestion,
  type ResolvedPlace,
} from "@/lib/places";
import { seedQuoteDraftFromHero } from "@/lib/quote/draft-storage";
import {
  hubPlaceFromServiceArea,
  SCREWIT_HUB_PLACE,
  SCREWIT_HUB_PLACE_ID,
} from "@/lib/quote/types";
import { fetchServiceAreaConfig } from "@/lib/config/service-area-client";
import type { ServiceAreaConfig } from "@/lib/config/service-area";
import { QUOTE_PATH } from "@/lib/site";

type FieldKey = "pickup" | "deliver";

/** Synthetic listbox row for ship-to-hub on marketing pickup. */
const HUB_LIST_ID = SCREWIT_HUB_PLACE_ID;

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color: "var(--blue-electric)" }}>
        {text.slice(i, i + q.length)}
      </span>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Pickup/delivery bar with Google Places autocomplete (Houston metro).
 * Pickup listbox pins ScrewIt Hub so customers can choose ship-to-hub
 * without typing a street address.
 */
export default function HeroAddressBar({
  cta,
}: {
  /** @deprecated Hero now routes to /quote/where; kept for API compatibility. */
  onQuote?: () => void;
  cta: string;
}) {
  const router = useRouter();
  const mobile = useIsMobile();
  const { t } = useLocale();
  const listId = useId();
  const mapsOn = isGoogleMapsConfigured();

  const [pickupText, setPickupText] = useState("");
  const [deliverText, setDeliverText] = useState("");
  const [pickupPlace, setPickupPlace] = useState<ResolvedPlace | null>(null);
  const [deliverPlace, setDeliverPlace] = useState<ResolvedPlace | null>(null);
  const [hubConfig, setHubConfig] = useState<ServiceAreaConfig | null>(null);

  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /** Waitlist banner after any selection */
  const [waitlistNote, setWaitlistNote] = useState<string | null>(null);

  const rootRef = useRef<HTMLFormElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchServiceAreaConfig().then((c) => {
      if (!cancelled) setHubConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hubPlace = hubConfig
    ? hubPlaceFromServiceArea(hubConfig)
    : SCREWIT_HUB_PLACE;

  const activeQuery =
    activeField === "pickup"
      ? pickupText
      : activeField === "deliver"
        ? deliverText
        : "";
  /** Pickup opens immediately so Hub is clickable; deliver needs 2+ chars. */
  const open = Boolean(
    activeField === "pickup" ||
      (activeField === "deliver" && activeQuery.trim().length >= 2)
  );
  const showHubOption = activeField === "pickup";
  /** Combined listbox length for keyboard nav (hub + place rows). */
  const listLength =
    (showHubOption ? 1 : 0) + (loading ? 0 : suggestions.length);

  // Debounced predictions (skip when query short — hub still available on pickup)
  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }
    const q = activeQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        if (!mapsOn) {
          if (reqId.current === id) {
            setSuggestions([]);
            // Pickup can still choose Hub without Maps.
            if (activeField !== "pickup") {
              setFormError(t("hero.placesResolveError"));
            }
          }
          return;
        }
        try {
          const list = await fetchPlacePredictions(q);
          if (reqId.current === id) {
            setSuggestions(list);
            setFormError(null);
          }
        } catch {
          if (reqId.current === id) {
            setSuggestions([]);
            if (activeField !== "pickup") {
              setFormError(t("hero.placesResolveError"));
            }
          }
        }
      } finally {
        if (reqId.current === id) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeField, activeQuery, mapsOn, t]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [suggestions, activeField]);

  const selectHub = useCallback(() => {
    setPickupText(hubPlace.formattedAddress);
    setPickupPlace(hubPlace);
    setFormError(null);
    setWaitlistNote(t("hero.placesWaitlistInArea"));
    setActiveField(null);
    setSuggestions([]);
  }, [hubPlace, t]);

  const selectSuggestion = useCallback(
    async (s: PlaceSuggestion) => {
      if (!activeField) return;
      setResolving(true);
      setFormError(null);
      try {
        if (!mapsOn) {
          setFormError(t("hero.placesResolveError"));
          return;
        }
        const resolved = await resolvePlace(s.placeId);

        const line = resolved.formattedAddress;
        if (activeField === "pickup") {
          setPickupText(line);
          setPickupPlace(resolved);
        } else {
          setDeliverText(line);
          setDeliverPlace(resolved);
        }

        // Model 1 soft wall: outside radius still bookable (travel fee on quote).
        // Non-TX still fails closed via resolvePlace / isInServiceArea.
        if (resolved.state && resolved.state.toUpperCase() !== "TX") {
          setFormError(t("hero.placesOutOfAreaBlock"));
          setWaitlistNote(t("hero.placesWaitlistOutOfArea"));
        } else if (resolved.inServiceArea) {
          setWaitlistNote(t("hero.placesWaitlistInArea"));
          setFormError(null);
        } else {
          // Outside free zone — allow continue; quote shows travel fee.
          setWaitlistNote(t("hero.placesWaitlistOutOfArea"));
          setFormError(null);
        }
        setActiveField(null);
        setSuggestions([]);
      } catch {
        setFormError(t("hero.placesResolveError"));
      } finally {
        setResolving(false);
      }
    },
    [activeField, mapsOn, t]
  );

  const onFieldChange = (key: FieldKey, value: string) => {
    if (key === "pickup") {
      setPickupText(value);
      setPickupPlace(null);
    } else {
      setDeliverText(value);
      setDeliverPlace(null);
    }
    setActiveField(key);
    setFormError(null);
    setWaitlistNote(null);
  };

  const isTxBookable = (p: typeof pickupPlace) =>
    Boolean(p && (!p.state || p.state.toUpperCase() === "TX"));

  const canSubmit =
    isTxBookable(pickupPlace) && isTxBookable(deliverPlace) && !resolving;

  const trySubmit = () => {
    if (resolving) return;

    if (!pickupPlace || !deliverPlace) {
      setFormError(t("hero.placesSelectBoth"));
      return;
    }
    if (!isTxBookable(pickupPlace) || !isTxBookable(deliverPlace)) {
      setFormError(t("hero.placesOutOfAreaBlock"));
      setWaitlistNote(t("hero.placesWaitlistOutOfArea"));
      return;
    }
    setFormError(null);
    // Get-a-Price journey: seed draft and enter Where step (price before bureaucracy).
    // Hub pickup → ship-to-hub mode; outside radius OK (Model 1 travel on Price).
    const shipToHub = pickupPlace.placeId === SCREWIT_HUB_PLACE_ID;
    seedQuoteDraftFromHero(pickupPlace, deliverPlace, { shipToHub });
    router.push(QUOTE_PATH);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    const len = Math.max(listLength, 1);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % len);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + len) % len);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showHubOption && highlight === 0) {
        selectHub();
        return;
      }
      const placeIndex = showHubOption ? highlight - 1 : highlight;
      if (suggestions[placeIndex]) {
        void selectSuggestion(suggestions[placeIndex]);
      }
    } else if (e.key === "Escape") {
      setActiveField(null);
    }
  };

  const field = (
    Icon: LucideIcon,
    label: string,
    placeholder: string,
    id: string,
    key: FieldKey,
    value: string
  ) => {
    const place = key === "pickup" ? pickupPlace : deliverPlace;
    const ooa = place && !place.inServiceArea;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
          padding: "8px 14px",
          position: "relative",
          opacity: resolving ? 0.85 : 1,
        }}
      >
        <Icon
          size={20}
          color={ooa ? "var(--status-error)" : "var(--ink-500)"}
          aria-hidden
        />
        <label htmlFor={id} style={{ display: "block", flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              color: ooa ? "var(--status-error)" : "var(--ink-500)",
            }}
          >
            {label}
          </span>
          <input
            id={id}
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open && activeField === key}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={ooa || undefined}
            aria-activedescendant={
              open && activeField === key
                ? key === "pickup" && highlight === 0
                  ? `${listId}-opt-${HUB_LIST_ID}`
                  : (() => {
                      const idx = key === "pickup" ? highlight - 1 : highlight;
                      const s = suggestions[idx];
                      return s ? `${listId}-opt-${s.placeId}` : undefined;
                    })()
                : undefined
            }
            onChange={(e) => onFieldChange(key, e.target.value)}
            onFocus={() => setActiveField(key)}
            onKeyDown={onKeyDown}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: ooa ? "var(--status-error)" : "var(--ink-900)",
            }}
          />
        </label>
      </div>
    );
  };

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    left: mobile ? 0 : activeField === "deliver" ? "42%" : 0,
    right: mobile ? 0 : activeField === "pickup" ? "38%" : 0,
    top: "calc(100% + 8px)",
    zIndex: 40,
    background: "var(--white)",
    border: "2px solid var(--blue-electric)",
    borderRadius: 16,
    padding: "6px 0",
    boxShadow: "0 18px 40px -18px rgba(11,16,48,0.35)",
    maxHeight: 320,
    overflowY: "auto",
    listStyle: "none",
    margin: 0,
  };

  return (
    <div style={{ width: "100%" }}>
      <form
        ref={rootRef}
        onSubmit={(e) => {
          e.preventDefault();
          trySubmit();
        }}
        style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          alignItems: "stretch",
          gap: mobile ? 4 : 0,
          width: "100%",
          position: "relative",
          background: "var(--white)",
          border: "2px solid transparent",
          borderRadius: 16,
          padding: 6,
          maxWidth: "100%",
          backgroundImage:
            "linear-gradient(#fff,#fff), linear-gradient(90deg, var(--blue-electric), var(--blue-deep))",
          backgroundOrigin: "padding-box, border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: "0 20px 50px -28px rgba(11,16,48,0.35)",
        }}
      >
        {field(
          ArrowUp,
          t("hero.addrPickupLabel"),
          t("hero.addrPickupPh"),
          "hero-pickup",
          "pickup",
          pickupText
        )}
        {!mobile && (
          <div
            style={{
              width: 1,
              alignSelf: "stretch",
              background: "var(--blue-100)",
              margin: "6px 0",
            }}
          />
        )}
        {field(
          ArrowDown,
          t("hero.addrDeliverLabel"),
          t("hero.addrDeliverPh"),
          "hero-deliver",
          "deliver",
          deliverText
        )}
        <button
          type="submit"
          disabled={resolving}
          style={{
            flex: "none",
            border: "none",
            cursor: canSubmit ? "pointer" : "pointer",
            color: "var(--white)",
            background: canSubmit
              ? "linear-gradient(90deg, var(--blue-electric), var(--blue-deep))"
              : "linear-gradient(90deg, var(--blue-300), var(--blue-steel))",
            borderRadius: 12,
            padding: mobile ? "14px 20px" : "0 26px",
            minHeight: 52,
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 700,
            whiteSpace: "nowrap",
            opacity: resolving ? 0.7 : 1,
          }}
        >
          {resolving ? t("hero.placesResolving") : cta}
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label={t("hero.placesListLabel")}
            style={dropdownStyle}
          >
            {showHubOption && (
              <li
                key={HUB_LIST_ID}
                id={`${listId}-opt-${HUB_LIST_ID}`}
                role="option"
                aria-selected={highlight === 0}
                onMouseEnter={() => setHighlight(0)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectHub();
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  background:
                    highlight === 0 ? "var(--blue-50)" : "transparent",
                  transition: "background 150ms ease",
                  borderBottom:
                    suggestions.length > 0 || loading
                      ? "1px solid var(--gray-100)"
                      : "none",
                }}
              >
                <Warehouse
                  size={20}
                  strokeWidth={1.75}
                  color="var(--blue-electric)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--blue-deep)",
                      lineHeight: 1.3,
                    }}
                  >
                    {t("hero.hubOptionPrimary")}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--ink-500)",
                      marginTop: 2,
                      lineHeight: 1.35,
                    }}
                  >
                    {hubPlace.formattedAddress}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "var(--blue-steel)",
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {t("hero.hubOptionSecondary")}
                  </span>
                </span>
              </li>
            )}
            {loading ? (
              <li
                style={{
                  padding: "14px 18px",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--ink-500)",
                }}
              >
                {t("hero.placesSearching")}
              </li>
            ) : suggestions.length === 0 && activeQuery.trim().length >= 2 ? (
              <li
                style={{
                  padding: "14px 18px",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--ink-500)",
                }}
              >
                {t("hero.placesNoMatch")}
              </li>
            ) : (
              suggestions.map((place, i) => {
                const rowIndex = showHubOption ? i + 1 : i;
                const active = rowIndex === highlight;
                return (
                  <li
                    key={place.placeId}
                    id={`${listId}-opt-${place.placeId}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlight(rowIndex)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      void selectSuggestion(place);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: active ? "var(--blue-50)" : "transparent",
                      transition: "background 150ms ease",
                    }}
                  >
                    <MapPin
                      size={20}
                      strokeWidth={1.75}
                      color="var(--ink-300)"
                      style={{ flexShrink: 0, marginTop: 2 }}
                      aria-hidden
                    />
                    <span style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-body)",
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--ink-900)",
                          lineHeight: 1.3,
                        }}
                      >
                        <HighlightMatch
                          text={place.primary}
                          query={activeQuery}
                        />
                      </span>
                      {place.secondary ? (
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-body)",
                            fontSize: 13,
                            color: "var(--ink-500)",
                            marginTop: 2,
                            lineHeight: 1.35,
                          }}
                        >
                          {place.secondary}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </form>

      {/* Waitlist note after every selection + hard errors that block submit */}
      {(waitlistNote || formError) && (
        <div
          role="status"
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 12,
            background: formError ? "rgba(198,50,60,0.08)" : "var(--blue-50)",
            border: `1px solid ${formError ? "rgba(198,50,60,0.25)" : "var(--blue-100)"}`,
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            lineHeight: 1.45,
            color: formError ? "var(--status-error)" : "var(--blue-deep)",
          }}
        >
          {formError ? (
            <strong style={{ display: "block", marginBottom: 4 }}>
              {formError}
            </strong>
          ) : null}
          {waitlistNote}
        </div>
      )}
    </div>
  );
}
