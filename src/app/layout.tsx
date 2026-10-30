import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionObserver } from "@/components/motion-observer";

export const metadata: Metadata = { title: "SneakerDrop — Considered by design", description: "An independent edit of premium sneakers and the people who move in them." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning><MotionObserver /><SiteHeader />{children}<SiteFooter /></body></html>;
}
