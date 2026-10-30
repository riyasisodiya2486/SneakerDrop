import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ message: "Supabase setup is incomplete." }, { status: 503 });
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email.includes("@") || password.length < 8) return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return NextResponse.json({ message: "Sign in failed. Check your credentials and try again." }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("administrator_allowlist").select("user_id").eq("user_id", user?.id ?? "").maybeSingle();
  if (!admin) { await supabase.auth.signOut(); return NextResponse.json({ message: "This account is not on the administrator allowlist." }, { status: 403 }); }
  return NextResponse.json({ ok: true });
}
