"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  ShoppingBag,
  Store,
} from "lucide-react";
import QuoteShell from "@/components/quote/QuoteShell";
import BuildCart from "@/components/quote/BuildCart";
import ScreenTransition from "@/components/quote/ScreenTransition";
import { BuyMode } from "@/components/quote/items/BuyMode";
import { HomeMode } from "@/components/quote/items/HomeMode";
import { StoreMode } from "@/components/quote/items/StoreMode";
import { useQuote } from "@/lib/quote/context";
import { catalogToQuoteItem } from "@/lib/quote/mock-catalog";
import type { EntryMode } from "@/lib/quote/types";
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
    sub: "We collect. Don't load your car",
    icon: Store,
  },
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

  /** Toggle a catalog product into / out of the build cart (handoff). */
  const toggleCatalogProduct = (p: Parameters<typeof catalogToQuoteItem>[0]) => {
    const existing = draft.items.find((i) => i.articleId === p.articleId);
    if (existing) removeItem(existing.id);
    else addItem(catalogToQuoteItem(p));
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
          First, how do you have it? Workshop assembly only (never in-home).
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
          <BuyMode
            addedIds={
              draft.items
                .map((i) => i.articleId)
                .filter(Boolean) as string[]
            }
            onToggle={toggleCatalogProduct}
            onAdd={addItem}
          />
        )}
        {draft.entryMode === "home" && <HomeMode onAdd={addItem} />}
        {draft.entryMode === "store" && <StoreMode onAdd={addItem} />}
      </ScreenTransition>
    </QuoteShell>
  );
}
