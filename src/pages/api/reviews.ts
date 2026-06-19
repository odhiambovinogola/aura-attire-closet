import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const prerender = false;

const MAX_BODY_LENGTH = 1000;
const MAX_NAME_LENGTH = 80;

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const { product_id, author_name, rating, body, website } = payload as {
    product_id?: string;
    author_name?: string;
    rating?: number;
    body?: string;
    website?: string;
  };

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots learn nothing.
  if (typeof website === "string" && website.trim() !== "") {
    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  }

  if (typeof product_id !== "string" || product_id.trim() === "") {
    return new Response(JSON.stringify({ error: "Missing product_id" }), { status: 400 });
  }

  if (typeof author_name !== "string" || author_name.trim() === "") {
    return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
  }
  if (author_name.length > MAX_NAME_LENGTH) {
    return new Response(JSON.stringify({ error: "Name is too long" }), { status: 400 });
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: "Rating must be an integer from 1 to 5" }), { status: 400 });
  }

  if (typeof body === "string" && body.length > MAX_BODY_LENGTH) {
    return new Response(JSON.stringify({ error: "Review is too long" }), { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    product_id,
    author_name: author_name.trim(),
    rating,
    body: typeof body === "string" && body.trim() !== "" ? body.trim() : null,
    is_approved: false,
  });

  if (error) {
    return new Response(JSON.stringify({ error: "Could not save the review" }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 201 });
};
