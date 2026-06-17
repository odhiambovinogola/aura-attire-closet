import { formatKES } from "./format";

export interface OrderItem {
  name: string;
  colour: string;
  size?: string;
  quantity: number;
  priceKes: number;
}

export function buildOrderMessage(items: OrderItem[], deliveryOption?: string): string {
  const lines = [
    "Hi Nash! I'd like to order:",
    "",
    ...items.map((item) => {
      const sizePart = item.size ? `, Size: ${item.size}` : "";
      const lineTotal = formatKES(item.priceKes * item.quantity);
      return `- ${item.name} (Colour: ${item.colour}${sizePart}, Qty: ${item.quantity}) — ${lineTotal}`;
    }),
  ];

  if (deliveryOption) {
    lines.push("", `Delivery: ${deliveryOption}`);
  }

  return lines.join("\n");
}

export function buildOrderWhatsAppUrl(
  items: OrderItem[],
  whatsappNumber: string,
  deliveryOption?: string,
): string {
  const message = buildOrderMessage(items, deliveryOption);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
