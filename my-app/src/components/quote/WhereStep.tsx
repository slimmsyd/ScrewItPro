"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Package, Truck, Warehouse } from "lucide-react";
import QuoteShell from "@/components/quote/QuoteShell";
import QuoteAside from "@/components/quote/QuoteAside";
import ScreenTransition from "@/components/quote/ScreenTransition";
import AddressField from "@/components/quote/AddressField";
import { useQuote } from "@/lib/quote/context";
import { SCREWIT_HUB_PLACE } from "@/lib/quote/types";
import { QUOTE_ITEMS_PATH } from "@/lib/site";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function WhereStep() {
  const router = useRouter();
  const mobile = useIsMobile();
  const {
    draft,
    totals,
    setPickupMode,
    setPickupAddress,
    setDeliveryAddress,
    canProceedFromWhere,
  } = useQuote();

  const goNext = () => {
    if (!canProceedFromWhere) return;
    if (draft.pickupMode === "ship") {
      setPickupAddress(SCREWIT_HUB_PLACE);
    }
    router.push(QUOTE_ITEMS_PATH);
  };

  const aside = (
    <QuoteAside
      totals={totals}
      showPrice={false}
      pickupMode={draft.pickupMode}
      hint="We'll show pickup & delivery pricing here as you choose. Your full quote lands after we know what to build."
      cta="Next - what to build"
      ctaDisabled={!canProceedFromWhere}
      onCta={goNext}
    />
  );

  return (
    <QuoteShell
      step={0}
      aside={aside}
      mobileBar={
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceedFromWhere}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 9,
            border: "none",
            background: "var(--blue-deep)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            fontFamily: "var(--font-body)",
            cursor: canProceedFromWhere ? "pointer" : "not-allowed",
            opacity: canProceedFromWhere ? 1 : 0.5,
          }}
        >
          Next - what to build →
        </button>
      }
    >
      <ScreenTransition>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            color: "var(--ink-500)",
            textDecoration: "none",
            marginBottom: 18,
            fontFamily: "var(--font-body)",
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
          Where are we going?
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--ink-500)",
            maxWidth: 52 * 8,
          }}
        >
          Tell us the pickup and delivery stops. Everything routes through our
          workshop — never on your living room floor.
        </p>

        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            padding: mobile ? 16 : 24,
            maxWidth: 640,
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <div
              aria-hidden
              style={{
                width: 2,
                marginTop: 40,
                marginBottom: 40,
                backgroundImage:
                  "linear-gradient(to bottom, var(--blue-electric) 40%, transparent 40%)",
                backgroundSize: "2px 10px",
                flex: "0 0 2px",
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
              {draft.pickupMode === "ship" ? (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink-500)",
                      marginBottom: 7,
                      letterSpacing: "0.02em",
                    }}
                  >
                    PICK UP FROM
                  </div>
                  <div
                    style={{
                      minHeight: 52,
                      borderRadius: 12,
                      border: "1.5px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "0 15px",
                      background: "var(--gray-50)",
                    }}
                  >
                    <Package size={18} color="var(--blue-electric)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink-900)" }}>
                        Ship to ScrewIt Hub
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
                        We&apos;ll give you the hub address after booking
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AddressField
                  label="PICK UP FROM"
                  icon={Package}
                  value={draft.pickupAddress}
                  placeholder="Home, store, or address"
                  onChange={setPickupAddress}
                />
              )}
              <AddressField
                label="DELIVER TO"
                icon={Home}
                value={draft.deliveryAddress}
                placeholder="Where should we place it?"
                onChange={setDeliveryAddress}
              />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-300)",
              marginBottom: 12,
            }}
          >
            How do we get it?
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
              gap: 12,
            }}
          >
            {(
              [
                {
                  mode: "ship" as const,
                  title: "I'll ship it to your hub",
                  sub: "Free inbound · tracking later",
                  icon: Warehouse,
                  price: "Free",
                },
                {
                  mode: "pickup" as const,
                  title: "Pick it up from me",
                  sub: "Home or store pickup",
                  icon: Truck,
                  price: "+$25",
                },
              ] as const
            ).map((opt) => {
              const selected = draft.pickupMode === opt.mode;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setPickupMode(opt.mode)}
                  className="quote-tap"
                  style={{
                    textAlign: "left",
                    padding: 16,
                    borderRadius: 12,
                    border: `1.5px solid ${selected ? "var(--blue-electric)" : "var(--border-default)"}`,
                    background: selected ? "var(--blue-50)" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      border: `2px solid ${selected ? "var(--blue-electric)" : "var(--ink-300)"}`,
                      marginTop: 2,
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    {selected && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: "var(--blue-electric)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Icon size={18} color="var(--blue-electric)" />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14.5,
                          color: "var(--blue-deep)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {opt.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-500)" }}>{opt.sub}</div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        color: selected ? "var(--blue-electric)" : "var(--ink-500)",
                      }}
                    >
                      {opt.price}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScreenTransition>
    </QuoteShell>
  );
}
