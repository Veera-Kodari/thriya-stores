import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import Shop from './components/Shop';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import MyAccount from './components/MyAccount';
import OrderDetail from './components/OrderDetail';
import AdminPanel from './components/AdminPanel';
import { getMe, getWishlist, toggleWishlistItem } from './services/api';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [loginMessage, setLoginMessage] = useState('');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Restore session
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) { setLoading(false); return; }
    getMe(savedToken)
      .then((userData) => {
        if (userData && !userData.error) {
          setUser(userData);
          setToken(savedToken);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      })
      .catch(() => { localStorage.removeItem('token'); setToken(null); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setWishlistIds([]);
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setCart([]);
    navigate('/login');
  };

  const handleRegisterSuccess = () => {
    setLoginMessage('Account created successfully! Now login and start shopping! 🛍️');
    navigate('/login');
  };

  const handleResetSuccess = () => {
    setLoginMessage('Password reset successful! Login with your shiny new password! ✨');

    navigate('/login');
  };

  // Wishlist
  const loadWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getWishlist(token);
      if (Array.isArray(data)) setWishlistIds(data.map((p) => p._id));
    } catch (err) { /* ignore */ }
  }, [token]);

  useEffect(() => { if (token) loadWishlist(); }, [token, loadWishlist]);

  const handleToggleWishlist = async (productId) => {
    if (!token) return;
    const data = await toggleWishlistItem(token, productId);
    if (Array.isArray(data)) setWishlistIds(data.map((p) => p._id));
  };

  // Cart helpers
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) return prev.map((item) => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart((prev) => prev.map((item) => (item._id === productId ? { ...item, qty } : item)));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const handleNavigate = (target) => {
    if (target === 'account') navigate('/account');
    else if (target === 'account-wishlist') navigate('/account?tab=wishlist');
    else navigate(`/${target}`);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-brand">
          <span className="brand-mark">T</span>
          <span className="brand-text">THRIYA</span>
        </div>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  const isAuthed = !!token && !!user;

  // Auth page (login/register/forgot)
  const authPage = location.pathname;
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(authPage);

  if (!isAuthed && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthed) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-header">
            <div className="brand-logo auth-brand">
              <span className="brand-mark">T</span>
              <span className="brand-text">THRIYA</span>
            </div>
            <p className="auth-tagline">Style that speaks your soul</p>
          </div>

          <div className="tab-buttons">
            <button className={`tab-btn ${authPage === '/login' ? 'active' : ''}`} onClick={() => navigate('/login')}>Login</button>
            <button className={`tab-btn ${authPage === '/register' ? 'active' : ''}`} onClick={() => navigate('/register')}>Register</button>
          </div>

          <Routes>
            <Route path="/forgot-password" element={<ForgotPassword onBack={() => navigate('/login')} onResetSuccess={handleResetSuccess} />} />
            <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} onSwitch={() => navigate('/login')} />} />
            <Route path="/login" element={<Login onAuth={handleAuth} onSwitch={() => navigate('/register')} onForgotPassword={() => navigate('/forgot-password')} incomingMessage={loginMessage} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Authenticated routes
  return (
    <Routes>
      <Route path="/" element={<Home user={user} token={token} onLogout={handleLogout} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} onNavigate={handleNavigate} />} />
      <Route path="/shop" element={<Shop user={user} token={token} onLogout={handleLogout} onNavigate={handleNavigate} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} cart={cart} addToCart={addToCart} updateQty={updateQty} removeFromCart={removeFromCart} />} />
      <Route path="/product/:id" element={<ProductDetail token={token} cart={cart} addToCart={addToCart} updateQty={updateQty} removeFromCart={removeFromCart} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} />} />
      <Route path="/checkout" element={<Checkout token={token} cart={cart} setCart={setCart} />} />
      <Route path="/account" element={<MyAccount token={token} user={user} onBack={() => navigate('/')} onAddToCart={addToCart} />} />
      <Route path="/account/orders/:orderId" element={<OrderDetail token={token} />} />
      <Route path="/admin" element={<AdminPanel token={token} user={user} />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
