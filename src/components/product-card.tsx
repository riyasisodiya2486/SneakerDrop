import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return <article className={`product-card product-card-${index % 3}`} data-reveal="rise" style={{ "--reveal-delay": `${Math.min(index % 3, 3) * 90}ms` } as CSSProperties}>
    <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={`View ${product.name}`}>
      <div className="product-image"><ProductImage src={product.image_url} alt={`${product.name} sneaker`} sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw" />
      <span className={`availability ${product.available ? "is-available" : "is-waitlist"}`}>{product.available ? "AVAILABLE" : product.waitlist_open ? "JOIN THE WAITLIST" : "UNAVAILABLE"}</span>
      <span className="image-index">{product.release_code}</span></div>
    </Link>
    <div className="product-meta"><div><p className="eyebrow">{product.category || "FOOTWEAR"}</p><Link className="product-title-link" href={`/products/${product.slug}`}><h3>{product.name}</h3></Link></div><span className="price">${Number(product.price).toFixed(0)}</span></div>
    <p className="product-description">{product.description}</p>
    <Link className="card-action" href={`/products/${product.slug}`}>VIEW RELEASE <ArrowUpRight size={14} aria-hidden="true" /></Link>
  </article>;
}
