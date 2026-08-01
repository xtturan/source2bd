/** Routes marketplace CDN images through our proxy so hotlink blocks do not break them. */
export function productImage(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const abs = url.startsWith("//") ? `https:${url}` : url;
  if (!/^https?:\/\//i.test(abs)) return abs;
  return `/api/public/img?u=${encodeURIComponent(abs)}`;
}
