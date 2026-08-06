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

const ROLE_LABEL: Record<StaffInviteRole, string> = {
  admin: "Admin",
  technician: "Technician",
  driver: "Driver",
};

function statusLabel(status: string): string {
  if (status === "invited") return "Invited";
  if (status === "active") return "Active";
  if (status === "suspended") return "Suspended";
  return status;
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
        setError(data.message ?? data.error ?? "Could not load team");
        return;
      }
      setSuperAdmins(data.superAdmins ?? []);
      setMembers(data.members ?? []);
      setInviterIsSuperAdmin(Boolean(data.inviterIsSuperAdmin));
    } catch {
      setError("Could not load team");
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
              ? "That person already has this role."
              : data.error === "role_not_allowed"
                ? "Only super admins can invite admins."
                : "Invite failed.")
        );
        return;
      }
      const who = data.member?.email ?? email;
      const roleName = ROLE_LABEL[role];
      if (data.emailSent) {
        setInviteMsg(
          `Invited ${who} as ${roleName}. We emailed them a ScrewIt Pros invite link.`
        );
      } else {
        setInviteMsg(
          `Saved ${who} as ${roleName} (Invited). Email not delivered${
            data.emailError ? `: ${data.emailError}` : ""
          }. They can still sign in once you fix email, or use Google with that address.`
        );
      }
      setEmail("");
      await load();
    } catch {
      setInviteErr("Invite failed.");
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
        sub="care owners + invited staff"
        help="Super admins are fixed by server config (SUPER_ADMIN_EMAILS). Invite adds admin, technician, or driver on their profile. Field portals may still be building."
      />

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
          Loading team…
        </div>
      ) : error ? (
        <Note tone="w" icon={<HelpCircle size={13} />}>
          {error}
        </Note>
      ) : (
        <>
          <p
            style={{
              margin: "12px 0 6px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
            }}
          >
            Super admins (company care)
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
                None configured. Set{" "}
                <code style={{ fontSize: 11 }}>SUPER_ADMIN_EMAILS</code> on the
                server (care owners). Not inviteable here.
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
                    <th style={th}>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {superAdmins.map((s) => (
                    <tr key={s.email}>
                      <td style={{ ...td, fontWeight: 600 }}>{s.email}</td>
                      <td style={{ ...td, color: "var(--ink-500)", fontSize: 11.5 }}>
                        Full Admin · env allowlist
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 11,
              color: "var(--ink-500)",
              lineHeight: 1.45,
            }}
          >
            Super admins cannot be created or removed from this screen — only via
            server env.
          </p>

          <p
            style={{
              margin: "20px 0 6px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
            }}
          >
            Invited staff
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
                No staff profiles yet. Invite someone below to test the loop.
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
                      <td style={{ ...td, fontSize: 11.5, textTransform: "capitalize" }}>
                        {m.role}
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
              margin: "20px 0 8px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-500)",
            }}
          >
            Invite member
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
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
            <label style={{ flex: "0 0 140px" }}>
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
                Role
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
                    {ROLE_LABEL[r]}
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
              Send invite
            </button>
            <button
              type="button"
              onClick={() => void load()}
              style={{ ...btnGhost, height: 36 }}
            >
              Refresh
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
