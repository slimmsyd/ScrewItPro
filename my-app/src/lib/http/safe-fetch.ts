import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

const TIMEOUT_MS = 8000;
const MAX_BYTES = 3_000_000;
const MAX_REDIRECTS = 3;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type SafeFetchFailure =
  | "invalid_url"
  | "blocked_host"
  | "timeout"
  | "too_large"
  | "http_error"
  | "network_error"
  | "too_many_redirects";

export type SafeFetchResult =
  | { ok: true; body: string; finalUrl: string; status: number }
  | { ok: false; reason: SafeFetchFailure };

/** Blocks loopback, RFC1918 private, link-local (incl. cloud metadata 169.254.169.254), and IPv6 equivalents. */
function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (incl. cloud metadata)
    if (a === 0) return true; // 0.0.0.0/8
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fe80:") || lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true; // fe80::/10 link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 unique local
    // IPv4-mapped IPv6 (::ffff:a.b.c.d) — re-check the embedded IPv4
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIp(mapped[1]);
    return false;
  }
  return true; // not a recognizable IP literal — treat as unsafe rather than assume safe
}

async function isBlockedHost(hostname: string): Promise<boolean> {
  if (hostname === "localhost" || hostname.endsWith(".local")) return true;
  if (isIP(hostname)) return isBlockedIp(hostname);
  try {
    const records = await dnsLookup(hostname, { all: true });
    return records.some((r) => isBlockedIp(r.address));
  } catch {
    // Unresolvable host — nothing to fetch, treat as blocked rather than let fetch() throw later.
    return true;
  }
}

function parseUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Fetches a user-submitted URL server-side with SSRF guards: protocol allowlist,
 * private/loopback/link-local IP blocking (resolved via DNS, not just string checks),
 * and re-validation of every redirect hop before following it — `fetch()`'s default
 * redirect-following happens before this code would ever see the Location header.
 */
export async function safeFetch(url: string): Promise<SafeFetchResult> {
  let current = parseUrl(url);
  if (!current) return { ok: false, reason: "invalid_url" };

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (await isBlockedHost(current.hostname)) {
      return { ok: false, reason: "blocked_host" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { ok: false, reason: "timeout" };
      }
      return { ok: false, reason: "network_error" };
    } finally {
      clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { ok: false, reason: "http_error" };
      if (hop === MAX_REDIRECTS) return { ok: false, reason: "too_many_redirects" };
      const next = parseUrl(new URL(location, current).toString());
      if (!next) return { ok: false, reason: "blocked_host" };
      current = next;
      continue;
    }

    if (response.status < 200 || response.status >= 300) {
      return { ok: false, reason: "http_error" };
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BYTES) {
      return { ok: false, reason: "too_large" };
    }

    const body = await response.text();
    if (body.length > MAX_BYTES) {
      return { ok: false, reason: "too_large" };
    }

    return { ok: true, body, finalUrl: current.toString(), status: response.status };
  }

  return { ok: false, reason: "too_many_redirects" };
}
