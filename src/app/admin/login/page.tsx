import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminContext } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const context = await getAdminContext(); const params = await searchParams;
  if (context.admin) redirect("/admin");
  return <main className="login-page"><div className="login-panel"><Link href="/" className="wordmark"><span className="brand-mark">S<span>D</span></span><span>SNEAKERDROP</span><sup>®</sup></Link><p className="eyebrow">PRIVATE AREA / STUDIO ACCESS</p><h1>Behind<br /><em>the rotation.</em></h1><p className="login-intro">Sign in with an administrator account provisioned for this project.</p>{params.error === "setup" && <p className="setup-inline">Supabase is not configured yet. Follow the setup steps in README.md.</p>}{params.error === "unauthorized" && <p className="setup-inline">That account is not authorized for studio access.</p>}<LoginForm/><Link href="/" className="back-link login-back">← BACK TO SNEAKERDROP</Link></div><div className="login-art"><span>STUDIO / 001</span><div>THE WORK<br />BEHIND<br /><em>THE WALK.</em></div><small>COLLECTED WITH INTENTION</small></div></main>;
}
