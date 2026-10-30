import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { WaitlistForm } from "@/components/waitlist-form";
import { ProductImage } from "@/components/product-image";
import { CatalogueNotice } from "@/components/catalogue-notice";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { products, error } = await getProducts();
  const featured = products[0];
  return <main>
    <section className="hero"><div className="hero-topline"><span>INDEPENDENT SNEAKER CULTURE</span><span>VOL. 01 — 2026</span></div>
      <div className="hero-copy"><p className="eyebrow hero-kicker">THE NEW ROTATION</p><h1 className="hero-title"><span className="hero-line"><span>NOT MADE</span></span><span className="hero-line"><span>TO <em>BLEND</em> IN<span className="period">.</span></span></span></h1><div className="hero-bottom"><p className="hero-support">Considered silhouettes.<br />Limited releases. No unnecessary noise.</p><Link className="circle-link" href="/shop" aria-label="Explore the collection"><ArrowDownRight /></Link><span className="hero-index">001—004<br />CURATED FOR THE CURIOUS</span></div></div>
      <div className="hero-image"><ProductImage src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1800&q=88" alt="Red and white performance sneaker, photographed in a vivid studio setting" sizes="100vw" priority /><div className="image-note">OBJECT STUDY / 001<br />FORM IN MOTION</div><div className="vertical-note">SNEAKERDROP — ROTATION 001</div></div>
      <div className="hero-caption"><span>FIG. 01 / A STUDY IN MOVEMENT</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>
    <section className="collection section-wrap" id="shop"><div className="section-heading" data-reveal="rise"><div><p className="eyebrow">THE CURRENT EDIT / 001</p><h2>Chosen for<br /><em>the long run.</em></h2></div><Link href="/shop" className="text-link">VIEW ALL RELEASES <ArrowUpRight size={15}/></Link></div>
      {error ? <CatalogueNotice error={error} /> : products.length === 0 ? <div className="empty-state">The next rotation is being considered. Check back soon.</div> : <div className="product-grid">{products.slice(0, 3).map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}</div>}
    </section>
    <section className="story" id="story"><div className="story-kicker" data-reveal="rise"><span className="eyebrow">A BETTER KIND OF ROTATION</span><span className="story-count">NOTE 001 / 003</span></div><div className="story-content" data-reveal="rise"><h2>Less noise.<br /><em>More meaning.</em></h2><p>We believe the right pair doesn’t ask for attention. It earns it slowly: in the details, in the miles, in the way it becomes yours.</p><Link href="/shop" className="text-link light-link">MEET THE ROTATION <ArrowUpRight size={15}/></Link></div><div className="story-vertical">BUILT FOR THE IN-BETWEEN.</div><div className="story-bottom" data-reveal="rise"><span>AN INDEPENDENT EDIT OF OBJECTS IN MOTION.</span><span>EST. FOR THE EVERYDAY EXTRAORDINARY.</span></div></section>
    {featured && <section className="featured" id="release"><div className="featured-image"><ProductImage src={featured.image_url} alt={`${featured.name}, featured release`} sizes="(max-width: 760px) 100vw, 58vw" /><span className="featured-mark">{featured.release_code}</span></div><div className="featured-copy" data-reveal="rise"><p className="eyebrow">THE FEATURED RELEASE / {featured.release_code}</p><h2>{featured.name.split(" ").slice(0, -1).join(" ")}<br /><em>{featured.name.split(" ").slice(-1)}</em></h2><p>{featured.description}</p><div className="featured-spec"><span>PRICE</span><strong>${Number(featured.price).toFixed(0)}</strong><span>STATUS</span><strong>{featured.available ? "AVAILABLE NOW" : featured.waitlist_open ? "WAITLIST OPEN" : "UNAVAILABLE"}</strong></div><Link href={`/products/${featured.slug}`} className="button-dark">DISCOVER THE DETAILS <ArrowRight size={16}/></Link></div></section>}
      {products.some(p => p.waitlist_open) && <section className="waitlist-band"><div data-reveal="rise"><p className="eyebrow">STAY CLOSE TO THE NEXT DROP</p><h2>First word.<br /><em>First wear.</em></h2><p className="waitlist-intro">Choose a release to follow. We’ll only write when there’s something worth knowing.</p></div><div className="waitlist-picks">{products.filter(p => p.waitlist_open).slice(0, 3).map(p => <div className="waitlist-pick" key={p.id} data-reveal="rise"><div><span className="eyebrow">{p.release_code} / {p.name}</span><span>{p.available ? "Release notes & availability" : "Waitlist open"}</span></div><WaitlistForm productId={p.id} productName={p.name}/></div>)}</div></section>}
  </main>;
}
