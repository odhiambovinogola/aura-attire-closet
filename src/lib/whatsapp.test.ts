import { describe, it, expect } from "vitest";
import { buildOrderMessage, buildOrderWhatsAppUrl, type OrderItem } from "./whatsapp";

describe("buildOrderMessage", () => {
  it("renders a single item with name, colour, size and quantity", () => {
    const items: OrderItem[] = [
      { name: "Elegant Dress", colour: "Red", size: "M", quantity: 2, priceKes: 2000 },
    ];
    const message = buildOrderMessage(items);
    expect(message).toContain("Elegant Dress");
    expect(message).toContain("Colour: Red");
    expect(message).toContain("Size: M");
    expect(message).toContain("Qty: 2");
  });

  it("lists multiple items and sums their line totals correctly", () => {
    const items: OrderItem[] = [
      { name: "Elegant Dress", colour: "Red", quantity: 1, priceKes: 2000 },
      { name: "Bodycon Dress", colour: "Black", size: "L", quantity: 2, priceKes: 1300 },
    ];
    const message = buildOrderMessage(items);
    expect(message).toContain("Elegant Dress");
    expect(message).toContain("Bodycon Dress");
    expect(message).toContain("KES 2,000");
    expect(message).toContain("KES 2,600");
  });

  it("omits the size segment when no size is given", () => {
    const items: OrderItem[] = [{ name: "Shoulder Bag", colour: "Brown", quantity: 1, priceKes: 1400 }];
    const message = buildOrderMessage(items);
    expect(message).not.toContain("Size:");
  });

  it("includes the delivery option when provided", () => {
    const items: OrderItem[] = [{ name: "Elegant Dress", colour: "Red", quantity: 1, priceKes: 2000 }];
    const message = buildOrderMessage(items, "Pickup Mtaani");
    expect(message).toContain("Delivery: Pickup Mtaani");
  });

  it("omits the delivery line when no delivery option is given", () => {
    const items: OrderItem[] = [{ name: "Elegant Dress", colour: "Red", quantity: 1, priceKes: 2000 }];
    const message = buildOrderMessage(items);
    expect(message).not.toContain("Delivery:");
  });
});

describe("buildOrderWhatsAppUrl", () => {
  it("encodes the message into a wa.me URL, preserving spaces and newlines", () => {
    const items: OrderItem[] = [{ name: "Elegant Dress", colour: "Red", quantity: 1, priceKes: 2000 }];
    const url = buildOrderWhatsAppUrl(items, "254712345678", "Bolt rider");
    expect(url).toMatch(/^https:\/\/wa\.me\/254712345678\?text=/);

    const encodedText = url.split("?text=")[1];
    const decoded = decodeURIComponent(encodedText);
    expect(decoded).toContain("\n");
    expect(decoded).toContain("Elegant Dress");
    expect(decoded).toContain("Bolt rider");
  });

  it("produces an empty-cart message that still builds a valid (if pointless) URL", () => {
    const url = buildOrderWhatsAppUrl([], "254712345678");
    expect(url).toContain("wa.me/254712345678");
  });
});
