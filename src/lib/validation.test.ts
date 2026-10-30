import test from "node:test";
import assert from "node:assert/strict";
import { productSchema, waitlistSchema } from "./validation.ts";

test("waitlist email is trimmed and normalized", () => {
  const result = waitlistSchema.safeParse({ email: "  Person@Example.COM ", productId: "82d47030-36ce-4f43-a7c8-fce9a028185b", consent: true });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "person@example.com");
});

test("waitlist rejects malformed email, product IDs and missing consent", () => {
  const productId = "82d47030-36ce-4f43-a7c8-fce9a028185b";
  assert.equal(waitlistSchema.safeParse({ email: "bad", productId, consent: true }).success, false);
  assert.equal(waitlistSchema.safeParse({ email: "person@example.com", productId: "not-a-uuid", consent: true }).success, false);
  assert.equal(waitlistSchema.safeParse({ email: "person@example.com", productId, consent: false }).success, false);
});

test("product validation rejects a negative price and malformed slug", () => {
  const product = { name: "Sample Sneaker", slug: "Sample Sneaker", description: "A considered shoe for the everyday rotation.", price: -1, image_url: "https://images.unsplash.com/photo-sample", category: "Lifestyle", available: true, published: true, waitlist_open: true };
  assert.equal(productSchema.safeParse(product).success, false);
  assert.equal(productSchema.safeParse({ ...product, slug: "sample-sneaker", price: 150 }).success, true);
});

test("product image validation allows configured HTTPS image hosts only", () => {
  const product = { name: "Sample Sneaker", slug: "sample-sneaker", description: "A considered shoe for the everyday rotation.", price: 150, image_url: "https://i.pinimg.com/1200x/sample.jpg", category: "Lifestyle", available: true, published: true, waitlist_open: true };
  assert.equal(productSchema.safeParse(product).success, true);
  assert.equal(productSchema.safeParse({ ...product, image_url: "http://i.pinimg.com/1200x/sample.jpg" }).success, false);
  assert.equal(productSchema.safeParse({ ...product, image_url: "https://example.com/sample.jpg" }).success, false);
});
