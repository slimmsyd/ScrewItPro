"use client";

/**
 * Settings → Roles and access: truthful super-admin list + staff roster + invite.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { HelpCircle, Loader2, UserPlus } from "lucide-react";
import {
  Head,
  Note,
  btnAccent,
  btnGhost,
} from "@/components/admin/settingsPrimitives";
import {
  STAFF_INVITE_ROLES,
  type StaffInviteRole,
  type TeamMember,
} from "@/lib/admin/team";

type RosterResponse = {
  ok: boolean;
  superAdmins?: { email: string }[];
  members?: TeamMember[];
  inviterIsSuperAdmin?: boolean;
  error?: string;
  message?: string;
};

/** Short labels for tables / messages */
const ROLE_LABEL: Record<StaffInviteRole, string> = {
  admin: "Admin",
  technician: "Technician",
  driver: "Driver",
};

/** Plain-language role picker lines */
const ROLE_OPTION_LABEL: Record<StaffInviteRole, string> = {
  admin: "Admin — full access to this Admin app",
  technician: "Technician — shop & build team (app coming soon)",
  driver: "Driver — delivery team (app coming soon)",
};

function statusLabel(status: string): string {
  if (status === "invited") return "Invite sent";
  if (status === "active") return "Signed in";
  if (status === "suspended") return "Paused";
  return status;
}

function roleDisplay(role: string): string {
  if (role === "admin") return "Admin";
  if (role === "technician") return "Technician";
  if (role === "driver") return "Driver";
  return role;
}

export default function TeamAccessPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [superAdmins, setSuperAdmins] = useState<{ email: string }[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviterIsSuperAdmin, setInviterIsSuperAdmin] = useState(false);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffInviteRole>("technician");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteErr, setInviteErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team");
      const data = (await res.json()) as RosterResponse;
      if (!res.ok || !data.ok) {
        setError(
          data.message ??
            "We couldn't load your team list. Try refresh, or sign in again."
        );
        return;
      }
      setSuperAdmins(data.superAdmins ?? []);
      setMembers(data.members ?? []);
      setInviterIsSuperAdmin(Boolean(data.inviterIsSuperAdmin));
    } catch {
      setError(
        "We couldn't load your team list. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const roleOptions = useMemo<StaffInviteRole[]>(
    () =>
      inviterIsSuperAdmin
        ? [...STAFF_INVITE_ROLES]
        : STAFF_INVITE_ROLES.filter((r) => r !== "admin"),
    [inviterIsSuperAdmin]
  );

  useEffect(() => {
    if (!roleOptions.includes(role) && roleOptions[0]) {
      setRole(roleOptions[0]);
    }
  }, [role, roleOptions]);

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setInviteMsg(null);
    setInviteErr(null);
    setInviting(true);
    try {
      const res = await fetch("/api/admin/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        message?: string;
        member?: TeamMember;
        emailSent?: boolean;
        emailError?: string | null;
      };
      if (!res.ok || !data.ok) {
        setInviteErr(
          data.message ??
            (data.error === "already_staff"
              ? "That person is already on the team with this role."
              : data.error === "role_not_allowed"
                ? "Only account owners can add new Admins. You can still add Technicians or Drivers."
                : "We couldn't send that invite. Try again in a moment.")
        );
        return;
      }
      const who = data.member?.email ?? email;
      const roleName = ROLE_LABEL[role];
      if (data.emailSent) {
        setInviteMsg(
          `Invite sent to ${who} as ${roleName}. They'll get an email from ScrewIt Pros — after they open the link and sign in, their status becomes “Signed in.”`
        );
      } else {
        setInviteMsg(
          `${who} was added as ${roleName}, but the email didn't go out${
            data.emailError ? ` (${data.emailError})` : ""
          }. Ask them to sign in with Google using that same email, or retry after email is fixed.`
        );
      }
      setEmail("");
      await load();
    } catch {
      setInviteErr("We couldn't send that invite. Try again in a moment.");
    } finally {
      setInviting(false);
    }
  }

  const th: CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--ink-500)",
    background: "#FCFDFF",
    borderBottom: "1px solid var(--border-default)",
  };

  const td: CSSProperties = {
    height: 42,
    padding: "0 14px",
    fontSize: 12,
    color: "var(--ink-900)",
    borderBottom: "1px solid var(--gray-100)",
  };

  return (
    <>
      <Head
        title="Roles and access"
        sub="who can open Admin"
        help="This page shows who can run the business in Admin, and lets you email invites to teammates. Account owners are set by the company (not from this form). Inviting someone as Technician or Driver saves their role even if their app screens are still coming soon."
      />

      <p
        style={{
          margin: "10px 0 0",
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--ink-700)",
          maxWidth: 520,
        }}
      >
        Use this page to see who can use Admin and to invite people onto the
        team. They get an email with a secure link. After they sign in, they
        show as <strong style={{ fontWeight: 600 }}>Signed in</strong>.
      </p>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--ink-500)",
            fontSize: 13,
            marginTop: 12,
          }}
        >
          <Loader2 size={16} aria-hidden style={{ animation: "spin 1s linear infinite" }} />
          Loading your team…
        </div>
      ) : error ? (
        <Note tone="w" icon={<HelpCircle size={13} />}>
          {error}
        </Note>
      ) : (
        <>
          <p
            style={{
              margin: "18px 0 6px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
            }}
          >
            Account owners
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              lineHeight: 1.45,
              color: "var(--ink-500)",
            }}
          >
            Full access to Admin (settings, leads, invites). These emails are
            set by the company — you can&apos;t add or remove owners from this
            screen.
          </p>
          <div
            style={{
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {superAdmins.length === 0 ? (
              <div
                style={{
                  padding: "14px 16px",
                  fontSize: 12.5,
                  color: "var(--ink-500)",
                }}
              >
                No account owners are listed yet. Ask your developer or
                ScrewIt setup contact to add the care team emails on the
                server.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Email</th>
                    <th style={th}>What they can do</th>
                  </tr>
                </thead>
                <tbody>
                  {superAdmins.map((s) => (
                    <tr key={s.email}>
                      <td style={{ ...td, fontWeight: 600 }}>{s.email}</td>
                      <td style={{ ...td, color: "var(--ink-500)", fontSize: 11.5 }}>
                        Full Admin access · company owner
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p
            style={{
              margin: "22px 0 6px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
            }}
          >
            Your team
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              lineHeight: 1.45,
              color: "var(--ink-500)",
            }}
          >
            People you&apos;ve invited.{" "}
            <strong style={{ fontWeight: 600, color: "var(--ink-700)" }}>
              Invite sent
            </strong>{" "}
            means we emailed them;{" "}
            <strong style={{ fontWeight: 600, color: "var(--ink-700)" }}>
              Signed in
            </strong>{" "}
            means they accepted and logged in at least once.
          </p>
          <div
            style={{
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {members.length === 0 ? (
              <div
                style={{
                  padding: "14px 16px",
                  fontSize: 12.5,
                  color: "var(--ink-500)",
                }}
              >
                No one invited yet. Use the form below to email a teammate.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Email</th>
                    <th style={th}>Role</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td style={{ ...td, fontWeight: 600 }}>{m.email}</td>
                      <td style={{ ...td, fontSize: 11.5 }}>
                        {roleDisplay(m.role)}
                      </td>
                      <td style={{ ...td, fontSize: 11.5, color: "var(--ink-500)" }}>
                        {statusLabel(m.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p
            style={{
              margin: "22px 0 6px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
            }}
          >
            Invite someone
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              lineHeight: 1.45,
              color: "var(--ink-500)",
            }}
          >
            We&apos;ll email them a ScrewIt Pros invite. Pick{" "}
            <strong style={{ fontWeight: 600, color: "var(--ink-700)" }}>
              Admin
            </strong>{" "}
            only for people who should manage the business here.
            Technician and Driver roles are for field team (their apps are
            still being built).
          </p>
          <form
            onSubmit={onInvite}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "flex-end",
              padding: "12px 14px",
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              background: "#FCFDFF",
            }}
          >
            <label style={{ flex: "1 1 180px", minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--ink-500)",
                  marginBottom: 4,
                }}
              >
                Their email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="sip-admin-focus"
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid var(--border-default)",
                  padding: "0 10px",
                  fontSize: 13,
                  color: "var(--ink-900)",
                  background: "#fff",
                }}
              />
            </label>
            <label style={{ flex: "1 1 220px", minWidth: 160 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--ink-500)",
                  marginBottom: 4,
                }}
              >
                Role on the team
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffInviteRole)}
                className="sip-admin-focus"
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid var(--border-default)",
                  padding: "0 8px",
                  fontSize: 13,
                  color: "var(--ink-900)",
                  background: "#fff",
                }}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_OPTION_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={inviting || !email.trim()}
              style={{
                ...btnAccent,
                height: 36,
                opacity: inviting || !email.trim() ? 0.6 : 1,
                cursor:
                  inviting || !email.trim() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {inviting ? (
                <Loader2 size={14} aria-hidden style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <UserPlus size={14} aria-hidden />
              )}
              Send invite email
            </button>
            <button
              type="button"
              onClick={() => void load()}
              style={{ ...btnGhost, height: 36 }}
            >
              Refresh list
            </button>
          </form>

          {inviteMsg && (
            <p
              role="status"
              style={{
                margin: "10px 0 0",
                fontSize: 12.5,
                color: "var(--status-success, #0d7a4f)",
              }}
            >
              {inviteMsg}
            </p>
          )}
          {inviteErr && (
            <p
              role="alert"
              style={{
                margin: "10px 0 0",
                fontSize: 12.5,
                color: "var(--status-danger, #b42318)",
              }}
            >
              {inviteErr}
            </p>
          )}
        </>
      )}
    </>
  );
}
