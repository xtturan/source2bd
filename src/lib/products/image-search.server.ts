import type { Marketplace, ProductSummary } from "./types";

/**
 * Elim's image search needs a URL it can fetch, so the uploaded photo is
 * parked in a private bucket and handed over as a short lived signed link.
 */

const BUCKET = "search-photos";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

function decode(dataUrl: string) {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  const mime = match[1]!.toLowerCase();
  if (!EXT[mime]) return null;
  const bytes = Buffer.from(match[2]!, "base64");
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) return null;
  return { mime, bytes };
}

/** Uploads the photo and returns a signed URL Elim can read for an hour. */
export async function hostPhoto(dataUrl: string): Promise<string> {
  const file = decode(dataUrl);
  if (!file) throw new Error("Use a JPG, PNG or WEBP photo under 8MB.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${EXT[file.mime]}`;

  const upload = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file.bytes, { contentType: file.mime, upsert: false });
  if (upload.error) {
    console.error("photo upload failed", upload.error);
    throw new Error("We could not read that photo. Try another one.");
  }

  const signed = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (signed.error || !signed.data?.signedUrl) {
    console.error("signed url failed", signed.error);
    throw new Error("We could not read that photo. Try another one.");
  }
  return signed.data.signedUrl;
}

export async function searchByPhoto(
  dataUrl: string,
  marketplace: Marketplace,
): Promise<{ items: ProductSummary[]; imageUrl: string }> {
  const imageUrl = await hostPhoto(dataUrl);
  const { getProductProvider } = await import("./provider.server");
  const provider = getProductProvider();
  if (!provider.searchByImage) return { items: [], imageUrl };
  const res = await provider.searchByImage(imageUrl, { marketplace });
  return { items: res.items, imageUrl };
}
