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
import { Warehouse } from "lucide-react";
import { isGoogleMapsConfigured } from "@/lib/google";
import {
  fetchPlacePredictions,
  resolvePlace,
  type PlaceSuggestion,
} from "@/lib/places";

export type ShopHubValue = {
  address: string;
  lat?: number;
  lng?: number;
};

/**
 * Admin shop address with Houston-biased Places autocomplete.
 * Always accepts a resolved place (the hub is the origin, not gated by radius).
 * Sets formatted address + lat/lng for map/booking center.
 */
export default function ShopAddressField({
  value,
  onChange,
}: {
  value: ShopHubValue;
  onChange: (next: ShopHubValue) => void;
}) {
  const listId = useId();
  const mapsOn = isGoogleMapsConfigured();
  const [text, setText] = useState(value.address);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinned, setPinned] = useState(
    value.lat != null && value.lng != null
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    setText(value.address);
    setPinned(value.lat != null && value.lng != null);
  }, [value.address, value.lat, value.lng]);

  useEffect(() => {
    if (!open) return;
    if (!mapsOn) {
      setSuggestions([]);
      setError(
        "Google Maps is not configured. Type a full street address, or set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."
      );
      return;
    }

    const q = text.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const list = await fetchPlacePredictions(q);
        if (reqId.current === id) {
          setSuggestions(list);
          setError(null);
          setHighlight(0);
        }
      } catch {
        if (reqId.current === id) {
          setSuggestions([]);
          setError("Could not load address suggestions. Try again.");
        }
      } finally {
        if (reqId.current === id) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [text, open, mapsOn]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const select = useCallback(
    async (s: PlaceSuggestion) => {
      if (!mapsOn) return;
      setLoading(true);
      setError(null);
      try {
        const resolved = await resolvePlace(s.placeId);
        // Prefer TX for the shop; still allow if Maps returns it.
        if (resolved.state && resolved.state.toUpperCase() !== "TX") {
          setError(
            "That place is outside Texas. Pick a Houston-area shop address."
          );
          setText(resolved.formattedAddress);
          setOpen(false);
          setSuggestions([]);
          return;
        }
        onChange({
          address: resolved.formattedAddress,
          lat: resolved.lat,
          lng: resolved.lng,
        });
        setText(resolved.formattedAddress);
        setPinned(true);
        setOpen(false);
        setSuggestions([]);
      } catch {
        setError("Could not verify that place. Try another suggestion.");
      } finally {
        setLoading(false);
      }
    },
    [mapsOn, onChange]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && suggestions[highlight]) {
      e.preventDefault();
      void select(suggestions[highlight]!);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={labelStyle} htmlFor="shop-address">
        Shop address
      </label>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <Warehouse
          size={14}
          color="var(--ink-500)"
          aria-hidden
          style={{ marginTop: 11 }}
        />
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <input
            id="shop-address"
            value={text}
            onChange={(e) => {
              const next = e.target.value;
              setText(next);
              setPinned(false);
              setOpen(true);
              // Free-type still dirty-saves address; pin clears until a suggestion is chosen
              onChange({
                address: next,
                lat: undefined,
                lng: undefined,
              });
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Start typing a Houston street, suite, or ZIP…"
            className="sip-admin-focus"
            autoComplete="off"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            style={{
              ...inputStyle,
              width: "100%",
              borderColor: pinned
                ? "var(--status-success)"
                : "var(--border-default)",
            }}
          />

          {open && (suggestions.length > 0 || loading) && (
            <ul
              id={listId}
              role="listbox"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "calc(100% + 4px)",
                zIndex: 30,
                margin: 0,
                padding: 6,
                listStyle: "none",
                background: "#fff",
                border: "1px solid var(--border-default)",
                borderRadius: 10,
                boxShadow: "var(--shadow-md)",
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {loading && suggestions.length === 0 && (
                <li
                  style={{
                    padding: "10px 12px",
                    fontSize: 12.5,
                    color: "var(--ink-500)",
                  }}
                >
                  Searching Houston addresses…
                </li>
              )}
              {suggestions.map((s, i) => (
                <li key={s.placeId} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => void select(s)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 12px",
                      cursor: "pointer",
                      background:
                        i === highlight ? "var(--blue-50)" : "transparent",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--ink-900)",
                      }}
                    >
                      {s.primary}
                    </div>
                    {s.secondary ? (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--ink-500)",
                          marginTop: 2,
                        }}
                      >
                        {s.secondary}
                      </div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--status-error)",
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}

      <p
        style={{
          margin: 0,
          fontSize: 11.5,
          color: "var(--ink-500)",
          lineHeight: 1.45,
        }}
      >
        {mapsOn ? (
          pinned && value.lat != null && value.lng != null ? (
            <>
              Map pin set · {value.lat.toFixed(5)}, {value.lng.toFixed(5)}.
              Save to update the home map and booking center.
            </>
          ) : (
            <>
              Pick a suggestion so we recognize a real Houston place and set the
              map pin. Free text alone will not move the pin until Save geocodes
              (if Maps server key allows).
            </>
          )
        ) : (
          <>
            Maps not configured - type the full address manually. Pin updates on
            Save only if server geocoding works.
          </>
        )}
      </p>
    </div>
  );
}

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--ink-500)",
};

const inputStyle: CSSProperties = {
  minWidth: 0,
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12.5,
  fontFamily: "var(--font-body)",
  color: "var(--ink-900)",
  background: "#fff",
  minHeight: 36,
  boxSizing: "border-box",
};
