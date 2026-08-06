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
  getServiceArea,
  resolvePlace,
  type PlaceSuggestion,
  type ResolvedPlace,
} from "@/lib/places";
import { BUSINESS } from "@/lib/seo/business";

const SUPPORT_EMAIL = BUSINESS.email;

/**
 * Houston-metro Places autocomplete for the quote Where step.
 * Fail-closed: no mock places. Service radius from Admin Settings hub config.
 * Model 1 soft wall: outside radius is accepted with a travel-fee notice.
 * Never invent inServiceArea: true (flag still means "inside free zone").
 */
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
  /** Soft notice (e.g. out-of-area travel) — not a hard block. */
  const [notice, setNotice] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    setText(value?.formattedAddress ?? "");
  }, [value]);

  useEffect(() => {
    if (disabled || !open) return;

    if (!mapsOn) {
      setSuggestions([]);
      setLoading(false);
      setError(
        `Address lookup needs Google Maps. Email ${SUPPORT_EMAIL} or try again later.`
      );
      return;
    }

    const q = text.trim();
    if (q.length < 2) {
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
        }
      } catch {
        if (reqId.current === id) {
          setSuggestions([]);
          setError(
            "We couldn't load address suggestions. Check your connection and try again."
          );
        }
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
      if (!mapsOn) {
        setError(
          `Address lookup needs Google Maps. Email ${SUPPORT_EMAIL} or try again later.`
        );
        return;
      }
      setLoading(true);
      setError(null);
      setNotice(null);
      try {
        const [resolved, area] = await Promise.all([
          resolvePlace(s.placeId),
          getServiceArea(),
        ]);
        // Fail closed on non-TX; soft wall outside radius (Model 1).
        if (resolved.state && resolved.state.toUpperCase() !== "TX") {
          setError(
            "We currently serve the Houston Metro area in Texas. That address is outside Texas."
          );
          onChange(null);
          setText(resolved.formattedAddress);
        } else if (!resolved.inServiceArea) {
          const fee =
            typeof area.farFee === "number" && area.farFee > 0
              ? ` A +$${Math.round(area.farFee)} travel fee will appear on your quote.`
              : "";
          setNotice(
            `Outside our usual ${area.radiusMiles} mi area from the hub — still bookable.${fee}`
          );
          onChange(resolved);
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
          disabled={disabled || !mapsOn}
          placeholder={
            mapsOn
              ? placeholder
              : "Address lookup unavailable — Maps not configured"
          }
          onChange={(e) => {
            setText(e.target.value);
            onChange(null);
            setOpen(true);
            setError(null);
            setNotice(null);
          }}
          onFocus={() => !disabled && mapsOn && setOpen(true)}
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
        <p
          role="alert"
          style={{
            margin: "6px 0 0",
            fontSize: 12.5,
            color: "var(--status-error)",
          }}
        >
          {error}
        </p>
      )}
      {!error && notice && (
        <p
          role="status"
          style={{
            margin: "6px 0 0",
            fontSize: 12.5,
            color: "var(--blue-steel)",
            fontWeight: 600,
          }}
        >
          {notice}
        </p>
      )}
      {open && suggestions.length > 0 && !disabled && mapsOn && (
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
                  background:
                    i === highlight ? "var(--blue-50)" : "transparent",
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--ink-900)",
                  }}
                >
                  {s.primary}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
                  {s.secondary}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
