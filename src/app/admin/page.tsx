import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { AdminWorkspace } from "@/components/admin-workspace";
import type { Product, WaitlistEntry } from "@/lib/types";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ waitlist_page?: string }> }) {
  const params = await searchParams;
  const waitlistPage = Math.max(1, Number.parseInt(params.waitlist_page ?? "1", 10) || 1);
  const pageSize = 50;
  const { supabase, user, admin } = await getAdminContext();
  if (!supabase) redirect("/admin/login?error=setup");
  if (!user) redirect("/admin/login");
  if (!admin) redirect("/admin/login?error=unauthorized");
  const [{ data: products, error: productError }, { data: entries, count, error: waitlistError }, { count: totalProducts, error: totalError }, { count: availableProducts, error: availableError }, { count: unavailableProducts, error: unavailableError }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("waitlist_entries").select("id,email,created_at,product_id,product:products(name,slug)", { count: "exact" }).order("created_at", { ascending: false }).range((waitlistPage - 1) * pageSize, waitlistPage * pageSize - 1),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("available", true).eq("published", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("available", false).eq("published", true),
  ]);
  if (productError || waitlistError || totalError || availableError || unavailableError) return <main className="admin-page section-wrap"><div className="empty-state"><h1>Studio data is unavailable.</h1><p>Refresh the page in a moment. No database details were exposed.</p></div></main>;
  return <main className="admin-page"><AdminWorkspace products={(products ?? []) as Product[]} entries={(entries ?? []) as unknown as WaitlistEntry[]} waitlistPage={waitlistPage} waitlistPages={Math.max(1, Math.ceil((count ?? 0) / pageSize))} waitlistCount={count ?? 0} productCount={totalProducts ?? 0} availableCount={availableProducts ?? 0} unavailableCount={unavailableProducts ?? 0} /></main>;
}
