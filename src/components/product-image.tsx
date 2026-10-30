"use client";
import Image from "next/image";
import { useState } from "react";
export function ProductImage({ src, alt, sizes, priority = false }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="image-fallback" role="img" aria-label={alt}><span>IMAGE UNAVAILABLE</span><strong>SD</strong></div> : <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onError={() => setFailed(true)} style={{ objectFit: "cover" }} />;
}
