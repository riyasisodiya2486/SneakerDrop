import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getProduct } from "@/lib/data";
import { WaitlistForm } from "@/components/waitlist-form";
import { ProductImage } from "@/components/product-image";
import { CatalogueNotice } from "@/components/catalogue-notice";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { product, error } = await getProduct(slug);
  if (!product && !error) notFound();
  if (error) return <main className="section-wrap setup-page"><CatalogueNotice error={error} /></main>;
  if (!product) return <main className="section-wrap"><div className="empty-state">This release could not be loaded. Please try again.</div></main>;
  return <main className="product-detail">
    <div className="detail-image"><ProductImage src={product.image_url} alt={`${product.name} sneaker`} sizes="(max-width: 800px) 100vw, 58vw" priority/><span className="eyebrow detail-stamp">{product.release_code} / OBJECT STUDY</span></div>
    <section className="detail-copy">
      <Link href="/shop" className="back-link" data-reveal="rise"><ArrowLeft size={15}/> BACK TO THE ROTATION</Link>
      <p className="eyebrow" data-reveal="rise">{product.category || "FOOTWEAR"} / {product.release_code}</p>
      <h1 data-reveal="rise">{product.name}</h1>
      <div className="detail-price" data-reveal="rise">${Number(product.price).toFixed(0)} <span>USD</span></div>
      <p className="detail-description" data-reveal="rise">{product.description}</p>
      <div className="detail-status" data-reveal="rise"><span className={`status-marker ${product.available ? "" : "unavailable"}`}/>{product.available ? "AVAILABLE IN THE CURRENT EDIT" : "CURRENTLY UNAVAILABLE"}</div>
      <div className="detail-divider"/>
      {product.waitlist_open ? <><h2 data-reveal="rise">Keep this one in view.</h2><p className="detail-small" data-reveal="rise">Get a note when there’s news about this release. No noise, just the essentials.</p><WaitlistForm productId={product.id} productName={product.name}/></> : <p className="detail-small" data-reveal="rise">This release is not currently accepting waitlist entries.</p>}
      <Link href="/shop" className="detail-browse" data-reveal="rise">EXPLORE THE REST <ArrowRight size={15}/></Link>
    </section>
  </main>;
}
