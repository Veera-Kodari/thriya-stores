import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';

const heroSlides = [
  {
    title: '🔥 Fashion Sale is Live',
    subtitle: 'Up to 60% off on ethnic wear, fusion styles & accessories',
    cta: 'Shop Now',
    bg: 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF4500 100%)',
    accent: '#FFD700',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
  },
  {
    title: 'Ethnic Elegance',
    subtitle: 'Handcrafted sarees, lehengas & more for every occasion',
    cta: 'Shop Women',
    bg: 'linear-gradient(135deg, #2d1b69 0%, #4a1942 50%, #721b65 100%)',
    accent: '#f7c948',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop',
  },
  {
    title: 'Men\'s Edit',
    subtitle: 'From sherwanis to streetwear — style redefined',
    cta: 'Shop Men',
    bg: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
    accent: '#00d2ff',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop',
  },
];

const categories = [
  {
    name: 'Women',
    key: 'women',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop',
    desc: 'Sarees, Kurtis, Lehengas & more',
  },
  {
    name: 'Men',
    key: 'men',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop',
    desc: 'Kurtas, Shirts, Sherwanis & more',
  },
  {
    name: 'Kids',
    key: 'kids',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop',
    desc: 'Ethnic wear, Casual & Sets',
  },
];

const trustFeatures = [
  { icon: '🔒', title: 'Secure Payments', desc: '100% safe transactions' },
  { icon: '✅', title: 'Quality Checked', desc: 'Every product inspected' },
  { icon: '🔄', title: 'Easy Exchanges', desc: 'Hassle-free process' },
  { icon: '💬', title: 'WhatsApp Support', desc: 'Chat with us anytime' },
];

const megaMenuData = {
  women: [
    { heading: 'Ethnic Wear', items: [
      { label: 'Sarees', sub: 'sarees' },
      { label: 'Lehengas', sub: 'lehengas' },
      { label: 'Salwar Suits', sub: 'salwar-suits' },
      { label: 'Kurtis', sub: 'kurtis' },
    ]},
    { heading: 'Essentials', items: [
      { label: 'Blouses', sub: 'blouses' },
      { label: 'Dupattas', sub: 'dupattas' },
      { label: 'Jewellery', sub: 'jewellery' },
      { label: 'Accessories', sub: 'accessories' },
    ]},
  ],
  men: [
    { heading: 'Clothing', items: [
      { label: 'Shirts', sub: 'shirts' },
      { label: 'Kurtas', sub: 'kurtas' },
      { label: 'T-Shirts', sub: 't-shirts' },
      { label: 'Sherwanis', sub: 'sherwanis' },
      { label: 'Blazers', sub: 'blazers' },
    ]},
    { heading: 'Bottoms & More', items: [
      { label: 'Pants', sub: 'pants' },
      { label: 'Jeans', sub: 'jeans' },
      { label: 'Lungis', sub: 'lungis' },
      { label: 'Footwear', sub: 'footwear' },
    ]},
  ],
  kids: [
    { heading: 'All Kids', items: [
      { label: 'Ethnic Wear', sub: 'kids-ethnic' },
      { label: 'Casual Wear', sub: 'kids-casual' },
      { label: 'Frocks', sub: 'kids-frocks' },
      { label: 'Sets', sub: 'kids-sets' },
    ]},
  ],
};

function Home({ user, token, onLogout, wishlistIds, onToggleWishlist, onNavigate }) {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [feat, trend] = await Promise.all([
          getProducts({ limit: 8, sort: 'newest' }),
          getProducts({ limit: 8, sort: 'rating' }),
        ]);
        if (!feat.error) setFeatured(feat.products || []);
        if (!trend.error) setTrending(trend.products || []);
      } catch (e) {}
    };
    loadProducts();
  }, []);

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[heroIndex];

  const fallback = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=520&fit=crop';

  return (
    <div className="home-page">
      {/* Nav */}
      <nav className="home-nav">
        <div className="nav-left">
          <div className="brand-logo" onClick={() => navigate('/')}>
            <span className="brand-mark">T</span>
            <span className="brand-text">THRIYA</span>
          </div>
        </div>
        <div className="nav-center home-nav-links">
          {['women', 'men', 'kids'].map(cat => (
            <div key={cat} className="nav-dropdown">
              <button onClick={() => navigate(`/shop?category=${cat}`)}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
              <div className="mega-menu">
                {megaMenuData[cat].map((col, i) => (
                  <div key={i} className="mega-col">
                    <h5>{col.heading}</h5>
                    {col.items.map(item => (
                      <button key={item.sub} onClick={() => navigate(`/shop?category=${cat}&subcategory=${item.sub}`)}>{item.label}</button>
                    ))}
                  </div>
                ))}
                <div className="mega-col mega-cta">
                  <button className="mega-shop-all" onClick={() => navigate(`/shop?category=${cat}`)}>Shop All {cat.charAt(0).toUpperCase() + cat.slice(1)} →</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/shop?maxPrice=999')}>999 Store</button>
          <button onClick={() => navigate('/shop?sort=price-low')}>Sales & Offers</button>
        </div>
        <div className="nav-right">
          <button className="nav-brand-link" onClick={() => navigate('/shop')}>Thriya by Sandhya</button>
          <button className="nav-icon-btn" title="Search" onClick={() => navigate('/shop')}>🔍</button>
          <button className="nav-icon-btn" title="Wishlist" onClick={() => onNavigate?.('account-wishlist')}>
            ♡
            {wishlistIds?.length > 0 && <span className="nav-badge">{wishlistIds.length}</span>}
          </button>
          <button className="nav-icon-btn" title="My Account" onClick={() => navigate('/account')}>👤</button>
          <button className="logout-btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="hero-section" style={{ background: currentSlide.bg }}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title" style={{ '--accent': currentSlide.accent }}>{currentSlide.title}</h1>
            <p className="hero-subtitle">{currentSlide.subtitle}</p>
            <button className="hero-cta" style={{ background: currentSlide.accent }} onClick={() => navigate('/shop')}>{currentSlide.cta}</button>
          </div>
          <div className="hero-image">
            <img src={currentSlide.image} alt="" />
          </div>
        </div>
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button key={i} className={`hero-dot ${i === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(i)} style={i === heroIndex ? { background: currentSlide.accent } : {}} />
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="home-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Find your perfect style</p>
        </div>
        <div className="category-cards">
          {categories.map(cat => (
            <div key={cat.key} className="category-card" onClick={() => navigate(`/shop?category=${cat.key}`)}>
              <img src={cat.image} alt={cat.name} onError={e => { e.target.onerror = null; e.target.src = fallback; }} />
              <div className="category-card-overlay">
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="category-card-cta">Shop {cat.name} →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Just Dropped */}
      {featured.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>Just Dropped 🔥</h2>
            <button className="section-link" onClick={() => navigate('/shop')}>View All →</button>
          </div>
          <div className="home-products-scroll">
            {featured.map(p => (
              <div key={p._id} className="home-product-card" onClick={() => navigate(`/product/${p._id}`)}>
                <div className="hpc-img">
                  <img src={p.image} alt={p.name} onError={e => { e.target.onerror = null; e.target.src = fallback; }} />
                  {p.originalPrice && (
                    <span className="hpc-badge">-{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>
                  )}
                </div>
                <div className="hpc-info">
                  <span className="hpc-brand">{p.brand}</span>
                  <p className="hpc-name">{p.name}</p>
                  <div className="hpc-price-row">
                    <span className="hpc-price">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.originalPrice && <span className="hpc-mrp">₹{p.originalPrice.toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pre-Book Exclusive Styles */}
      {featured.length >= 3 && (
        <section className="prebook-section">
          <div className="prebook-content">
            <h2>✨ Pre-Book Exclusive Styles</h2>
            <p>Limited pieces, exclusive designs — Pre-book now, dispatch in 5 days</p>
            <div className="prebook-cards">
              {featured.slice(0, 3).map(p => (
                <div key={p._id} className="prebook-card" onClick={() => navigate(`/product/${p._id}`)}>
                  <div className="prebook-img">
                    <img src={p.image} alt={p.name} onError={e => { e.target.onerror = null; e.target.src = fallback; }} />
                    <span className="prebook-badge">PRE-BOOK</span>
                  </div>
                  <div className="prebook-info">
                    <p className="prebook-name">{p.name}</p>
                    <span className="prebook-price">₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated */}
      {trending.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>Top Rated ⭐</h2>
            <button className="section-link" onClick={() => navigate('/shop')}>View All →</button>
          </div>
          <div className="home-products-scroll">
            {trending.map(p => (
              <div key={p._id} className="home-product-card" onClick={() => navigate(`/product/${p._id}`)}>
                <div className="hpc-img">
                  <img src={p.image} alt={p.name} onError={e => { e.target.onerror = null; e.target.src = fallback; }} />
                  <span className="hpc-rating">★ {p.rating}</span>
                </div>
                <div className="hpc-info">
                  <span className="hpc-brand">{p.brand}</span>
                  <p className="hpc-name">{p.name}</p>
                  <div className="hpc-price-row">
                    <span className="hpc-price">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.originalPrice && <span className="hpc-mrp">₹{p.originalPrice.toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seen on Instagram */}
      {trending.length >= 6 && (
        <section className="home-section instagram-section">
          <div className="section-header">
            <h2>📸 Seen on Instagram</h2>
            <a className="section-link" href="https://www.instagram.com/thriya_by_sandhya?igsh=MTF1ZmtqeGRoaTBn" target="_blank" rel="noopener noreferrer">Follow @thriya_by_sandhya →</a>
          </div>
          <div className="insta-grid">
            {trending.slice(0, 6).map(p => (
              <div key={p._id} className="insta-card" onClick={() => navigate(`/product/${p._id}`)}>
                <img src={p.image} alt={p.name} onError={e => { e.target.onerror = null; e.target.src = fallback; }} />
                <div className="insta-overlay">
                  <span>{p.name}</span>
                  <span className="insta-price">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust Strip */}
      <section className="trust-strip">
        {trustFeatures.map((f, i) => (
          <div key={i} className="trust-item">
            <span className="trust-icon">{f.icon}</span>
            <div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="brand-logo footer-logo">
              <span className="brand-mark">T</span>
              <span className="brand-text">THRIYA</span>
            </div>
            <p>Your destination for authentic Indian fashion. Curated collections for the modern you.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <button onClick={() => navigate('/shop?category=women')}>Women</button>
            <button onClick={() => navigate('/shop?category=men')}>Men</button>
            <button onClick={() => navigate('/shop?category=kids')}>Kids</button>
            <button onClick={() => navigate('/shop?maxPrice=999')}>999 Store</button>
            <button onClick={() => navigate('/shop?sort=price-low')}>Sales & Offers</button>
            <button onClick={() => navigate('/about')}>About Us</button>
            <button onClick={() => navigate('/terms')}>Terms & Conditions</button>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <button onClick={() => navigate('/account?tab=orders')}>Track Your Order</button>
            <button onClick={() => navigate('/account')}>My Account</button>
            <span>Returns & Exchanges</span>
            <span>Contact: support@thriya.com</span>
            <span>Payments</span>
            <a href="https://wa.me/916305563286" target="_blank" rel="noopener noreferrer" className="footer-whatsapp">💬 WhatsApp Support</a>
          </div>
          <div className="footer-col">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://www.instagram.com/thriya_by_sandhya?igsh=MTF1ZmtqeGRoaTBn" target="_blank" rel="noopener noreferrer">📷 Instagram</a>
              <span>🐦 Twitter</span>
              <span>📘 Facebook</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Thriya Stores. Made with ❤️ in India.</p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/916305563286" target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Chat on WhatsApp">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.14 6.744 3.072 9.382L1.062 31.19l5.964-1.97a15.93 15.93 0 008.978 2.784C24.826 32.004 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.318 22.614c-.396 1.116-1.956 2.042-3.21 2.312-.86.182-1.98.328-5.756-1.238-4.836-2.006-7.946-6.914-8.188-7.232-.232-.318-1.952-2.598-1.952-4.958s1.232-3.516 1.672-3.996c.438-.48.958-.6 1.278-.6.318 0 .636.002.914.016.294.014.688-.112 1.076.822.396.954 1.352 3.294 1.47 3.534.12.238.198.518.04.836-.16.318-.238.518-.478.796-.238.28-.502.624-.716.838-.238.238-.486.496-.21.976.28.48 1.24 2.048 2.662 3.318 1.83 1.634 3.37 2.14 3.85 2.38.478.238.758.198 1.036-.12.28-.318 1.194-1.394 1.514-1.872.318-.48.636-.396 1.076-.238.438.16 2.796 1.318 3.274 1.558.478.238.796.358.914.558.12.198.12 1.156-.278 2.274z"/></svg>
      </a>
    </div>
  );
}

export default Home;
