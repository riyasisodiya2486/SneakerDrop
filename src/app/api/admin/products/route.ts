import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { supabase, user, admin } = await getAdminContext();
  if (!supabase) return NextResponse.json({ message: "Database setup is incomplete." }, { status: 503 });
  if (!user || !admin) return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Please check the product fields." }, { status: 400 });
  const { data, error } = await supabase.from("products").insert(parsed.data).select().single();
  if (error) return NextResponse.json({ message: error.code === "23505" ? "That slug is already in use." : "Product could not be saved." }, { status: 400 });
  return NextResponse.json({ product: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, user, admin } = await getAdminContext();
  if (!supabase) return NextResponse.json({ message: "Database setup is incomplete." }, { status: 503 });
  if (!user || !admin) return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid product data." }, { status: 400 });
  const record = body as { id?: unknown; [key: string]: unknown };
  if (typeof record.id !== "string") return NextResponse.json({ message: "A product ID is required." }, { status: 400 });
  const { id, ...fields } = record;
  const parsed = productSchema.safeParse(fields);
  if (!parsed.success) return NextResponse.json({ message: "Please check the product fields." }, { status: 400 });
  const { data, error } = await supabase.from("products").update(parsed.data).eq("id", id).select().single();
  if (error) return NextResponse.json({ message: "Product could not be updated." }, { status: 400 });
  return NextResponse.json({ product: data });
}

export async function DELETE(request: Request) {
  const { supabase, user, admin } = await getAdminContext();
  if (!supabase) return NextResponse.json({ message: "Database setup is incomplete." }, { status: 503 });
  if (!user || !admin) return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid product data." }, { status: 400 });
  const id = (body as { id?: unknown }).id;
  if (typeof id !== "string") return NextResponse.json({ message: "A product ID is required." }, { status: 400 });
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ message: "Product could not be deleted." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
