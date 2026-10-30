"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  function handleMenuKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && open) {
      setOpen(false);
      menuButton.current?.focus();
    }
  }

  return <header className={`site-header${scrolled ? " is-scrolled" : ""}`} onKeyDown={handleMenuKeyDown}>
    <Link href="/" className="wordmark" aria-label="SneakerDrop home"><span className="brand-mark">S<span>D</span></span><span>SNEAKERDROP</span><sup>®</sup></Link>
    <nav className="desktop-nav" aria-label="Main navigation"><Link href="/shop" aria-current={pathname === "/shop" ? "page" : undefined}>Shop</Link><Link href="/#story">The journal</Link><Link href="/#release">Release 001 <span className="live-dot" /></Link><Link href="/admin/login">Admin login</Link></nav>
    <Link className="header-cta" href="/shop">Explore the drop <ArrowUpRight size={14} /></Link>
    <button ref={menuButton} className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X /> : <Menu />}</button>
    <nav id="mobile-navigation" className={`mobile-nav${open ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>
      <Link onClick={() => setOpen(false)} href="/shop" aria-current={pathname === "/shop" ? "page" : undefined}>Shop the collection</Link>
      <Link onClick={() => setOpen(false)} href="/#story">The journal</Link>
      <Link onClick={() => setOpen(false)} href="/#release">Release 001</Link>
      <Link onClick={() => setOpen(false)} href="/admin/login">Admin login</Link>
    </nav>
  </header>;
}
