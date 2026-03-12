import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';

const heroSlides = [
  {
    title: 'New Season Arrivals',
    subtitle: 'Discover the latest trends in Indian fashion',
    cta: 'Shop Now',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: '#e94560',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
  },
  {
    title: 'Ethnic Elegance',
    subtitle: 'Handcrafted sarees, lehengas & more for every occasion',
    cta: 'Explore Collection',
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

const features = [
  { icon: '🚚', title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
  { icon: '💰', title: 'Cash on Delivery', desc: 'Pay at your doorstep' },
  { icon: '🔒', title: 'Secure Shopping', desc: '100% safe & trusted' },
];

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
          <button onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => navigate('/shop?category=women')}>Women</button>
          <button onClick={() => navigate('/shop?category=men')}>Men</button>
          <button onClick={() => navigate('/shop?category=kids')}>Kids</button>
        </div>
        <div className="nav-right">
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

      {/* Trust Features */}
      <section className="features-strip">
        {features.map((f, i) => (
          <div key={i} className="feature-item">
            <span className="feature-icon">{f.icon}</span>
            <div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
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
                <span className="category-card-cta">Explore →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
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

      {/* Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>🎉 Grand Indian Fashion Sale</h2>
          <p>Up to 60% off on ethnic wear, fusion styles & accessories</p>
          <button className="promo-cta" onClick={() => navigate('/shop')}>Shop the Sale</button>
        </div>
      </section>

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
            <button onClick={() => navigate('/shop')}>Shop All</button>
            <button onClick={() => navigate('/shop?category=women')}>Women</button>
            <button onClick={() => navigate('/shop?category=men')}>Men</button>
            <button onClick={() => navigate('/shop?category=kids')}>Kids</button>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <button onClick={() => navigate('/account')}>My Account</button>
            <button onClick={() => navigate('/account')}>My Orders</button>
            <span>Contact: support@thriya.com</span>
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
    </div>
  );
}

export default Home;
