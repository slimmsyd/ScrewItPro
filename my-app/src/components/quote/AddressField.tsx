"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { LucideIcon } from "lucide-react";
import { isGoogleMapsConfigured } from "@/lib/google";
import {
  fetchPlacePredictions,
  resolvePlace,
  type PlaceSuggestion,
  type ResolvedPlace,
} from "@/lib/places";

const MOCK_PLACES: PlaceSuggestion[] = [
  { placeId: "mock-1", primary: "IKEA Houston", secondary: "7810 Katy Freeway, Houston, TX" },
  { placeId: "mock-2", primary: "The Galleria", secondary: "5085 Westheimer Rd, Houston, TX" },
  { placeId: "mock-3", primary: "CityCentre Houston", secondary: "800 Town & Country Blvd, Houston, TX" },
  { placeId: "mock-4", primary: "Memorial City Mall", secondary: "303 Memorial City Way, Houston, TX" },
  { placeId: "mock-5", primary: "Rice Village", secondary: "2400 University Blvd, Houston, TX" },
  { placeId: "mock-6", primary: "Highland Village", secondary: "4055 Westheimer Rd, Houston, TX" },
  { placeId: "mock-7", primary: "Heights Mercantile", secondary: "1801 N Shepherd Dr, Houston, TX" },
  { placeId: "mock-8", primary: "Sugar Land Town Square", secondary: "15958 City Walk, Sugar Land, TX" },
  { placeId: "mock-9", primary: "The Woodlands Mall", secondary: "1201 Lake Woodlands Dr, The Woodlands, TX" },
  { placeId: "mock-10", primary: "Katy Mills", secondary: "5000 Katy Mills Cir, Katy, TX" },
];

const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {
  "mock-1": { lat: 29.785, lng: -95.561 },
  "mock-2": { lat: 29.739, lng: -95.463 },
  "mock-3": { lat: 29.781, lng: -95.56 },
  "mock-4": { lat: 29.781, lng: -95.54 },
  "mock-5": { lat: 29.717, lng: -95.415 },
  "mock-6": { lat: 29.741, lng: -95.445 },
  "mock-7": { lat: 29.802, lng: -95.41 },
  "mock-8": { lat: 29.593, lng: -95.624 },
  "mock-9": { lat: 30.165, lng: -95.46 },
  "mock-10": { lat: 29.777, lng: -95.81 },
};

function filterMock(query: string): PlaceSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return MOCK_PLACES.filter(
    (p) =>
      p.primary.toLowerCase().includes(q) ||
      p.secondary.toLowerCase().includes(q)
  ).slice(0, 6);
}

export default function AddressField({
  label,
  icon: Icon,
  value,
  placeholder,
  onChange,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  value: ResolvedPlace | null;
  placeholder: string;
  onChange: (place: ResolvedPlace | null) => void;
  disabled?: boolean;
}) {
  const listId = useId();
  const mapsOn = isGoogleMapsConfigured();
  const [text, setText] = useState(value?.formattedAddress ?? "");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    setText(value?.formattedAddress ?? "");
  }, [value]);

  useEffect(() => {
    if (disabled || !open) return;
    const q = text.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        let list: PlaceSuggestion[] = [];
        if (mapsOn) {
          try {
            list = await fetchPlacePredictions(q);
          } catch {
            list = filterMock(q);
          }
        } else {
          list = filterMock(q);
        }
        if (reqId.current === id) setSuggestions(list);
      } finally {
        if (reqId.current === id) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [text, open, mapsOn, disabled]);

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
      setLoading(true);
      setError(null);
      try {
        let resolved: ResolvedPlace;
        if (s.placeId.startsWith("mock-") || !mapsOn) {
          const coords = MOCK_COORDS[s.placeId] ?? { lat: 29.76, lng: -95.37 };
          resolved = {
            placeId: s.placeId,
            name: s.primary,
            formattedAddress: `${s.primary}, ${s.secondary}`,
            lat: coords.lat,
            lng: coords.lng,
            state: "TX",
            inServiceArea: true,
          };
        } else {
          resolved = await resolvePlace(s.placeId);
        }
        if (!resolved.inServiceArea) {
          setError("We currently serve the Houston Metro Area only.");
          onChange(null);
          setText(resolved.formattedAddress);
        } else {
          onChange(resolved);
          setText(resolved.formattedAddress);
        }
        setOpen(false);
        setSuggestions([]);
      } catch {
        setError("Couldn't verify that place. Try another suggestion.");
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
      void select(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const filled = Boolean(value);
  const active = open && !disabled;

  return (
    <div ref={rootRef} style={{ flex: 1, position: "relative" }}>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--ink-500)",
          marginBottom: 7,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </label>
      <div
        style={{
          minHeight: 52,
          borderRadius: 8,
          background: disabled ? "var(--gray-50)" : "#fff",
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "0 15px",
          border: `1.5px solid ${
            active || filled ? "var(--blue-electric)" : "var(--border-default)"
          }`,
          boxShadow:
            active || filled ? "0 0 0 4px rgba(29,110,254,.12)" : "none",
          opacity: disabled ? 0.75 : 1,
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <Icon
          size={18}
          color={
            filled || active ? "var(--blue-electric)" : "var(--ink-300)"
          }
          style={{ flex: "0 0 auto" }}
        />
        <input
          type="text"
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            onChange(null);
            setOpen(true);
            setError(null);
          }}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: filled ? 600 : 500,
            color: "var(--ink-900)",
          }}
        />
        {loading && (
          <span style={{ fontSize: 12, color: "var(--ink-300)" }}>…</span>
        )}
      </div>
      {error && (
        <p role="alert" style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--status-error)" }}>
          {error}
        </p>
      )}
      {open && suggestions.length > 0 && !disabled && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            margin: "6px 0 0",
            padding: 6,
            listStyle: "none",
            background: "#fff",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "var(--shadow-md)",
            zIndex: 20,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
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
                  background: i === highlight ? "var(--blue-50)" : "transparent",
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>
                  {s.primary}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>{s.secondary}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
