"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function WaitlistForm({ productId, productName }: { productId: string; productName: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  async function submit(formData: FormData) {
    if (submitting.current) return;
    submitting.current = true;
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email"), productId, consent: formData.get("consent") === "on" }) });
      const result = await response.json().catch(() => ({}));
      if (response.ok) { setStatus("success"); setMessage(`You’re on the ${productName} waitlist. We’ll keep you updated.`); }
      else if (response.status === 409) { setStatus("duplicate"); setMessage(result.message || "You are already on this release list."); }
      else { setStatus("error"); setMessage(result.message || "We could not save that. Please try again."); }
    } catch { setStatus("error"); setMessage("Connection problem. Please try again."); }
    finally { submitting.current = false; }
  }
  return <form className="waitlist-form" action={submit}>
    <label htmlFor={`email-${productId}`}>Email address</label>
    <div className="waitlist-input"><input id={`email-${productId}`} name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} disabled={status === "loading" || status === "success"} /><button aria-label={`Join waitlist for ${productName}`} type="submit" disabled={status === "loading" || status === "success"}>{status === "success" ? <Check /> : <ArrowRight />}</button></div>
    <label className="consent"><input type="checkbox" name="consent" required disabled={status === "loading" || status === "success"} /><span>Send me release updates for {productName}. I can unsubscribe anytime.</span></label>
    <p className={`form-message ${status}`} role="status" aria-live="polite">{status === "loading" ? "Adding you to the release list…" : message}</p>
  </form>;
}
