"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product, WaitlistEntry } from "@/lib/types";

type Draft = {
  name: string; slug: string; description: string; price: string; image_url: string;
  category: string; available: boolean; published: boolean; waitlist_open: boolean; release_code: string;
};
const blank: Draft = { name: "", slug: "", description: "", price: "", image_url: "", category: "Lifestyle", available: true, published: true, waitlist_open: true, release_code: "SD / 001" };
function asDraft(product: Product): Draft {
  return { name: product.name, slug: product.slug, description: product.description, price: String(product.price), image_url: product.image_url, category: product.category || "", available: product.available, published: product.published, waitlist_open: product.waitlist_open, release_code: product.release_code };
}

type Props = {
  products: Product[]; entries: WaitlistEntry[]; waitlistPage: number; waitlistPages: number;
  waitlistCount: number; productCount: number; availableCount: number; unavailableCount: number;
};

export function AdminWorkspace({ products, entries, waitlistPage, waitlistPages, waitlistCount, productCount, availableCount, unavailableCount }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (draft) {
      wasOpen.current = true;
      dialogRef.current?.querySelector<HTMLElement>('input[name="name"]')?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
      wasOpen.current = false;
    }
  }, [draft]);

  function start(product?: Product) {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setEditing(product?.id ?? null);
    setDraft(product ? asDraft(product) : { ...blank });
    setMessage("");
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); setDraft(null); return; }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  async function save(form: FormData) {
    setLoading(true);
    const body = {
      ...draft,
      ...Object.fromEntries(form),
      price: Number(form.get("price")),
      category: String(form.get("category") || "") || null,
      available: form.get("available") === "on",
      published: form.get("published") === "on",
      waitlist_open: form.get("waitlist_open") === "on",
    };
    try {
      const response = await fetch("/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...body, id: editing } : body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.message || "Unable to save this product."); return; }
      setDraft(null);
      setMessage("Product saved.");
      router.refresh();
    } catch { setMessage("Connection problem. Please try saving again."); }
    finally { setLoading(false); }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Delete “${product.name}”? Waitlist records will remain for historical reporting.`)) return;
    try {
      const response = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product.id }) });
      if (!response.ok) setMessage("Product could not be deleted.");
      else { setMessage("Product deleted."); router.refresh(); }
    } catch { setMessage("Connection problem. Please try deleting again."); }
  }

  async function logout() {
    try { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }
    catch { setMessage("Unable to sign out. Please try again."); }
  }

  const rowDelay = (index: number): CSSProperties => ({ "--reveal-delay": `${Math.min(index, 8) * 35}ms` } as CSSProperties);

  return <div className="admin-shell">
    <aside className="admin-sidebar"><span className="eyebrow">SNEAKERDROP / STUDIO</span><a href="#overview">Overview</a><a href="#products">Products</a><a href="#waitlist">Waitlist</a><button onClick={logout}>Sign out ↗</button></aside>
    <div className="admin-main">
      <div className="admin-top" data-reveal="rise"><div><p className="eyebrow">CONTROL ROOM / {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p><h1>Good morning.</h1></div><button className="button-dark" onClick={() => start()}>+ ADD A PRODUCT</button></div>
      <div className="stats-row" id="overview" data-reveal="rise"><div><span className="eyebrow">TOTAL PRODUCTS</span><strong>{productCount}</strong></div><div><span className="eyebrow">AVAILABLE</span><strong>{availableCount}</strong></div><div><span className="eyebrow">UNAVAILABLE</span><strong>{unavailableCount}</strong></div><div><span className="eyebrow">WAITLIST ENTRIES</span><strong>{waitlistCount}</strong></div></div>
      {message && <p className="admin-message" role="status">{message}</p>}
      <section className="admin-section" id="products" data-reveal="rise"><div className="admin-heading"><div><p className="eyebrow">INVENTORY / DATABASE RECORDS</p><h2>The rotation</h2></div><span>{products.length} ITEMS</span></div><div className="admin-table"><div className="admin-row admin-table-head"><span>PRODUCT</span><span>PRICE</span><span>STATUS</span><span>ACTIONS</span></div>
        {products.map((product, index) => <div className="admin-row" data-reveal="row" style={rowDelay(index)} key={product.id}><div><strong>{product.name}</strong><small>{product.release_code} · /{product.slug}</small></div><span>${Number(product.price).toFixed(0)}</span><span className={product.published ? (product.available ? "table-status" : "table-status muted") : "table-status muted"}>{!product.published ? "DRAFT" : product.available ? "AVAILABLE" : "WAITLIST"}</span><div className="table-actions"><button onClick={() => start(product)}>Edit</button><button onClick={() => remove(product)}>Delete</button></div></div>)}
        {products.length === 0 && <p className="empty-state">No products yet. Add the first release to begin.</p>}
      </div></section>
      <section className="admin-section" id="waitlist" data-reveal="rise"><div className="admin-heading"><div><p className="eyebrow">COMMUNITY / OPTED-IN CONTACTS</p><h2>Release notes</h2></div><span>{waitlistCount} SUBMISSIONS</span></div><div className="admin-table"><div className="admin-row waitlist-row admin-table-head"><span>EMAIL</span><span>PRODUCT</span><span>CONSENT</span><span>JOINED</span></div>
        {entries.map((entry, index) => <div className="admin-row waitlist-row" data-reveal="row" style={rowDelay(index)} key={entry.id}><strong>{entry.email}</strong><span>{entry.product?.name ?? "Deleted release"}</span><span>Updates accepted</span><span>{new Date(entry.created_at).toLocaleDateString()}</span></div>)}
        {entries.length === 0 && <p className="empty-state">No submissions on this page.</p>}
      </div>{waitlistPages > 1 && <div className="pagination"><span>PAGE {waitlistPage} OF {waitlistPages} · SHOWING 50 MOST RECENT PER PAGE</span><div>{waitlistPage > 1 && <Link href={`/admin?waitlist_page=${waitlistPage - 1}#waitlist`}>← NEWER</Link>}{waitlistPage < waitlistPages && <Link href={`/admin?waitlist_page=${waitlistPage + 1}#waitlist`}>OLDER →</Link>}</div></div>}</section>
      {draft && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDraft(null); }}>
        <section ref={dialogRef} className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onKeyDown={handleDialogKeyDown}>
          <button className="modal-close" onClick={() => setDraft(null)} aria-label="Close">×</button><p className="eyebrow">INVENTORY EDITOR</p><h2 id="product-modal-title">{editing ? "Edit release" : "New release"}</h2>
          <form action={save} className="admin-form product-editor">
            <label>Product name<input name="name" required minLength={2} maxLength={100} defaultValue={draft.name}/></label>
            <label>URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={draft.slug}/></label>
            <label>Description<textarea name="description" required minLength={10} maxLength={2000} defaultValue={draft.description}/></label>
            <label>Image URL<input name="image_url" type="url" required defaultValue={draft.image_url}/><small>Use an HTTPS image URL from images.unsplash.com or i.pinimg.com.</small></label>
            <div className="editor-split"><label>Price (USD)<input name="price" type="number" min="0" step="0.01" required defaultValue={draft.price}/></label><label>Category<input name="category" defaultValue={draft.category}/></label></div>
            <div className="editor-split"><label>Release code<input name="release_code" maxLength={30} defaultValue={draft.release_code}/></label><label className="check-label"><input type="checkbox" name="available" defaultChecked={draft.available}/> Available</label></div>
            <label className="check-label"><input type="checkbox" name="published" defaultChecked={draft.published}/> Published on the storefront</label>
            <label className="check-label"><input type="checkbox" name="waitlist_open" defaultChecked={draft.waitlist_open}/> Accept waitlist entries</label>
            <p className="form-message error" role="alert">{message}</p><button className="button-dark" disabled={loading}>{loading ? "SAVING…" : "SAVE RELEASE →"}</button>
          </form>
        </section>
      </div>}
    </div>
  </div>;
}
