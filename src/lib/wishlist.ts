import { persistentAtom } from "@nanostores/persistent";

export interface WishlistItem {
  productSlug: string;
  name: string;
  priceKes: number;
  imagePath?: string;
}

export const wishlistItems = persistentAtom<WishlistItem[]>("aura-wishlist", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function isWishlisted(slug: string, items: readonly WishlistItem[] = wishlistItems.get()): boolean {
  return items.some((item) => item.productSlug === slug);
}

export function toggleWishlist(item: WishlistItem) {
  const current = wishlistItems.get();
  const exists = isWishlisted(item.productSlug, current);
  wishlistItems.set(
    exists ? current.filter((line) => line.productSlug !== item.productSlug) : [...current, item],
  );
}

export function removeFromWishlist(slug: string) {
  wishlistItems.set(wishlistItems.get().filter((item) => item.productSlug !== slug));
}
