/**
 * Human label for a referred friend — first name if available, else masked email.
 */
export function referralDisplayName(opts: {
  fullName?: string | null;
  email?: string | null;
}): string {
  const name = opts.fullName?.trim();
  if (name) {
    const first = name.split(/\s+/)[0];
    if (first && first.length > 0) return first;
  }
  const email = opts.email?.trim().toLowerCase();
  if (email && email.includes("@")) {
    const [local, domain] = email.split("@");
    if (local && domain) {
      const head = local.slice(0, 1);
      return `${head}***@${domain}`;
    }
  }
  return "Friend";
}
