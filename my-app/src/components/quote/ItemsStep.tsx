"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Armchair,
  BedDouble,
  Camera,
  Check,
  Home,
  Library,
  Mic,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Square,
  Store,
  Table,
} from "lucide-react";
import QuoteShell from "@/components/quote/QuoteShell";
import BuildCart from "@/components/quote/BuildCart";
import ScreenTransition from "@/components/quote/ScreenTransition";
import { useQuote } from "@/lib/quote/context";
import {
  catalogToQuoteItem,
  MOCK_PRODUCTS,
  RETAILER_CHIPS,
  searchCatalog,
  STORE_CHIPS,
} from "@/lib/quote/mock-catalog";
import { formatUsd, HOME_CATEGORY_CENTS } from "@/lib/quote/pricing";
import type { EntryMode, HomeCategory, QuoteItem } from "@/lib/quote/types";
import { QUOTE_PATH, QUOTE_PRICE_PATH } from "@/lib/site";
import { useIsMobile } from "@/hooks/useIsMobile";

const MODES: {
  key: EntryMode;
  title: string;
  sub: string;
  icon: typeof ShoppingBag;
}[] = [
  {
    key: "buy",
    title: "I'm buying it new",
    sub: "Paste a link or search",
    icon: ShoppingBag,
  },
  {
    key: "home",
    title: "I own it, boxed at home",
    sub: "Describe what you have",
    icon: Home,
  },
  {
    key: "store",
    title: "It's waiting at the store",
    sub: "We collect — don't load your car",
    icon: Store,
  },
];

const HOME_CATS: {
  key: HomeCategory;
  label: string;
  icon: typeof BedDouble;
}[] = [
  { key: "bed", label: "Bed", icon: BedDouble },
  { key: "dresser", label: "Dresser", icon: Archive },
  { key: "table", label: "Table", icon: Table },
  { key: "shelf", label: "Shelf", icon: Library },
  { key: "chair", label: "Chair", icon: Armchair },
  { key: "other", label: "Other", icon: Archive },
];

export default function ItemsStep() {
  const router = useRouter();
  const mobile = useIsMobile();
  const { draft, setEntryMode, addItem, removeItem, canProceedFromItems } =
    useQuote();

  const goPrice = () => {
    if (!canProceedFromItems) return;
    router.push(QUOTE_PRICE_PATH);
  };

  return (
    <QuoteShell
      step={1}
      aside={
        <BuildCart
          items={draft.items}
          onRemove={removeItem}
          cta="See my price"
          ctaDisabled={!canProceedFromItems}
          onCta={goPrice}
        />
      }
      mobileBar={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600 }}>
              Your build
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--blue-deep)" }}>
              {draft.items.length} item{draft.items.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            type="button"
            onClick={goPrice}
            disabled={!canProceedFromItems}
            style={{
              height: 48,
              padding: "0 18px",
              borderRadius: 9,
              border: "none",
              background: "var(--blue-deep)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14.5,
              cursor: canProceedFromItems ? "pointer" : "not-allowed",
              opacity: canProceedFromItems ? 1 : 0.5,
              whiteSpace: "nowrap",
            }}
          >
            See my price →
          </button>
        </div>
      }
    >
      <ScreenTransition>
        <Link
          href={QUOTE_PATH}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            color: "var(--ink-500)",
            textDecoration: "none",
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: mobile ? 28 : 34,
            letterSpacing: "-0.015em",
            color: "var(--blue-deep)",
            margin: "0 0 6px",
          }}
        >
          What are we building?
        </h1>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: 15,
            color: "var(--ink-500)",
            maxWidth: 520,
          }}
        >
          First — how do you have it? Workshop assembly only (never in-home).
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
            gap: 10,
            maxWidth: 720,
            marginBottom: 28,
          }}
        >
          {MODES.map((m) => {
            const selected = draft.entryMode === m.key;
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setEntryMode(m.key)}
                className="quote-tap"
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  border: `1.5px solid ${selected ? "var(--blue-electric)" : "var(--border-default)"}`,
                  background: selected ? "var(--blue-50)" : "#fff",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: selected ? "#fff" : "var(--blue-50)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Icon size={18} color="var(--blue-electric)" />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "var(--blue-deep)",
                    marginBottom: 4,
                  }}
                >
                  {m.title}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-500)", lineHeight: 1.35 }}>
                  {m.sub}
                </div>
              </button>
            );
          })}
        </div>

        {draft.entryMode === "buy" && (
          <BuyMode addedIds={draft.items.map((i) => i.articleId).filter(Boolean) as string[]} onAdd={addItem} />
        )}
        {draft.entryMode === "home" && <HomeMode onAdd={addItem} />}
        {draft.entryMode === "store" && <StoreMode onAdd={addItem} />}
      </ScreenTransition>
    </QuoteShell>
  );
}

function BuyMode({
  onAdd,
  addedIds,
}: {
  onAdd: (item: QuoteItem) => void;
  addedIds: string[];
}) {
  const [query, setQuery] = useState("https://www.ikea.com/");
  const [retailer, setRetailer] = useState<string | null>(null);
  const results = useMemo(
    () => searchCatalog(query, retailer),
    [query, retailer]
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 52,
          borderRadius: 999,
          border: "2px solid var(--blue-electric)",
          boxShadow: "0 0 0 4px rgba(29,110,254,.12)",
          padding: "0 18px",
          background: "#fff",
          marginBottom: 14,
        }}
      >
        <Search size={18} color="var(--blue-electric)" />
        <label htmlFor="product-search" className="sr-only">
          Product link or name
        </label>
        <input
          id="product-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste product link or search"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 15,
            fontFamily: "var(--font-body)",
            background: "transparent",
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {RETAILER_CHIPS.map((r) => {
          const on = retailer === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRetailer(on ? null : r)}
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: 999,
                border: `1px solid ${on ? "var(--blue-electric)" : "var(--border-default)"}`,
                background: on ? "var(--blue-50)" : "#fff",
                color: on ? "var(--blue-deep)" : "var(--ink-700)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          fontSize: 13,
          color: "var(--ink-500)",
          fontWeight: 600,
        }}
      >
        <span>
          {results.length || MOCK_PRODUCTS.length} products
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((p) => {
          const added = addedIds.includes(p.articleId);
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--border-default)",
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  background:
                    "repeating-linear-gradient(45deg, var(--blue-50), var(--blue-50) 8px, var(--blue-100) 8px, var(--blue-100) 16px)",
                  flex: "0 0 auto",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "var(--ink-300)",
                    textTransform: "uppercase",
                  }}
                >
                  {p.brand} — {p.articleId}
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: "var(--ink-900)",
                    marginTop: 2,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "var(--blue-deep)",
                    marginTop: 4,
                  }}
                >
                  Assembly {formatUsd(p.assemblyCents)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!added) onAdd(catalogToQuoteItem(p));
                }}
                disabled={added}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 9,
                  border: added
                    ? "1px solid var(--status-success)"
                    : "1px solid var(--blue-electric)",
                  background: added ? "var(--status-success-bg)" : "var(--blue-electric)",
                  color: added ? "var(--status-success)" : "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: added ? "default" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {added ? (
                  <>
                    <Check size={14} /> Added
                  </>
                ) : (
                  "Add to build"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeMode({ onAdd }: { onAdd: (item: QuoteItem) => void }) {
  const [category, setCategory] = useState<HomeCategory>("bed");
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [details, setDetails] = useState("");
  const [listening, setListening] = useState(false);

  const toggleVoice = () => {
    const SR =
      typeof window !== "undefined"
        ? (window as unknown as {
            SpeechRecognition?: new () => SpeechRecognition;
            webkitSpeechRecognition?: new () => SpeechRecognition;
          }).SpeechRecognition ||
          (window as unknown as {
            webkitSpeechRecognition?: new () => SpeechRecognition;
          }).webkitSpeechRecognition
        : undefined;

    if (!SR) {
      setListening(false);
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      setDetails((d) => (d ? `${d} ${text}` : text));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const add = () => {
    const label =
      name.trim() ||
      `${HOME_CATS.find((c) => c.key === category)?.label ?? "Item"} assembly`;
    onAdd({
      id: `home-${Date.now()}`,
      name: label,
      icon: category,
      assemblyCents: HOME_CATEGORY_CENTS[category],
      src: "home",
      quantity: qty,
      taskDetails: details.trim() || undefined,
      category,
    });
    setName("");
    setDetails("");
    setQty(1);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {HOME_CATS.map((c) => {
          const selected = category === c.key;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className="quote-tap"
              style={{
                padding: 12,
                borderRadius: 10,
                border: `1.5px solid ${selected ? "var(--blue-electric)" : "var(--border-default)"}`,
                background: selected ? "var(--blue-50)" : "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Icon size={18} color="var(--blue-electric)" />
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6, color: "var(--blue-deep)" }}>
                {c.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                {formatUsd(HOME_CATEGORY_CENTS[c.key])}
              </div>
            </button>
          );
        })}
      </div>

      <FieldLabel htmlFor="home-name">Item name / description</FieldLabel>
      <input
        id="home-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. MALM dresser, white, still boxed"
        style={inputStyle}
      />

      <FieldLabel>Quantity</FieldLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} style={stepperBtn}>
          <Minus size={16} />
        </button>
        <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>{qty}</span>
        <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} style={stepperBtn}>
          <Plus size={16} />
        </button>
      </div>

      <FieldLabel htmlFor="home-details">Tell us about the task</FieldLabel>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          id="home-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="Stairs? Missing hardware? Anything we should know…"
          style={{ ...inputStyle, resize: "vertical", minHeight: 100, paddingRight: 52 }}
        />
        <button
          type="button"
          title={listening ? "Stop" : "Talk to describe it"}
          aria-label={listening ? "Stop listening" : "Voice input"}
          onClick={toggleVoice}
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: listening ? "var(--status-error)" : "var(--blue-electric)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
          }}
        >
          {listening ? <Square size={14} fill="#fff" /> : <Mic size={16} />}
        </button>
      </div>
      {listening && (
        <p style={{ fontSize: 13, color: "var(--blue-electric)", margin: "-8px 0 16px", fontWeight: 600 }}>
          Listening… tap mic to stop
        </p>
      )}

      <div
        style={{
          border: "1.5px dashed var(--border-default)",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",
          marginBottom: 18,
          color: "var(--ink-500)",
        }}
      >
        <Camera size={22} color="var(--ink-300)" style={{ margin: "0 auto 8px" }} />
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--blue-deep)" }}>
          Drop a photo or tap to upload
        </div>
        <div style={{ fontSize: 12.5, marginTop: 4 }}>(optional — helps us price accurately)</div>
      </div>

      <button
        type="button"
        onClick={add}
        style={{
          height: 48,
          padding: "0 22px",
          borderRadius: 9,
          border: "none",
          background: "var(--blue-electric)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Add to build
      </button>
    </div>
  );
}

function StoreMode({ onAdd }: { onAdd: (item: QuoteItem) => void }) {
  const [store, setStore] = useState("IKEA");
  const [orderNumber, setOrderNumber] = useState("");
  const [nameOnOrder, setNameOnOrder] = useState("");
  const [location, setLocation] = useState("");
  const [readyBy, setReadyBy] = useState("");

  const add = () => {
    if (!orderNumber.trim()) return;
    onAdd({
      id: `store-${Date.now()}`,
      brand: store,
      name: `${store} order ${orderNumber.trim()}`,
      icon: "store",
      assemblyCents: 4900,
      src: "retailer",
      store,
      orderNumber: orderNumber.trim(),
      nameOnOrder: nameOnOrder.trim() || undefined,
      storeLocation: location.trim() || undefined,
      readyByDate: readyBy || undefined,
      quantity: 1,
    });
    setOrderNumber("");
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ fontSize: 14, color: "var(--ink-500)", margin: "0 0 16px", lineHeight: 1.45 }}>
        Don&apos;t load your car — we collect it from the store.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {STORE_CHIPS.map((s) => {
          const on = store === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStore(s)}
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: 999,
                border: `1px solid ${on ? "var(--blue-electric)" : "var(--border-default)"}`,
                background: on ? "var(--blue-50)" : "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                color: on ? "var(--blue-deep)" : "var(--ink-700)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <FieldLabel htmlFor="order-num">Order number</FieldLabel>
      <input
        id="order-num"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
        placeholder="e.g. 1234567890"
        style={inputStyle}
      />
      <FieldLabel htmlFor="name-order">Name on order</FieldLabel>
      <input
        id="name-order"
        value={nameOnOrder}
        onChange={(e) => setNameOnOrder(e.target.value)}
        placeholder="As shown on the receipt"
        style={inputStyle}
      />
      <FieldLabel htmlFor="store-loc">Store location</FieldLabel>
      <input
        id="store-loc"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. IKEA Houston — Katy Freeway"
        style={inputStyle}
      />
      <FieldLabel htmlFor="ready-by">Ready-by date</FieldLabel>
      <input
        id="ready-by"
        type="date"
        value={readyBy}
        onChange={(e) => setReadyBy(e.target.value)}
        style={inputStyle}
      />

      <div
        style={{
          border: "1.5px dashed var(--border-default)",
          borderRadius: 12,
          padding: 18,
          textAlign: "center",
          marginBottom: 18,
          color: "var(--ink-500)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--blue-deep)" }}>
          Drop your receipt or order confirmation
        </div>
        <div style={{ fontSize: 12.5, marginTop: 4 }}>(optional — speeds up store pickup)</div>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={!orderNumber.trim()}
        style={{
          height: 48,
          padding: "0 22px",
          borderRadius: 9,
          border: "none",
          background: "var(--blue-electric)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          cursor: orderNumber.trim() ? "pointer" : "not-allowed",
          opacity: orderNumber.trim() ? 1 : 0.5,
        }}
      >
        Add this order to build
      </button>
    </div>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: "var(--ink-500)",
        marginBottom: 6,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  borderRadius: 10,
  border: "1.5px solid var(--border-default)",
  padding: "10px 14px",
  fontSize: 15,
  fontFamily: "var(--font-body)",
  marginBottom: 14,
  outline: "none",
  boxSizing: "border-box",
};

const stepperBtn: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  border: "1px solid var(--border-default)",
  background: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};

// Minimal SpeechRecognition typings for optional Web Speech API
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
