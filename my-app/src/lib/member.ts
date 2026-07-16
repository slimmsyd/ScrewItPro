import { isWaitlist } from "@/lib/site";

/** Visitor membership relative to auth + waitlist enrollment. */
export type MemberStatus =
  | "loading"
  | "anonymous"
  | "signed_in"
  | "waitlisted";

export type MemberUser = {
  email: string;
  name: string;
  picture: string;
  provider: string;
  position: number | null;
};

export type PrimaryCtaAction = "join" | "share" | "quote" | "finish_join";

export function deriveMemberStatus(
  user: MemberUser | null,
  loading: boolean
): MemberStatus {
  if (loading) return "loading";
  if (!user) return "anonymous";
  if (user.position != null && user.position > 0) return "waitlisted";
  return "signed_in";
}

/**
 * Primary marketing CTA action from membership + site mode.
 * During loading we keep "join" so waitlisted users may briefly see Join
 * rather than flashing Share to anonymous visitors.
 */
export function resolvePrimaryCtaAction(
  status: MemberStatus,
  waitlistMode: boolean = isWaitlist
): PrimaryCtaAction {
  if (!waitlistMode) return "quote";
  if (status === "waitlisted") return "share";
  if (status === "signed_in") return "finish_join";
  return "join";
}

/** i18n key for the primary CTA label. */
export function primaryCtaLabelKey(action: PrimaryCtaAction): string {
  switch (action) {
    case "share":
      return "common.shareWithFriend";
    case "quote":
      return "common.getQuote";
    case "finish_join":
      return "common.finishJoining";
    case "join":
    default:
      return "common.joinNow";
  }
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/**
 * Native share when available; otherwise copy invite URL to clipboard.
 */
export async function shareWaitlistInvite(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  if (typeof window === "undefined") return "failed";

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
      });
      return "shared";
    }
  } catch (err) {
    const name =
      err && typeof err === "object" && "name" in err
        ? String((err as { name?: string }).name)
        : "";
    if (name === "AbortError") return "cancelled";
    // Fall through to clipboard
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(opts.url);
      return "copied";
    }
  } catch {
    /* fall through */
  }

  try {
    window.prompt(opts.text, opts.url);
    return "copied";
  } catch {
    return "failed";
  }
}

/** Default invite URL with light attribution. */
export function waitlistInviteUrl(origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/?utm_source=waitlist_share&utm_medium=referral`;
}
