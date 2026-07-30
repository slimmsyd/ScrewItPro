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
import { ArrowUp, ArrowDown, MapPin, type LucideIcon } from "lucide-react";
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
import { QUOTE_PATH } from "@/lib/site";

type FieldKey = "pickup" | "deliver";

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
 * Pickup/delivery bar with Google Places autocomplete (Houston metro only).
 * Establishment-friendly predictions; out-of-area selection blocks submit.
 * Waitlist copy shows after every selection (product is waitlist-first).
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

  const activeQuery =
    activeField === "pickup"
      ? pickupText
      : activeField === "deliver"
        ? deliverText
        : "";
  const open = Boolean(activeField && activeQuery.trim().length >= 2);

  // Debounced predictions
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
            setFormError(t("hero.placesResolveError"));
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
            setFormError(t("hero.placesResolveError"));
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

        // Waitlist message on every selection (product goal)
        if (resolved.inServiceArea) {
          setWaitlistNote(t("hero.placesWaitlistInArea"));
        } else {
          setWaitlistNote(t("hero.placesWaitlistOutOfArea"));
          setFormError(t("hero.placesOutOfAreaBlock"));
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

  const canSubmit =
    pickupPlace?.inServiceArea === true &&
    deliverPlace?.inServiceArea === true &&
    !resolving;

  const trySubmit = () => {
    if (resolving) return;

    if (!pickupPlace || !deliverPlace) {
      setFormError(t("hero.placesSelectBoth"));
      return;
    }
    if (!pickupPlace.inServiceArea || !deliverPlace.inServiceArea) {
      setFormError(t("hero.placesOutOfAreaBlock"));
      setWaitlistNote(t("hero.placesWaitlistOutOfArea"));
      return;
    }
    setFormError(null);
    // Get-a-Price journey: seed draft and enter Where step (price before bureaucracy).
    seedQuoteDraftFromHero(pickupPlace, deliverPlace);
    router.push(QUOTE_PATH);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length)
        setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length)
        setHighlight(
          (h) => (h - 1 + suggestions.length) % suggestions.length
        );
    } else if (e.key === "Enter") {
      if (suggestions[highlight]) {
        e.preventDefault();
        void selectSuggestion(suggestions[highlight]);
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
              open && activeField === key && suggestions[highlight]
                ? `${listId}-opt-${suggestions[highlight].placeId}`
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
            ) : suggestions.length === 0 ? (
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
                const active = i === highlight;
                return (
                  <li
                    key={place.placeId}
                    id={`${listId}-opt-${place.placeId}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlight(i)}
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
