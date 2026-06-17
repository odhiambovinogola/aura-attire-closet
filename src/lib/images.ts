export function productImageUrl(storagePath: string): string {
  const base = import.meta.env.PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/product-images/${storagePath}`;
}
