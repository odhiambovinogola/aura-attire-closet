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
