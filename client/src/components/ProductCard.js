import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Fallback image by subcategory
const fallbackImages = {
  sarees: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  lehengas: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  'salwar-suits': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  kurtis: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  dupattas: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  blouses: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  kurtas: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  sherwanis: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  shirts: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  pants: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  jeans: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  lungis: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  't-shirts': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  blazers: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  footwear: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  jewellery: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  'kids-ethnic': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  'kids-casual': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  'kids-frocks': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
  'kids-sets': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=520&fit=crop',
};

const defaultFallback = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=520&fit=crop';

function ProductCard({ product, onAddToCart, onUpdateQty, onRemoveFromCart, cartQty = 0, isWishlisted, onToggleWishlist }) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imgSrc = imgError
    ? (fallbackImages[product.subcategory] || defaultFallback)
    : product.image;

  return (
    <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`} onClick={() => navigate(`/product/${product._id}`)} style={{cursor:'pointer'}}>
      {/* Image Container */}
      <div className="product-img-container">
        {!imgLoaded && <div className="img-placeholder"></div>}
        <img
          src={imgSrc}
          alt={product.name}
          className={`product-img ${imgLoaded ? 'loaded' : ''}`}
          style={{ objectFit: 'cover', width: '100%', height: '240px', borderRadius: '8px' }}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-badges">
          {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
          {!product.inStock && <span className="badge badge-oos">Sold Out</span>}
        </div>

        {/* Wishlist Heart */}
        {onToggleWishlist && (
          <button
            className={`wishlist-heart ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product._id); }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? '❤' : '♡'}
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-name">{product.name}</h3>

        {/* Price */}
        <div className="product-price-row">
          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="product-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
          {discount > 0 && (
            <span className="product-discount-text">({discount}% off)</span>
          )}
        </div>

        {/* Rating - compact */}
        <div className="product-rating">
          <span className="rating-star">★</span>
          <span className="rating-value">{product.rating}</span>
          <span className="rating-divider">|</span>
          <span className="review-count">{product.reviewCount.toLocaleString('en-IN')} reviews</span>
        </div>

        {/* Colors - subtle */}
        {product.colors && product.colors.length > 0 && (
          <p className="product-color-text">
            {product.colors.length} colour{product.colors.length > 1 ? 's' : ''}
          </p>
        )}

        {/* Add to Cart / Quantity Controls */}
        <div className="product-cart-section">
          {!product.inStock ? (
            <span className="oos-label">Currently Unavailable</span>
          ) : cartQty > 0 ? (
            <div className="card-qty-controls" onClick={e => e.stopPropagation()}>
              <button className="qty-btn" onClick={() => onUpdateQty(product._id, cartQty - 1)}>−</button>
              <span className="qty-value">{cartQty}</span>
              <button className="qty-btn" onClick={() => onUpdateQty(product._id, cartQty + 1)}>+</button>
              <button className="qty-remove" onClick={() => onRemoveFromCart(product._id)}>Remove</button>
            </div>
          ) : (
            <button className="add-cart-btn" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
