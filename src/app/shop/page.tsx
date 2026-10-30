import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { CatalogueNotice } from "@/components/catalogue-notice";

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ availability?: string; category?: string }> }) {
  const params = await searchParams;
  const filter = params.availability === "available" ? true : params.availability === "waitlist" ? false : undefined;
  const { products, error } = await getProducts({ available: filter, waitlistOpen: params.availability === "waitlist" ? true : undefined, category: params.category });
  const categories = [...new Set(products.map(p => p.category).filter((x): x is string => !!x))];
  return <main className="shop-page section-wrap"><div className="shop-hero" data-reveal="rise"><p className="eyebrow">THE CURRENT EDIT / INDEPENDENTLY SELECTED</p><h1>Find your<br /><em>next pair.</em></h1><p>Good things aren’t always loud. Explore the considered rotation.</p></div><div className="filter-bar" data-reveal="rise"><div><span className="eyebrow">FILTER BY</span><Link className={!params.availability ? "filter-active" : ""} href="/shop">All pairs</Link><Link className={params.availability === "available" ? "filter-active" : ""} href="/shop?availability=available">Available</Link><Link className={params.availability === "waitlist" ? "filter-active" : ""} href="/shop?availability=waitlist">Waitlist open</Link></div><div className="product-count">{products.length} {products.length === 1 ? "PAIR" : "PAIRS"}</div></div>{categories.length > 0 && <div className="category-filter" data-reveal="rise">{categories.map(c => <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className={params.category === c ? "filter-active" : ""}>{c}</Link>)}</div>}
    {error ? <CatalogueNotice error={error} /> : products.length ? <div className="product-grid shop-grid">{products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div> : <div className="empty-state"><h2>No pairs in this view.</h2><p>Try another filter or return to the complete edit.</p><Link className="text-link" href="/shop">CLEAR FILTERS ↗</Link></div>}
  </main>;
}
