function CategorySection({ categoriesLoading, shopCategories, catalogError, catalogLoading, loadCatalog, categoryImageFallbacks, setCategory, scrollTo }) {
  return (
    <section className="categories section" id="categories">
      <div className="section-head center">
        <span className="eyebrow">SHOP BY CATEGORY</span>
        <h2>Find the Perfect Cake for Every Occasion</h2>
      </div>
      <div className="category-grid">
        {categoriesLoading && shopCategories.length === 0 ? (
          <div className="empty">Loading categories...</div>
        ) : shopCategories.length === 0 ? (
          <div className="empty">
            {catalogError && !catalogLoading ? (
              <>
                <p>{catalogError}</p>
                <button type="button" className="btn secondary" onClick={loadCatalog}>Retry</button>
              </>
            ) : (
              "Categories will appear once cakes are published."
            )}
          </div>
        ) : shopCategories.map(({ name, image: img }) => (
          <button key={name} className="category-card" onClick={() => { setCategory(name); scrollTo("cakes"); }}>
            <img src={img || categoryImageFallbacks[name] || categoryImageFallbacks["Birthday Cakes"]} alt={name} loading="lazy" width="600" height="400" /><span>{name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
