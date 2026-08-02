import type { Marketplace, ProductSummary } from "./types";

/**
 * Photo search runs straight through Elim: the bytes are uploaded to their
 * image endpoint, and the returned image id drives the marketplace match.
 * A copy is parked in our private bucket so the desk can review what people
 * sent, but that URL is never used for matching (the marketplace rejects
 * any image host it does not own).
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

/** Archives the photo and returns a signed URL for our own review only. */
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
  const file = decode(dataUrl);
  if (!file) throw new Error("Use a JPG, PNG or WEBP photo under 8MB.");

  const { uploadPhotoToElim, searchElimByImageId } = await import("./elim-provider.server");
  const imageId = await uploadPhotoToElim(file.bytes, file.mime);
  const items = await searchElimByImageId(imageId, marketplace);

  // Keep a copy for the desk, but never block the match on it.
  let imageUrl = dataUrl;
  try {
    imageUrl = await hostPhoto(dataUrl);
  } catch (err) {
    const { noteIncident } = await import("@/lib/api/error-log.server");
    noteIncident("photo.archive", err);
  }
  return { items, imageUrl };
}
