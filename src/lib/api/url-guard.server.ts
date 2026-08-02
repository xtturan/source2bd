/**
 * Blocks server-side request forgery on any user supplied product link.
 * Only public http(s) hosts are allowed through to the upstream fetchers.
 */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "instance-data",
  "0.0.0.0",
  "[::]",
  "::1",
]);

function isPrivateIpv4(host: string) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if ([a, Number(m[2]), Number(m[3]), Number(m[4])].some((n) => n > 255)) return true;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true; // link local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

export class UnsafeUrlError extends Error {
  readonly code = "UNSAFE_URL";
  readonly messageBn = "এই লিংকটি নেওয়া যাচ্ছে না। পুরো পণ্যের লিংক দিন।";
  constructor() {
    super("UNSAFE_URL");
    this.name = "UnsafeUrlError";
  }
}

/** Returns the normalised URL string, or throws UnsafeUrlError. */
export function assertSafeUrl(raw: string): string {
  if (raw.length > 2048) throw new UnsafeUrlError();
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UnsafeUrlError();
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new UnsafeUrlError();
  if (url.username || url.password) throw new UnsafeUrlError();

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host || BLOCKED_HOSTS.has(host)) throw new UnsafeUrlError();
  if (host.endsWith(".local") || host.endsWith(".internal") || !host.includes("."))
    throw new UnsafeUrlError();
  if (host.startsWith("[")) throw new UnsafeUrlError(); // raw IPv6 literal
  if (isPrivateIpv4(host)) throw new UnsafeUrlError();

  return url.toString();
}
