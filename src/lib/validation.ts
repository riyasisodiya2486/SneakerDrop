import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().finite().nonnegative().max(100000),
  image_url: z.string().trim().url().max(1000).refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && ["images.unsplash.com", "i.pinimg.com"].includes(parsed.hostname);
    }
    catch { return false; }
  }, "Use an HTTPS image URL from images.unsplash.com or i.pinimg.com."),
  category: z.string().trim().max(60).nullable().optional(),
  available: z.boolean(),
  published: z.boolean(),
  waitlist_open: z.boolean().default(true),
  release_code: z.string().trim().max(30).default("SD / 001"),
});

export const waitlistSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  productId: z.string().uuid(),
  consent: z.literal(true),
});
