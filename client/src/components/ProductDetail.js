import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProductReviews, addProductReview, getRelatedProducts } from '../services/api';

const fallbackImages = {
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=520&fit=crop',
  lehengas: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=520&fit=crop',
  'salwar-suits': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
  kurtis: 'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
  kurtas: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop',
  sherwanis: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=520&fit=crop',
  shirts: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=520&fit=crop',
  pants: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=520&fit=crop',
  jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=520&fit=crop',
  footwear: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=520&fit=crop',
  jewellery: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=520&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=520&fit=crop',
  'kids-ethnic': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
  'kids-casual': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
  'kids-frocks': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
  'kids-sets': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
};
const defaultFallback = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=520&fit=crop';

function ProductDetail({ token, cart, addToCart, updateQty, removeFromCart, wishlistIds, onToggleWishlist, onLogout, onNavigate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setImgError(false);
      try {
        const [prod, revs, rel] = await Promise.all([
          getProduct(id),
          getProductReviews(id),
          getRelatedProducts(id),
        ]);
        if (prod.error) {
          setProduct(null);
        } else {
          setProduct(prod);
          if (prod.sizes?.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors?.length > 0) setSelectedColor(prod.colors[0]);
        }
        setReviews(Array.isArray(revs) ? revs : []);
        setRelated(Array.isArray(rel) ? rel : []);
      } catch (err) {
        setProduct(null);
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddReview = async () => {
    if (!token) return;
    setReviewLoading(true);
    setReviewMsg('');
    try {
      const data = await addProductReview(token, id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      if (data.error) {
        setReviewMsg(data.error);
      } else {
        setReviews([data, ...reviews.filter(r => r.user?._id !== data.user?._id)]);
        setShowReviewForm(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewMsg('Review submitted!');
        // Refresh product data for updated rating
        const updated = await getProduct(id);
        if (!updated.error) setProduct(updated);
      }
    } catch (err) {
      setReviewMsg('Failed to submit review');
    }
    setReviewLoading(false);
    setTimeout(() => setReviewMsg(''), 3000);
  };

  const cartItem = product ? cart.find(item => item._id === product._id) : null;
  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imgSrc = product ? (imgError ? (fallbackImages[product.subcategory] || defaultFallback) : product.image) : '';
  const isWishlisted = product && wishlistIds?.includes(product._id);

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-loading">
          <div className="pd-skeleton-img"></div>
          <div className="pd-skeleton-info">
            <div className="skeleton-text" style={{width:'60%',height:24}}></div>
            <div className="skeleton-text" style={{width:'40%',height:18,marginTop:12}}></div>
            <div className="skeleton-text" style={{width:'30%',height:28,marginTop:16}}></div>
            <div className="skeleton-text" style={{width:'100%',height:80,marginTop:20}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-page"><div className="pd-not-found">
        <span className="empty-icon">😕</span>
        <h3>Product not found</h3>
        <button className="submit-btn" onClick={() => navigate('/shop')}>Back to Shop</button>
      </div></div>
    );
  }

  return (
    <div className="pd-page">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <button onClick={() => navigate('/shop')}>Shop</button>
        <span>/</span>
        <span>{product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pd-content">
        {/* Image Section */}
        <div className="pd-image-section">
          return (
            <div className="pd-page">
              {/* Nav Bar (copied from Home.js) */}
              <nav className="home-nav">
                <div className="nav-left">
                  <div className="brand-logo" onClick={() => navigate('/')}> <span className="brand-mark">T</span> <span className="brand-text">THRIYA</span> </div>
                </div>
                <div className="nav-center home-nav-links">
                  <button onClick={() => navigate('/shop?category=women')}>Women</button>
                  <button onClick={() => navigate('/shop?category=men')}>Men</button>
                  <button onClick={() => navigate('/shop?category=kids')}>Kids</button>
                  <button onClick={() => navigate('/shop?maxPrice=999')}>999 Store</button>
                  <button onClick={() => navigate('/shop?sort=price-low')}>Sales & Offers</button>
                </div>
                <div className="nav-right">
                  <button className="nav-brand-link" onClick={() => navigate('/shop')}>Thriya by Sandhya</button>
                  <button className="nav-icon-btn" title="Search" onClick={() => navigate('/shop')}>🔍</button>
                  <button className="nav-icon-btn" title="Wishlist" onClick={() => onNavigate?.('account-wishlist')}> ♡ </button>
                  <button className="nav-icon-btn" title="My Account" onClick={() => navigate('/account')}>👤</button>
                  <button className="logout-btn-sm" onClick={onLogout}>Logout</button>
                </div>
              </nav>

              {/* Breadcrumb */}
              <div className="pd-breadcrumb">
                <button onClick={() => navigate('/shop')}>Shop</button>
                <span>/</span>
                <span>{product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}</span>
                <span>/</span>
                <span>{product.name}</span>
              </div>

              <div className="pd-content">
                {/* Image Section */}
                <div className="pd-image-section">
                  <div className="pd-main-image">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      onError={() => setImgError(true)}
                    />
                    {discount > 0 && <span className="pd-discount-badge">-{discount}%</span>}
                    {!product.inStock && <div className="pd-oos-overlay">Sold Out</div>}
                  </div>
                  {onToggleWishlist && (
                    <button
                      className={`pd-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={() => onToggleWishlist(product._id)}
                    >
                      {isWishlisted ? '❤ Wishlisted' : '♡ Add to Wishlist'}
                    </button>
                  )}
                </div>

                {/* Info Section */}
                <div className="pd-info-section">
                  <span className="pd-brand">{product.brand}</span>
                  <h1 className="pd-name">{product.name}</h1>

                  {/* Rating */}
                  <div className="pd-rating">
                    <div className="pd-stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`pd-star ${s <= Math.round(product.rating) ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                    <span className="pd-rating-value">{product.rating}</span>
                    <span className="pd-review-count">({product.reviewCount} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="pd-price-section">
                    <span className="pd-price">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice && (
                      <span className="pd-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                    {discount > 0 && <span className="pd-discount-text">{discount}% off</span>}
                  </div>

                  <p className="pd-tax-info">Inclusive of all taxes</p>

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="pd-option-section">
                      <h4>Select Size</h4>
                      <div className="pd-size-options">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            className={`pd-size-btn ${selectedSize === size ? 'active' : ''}`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="pd-option-section">
                      <h4>Select Color</h4>
                      <div className="pd-color-options">
                        {product.colors.map(color => (
                          <button
                            key={color}
                            className={`pd-color-btn ${selectedColor === color ? 'active' : ''}`}
                            onClick={() => setSelectedColor(color)}
                            title={color}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <div className="pd-cart-section">
                    {!product.inStock ? (
                      <button className="pd-cart-btn disabled" disabled>Out of Stock</button>
                    ) : cartItem ? (
                      <div className="pd-qty-controls">
                        <button className="qty-btn" onClick={() => updateQty(product._id, cartItem.qty - 1)}>−</button>
                        <span className="qty-value">{cartItem.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(product._id, cartItem.qty + 1)}>+</button>
                        <button className="qty-remove" onClick={() => removeFromCart(product._id)}>Remove</button>
                      </div>
                    ) : (
                      <button className="pd-cart-btn" onClick={() => addToCart({ ...product, selectedSize, selectedColor })}>
                        Add to Cart
                      </button>
                    )}
                    <button className="pd-buy-btn" onClick={() => {
                      if (product.inStock && !cartItem) addToCart({ ...product, selectedSize, selectedColor });
                      navigate('/checkout');
                    }} disabled={!product.inStock}>
                      Buy Now
                    </button>
                  </div>

                  {/* Description */}
                  <div className="pd-description">
                    <h4>Product Details</h4>
                    <p>{product.description}</p>
                    {product.tags && product.tags.length > 0 && (
                      <div className="pd-tags">
                        {product.tags.map((tag, i) => <span key={i} className="pd-tag">{tag}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pd-reviews-section">
                <div className="pd-reviews-header">
                  <h3>Customer Reviews ({reviews.length})</h3>
                  {token && (
                    <button className="pd-write-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                      {showReviewForm ? 'Cancel' : '✎ Write a Review'}
                    </button>
                  )}
                </div>

                {reviewMsg && <div className="pd-review-msg">{reviewMsg}</div>}

                {showReviewForm && (
                  <div className="pd-review-form">
                    <div className="pd-review-stars-input">
                      <label>Your Rating:</label>
                      <div className="pd-star-selector">
                        {[1,2,3,4,5].map(s => (
                          <span
                            key={s}
                            className={`pd-star-select ${s <= reviewRating ? 'filled' : ''}`}
                            onClick={() => setReviewRating(s)}
                          >★</span>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Review title (optional)"
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Write your review..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                    />
                    <button className="submit-btn" onClick={handleAddReview} disabled={reviewLoading}>
                      Submit Review
                    </button>
                  </div>
                )}

                {reviews.length === 0 && <div className="pd-no-reviews">No reviews yet.</div>}

                {reviews.map((r, i) => (
                  <div key={i} className="pd-review">
                    <div className="pd-review-header">
                      <span className="pd-review-user">{r.user?.name || 'Anonymous'}</span>
                      <span className="pd-review-rating">★ {r.rating}</span>
                      <span className="pd-review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="pd-review-title">{r.title}</h4>
                    <p className="pd-review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pd-related-section">
          <h3>You Might Also Like</h3>
          <div className="pd-related-grid">
            {related.map(p => (
              <div key={p._id} className="pd-related-card" onClick={() => navigate(`/product/${p._id}`)}>
                <img src={p.image} alt={p.name} onError={e => { e.target.onerror = null; e.target.src = fallbackImages[p.subcategory] || defaultFallback; }} />
                <div className="pd-related-info">
                  <span className="pd-related-brand">{p.brand}</span>
                  <p className="pd-related-name">{p.name}</p>
                  <span className="pd-related-price">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
