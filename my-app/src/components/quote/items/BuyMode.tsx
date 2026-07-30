"use client";

import { useState } from "react";
import { Link2, Plus, Search } from "lucide-react";
import { SUPPORTED_RETAILERS } from "@/lib/quote/retailers";
import { formatUsd } from "@/lib/quote/pricing";
import type { QuoteItem } from "@/lib/quote/types";

/** A pasted product link vs. a plain search term — gates real lookup. */
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

/**
 * Buy-new entry mode: paste-a-link only (no mock catalog).
 * Real product identity comes from POST /api/quote/lookup-product.
 */
export function BuyMode({ onAdd }: { onAdd: (item: QuoteItem) => void }) {
  const [query, setQuery] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupItem, setLookupItem] = useState<QuoteItem | null>(null);

  const isUrlInput = looksLikeUrl(query);
  const showNonUrlHint = query.trim().length > 0 && !isUrlInput;

  const runLookup = async () => {
    if (!looksLikeUrl(query)) return;
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
          blocked_host:
            "That link isn't allowed. Paste a public product page URL.",
          fetch_failed:
            "We couldn't load that page. Double-check the link and try again.",
          parse_failed:
            "We couldn't find product details on that page. Try a specific product page link, or switch to “I own it, boxed at home.”",
          lookup_failed: "Something went wrong. Try again.",
        };
        setLookupError(
          (json.error && known[json.error]) ??
            json.message ??
            "Could not look up that product."
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
          Product link
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
          placeholder="Paste a product link"
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

      {/* Advisory logo strip — not a catalog, not a gate */}
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-500)",
            fontFamily: "var(--font-body)",
          }}
        >
          Works with popular retailers… or any public product page
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {SUPPORTED_RETAILERS.map((r) => (
            <div
              key={r.name}
              title={r.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: r.tile,
                border: "1px solid var(--border-default)",
                display: "grid",
                placeItems: "center",
                padding: 6,
                boxSizing: "border-box",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.logo}
                alt={r.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {!query.trim() && (
        <div
          style={{
            padding: 20,
            borderRadius: 14,
            border: "1.5px dashed var(--border-default)",
            background: "var(--gray-50)",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--blue-50)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
            }}
          >
            <Link2 size={18} color="var(--blue-electric)" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14.5,
                color: "var(--blue-deep)",
                marginBottom: 4,
              }}
            >
              Paste a product page URL
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: "var(--ink-500)",
                lineHeight: 1.45,
              }}
            >
              Copy the link from IKEA, Wayfair, Amazon, Target, or any public
              product page. We&apos;ll pull the name, photo, and assembly estimate.
              Already own it boxed? Choose{" "}
              <strong style={{ color: "var(--ink-700)" }}>
                I own it, boxed at home
              </strong>{" "}
              above.
            </p>
          </div>
        </div>
      )}

      {showNonUrlHint && (
        <div
          role="status"
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1.5px solid var(--border-default)",
            background: "var(--blue-50)",
            color: "var(--ink-700)",
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            lineHeight: 1.45,
          }}
        >
          Paste a full product link starting with{" "}
          <code style={{ fontSize: 12.5 }}>https://</code>. Searching a
          catalog isn&apos;t available — if you already have the piece, switch to{" "}
          <strong>I own it, boxed at home</strong>.
        </div>
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

/** Single real-product card from a paste-a-link lookup. */
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
        // eslint-disable-next-line @next/next/no-img-element -- external retailer CDN image
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
          <span style={{ color: "var(--ink-500)", fontWeight: 600 }}>
            Assembly
          </span>{" "}
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
