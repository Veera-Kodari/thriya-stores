import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, getFilterOptions, getSearchSuggestions } from '../services/api';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';

function Shop({ user, token, onLogout, onNavigate, wishlistIds, onToggleWishlist, cart: cartProp, addToCart: addToCartProp, updateQty: updateQtyProp, removeFromCart: removeFromCartProp }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [cart, setCart] = useState(() => {
    if (cartProp) return cartProp;
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  // Search autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef(null);
  const suggestTimer = useRef(null);

  // Sync cart from props
  useEffect(() => { if (cartProp) setCart(cartProp); }, [cartProp]);

  // Init category from URL params
  const urlCategory = searchParams.get('category');

  // Filters state
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    subcategories: [],
    priceRange: { minPrice: 0, maxPrice: 500 },
  });

  // Fetch filter options when category changes
  useEffect(() => {
    const fetchFilters = async () => {
      const category = activeCategory === 'all' ? '' : activeCategory;
      const data = await getFilterOptions(category);
      if (!data.error) {
        setFilterOptions(data);
        setPriceRange([data.priceRange.minPrice, data.priceRange.maxPrice]);
      }
    };
    fetchFilters();
  }, [activeCategory]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: perPage, sort };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (search) params.search = search;
      if (selectedSubcategory) params.subcategory = selectedSubcategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < filterOptions.priceRange.maxPrice) params.maxPrice = priceRange[1];

      const data = await getProducts(params);
      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (err) {
      setError('Failed to load products');
    }
    setLoading(false);
  }, [page, perPage, sort, activeCategory, search, selectedSubcategory, selectedBrand, priceRange, filterOptions.priceRange.maxPrice]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const data = await getSearchSuggestions(query);
      if (data.products || data.brands) {
        setSuggestions([...(data.products || []).slice(0,5), ...(data.brands || []).map(b => ({ _type: 'brand', name: b }))]);
        setShowSuggestions(true);
      }
    } catch(e) {}
  };

  const handleSearchInputChange = (val) => {
    setSearchInput(val);
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setShowSuggestions(false);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSelectedSubcategory('');
    setSelectedBrand('');
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedSubcategory('');
    setSelectedBrand('');
    setSearch('');
    setSearchInput('');
    setPriceRange([filterOptions.priceRange.minPrice, filterOptions.priceRange.maxPrice]);
    setSort('newest');
    setPage(1);
  };

  const addToCart = addToCartProp || ((product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) return prev.map((item) => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  });

  const removeFromCart = removeFromCartProp || ((productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  });

  const updateQty = updateQtyProp || ((productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart((prev) => prev.map((item) => (item._id === productId ? { ...item, qty } : item)));
  });

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const [showCart, setShowCart] = useState(false);

  const hasActiveFilters = selectedSubcategory || selectedBrand || search ||
    priceRange[0] > filterOptions.priceRange.minPrice ||
    priceRange[1] < filterOptions.priceRange.maxPrice;

  return (
    <div className="shop-layout">
      {/* Top Navigation Bar */}
      <nav className="shop-nav">
        <div className="nav-left">
          <div className="brand-logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
            <span className="brand-mark">T</span>
            <span className="brand-text">THRIYA</span>
          </div>
        </div>
        <div className="nav-center" ref={suggestRef}>
          <form className="search-form" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="search-input"
            />
            {searchInput && (
              <button type="button" className="search-clear" onClick={() => { setSearchInput(''); setSearch(''); setSuggestions([]); setShowSuggestions(false); setPage(1); }}>
                ✕
              </button>
            )}
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((s, i) => s._type === 'brand' ? (
                <button key={'b'+i} className="suggestion-item brand" onClick={() => { setSearchInput(s.name); setSearch(s.name); setShowSuggestions(false); setPage(1); }}>
                  <span className="sug-icon">🏷️</span> {s.name}
                  <span className="sug-type">Brand</span>
                </button>
              ) : (
                <button key={s._id} className="suggestion-item" onClick={() => { setShowSuggestions(false); navigate(`/product/${s._id}`); }}>
                  <img src={s.image} alt="" className="sug-img" onError={e => { e.target.style.display = 'none'; }} />
                  <div className="sug-info"><span className="sug-name">{s.name}</span><span className="sug-price">₹{s.price?.toLocaleString('en-IN')}</span></div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="nav-right">
          <button className="nav-icon-btn" title="Wishlist" onClick={() => onNavigate && onNavigate('account-wishlist')}>
            ♡
            {wishlistIds && wishlistIds.length > 0 && <span className="nav-badge">{wishlistIds.length}</span>}
          </button>
          <button className="nav-icon-btn" title="My Account" onClick={() => navigate('/account')}>
            👤
          </button>
          <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
            🛒
            {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
          </button>
          <button className="logout-btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Category Tabs */}
      <div className="category-bar">
        <div className="category-tabs">
          {['all', 'men', 'women', 'kids'].map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat === 'all' ? 'All' : cat === 'men' ? 'Men' : cat === 'women' ? 'Women' : 'Kids'}
            </button>
          ))}
        </div>
        <div className="category-actions">
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="name-az">Name: A → Z</option>
            <option value="name-za">Name: Z → A</option>
          </select>
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            ☰ Filters {hasActiveFilters && <span className="filter-dot"></span>}
          </button>
        </div>
      </div>

      <div className="shop-body">
        {/* Filter Sidebar */}
        <FilterSidebar
          show={showFilters}
          onClose={() => setShowFilters(false)}
          filterOptions={filterOptions}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={(v) => { setSelectedSubcategory(v); setPage(1); }}
          selectedBrand={selectedBrand}
          setSelectedBrand={(v) => { setSelectedBrand(v); setPage(1); }}
          priceRange={priceRange}
          setPriceRange={(v) => { setPriceRange(v); setPage(1); }}
          clearFilters={clearFilters}
          activeCategory={activeCategory}
        />

        {/* Main content */}
        <main className="shop-main">
          {/* Results info bar */}
          <div className="results-bar">
            <span className="results-count">
              {total > 0 ? (
                <>Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total} product{total !== 1 ? 's' : ''}</>
              ) : (
                <>0 products found</>
              )}
              {search && <span className="results-search"> for "{search}"</span>}
            </span>
            <div className="results-bar-right">
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>Clear all filters</button>
              )}
              <div className="per-page-select">
                <label>Show:</label>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-text shorter"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="shop-error">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={fetchProducts}>Try Again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <span className="empty-icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const cartItem = cart.find((item) => item._id === product._id);
                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={addToCart}
                    onUpdateQty={updateQty}
                    onRemoveFromCart={removeFromCart}
                    cartQty={cartItem ? cartItem.qty : 0}
                    isWishlisted={wishlistIds && wishlistIds.includes(product._id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (() => {
            const SIBLING = 1;
            const range = [];
            const left = Math.max(2, page - SIBLING);
            const right = Math.min(pages - 1, page + SIBLING);

            range.push(1);
            if (left > 2) range.push('...');
            for (let i = left; i <= right; i++) range.push(i);
            if (right < pages - 1) range.push('...');
            if (pages > 1) range.push(pages);

            return (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Prev
                </button>
                <div className="page-numbers">
                  {range.map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`page-num ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
                <button
                  className="page-btn"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <>
          <div className="cart-overlay" onClick={() => setShowCart(false)}></div>
          <div className="cart-drawer">
            <div className="cart-header">
              <h2>Shopping Cart ({totalCartItems})</h2>
              <button className="cart-close" onClick={() => setShowCart(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <span>🛒</span>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item._id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=520&fit=crop'; }} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p className="cart-item-brand">{item.brand}</p>
                        <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                        </div>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item._id)}>🗑️</button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <span className="cart-total-price">₹{totalCartPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <button className="checkout-btn" onClick={() => { setShowCart(false); navigate('/checkout'); }}>Proceed to Checkout</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Shop;
