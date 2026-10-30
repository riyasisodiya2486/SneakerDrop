import { createClient, missingSupabaseVariables } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export type CatalogueError = {
  kind: "missing-config" | "permission" | "schema" | "database";
  missingVariables?: string[];
};

function classifyQueryError(context: string, error: { code?: string; message: string }): CatalogueError {
  const code = error.code ?? "UNKNOWN";
  const kind: CatalogueError["kind"] = code === "42501" || code === "PGRST301" || code === "PGRST302"
    ? "permission"
    : code === "42P01" || code === "42703" || code === "PGRST200" || code === "PGRST204" || code === "PGRST205"
      ? "schema"
      : "database";
  console.error(`[supabase] ${context} query failed`, { code, message: error.message });
  return { kind };
}

export async function getProducts(options: { available?: boolean; waitlistOpen?: boolean; category?: string } = {}) {
  const supabase = await createClient();
  if (!supabase) return { products: [] as Product[], error: { kind: "missing-config" as const, missingVariables: missingSupabaseVariables() } };
  let query = supabase.from("products").select("*").eq("published", true).order("release_code", { ascending: true });
  if (options.available !== undefined) query = query.eq("available", options.available);
  if (options.waitlistOpen !== undefined) query = query.eq("waitlist_open", options.waitlistOpen);
  if (options.category) query = query.eq("category", options.category);
  const { data, error } = await query;
  return { products: (data ?? []) as Product[], error: error ? classifyQueryError("products", error) : null };
}

export async function getProduct(slug: string) {
  const supabase = await createClient();
  if (!supabase) return { product: null, error: { kind: "missing-config" as const, missingVariables: missingSupabaseVariables() } };
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return { product: data as Product | null, error: error ? classifyQueryError("product detail", error) : null };
}
