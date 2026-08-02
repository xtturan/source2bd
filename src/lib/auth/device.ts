/** Stable per-browser id, used to cap how many accounts one device can open. */
const KEY = "s2bd_device";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/** BD phone numbers become a stable login address (SMS is not enabled). */
export function phoneToEmail(raw: string): string {
  const digits = raw.replace(/\D+/g, "").replace(/^0+/, "");
  const national = digits.startsWith("88") ? digits.slice(2) : digits;
  return `bd${national}@phone.source2bd.app`;
}

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "").replace(/^0+/, "");
  const national = digits.startsWith("88") ? digits.slice(2) : digits;
  return `+88${national}`;
}

export function isValidBdPhone(raw: string): boolean {
  const digits = raw.replace(/\D+/g, "").replace(/^0+/, "");
  const national = digits.startsWith("88") ? digits.slice(2) : digits;
  return /^1[3-9]\d{8}$/.test(national);
}
