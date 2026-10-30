export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category: string | null;
  available: boolean;
  published: boolean;
  waitlist_open: boolean;
  release_code: string;
  created_at?: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  created_at: string;
  product_id: string;
  product: Pick<Product, "name" | "slug"> | null;
};
