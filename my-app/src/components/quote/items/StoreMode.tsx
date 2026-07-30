"use client";

import { useState } from "react";
import { COLLECTION_STORES } from "@/lib/quote/retailers";
import type { QuoteItem } from "@/lib/quote/types";
import { FieldLabel, inputStyle } from "./shared";

export function StoreMode({ onAdd }: { onAdd: (item: QuoteItem) => void }) {
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
        Don&apos;t load your car. We collect it from the store.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {COLLECTION_STORES.map((s) => {
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
        placeholder="e.g. IKEA Houston, Katy Freeway"
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
        <div style={{ fontSize: 12.5, marginTop: 4 }}>(optional, speeds up store pickup)</div>
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

