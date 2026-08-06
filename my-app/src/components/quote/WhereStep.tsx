"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Home,
  MapPin,
  Package,
  Truck,
  Warehouse,
} from "lucide-react";
import QuoteShell from "@/components/quote/QuoteShell";
import QuoteAside from "@/components/quote/QuoteAside";
import ScreenTransition from "@/components/quote/ScreenTransition";
import AddressField from "@/components/quote/AddressField";
import { useQuote } from "@/lib/quote/context";
import {
  hubPlaceFromServiceArea,
  SCREWIT_HUB_PLACE,
  SCREWIT_HUB_PLACE_ID,
} from "@/lib/quote/types";
import { QUOTE_ITEMS_PATH } from "@/lib/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import { fetchServiceAreaConfig } from "@/lib/config/service-area-client";
import type { ServiceAreaConfig } from "@/lib/config/service-area";

/**
 * Where step: dual-stop route card (pickup + deliver) + ship/pickup mode.
 * Both stops are always visible; ship mode locks pickup to the ScrewIt Hub.
 * Hub address comes from Admin Settings (public service-area config).
 */
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
  const showTravelCallout =
    totals.beyondRadius && totals.travelCents > 0;
  const [hubConfig, setHubConfig] = useState<ServiceAreaConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchServiceAreaConfig().then((c) => {
      if (!cancelled) setHubConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shipMode = draft.pickupMode === "ship";
  const hubPlace = hubConfig
    ? hubPlaceFromServiceArea(hubConfig)
    : SCREWIT_HUB_PLACE;

  const goNext = () => {
    if (!canProceedFromWhere) return;
    if (shipMode) {
      setPickupAddress(hubPlace);
    }
    router.push(QUOTE_ITEMS_PATH);
  };

  const aside = (
    <QuoteAside
      totals={totals}
      showPrice={false}
      pickupMode={draft.pickupMode}
      hint="We'll show pickup & delivery pricing here as you choose. Your full quote lands on the next step."
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
          className="quote-tap"
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
            gap: 7,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--ink-500)",
            textDecoration: "none",
            marginBottom: 16,
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
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          Two stops. We handle everything in between. No warehouse logistics
          for you to manage.
        </p>

        {showTravelCallout && (
          <div
            role="status"
            style={{
              maxWidth: 640,
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "var(--blue-50)",
              border: "1px solid rgba(29,110,254,0.2)",
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--blue-deep)",
              lineHeight: 1.45,
            }}
          >
            Outside our usual service area
            {totals.travelMiles > 0
              ? ` (~${Math.round(totals.travelMiles)} mi from hub)`
              : ""}
            . Travel fee{" "}
            <strong>
              +${(totals.travelCents / 100).toFixed(0)}
            </strong>{" "}
            will show on your honest breakdown — no hidden fees.
          </div>
        )}

        {/* Route card: always shows PICK UP + DELIVER (handoff) */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            padding: mobile ? 16 : 24,
            maxWidth: 640,
            marginBottom: 26,
            position: "relative",
          }}
        >
          {/* Dashed connector between stop markers */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: mobile ? 27 : 36,
              top: mobile ? 72 : 88,
              bottom: mobile ? 72 : 88,
              borderLeft: "2px dashed var(--gray-100)",
              pointerEvents: "none",
            }}
          />

          {/* PICK UP FROM */}
          <div
            style={{
              display: "flex",
              gap: mobile ? 12 : 16,
              marginBottom: 20,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                flex: "0 0 26px",
                paddingTop: 28,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 999,
                  background: "#fff",
                  border: "3px solid var(--blue-electric)",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {shipMode ? (
                <LockedHubField
                  address={hubPlace.formattedAddress}
                  loading={!hubConfig}
                />
              ) : (
                <AddressField
                  label="PICK UP FROM"
                  icon={Package}
                  value={
                    draft.pickupAddress?.placeId === SCREWIT_HUB_PLACE_ID
                      ? null
                      : draft.pickupAddress
                  }
                  placeholder="Home, store, or address"
                  onChange={setPickupAddress}
                />
              )}
            </div>
          </div>

          {/* DELIVER TO */}
          <div
            style={{
              display: "flex",
              gap: mobile ? 12 : 16,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                flex: "0 0 26px",
                paddingTop: 28,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <MapPin size={22} color="var(--blue-deep)" aria-hidden />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <AddressField
                label="DELIVER TO"
                icon={Home}
                value={draft.deliveryAddress}
                placeholder="Where should we place it?"
                onChange={setDeliveryAddress}
              />
              {draft.deliveryAddress && (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    color: "var(--ink-500)",
                    lineHeight: 1.4,
                  }}
                >
                  Assembled, placed in the room, packaging hauled away
                </p>
              )}
            </div>
          </div>
        </div>

        {/* HOW DO WE GET IT? */}
        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
              marginBottom: 12,
            }}
          >
            How do we get it?
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
              gap: 14,
            }}
          >
            {(
              [
                {
                  mode: "ship" as const,
                  title: "I'll ship it to your hub",
                  sub: "Free. We send the address",
                  icon: Warehouse,
                },
                {
                  mode: "pickup" as const,
                  title: "Pick it up from me",
                  sub: "+ $25 · Houston Metro",
                  icon: Truck,
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
                    padding: "16px",
                    borderRadius: 10,
                    border: `1.5px solid ${
                      selected ? "var(--blue-electric)" : "var(--border-default)"
                    }`,
                    background: selected ? "var(--blue-50)" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    fontFamily: "var(--font-body)",
                    transition:
                      "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
                    boxShadow: selected
                      ? "0 0 0 3px rgba(29,110,254,.1)"
                      : "none",
                  }}
                >
                  <Icon
                    size={20}
                    color={selected ? "var(--blue-electric)" : "var(--ink-500)"}
                    style={{ flex: "0 0 auto", marginTop: 1 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: selected ? "var(--blue-deep)" : "var(--ink-700)",
                        lineHeight: 1.3,
                      }}
                    >
                      {opt.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink-500)",
                        marginTop: 2,
                        lineHeight: 1.35,
                      }}
                    >
                      {opt.sub}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      border: `2px solid ${
                        selected ? "var(--blue-electric)" : "var(--border-default)"
                      }`,
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 20px",
                      marginTop: 1,
                    }}
                  >
                    {selected && (
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: "var(--blue-electric)",
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ScreenTransition>
    </QuoteShell>
  );
}

/** Locked pickup field when customer ships boxes to the hub (handoff Field). */
function LockedHubField({
  address,
  loading,
}: {
  address: string;
  loading?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-body)",
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
          borderRadius: 8,
          border: "1.5px solid var(--blue-electric)",
          boxShadow: "0 0 0 4px rgba(29,110,254,.12)",
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "10px 15px",
          background: "var(--blue-50)",
        }}
      >
        <Package size={18} color="var(--blue-electric)" style={{ flex: "0 0 auto" }} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 15,
              color: "var(--ink-900)",
              lineHeight: 1.25,
            }}
          >
            Ship to ScrewIt Hub
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              color: "var(--ink-700)",
              marginTop: 2,
              lineHeight: 1.35,
              wordBreak: "break-word",
            }}
          >
            {loading ? "Loading hub address…" : address}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11.5,
              color: "var(--ink-500)",
              marginTop: 3,
              lineHeight: 1.35,
            }}
          >
            Label every box with your order number after booking
          </div>
        </div>
      </div>
    </div>
  );
}
