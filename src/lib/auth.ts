import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, admin: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, admin: false };
  const { data } = await supabase.from("administrator_allowlist").select("user_id").eq("user_id", user.id).maybeSingle();
  return { supabase, user, admin: !!data };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  if (!context.supabase) redirect("/admin/login?error=setup");
  if (!context.user) redirect("/admin/login");
  if (!context.admin) redirect("/admin/login?error=unauthorized");
  return context;
}
