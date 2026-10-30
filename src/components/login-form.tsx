"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type LoginStatus = "idle" | "loading" | "success" | "error";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(form: FormData) {
    setStatus("loading");
    setMessage("Checking your administrator access…");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Unable to sign in. Check your credentials and try again.");
        return;
      }
      setStatus("success");
      setMessage("Signed in. Opening the studio…");
      router.replace("/admin");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Connection problem. Please try again.");
    }
  }

  return <form action={submit} className="admin-form login-form">
    <label htmlFor="admin-email">Email address
      <input id="admin-email" name="email" type="email" required autoComplete="username" maxLength={254} disabled={status === "loading"} />
    </label>
    <label htmlFor="admin-password">Password
      <span className="password-field">
        <input id="admin-password" name="password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete="current-password" disabled={status === "loading"} />
        <button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={status === "loading"}>
          {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </span>
    </label>
    <button className="button-dark" disabled={status === "loading"}>{status === "loading" ? "CHECKING…" : "SIGN IN →"}</button>
    <p className={`form-message ${status}`} role={status === "error" ? "alert" : "status"} aria-live={status === "error" ? "assertive" : "polite"}>{message}</p>
  </form>;
}
