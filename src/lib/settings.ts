import { supabase } from "./supabase";
import type { SiteSettings } from "./types";

const defaults: SiteSettings = {
  id: 1,
  hero_tagline: "One closet, endless OOTD's.",
  hero_subcopy:
    "Elegant dresses, sets, jumpsuits, bags and shoes — I personally curate every piece. Pick your colour and size, then message me directly on WhatsApp.",
  about_body:
    "I'm Nash, and Aura Attire Closet is my Nairobi-based closet of elegant dresses, two-piece sets, jumpsuits, bags and shoes — curating since 2024, with customers all across Kenya, not just Nairobi.\n\nEvery piece is picked with one idea in mind: an endless wardrobe of outfits-of-the-day for the woman who wants to feel put together without overthinking it. I personally select each item, and you can chat with me directly about sizing, styling, or anything else before you order.\n\nAura Attire Closet started on WhatsApp and social media, and that personal, message-me-directly feel carries through here — browse the shop, pick your colour and size, and send your order straight to me.",
  instagram_url: "https://instagram.com/aura_attire_closet",
  facebook_url: "https://facebook.com/StyleWithnash",
  tiktok_url: "#",
  shop_address: null,
  maps_url: "#",
  hero_image_path: null,
  about_image_path: null,
  updated_at: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return defaults;
    return data as SiteSettings;
  } catch {
    return defaults;
  }
}
