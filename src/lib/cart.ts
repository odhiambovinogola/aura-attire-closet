import { persistentAtom } from "@nanostores/persistent";

export interface CartItem {
  productSlug: string;
  name: string;
  colour: string;
  size?: string;
  quantity: number;
  priceKes: number;
}

function sameLine(a: CartItem, b: Pick<CartItem, "productSlug" | "colour" | "size">): boolean {
  return a.productSlug === b.productSlug && a.colour === b.colour && a.size === b.size;
}

export const cartItems = persistentAtom<CartItem[]>("aura-cart", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addToCart(item: CartItem) {
  const current = cartItems.get();
  const existingIndex = current.findIndex((line) => sameLine(line, item));

  if (existingIndex >= 0) {
    const next = current.slice();
    next[existingIndex] = {
      ...next[existingIndex],
      quantity: next[existingIndex].quantity + item.quantity,
    };
    cartItems.set(next);
  } else {
    cartItems.set([...current, item]);
  }
}

export function updateQuantity(index: number, quantity: number) {
  const current = cartItems.get();
  if (quantity < 1 || index < 0 || index >= current.length) return;
  const next = current.slice();
  next[index] = { ...next[index], quantity };
  cartItems.set(next);
}

export function removeFromCart(index: number) {
  const current = cartItems.get();
  cartItems.set(current.filter((_, i) => i !== index));
}

export function clearCart() {
  cartItems.set([]);
}

export function cartCount(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotalKes(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.priceKes, 0);
}
