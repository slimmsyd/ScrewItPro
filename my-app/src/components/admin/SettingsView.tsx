"use client";

/**
 * Settings v2 - design handoff: section rail + dense form pane.
 * Source: design_handoff_admin_settings/admin-settings-v2.jsx
 * Live data: GET/PUT /api/admin/settings (deposit, hub, ops_rules).
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Activity,
  Calendar,
  CalendarX,
  Check,
  ChevronRight,
  DollarSign,
  HelpCircle,
  Mail,
  MapPin,
  Minus,
  Plus,
  Shield,
  Timer,
  X,
} from "lucide-react";
import {
  LEG_KEYS,
  LEG_LABELS,
  money,
  WEEKDAYS,
  WINDOWS,
  type AdminSettings,
  type LegKey,
  type OpsRules,
} from "@/lib/admin/settings";
import ShopAddressField from "@/components/admin/ShopAddressField";
import TeamAccessPanel from "@/components/admin/TeamAccessPanel";
import {
  Band,
  G,
  Head,
  HelpTip,
  LabelWithHelp,
  Note,
  Row,
  Stepper,
  btnAccent,
  btnGhost,
  eyebrow,
  iconBtn,
  linkAdd,
} from "@/components/admin/settingsPrimitives";
import { clearServiceAreaClientCache } from "@/lib/config/service-area-client";

type SectionKey = "hours" | "work" | "price" | "area" | "emails" | "access";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" };

function formatHours(m: number): string {
  if (m % 60 === 0) return `${m / 60}h`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function moneyShort(n: number): string {
  return money(n).replace(/\.00$/, "");
}

export default function SettingsView() {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [draft, setDraft] = useState<AdminSettings | null>(null);
  const [baseline, setBaseline] = useState<AdminSettings | null>(null);
  const [sec, setSec] = useState<SectionKey>("hours");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const apply = useCallback((s: AdminSettings) => {
    setDraft(structuredClone(s));
    setBaseline(structuredClone(s));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const json = (await res.json()) as {
          ok?: boolean;
          settings?: AdminSettings;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !json.ok || !json.settings) {
          setLoad({
            status: "error",
            message: json.error ?? "Could not load settings",
          });
          return;
        }
        apply(json.settings);
        setLoad({ status: "ready" });
      } catch {
        if (!cancelled) {
          setLoad({
            status: "error",
            message: "Network error loading settings",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const dirty = useMemo(() => {
    if (!draft || !baseline) return false;
    return JSON.stringify(draft) !== JSON.stringify(baseline);
  }, [draft, baseline]);

  function patchOps(p: Partial<OpsRules>) {
    setDraft((d) => (d ? { ...d, ops: { ...d.ops, ...p } } : d));
  }

  function setDuration(k: LegKey, v: number) {
    setDraft((d) =>
      d
        ? {
            ...d,
            ops: {
              ...d.ops,
              durations: { ...d.ops.durations, [k]: v },
            },
          }
        : d
    );
  }

  function revert() {
    if (!baseline) return;
    setDraft(structuredClone(baseline));
    setSaveError(null);
  }

  async function save() {
    if (!draft || !dirty || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        settings?: AdminSettings;
        error?: string;
        message?: string;
      };
      if (!res.ok || !json.ok || !json.settings) {
        setSaveError(json.message ?? json.error ?? "Save failed");
        return;
      }
      apply(json.settings);
      clearServiceAreaClientCache();
      setToast("Settings saved");
      window.setTimeout(() => setToast(null), 2800);
    } catch {
      setSaveError("Network error saving settings");
    } finally {
      setSaving(false);
    }
  }

  if (load.status === "loading" || !draft) {
    return (
      <p style={{ margin: 24, fontSize: 13, color: "var(--ink-500)" }}>
        Loading settings…
      </p>
    );
  }

  if (load.status === "error") {
    return (
      <div
        role="alert"
        style={{
          margin: 24,
          background: "var(--status-error-bg)",
          borderRadius: 12,
          padding: "14px 16px",
          color: "var(--status-error)",
          fontSize: 13,
        }}
      >
        {load.message}
      </div>
    );
  }

  const { ops, hub, deposit_percent: depositPct } = draft;
  const openDays = 7 - ops.closedDays.length;
  const totalMins = LEG_KEYS.reduce((a, k) => a + ops.durations[k], 0);

  const sections: {
    k: SectionKey;
    icon: ReactNode;
    label: string;
    val: string;
  }[] = [
    {
      k: "hours",
      icon: <Calendar size={15} />,
      label: "Hours and capacity",
      val: `${openDays} days open · ${ops.capPerWindow} per window`,
    },
    {
      k: "work",
      icon: <Timer size={15} />,
      label: "Work durations",
      val: `${formatHours(totalMins)} per order, estimated`,
    },
    {
      k: "price",
      icon: <DollarSign size={15} />,
      label: "Pricing",
      val: `${moneyShort(ops.baseRate)} base · ${depositPct}% deposit`,
    },
    {
      k: "area",
      icon: <MapPin size={15} />,
      label: "Service area",
      val: `${hub.radius_miles} mi free · $${ops.farFee} past that`,
    },
    {
      k: "emails",
      icon: <Mail size={15} />,
      label: "Customer emails",
      val: "6 of 7 active",
    },
    {
      k: "access",
      icon: <Shield size={15} />,
      label: "Roles and access",
      val: "Team · invites",
    },
  ];

  const pane: Record<SectionKey, ReactNode> = {
    hours: (
      <>
        <Head
          title="Hours and capacity"
          sub="closed days grey out in every picker"
          help="Controls which days and how many jobs per time slot you accept. Closed days grey out in booking pickers."
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 0 4px",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--ink-900)",
            }}
          >
            Open days
          </span>
          <HelpTip text="Tap a day to open or close it for bookings. Closed days are greyed out in every schedule picker. Jobs already booked on a day you close later are not moved automatically." />
        </div>
        <div
          style={{ display: "flex", gap: 5, padding: "4px 0 3px" }}
          role="group"
          aria-label="Open days"
        >
          {WEEKDAYS.map((em) => {
            const closed = ops.closedDays.includes(em);
            return (
              <button
                key={em}
                type="button"
                className="sip-admin-focus"
                aria-pressed={!closed}
                onClick={() =>
                  patchOps({
                    closedDays: closed
                      ? ops.closedDays.filter((x) => x !== em)
                      : [...ops.closedDays, em],
                  })
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                  padding: "9px 0 8px",
                  borderRadius: 10,
                  border: `1px solid ${closed ? "var(--gray-100)" : "var(--blue-100)"}`,
                  cursor: "pointer",
                  background: closed ? "var(--gray-100)" : "var(--blue-50)",
                  color: closed ? "var(--ink-500)" : "var(--blue-deep)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-body)",
                }}
              >
                {em}
                <span
                  style={{
                    display: "block",
                    fontSize: 9,
                    fontWeight: 600,
                    marginTop: 3,
                    color: closed ? "var(--ink-500)" : "var(--blue-700)",
                  }}
                >
                  {closed ? "Closed" : "Open"}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ height: 14 }} />
        <G>
          <Row
            label="Jobs allowed in one window"
            help="Maximum jobs we plan to accept in one time window (for example 8–11a). Going over may warn operators instead of hard-blocking until capacity is fully enforced."
          >
            <Stepper
              value={ops.capPerWindow}
              min={1}
              max={12}
              unit="jobs"
              w={74}
              onChange={(v) => patchOps({ capPerWindow: v })}
            />
          </Row>
          <Row
            label="Booking windows"
            help="Fixed time slots customers can choose. Changing these later can affect every already-scheduled job, so they stay locked for now."
            tall
          >
            <span
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                maxWidth: 180,
              }}
            >
              {WINDOWS.map((w) => (
                <span
                  key={w}
                  style={{
                    background: "var(--gray-50)",
                    borderRadius: 99,
                    padding: "5px 11px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--ink-700)",
                  }}
                >
                  {w}
                </span>
              ))}
            </span>
          </Row>
        </G>
        <Note icon={<CalendarX size={13} />}>
          Closing a day greys it out everywhere, but jobs already on a now-closed
          day are not moved. Schedule will flag them instead.
        </Note>
      </>
    ),
    work: (
      <>
        <Head
          title="Work durations"
          sub="the block each leg is scheduled for"
          help="Minutes we reserve on the schedule for each leg of a hub job (pickup → intake → build → QC → deliver). Estimates only until the labour clock measures real time."
        />
        <G>
          {LEG_KEYS.map((k) => (
            <Row
              key={k}
              label={LEG_LABELS[k]}
              help={
                k === "pickup"
                  ? "Time reserved to collect items from the customer or retailer."
                  : k === "intake"
                    ? "Time to receive, check-in, and stage items at the hub."
                    : k === "build"
                      ? "Assembly time — usually the longest and most variable leg."
                      : k === "qc"
                        ? "Quality check after build before delivery."
                        : "White-glove delivery and in-home placement time."
              }
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--ink-500)",
                  width: 42,
                  textAlign: "right",
                }}
              >
                {totalMins
                  ? Math.round((ops.durations[k] / totalMins) * 100)
                  : 0}
                %
              </span>
              <Stepper
                value={ops.durations[k]}
                step={15}
                min={15}
                max={480}
                unit="min"
                w={70}
                onChange={(v) => setDuration(k, v)}
              />
            </Row>
          ))}
        </G>
        <Band>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--ink-500)", flex: 1 }}>
                Booked time for a full order
              </span>
              <b style={{ fontSize: 14, color: "var(--ink-900)" }}>
                {formatHours(totalMins)}
              </b>
            </div>
            <div
              style={{
                display: "flex",
                height: 8,
                borderRadius: 99,
                overflow: "hidden",
                marginTop: 9,
                gap: 2,
              }}
            >
              {LEG_KEYS.map((k, i) => (
                <span
                  key={k}
                  title={LEG_LABELS[k]}
                  style={{
                    flex: ops.durations[k],
                    background:
                      i === 2
                        ? "var(--blue-electric)"
                        : "var(--blue-100)",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 9,
              }}
            >
              {LEG_KEYS.map((k, i) => (
                <span
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10.5,
                    color: "var(--ink-500)",
                  }}
                >
                  <em
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 99,
                      display: "inline-block",
                      background:
                        i === 2
                          ? "var(--blue-electric)"
                          : "var(--blue-100)",
                    }}
                  />
                  {LEG_LABELS[k]}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "var(--blue-50)",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              gap: 9,
              fontSize: 11.5,
              color: "var(--blue-700)",
              lineHeight: 1.5,
            }}
          >
            <Activity
              size={13}
              color="var(--blue-electric)"
              style={{ marginTop: 1, flex: "0 0 13px" }}
            />
            <span>
              These are estimates, not measurements. The labour clock records
              what work actually takes and Reports shows the gap.
            </span>
          </div>
        </Band>
      </>
    ),
    price: (
      <>
        <Head
          title="Pricing"
          sub="applies to new orders only"
          help="Rate card for new quotes and bookings. Existing orders keep the price they already locked in."
        />
        <G>
          <Row
            label="Base rate per job"
            help="Starting assembly price for a standard job before extra items or travel."
          >
            <Stepper
              value={ops.baseRate}
              step={5}
              unit="$"
              w={74}
              onChange={(v) => patchOps({ baseRate: v })}
            />
          </Row>
          <Row
            label="Each additional item"
            help="Amount added for each extra piece on the same job (beyond the first)."
          >
            <Stepper
              value={ops.perItem}
              step={5}
              unit="$"
              w={74}
              onChange={(v) => patchOps({ perItem: v })}
            />
          </Row>
          <Row
            label="Membership"
            help="Monthly membership price. Customers can cancel any time. Not the same as a one-time job deposit."
          >
            <Stepper
              value={ops.membership}
              step={5}
              unit="$/mo"
              w={78}
              onChange={(v) => patchOps({ membership: v })}
            />
          </Row>
          <Row
            label="Deposit to book"
            help="Percent of the job total charged when they book (Stripe deposit). The rest is balance due on delivery. Product default is 30%."
          >
            <Stepper
              value={depositPct}
              step={5}
              min={5}
              max={100}
              unit="%"
              w={70}
              onChange={(v) =>
                setDraft((d) =>
                  d ? { ...d, deposit_percent: Math.min(100, v) } : d
                )
              }
            />
          </Row>
        </G>
        <Band>
          <div
            style={{
              background: "var(--gray-50)",
              borderRadius: 12,
              padding: "13px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <b style={eyebrow}>How a job splits</b>
              <b
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  color: "var(--ink-900)",
                }}
              >
                {moneyShort(ops.baseRate)}
              </b>
            </div>
            <div
              style={{
                display: "flex",
                height: 9,
                borderRadius: 99,
                overflow: "hidden",
                background: "var(--gray-100)",
              }}
            >
              <span
                style={{
                  width: `${depositPct}%`,
                  background: "var(--blue-electric)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11.5 }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--ink-500)",
                }}
              >
                <em
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: "var(--blue-electric)",
                    display: "inline-block",
                  }}
                />
                <b style={{ color: "var(--ink-900)" }}>
                  {moneyShort((ops.baseRate * depositPct) / 100)}
                </b>{" "}
                at booking
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--ink-500)",
                }}
              >
                <em
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: "var(--gray-100)",
                    display: "inline-block",
                  }}
                />
                <b style={{ color: "var(--ink-900)" }}>
                  {moneyShort((ops.baseRate * (100 - depositPct)) / 100)}
                </b>{" "}
                on delivery
              </span>
            </div>
          </div>
          <div
            style={{
              background: "var(--gray-50)",
              borderRadius: 12,
              padding: "13px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            <b style={eyebrow}>Worked examples</b>
            {(
              [
                ["One item", ops.baseRate],
                ["Three items", ops.baseRate + ops.perItem * 2],
                [
                  "Three items, member",
                  ops.baseRate + ops.perItem * 2 - ops.membership,
                ],
              ] as const
            ).map(([lab, tot]) => (
              <div
                key={lab}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  fontSize: 12,
                  color: "var(--ink-500)",
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>{lab}</span>
                <b style={{ color: "var(--ink-900)", fontSize: 12.5 }}>
                  {moneyShort(Math.max(0, tot))}
                </b>
                <i
                  style={{
                    fontStyle: "normal",
                    fontSize: 10.5,
                    color: "var(--ink-500)",
                    width: 74,
                    textAlign: "right",
                  }}
                >
                  {moneyShort((Math.max(0, tot) * depositPct) / 100)} up front
                </i>
              </div>
            ))}
          </div>
        </Band>
      </>
    ),
    area: (
      <>
        <Head
          title="Service area"
          sub="everything measured from the shop"
          help="Where the workshop is and how far free travel goes. Distance is measured from the shop pin. Outside the free zone, customers can still book with an out-of-area travel fee."
        />
        <div style={{ padding: "8px 0 4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--ink-900)",
              }}
            >
              Shop / hub address
            </span>
            <HelpTip text="The workshop origin. Drives the home map pin, quote “ship to hub” address, and the center of the free-travel radius." />
          </div>
          <ShopAddressField
            value={{
              address: hub.address,
              lat: hub.lat,
              lng: hub.lng,
            }}
            onChange={(next) =>
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      hub: {
                        ...d.hub,
                        address: next.address,
                        lat: next.lat,
                        lng: next.lng,
                      },
                    }
                  : d
              )
            }
          />
        </div>
        <G>
          <Row
            label="We travel up to"
            help="Free-travel zone in miles from the shop. Deliveries inside this radius do not add an out-of-area travel fee. Outside still bookable — the far fee applies and shows on the quote."
          >
            <Stepper
              value={hub.radius_miles}
              step={5}
              min={5}
              max={200}
              unit="mi"
              w={70}
              onChange={(v) =>
                setDraft((d) =>
                  d
                    ? {
                        ...d,
                        hub: { ...d.hub, radius_miles: v },
                      }
                    : d
                )
              }
            />
          </Row>
          <Row
            label="Longest drive we accept"
            help="Policy target for one-way drive time. Not a booking gate yet — real Google Maps drive-time is not wired. Safe to treat as planning only for now."
          >
            <Stepper
              value={ops.driveMinutes}
              step={5}
              min={10}
              unit="min"
              w={74}
              onChange={(v) => patchOps({ driveMinutes: v })}
            />
          </Row>
          <Row
            label="Out-of-area travel fee"
            help={`Charged when delivery is past “We travel up to” (${hub.radius_miles} mi). Shows on the customer quote as Travel · out of area and is included in the deposit total. Inside the free zone there is no travel fee.`}
          >
            <Stepper
              value={ops.farFee}
              step={5}
              min={0}
              unit="$"
              w={74}
              onChange={(v) => patchOps({ farFee: v })}
            />
          </Row>
        </G>

        <div style={{ paddingTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingBottom: 8,
            }}
          >
            <LabelWithHelp
              help="Force a surcharge or refuse service for specific ZIP codes, even if they fall inside or outside the free zone. Use refuse for areas you will not serve."
            >
              <b style={eyebrow}>ZIP exceptions</b>
            </LabelWithHelp>
            <i
              style={{
                fontStyle: "normal",
                fontSize: 11,
                color: "var(--ink-500)",
              }}
            >
              override by ZIP
            </i>
            <button
              type="button"
              className="sip-admin-focus"
              onClick={() =>
                patchOps({
                  exceptions: [
                    ...ops.exceptions,
                    { zip: "", mode: "surcharge", why: "" },
                  ],
                })
              }
              style={linkAdd}
            >
              <Plus size={12} />
              Add ZIP
            </button>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 7 }}
          >
            {ops.exceptions.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: 560,
                  flexWrap: "wrap",
                }}
              >
                <input
                  value={e.zip}
                  placeholder="77000"
                  className="sip-admin-focus"
                  aria-label={`ZIP ${i + 1}`}
                  onChange={(ev) =>
                    patchOps({
                      exceptions: ops.exceptions.map((x, j) =>
                        j === i ? { ...x, zip: ev.target.value } : x
                      ),
                    })
                  }
                  style={{
                    width: 62,
                    flex: "0 0 62px",
                    border: "1px solid var(--border-default)",
                    borderRadius: 8,
                    padding: "6px 9px",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    color: "var(--ink-900)",
                    background: "#fff",
                  }}
                />
                <button
                  type="button"
                  className="sip-admin-focus"
                  onClick={() =>
                    patchOps({
                      exceptions: ops.exceptions.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              mode:
                                x.mode === "refuse" ? "surcharge" : "refuse",
                            }
                          : x
                      ),
                    })
                  }
                  style={{
                    background:
                      e.mode === "refuse"
                        ? "var(--status-error-bg)"
                        : "var(--status-warning-bg)",
                    color:
                      e.mode === "refuse"
                        ? "var(--status-error)"
                        : "var(--status-warning)",
                    borderRadius: 99,
                    padding: "4px 10px",
                    fontSize: 10.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    minHeight: 32,
                  }}
                >
                  {e.mode === "refuse" ? "Refuse" : "Always surcharge"}
                </button>
                <input
                  value={e.why}
                  placeholder="Why"
                  className="sip-admin-focus"
                  aria-label={`Reason ${i + 1}`}
                  onChange={(ev) =>
                    patchOps({
                      exceptions: ops.exceptions.map((x, j) =>
                        j === i ? { ...x, why: ev.target.value } : x
                      ),
                    })
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: "1px solid var(--border-default)",
                    borderRadius: 8,
                    padding: "6px 9px",
                    fontSize: 12,
                    fontFamily: "var(--font-body)",
                    color: "var(--ink-900)",
                    background: "#fff",
                  }}
                />
                <button
                  type="button"
                  className="sip-admin-focus"
                  aria-label={`Remove ZIP ${i + 1}`}
                  onClick={() =>
                    patchOps({
                      exceptions: ops.exceptions.filter((_, j) => j !== i),
                    })
                  }
                  style={iconBtn}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    emails: (
      <>
        <Head
          title="Customer emails"
          sub="sent automatically on stage change"
          help="Lifecycle emails customers receive as a job moves (booked, pickup, build, delivery). “Stored” templates can be edited in the database; others still live in code."
        />
        <div
          style={{
            paddingTop: 6,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            columnGap: 26,
          }}
        >
          {(
            [
              {
                n: "Booking confirmation",
                help: "Sent when a customer successfully books. Confirms the job and next steps.",
              },
              {
                n: "Pickup scheduled",
                help: "Sent when a pickup window is locked for collecting their items.",
              },
              {
                n: "Picked up",
                help: "Sent after items leave the customer or retailer and are in transit to the hub.",
              },
              {
                n: "Build started",
                help: "Sent when assembly work begins at the workshop.",
              },
              {
                n: "Built and inspected",
                help: "Sent when build + QC are complete and the job is ready for delivery.",
              },
              {
                n: "Out for delivery",
                help: "Sent when the assembled pieces leave the hub for white-glove delivery.",
              },
              {
                n: "Delivered",
                help: "Sent after in-home placement is complete. Closes the customer loop.",
              },
            ] as const
          ).map(({ n, help }, i) => (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderBottom: "1px solid var(--gray-100)",
              }}
            >
              <em
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  display: "inline-block",
                  flex: "0 0 7px",
                  background:
                    i === 0
                      ? "var(--status-success)"
                      : "var(--ink-300)",
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-900)",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {n}
                <HelpTip text={help} />
              </span>
              {i === 0 && (
                <span
                  style={{
                    background: "var(--blue-50)",
                    color: "var(--blue-700)",
                    borderRadius: 99,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    flex: "0 0 auto",
                  }}
                >
                  Editable
                </span>
              )}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "var(--ink-500)",
                  flex: "0 0 auto",
                }}
              >
                {i === 0 ? "Stored" : "In code"}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 14,
          }}
        >
          <span style={{ fontSize: 11.5, color: "var(--ink-500)", flex: 1 }}>
            Email only this release - no SMS.
          </span>
          <button
            type="button"
            disabled
            style={{
              ...btnAccent,
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            <Mail size={14} />
            Edit templates - soon
          </button>
        </div>
      </>
    ),
    access: <TeamAccessPanel />,
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        alignItems: "stretch",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Section rail */}
      <div
        style={{
          flex: "0 1 236px",
          minWidth: 190,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--gray-100)",
          background: "#FCFDFF",
        }}
      >
        <div
          className="scr"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minHeight: 0,
          }}
        >
          {sections.map((x) => {
            const on = sec === x.k;
            return (
              <button
                key={x.k}
                type="button"
                className="sip-admin-focus"
                onClick={() => setSec(x.k)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 10,
                  background: on ? "var(--blue-50)" : "transparent",
                  flex: "0 0 auto",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-body)",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    color: on ? "var(--blue-electric)" : "var(--ink-500)",
                    display: "flex",
                  }}
                >
                  {x.icon}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <b
                    style={{
                      display: "block",
                      fontSize: 12.5,
                      fontWeight: on ? 700 : 500,
                      color: on ? "var(--blue-deep)" : "var(--ink-900)",
                      lineHeight: 1.25,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {x.label}
                  </b>
                  <i
                    style={{
                      fontStyle: "normal",
                      display: "block",
                      fontSize: 10.5,
                      color: on ? "var(--blue-700)" : "var(--ink-500)",
                      marginTop: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {x.val}
                  </i>
                </span>
                {on && (
                  <ChevronRight size={13} color="var(--blue-electric)" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pane */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          className="scr"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "17px 22px 22px",
            minHeight: 0,
          }}
        >
          {toast && (
            <div
              role="status"
              aria-live="polite"
              style={{
                background: "var(--status-success-bg)",
                color: "var(--status-success)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              {toast}
            </div>
          )}
          {saveError && (
            <div
              role="alert"
              style={{
                background: "var(--status-error-bg)",
                color: "var(--status-error)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12.5,
                marginBottom: 14,
              }}
            >
              {saveError}
            </div>
          )}
          {pane[sec]}
        </div>

        {/* Save foot - pinned to pane */}
        <div
          style={{
            borderTop: "1px solid var(--gray-100)",
            padding: "11px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: "0 0 auto",
            background: "#fff",
          }}
        >
          {dirty ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11.5,
                color: "var(--status-warning)",
                fontWeight: 600,
              }}
            >
              <em
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: "var(--status-warning)",
                  display: "inline-block",
                }}
              />
              Unsaved changes
            </span>
          ) : (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11.5,
                color: "var(--ink-500)",
              }}
            >
              <Check size={13} color="var(--ink-500)" />
              Everything saved
            </span>
          )}
          <span
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 8,
            }}
          >
            {dirty && (
              <button
                type="button"
                className="sip-admin-focus"
                onClick={revert}
                style={btnGhost}
              >
                Revert
              </button>
            )}
            <button
              type="button"
              className="sip-admin-focus"
              disabled={!dirty || saving}
              onClick={save}
              aria-busy={saving}
              style={{
                ...btnAccent,
                opacity: !dirty || saving ? 0.45 : 1,
                cursor: !dirty || saving ? "not-allowed" : "pointer",
              }}
            >
              <Check size={14} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </span>
        </div>
      </div>

    </div>
  );
}
