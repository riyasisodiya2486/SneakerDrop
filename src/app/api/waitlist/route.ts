import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { waitlistSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ message: "Please check the form and try again." }, { status: 400 }); }
  const parsed = waitlistSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email and agree to receive updates for this release." }, { status: 400 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ message: "Waitlist setup is incomplete. Please try again later." }, { status: 503 });
  const { data, error } = await supabase.rpc("join_waitlist", { p_email: parsed.data.email, p_product_id: parsed.data.productId, p_consent: true });
  if (error) return NextResponse.json({ message: "We couldn’t save your request. Please try again shortly." }, { status: 503 });
  if (data === "duplicate") return NextResponse.json({ message: "You’re already on this release list." }, { status: 409 });
  if (data === "ineligible") return NextResponse.json({ message: "This release isn’t accepting waitlist entries right now." }, { status: 400 });
  return NextResponse.json({ message: "You’re on the list. We’ll keep you in the loop." }, { status: 201 });
}
