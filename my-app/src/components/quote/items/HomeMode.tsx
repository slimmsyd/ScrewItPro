"use client";

import { useState } from "react";
import {
  Archive,
  Armchair,
  BedDouble,
  Camera,
  Library,
  Mic,
  Minus,
  Plus,
  Square,
  Table,
} from "lucide-react";
import { formatUsd, HOME_CATEGORY_CENTS } from "@/lib/quote/pricing";
import type { HomeCategory, QuoteItem } from "@/lib/quote/types";
import { FieldLabel, inputStyle, stepperBtn } from "./shared";
import type { SpeechRecognition, SpeechRecognitionEvent } from "./speech";

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

export function HomeMode({ onAdd }: { onAdd: (item: QuoteItem) => void }) {
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

      <FieldLabel htmlFor="home-details">
        Tell us about the task{" "}
        <span
          style={{
            fontWeight: 500,
            textTransform: "none",
            letterSpacing: 0,
            color: "var(--ink-300)",
          }}
        >
          (type or talk)
        </span>
      </FieldLabel>
      {/*
        Composite field (handoff TaskVoice): border on the wrapper so the mic
        sits inside the input. Never put margin on the textarea or absolute
        bottom/right lands outside the visible field.
      */}
      <div
        className="quote-voice-field"
        data-listening={listening ? "true" : "false"}
        style={{
          position: "relative",
          marginBottom: 16,
          borderRadius: 10,
          border: `1.5px solid ${
            listening ? "var(--blue-electric)" : "var(--border-default)"
          }`,
          boxShadow: listening ? "0 0 0 4px rgba(29,110,254,.12)" : "none",
          background: "#fff",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <textarea
          id="home-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="Stairs? Missing hardware? Anything we should know…"
          aria-describedby={listening ? "home-details-listening" : undefined}
          style={{
            display: "block",
            width: "100%",
            minHeight: 112,
            boxSizing: "border-box",
            border: "none",
            outline: "none",
            resize: "vertical",
            margin: 0,
            padding: listening ? "14px 56px 40px 15px" : "14px 56px 14px 15px",
            fontSize: 15,
            fontFamily: "var(--font-body)",
            lineHeight: 1.55,
            color: "var(--ink-900)",
            background: "transparent",
            borderRadius: 10,
          }}
        />
        <button
          type="button"
          title={listening ? "Stop listening" : "Talk to describe it"}
          aria-label={listening ? "Stop listening" : "Voice input"}
          aria-pressed={listening}
          onClick={toggleVoice}
          className="quote-tap"
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            width: 40,
            height: 40,
            minWidth: 40,
            minHeight: 40,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: listening ? "var(--blue-electric)" : "var(--blue-50)",
            color: listening ? "#fff" : "var(--blue-electric)",
            display: "grid",
            placeItems: "center",
            boxShadow: listening ? "0 0 0 6px rgba(29,110,254,.16)" : "none",
            zIndex: 2,
            transition: "background 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          {listening ? (
            <Square size={14} fill="currentColor" color="currentColor" />
          ) : (
            <Mic size={18} color="var(--blue-electric)" />
          )}
        </button>
        {listening && (
          <div
            id="home-details-listening"
            role="status"
            aria-live="polite"
            style={{
              position: "absolute",
              left: 15,
              bottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--blue-electric)",
              pointerEvents: "none",
              zIndex: 1,
              maxWidth: "calc(100% - 68px)",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                gap: 3,
                alignItems: "flex-end",
                height: 16,
              }}
            >
              {[10, 16, 7, 13].map((h, i) => (
                <span
                  key={i}
                  className="quote-eq-bar"
                  style={{
                    width: 3,
                    height: h,
                    borderRadius: 2,
                    background: "var(--blue-electric)",
                    animation: `quoteEq 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                  }}
                />
              ))}
            </span>
            Listening… tap mic to stop
          </div>
        )}
      </div>

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
        <div style={{ fontSize: 12.5, marginTop: 4 }}>(optional, helps us price accurately)</div>
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

