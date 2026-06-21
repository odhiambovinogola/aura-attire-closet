export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  storage_path: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price_kes: number;
  description: string | null;
  colours: string[];
  sizes: string[];
  is_published: boolean;
  is_featured: boolean;
  product_images?: ProductImage[];
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  body: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: 1;
  hero_tagline: string;
  hero_subcopy: string;
  about_body: string;
  instagram_url: string;
  instagram_followers: number;
  facebook_url: string;
  tiktok_url: string;
  shop_address: string | null;
  maps_url: string;
  hero_image_path: string | null;
  about_image_path: string | null;
  updated_at: string;
}
