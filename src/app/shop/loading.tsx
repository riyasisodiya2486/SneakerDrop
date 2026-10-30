export default function ShopLoading() {
  return <main className="shop-page section-wrap shop-loading" aria-busy="true" aria-label="Loading the sneaker catalogue">
    <div className="shop-hero"><p className="eyebrow">THE CURRENT EDIT / INDEPENDENTLY SELECTED</p><h1>Find your<br /><em>next pair.</em></h1><p>Updating the rotation…</p></div>
    <div className="filter-bar"><span className="eyebrow">UPDATING CATALOGUE</span><span className="product-count">PLEASE WAIT</span></div>
    <div className="product-grid shop-grid" aria-hidden="true">
      {[0, 1, 2].map((item) => <div className="shop-loading-card" key={item}><div className="shop-loading-image"/><div className="shop-loading-line shop-loading-line-short"/><div className="shop-loading-line"/></div>)}
    </div>
  </main>;
}
