import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top"><Link href="/" className="wordmark"><span className="brand-mark">S<span>D</span></span><span>SNEAKERDROP</span><sup>®</sup></Link><p>Good shoes change the way<br />you move through a room.</p><Link className="footer-link" href="/shop">Find your next pair <ArrowUpRight size={15}/></Link></div><div className="footer-bottom"><span>INDEPENDENTLY CURATED · EST. 2024</span><span>© SNEAKERDROP 2026</span><Link href="/admin/login">STUDIO LOGIN ↗</Link></div></footer>;
}
