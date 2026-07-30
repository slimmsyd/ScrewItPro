"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  catalogToQuoteItem,
  RETAILER_CHIPS,
  searchCatalog,
} from "@/lib/quote/mock-catalog";
import { formatUsd } from "@/lib/quote/pricing";
import type { QuoteItem } from "@/lib/quote/types";

/** A pasted product link vs. a plain search term — gates real lookup vs. the mock catalog. */
function looksLikeUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function BuyMode({
  onToggle,
  addedIds,
  onAdd,
}: {
  /** Toggle product in/out of build (whole card or CTA). */
  onToggle: (p: Parameters<typeof catalogToQuoteItem>[0]) => void;
  addedIds: string[];
  /** Add a real, looked-up product straight into the build. */
  onAdd: (item: QuoteItem) => void;
}) {
  const [query, setQuery] = useState("https://www.ikea.com/");
  const [retailer, setRetailer] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupItem, setLookupItem] = useState<QuoteItem | null>(null);

  const isUrlInput = looksLikeUrl(query);
  const results = useMemo(
    () => searchCatalog(query, retailer),
    [query, retailer]
  );

  const runLookup = async () => {
    setLookupBusy(true);
    setLookupError(null);
    setLookupItem(null);
    try {
      const res = await fetch("/api/quote/lookup-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: query.trim() }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        item?: QuoteItem;
        error?: string;
        message?: string;
      };
      if (!res.ok || !json.ok || !json.item) {
        const known: Record<string, string> = {
          invalid_input: "That doesn't look like a valid link.",
          invalid_url: "That doesn't look like a valid link.",
          blocked_host: "That link isn't allowed. Paste a public product page URL.",
          fetch_failed: "We couldn't load that page. Double-check the link and try again.",
          parse_failed:
            "We couldn't find product details on that page. Try a specific product page link, or search our catalog instead.",
          lookup_failed: "Something went wrong. Try again.",
        };
        setLookupError(
          (json.error && known[json.error]) ?? json.message ?? "Could not look up that product."
        );
        return;
      }
      setLookupItem(json.item);
    } catch {
      setLookupError("Network error. Please try again.");
    } finally {
      setLookupBusy(false);
    }
  };

  const addLookupItem = () => {
    if (!lookupItem) return;
    onAdd(lookupItem);
    setLookupItem(null);
    setQuery("");
  };

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
          onChange={(e) => {
            setQuery(e.target.value);
            setLookupError(null);
            setLookupItem(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isUrlInput && !lookupBusy) {
              e.preventDefault();
              void runLookup();
            }
          }}
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
        {isUrlInput && (
          <button
            type="button"
            onClick={() => void runLookup()}
            disabled={lookupBusy}
            className="quote-tap"
            style={{
              flex: "0 0 auto",
              height: 36,
              padding: "0 16px",
              borderRadius: 999,
              border: "none",
              background: "var(--blue-electric)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13.5,
              fontFamily: "var(--font-body)",
              cursor: lookupBusy ? "wait" : "pointer",
              opacity: lookupBusy ? 0.7 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {lookupBusy ? "Looking up…" : "Look up"}
          </button>
        )}
      </div>

      {!isUrlInput && (
        <>
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
          fontSize: 13.5,
          color: "var(--ink-700)",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
        }}
      >
        <span>
          {results.length} product{results.length === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          aria-label="Filter products"
          onClick={() => {
            document.getElementById("product-search")?.focus();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 34,
            padding: "0 16px",
            borderRadius: 999,
            border: "1px solid var(--border-default)",
            background: "#fff",
            color: "var(--ink-700)",
            fontWeight: 600,
            fontSize: 13.5,
            fontFamily: "var(--font-body)",
            cursor: "pointer",
          }}
        >
          <SlidersHorizontal size={16} color="var(--ink-500)" />
          Filter
        </button>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
        role="list"
        aria-label="Product results"
      >
        {results.map((p) => {
          const selected = addedIds.includes(p.articleId);
          const toggle = () => onToggle(p);
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={
                selected
                  ? `${p.name}, added to build. Activate to remove.`
                  : `${p.name}. Activate to add to build.`
              }
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              className={`quote-tap quote-product-card${selected ? " is-selected" : ""}`}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: 16,
                borderRadius: 11,
                /* Green = confirmation (added to build) */
                border: `1.5px solid ${
                  selected ? "var(--status-success)" : "var(--border-default)"
                }`,
                boxShadow: selected
                  ? "0 0 0 3px rgba(14,138,95,.14)"
                  : "0 0 0 0 transparent",
                background: selected ? "var(--status-success-bg)" : "#fff",
                cursor: "pointer",
                transition:
                  "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
                outline: "none",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  background:
                    "repeating-linear-gradient(45deg, var(--blue-50), var(--blue-50) 8px, var(--blue-100) 8px, var(--blue-100) 16px)",
                  flex: "0 0 auto",
                  border: "1px solid var(--border-default)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--blue-deep)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.brand} - {p.articleId}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    color: "var(--ink-500)",
                    margin: "3px 0 8px",
                    lineHeight: 1.4,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "var(--ink-900)",
                  }}
                >
                  <span style={{ color: "var(--ink-500)", fontWeight: 600 }}>
                    Assembly
                  </span>{" "}
                  {formatUsd(p.assemblyCents)}
                </div>
              </div>
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className="quote-tap"
                style={{
                  flex: "0 0 auto",
                  height: 44,
                  padding: "0 20px",
                  borderRadius: 999,
                  border: selected
                    ? "1.5px solid var(--status-success)"
                    : "1.5px solid var(--blue-electric)",
                  background: selected
                    ? "var(--status-success-bg)"
                    : "var(--blue-electric)",
                  color: selected ? "var(--status-success)" : "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  transition:
                    "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
                }}
              >
                {selected ? (
                  <>
                    <Check
                      size={17}
                      color="var(--status-success)"
                      strokeWidth={2.5}
                    />{" "}
                    Added
                  </>
                ) : (
                  <>
                    <Plus size={17} color="#fff" /> Add to build
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
        </>
      )}

      {isUrlInput && lookupBusy && (
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-500)",
            fontFamily: "var(--font-body)",
          }}
        >
          Looking up product…
        </p>
      )}

      {isUrlInput && lookupError && !lookupBusy && (
        <div
          role="alert"
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1.5px solid var(--status-error)",
            background: "var(--status-error-bg)",
            color: "var(--status-error-text)",
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            lineHeight: 1.45,
          }}
        >
          {lookupError}
        </div>
      )}

      {isUrlInput && lookupItem && !lookupBusy && !lookupError && (
        <LookupResultCard item={lookupItem} onAdd={addLookupItem} />
      )}
    </div>
  );
}

/** Single real-product card from a paste-a-link lookup — same visual language as the mock product cards above. */
function LookupResultCard({
  item,
  onAdd,
}: {
  item: QuoteItem;
  onAdd: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(item.photoDataUrl) && !imgFailed;

  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        alignItems: "flex-start",
        padding: 16,
        borderRadius: 14,
        border: "1.5px solid var(--border-default)",
        background: "#fff",
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- external retailer CDN image, not a local/optimizable asset
        <img
          src={item.photoDataUrl}
          alt={item.name}
          onError={() => setImgFailed(true)}
          style={{
            width: 128,
            height: 128,
            borderRadius: 12,
            objectFit: "contain",
            background: "var(--gray-50)",
            flex: "0 0 auto",
            border: "1px solid var(--border-default)",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: 128,
            height: 128,
            borderRadius: 12,
            background:
              "repeating-linear-gradient(45deg, var(--blue-50), var(--blue-50) 8px, var(--blue-100) 8px, var(--blue-100) 16px)",
            flex: "0 0 auto",
            border: "1px solid var(--border-default)",
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--blue-deep)",
            letterSpacing: "-0.01em",
          }}
        >
          {item.brand}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            color: "var(--ink-500)",
            margin: "3px 0 8px",
            lineHeight: 1.4,
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--ink-900)",
          }}
        >
          <span style={{ color: "var(--ink-500)", fontWeight: 600 }}>Assembly</span>{" "}
          {formatUsd(item.assemblyCents)}
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="quote-tap"
        style={{
          flex: "0 0 auto",
          alignSelf: "center",
          height: 44,
          padding: "0 20px",
          borderRadius: 999,
          border: "1.5px solid var(--blue-electric)",
          background: "var(--blue-electric)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <Plus size={17} color="#fff" /> Add to build
      </button>
    </div>
  );
}

