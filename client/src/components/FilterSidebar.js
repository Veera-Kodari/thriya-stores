import React from 'react';

const subcategoryLabels = {
  kurtas: '🧥 Kurtas',
  shirts: '👔 Shirts',
  pants: '👖 Pants',
  sherwanis: '🤵 Sherwanis',
  lungis: '🩱 Lungis & Dhotis',
  jeans: '👖 Jeans',
  sarees: '🥻 Sarees',
  lehengas: '👗 Lehengas',
  'salwar-suits': '👘 Salwar Suits',
  kurtis: '👚 Kurtis',
  dupattas: '🧣 Dupattas',
  blouses: '👚 Blouses',
  'kids-ethnic': '🧒 Kids Ethnic',
  'kids-casual': '👶 Kids Casual',
  'kids-frocks': '👧 Kids Frocks',
  'kids-sets': '🧒 Kids Sets',
  footwear: '👟 Footwear',
  jewellery: '💍 Jewellery',
  accessories: '⌚ Accessories',
};

function FilterSidebar({
  show,
  onClose,
  filterOptions,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  clearFilters,
  activeCategory,
}) {
  const { brands, subcategories, priceRange: pRange } = filterOptions;

  return (
    <aside className={`filter-sidebar ${show ? 'open' : ''}`}>
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="filter-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Category Subcategories */}
      <div className="filter-section">
        <h4 className="filter-title">Category</h4>
        <div className="filter-options">
          <button
            className={`filter-option ${!selectedSubcategory ? 'active' : ''}`}
            onClick={() => setSelectedSubcategory('')}
          >
            All Categories
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              className={`filter-option ${selectedSubcategory === sub ? 'active' : ''}`}
              onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? '' : sub)}
            >
              {subcategoryLabels[sub] || sub}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4 className="filter-title">Price Range</h4>
        <div className="price-range-display">
          <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
          <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
        </div>
        <div className="price-sliders">
          <input
            type="range"
            min={Math.floor(pRange.minPrice)}
            max={Math.ceil(pRange.maxPrice)}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
            }}
            className="price-slider"
          />
          <input
            type="range"
            min={Math.floor(pRange.minPrice)}
            max={Math.ceil(pRange.maxPrice)}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
            }}
            className="price-slider"
          />
        </div>
        <div className="price-presets">
          <button onClick={() => setPriceRange([0, 999])}>Under ₹999</button>
          <button onClick={() => setPriceRange([999, 2999])}>₹999 - ₹2,999</button>
          <button onClick={() => setPriceRange([2999, 5999])}>₹2,999 - ₹5,999</button>
          <button onClick={() => setPriceRange([5999, Math.ceil(pRange.maxPrice)])}>₹5,999+</button>
        </div>
      </div>

      {/* Brands */}
      <div className="filter-section">
        <h4 className="filter-title">Brands</h4>
        <div className="filter-options">
          <button
            className={`filter-option ${!selectedBrand ? 'active' : ''}`}
            onClick={() => setSelectedBrand('')}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              className={`filter-option ${selectedBrand === brand ? 'active' : ''}`}
              onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      <div className="filter-footer">
        <button className="clear-all-btn" onClick={clearFilters}>
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}

export default FilterSidebar;
