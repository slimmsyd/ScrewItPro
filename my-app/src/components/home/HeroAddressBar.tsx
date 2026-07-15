"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ArrowUp, ArrowDown, MapPin, type LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

type FieldKey = "pickup" | "deliver";

type MockPlace = {
  id: string;
  name: string;
  address: string;
};

/** Houston-metro mock places — swapped for Google Places shortly. */
const MOCK_PLACES: MockPlace[] = [
  {
    id: "1",
    name: "IKEA Houston",
    address: "7810 Katy Freeway, Houston, TX",
  },
  {
    id: "2",
    name: "The Galleria",
    address: "5085 Westheimer Rd, Houston, TX",
  },
  {
    id: "3",
    name: "CityCentre Houston",
    address: "800 Town & Country Blvd, Houston, TX",
  },
  {
    id: "4",
    name: "Memorial City Mall",
    address: "303 Memorial City Way, Houston, TX",
  },
  {
    id: "5",
    name: "Rice Village",
    address: "2400 University Blvd, Houston, TX",
  },
  {
    id: "6",
    name: "Highland Village",
    address: "4055 Westheimer Rd, Houston, TX",
  },
  {
    id: "7",
    name: "Heights Mercantile",
    address: "1801 N Shepherd Dr, Houston, TX",
  },
  {
    id: "8",
    name: "Montrose",
    address: "Westheimer Rd & Montrose Blvd, Houston, TX",
  },
  {
    id: "9",
    name: "Midtown Houston",
    address: "2800 Main St, Houston, TX",
  },
  {
    id: "10",
    name: "Sugar Land Town Square",
    address: "15958 City Walk, Sugar Land, TX",
  },
  {
    id: "11",
    name: "The Woodlands Mall",
    address: "1201 Lake Woodlands Dr, The Woodlands, TX",
  },
  {
    id: "12",
    name: "Katy Mills",
    address: "5000 Katy Mills Cir, Katy, TX",
  },
];

function filterPlaces(query: string): MockPlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
  ).slice(0, 6);
}

/** Highlight the typed query inside a place label (Bellhop-style). */
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
 * Pickup/delivery quote bar from the V2 design.
 * Mock location autocomplete (Google Places later) opens as the user types.
 */
export default function HeroAddressBar({
  onQuote,
  cta,
}: {
  onQuote: () => void;
  cta: string;
}) {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const listId = useId();

  const [pickup, setPickup] = useState("");
  const [deliver, setDeliver] = useState("");
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLFormElement>(null);

  const activeQuery = activeField === "pickup" ? pickup : deliver;
  const suggestions = useMemo(
    () => (activeField ? filterPlaces(activeQuery) : []),
    [activeField, activeQuery]
  );
  const open = Boolean(activeField && activeQuery.trim().length > 0);

  // Close on outside click
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

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlight(0);
  }, [activeQuery, activeField]);

  const selectPlace = useCallback(
    (place: MockPlace) => {
      const line = `${place.name}, ${place.address}`;
      if (activeField === "pickup") setPickup(line);
      if (activeField === "deliver") setDeliver(line);
      setActiveField(null);
    },
    [activeField]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && suggestions[highlight]) {
      e.preventDefault();
      selectPlace(suggestions[highlight]);
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
    value: string,
    onChange: (v: string) => void
  ) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flex: 1,
        minWidth: 0,
        padding: "8px 14px",
        position: "relative",
      }}
    >
      <Icon size={20} color="var(--ink-500)" aria-hidden />
      <label htmlFor={id} style={{ display: "block", flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink-500)",
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
          aria-activedescendant={
            open && activeField === key && suggestions[highlight]
              ? `${listId}-opt-${suggestions[highlight].id}`
              : undefined
          }
          onChange={(e) => {
            onChange(e.target.value);
            setActiveField(key);
          }}
          onFocus={() => setActiveField(key)}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--ink-900)",
          }}
        />
      </label>
    </div>
  );

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
    <form
      ref={rootRef}
      onSubmit={(e) => {
        e.preventDefault();
        onQuote();
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
        pickup,
        setPickup
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
        deliver,
        setDeliver
      )}
      <button
        type="submit"
        style={{
          flex: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--white)",
          background:
            "linear-gradient(90deg, var(--blue-electric), var(--blue-deep))",
          borderRadius: 12,
          padding: mobile ? "14px 20px" : "0 26px",
          minHeight: 52,
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {cta}
      </button>

      {/* Mock address autocomplete — Google Places later */}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Address suggestions"
          style={dropdownStyle}
        >
          {suggestions.length === 0 ? (
            <li
              style={{
                padding: "14px 18px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink-500)",
              }}
            >
              No matches — try a Houston street or landmark
            </li>
          ) : (
            suggestions.map((place, i) => {
              const active = i === highlight;
              return (
                <li
                  key={place.id}
                  id={`${listId}-opt-${place.id}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    // mousedown so selection wins before input blur
                    e.preventDefault();
                    selectPlace(place);
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
                      <HighlightMatch text={place.name} query={activeQuery} />
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
                      {place.address}
                    </span>
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </form>
  );
}
