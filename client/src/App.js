import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Shop from './components/Shop';
import MyAccount from './components/MyAccount';
import { getMe, getWishlist, toggleWishlistItem } from './services/api';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [wishlistIds, setWishlistIds] = useState([]);
  const [accountTab, setAccountTab] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [loginMessage, setLoginMessage] = useState('');

  // Restore session from stored token on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) { setLoading(false); return; }
    getMe(savedToken)
      .then((userData) => {
        if (userData && !userData.error) {
          setUser(userData);
          setToken(savedToken);
          setPage('shop');
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    setPage('shop');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setWishlistIds([]);
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setCart([]);
    setPage('login');
  };

  // After successful registration, redirect to login page
  const handleRegisterSuccess = () => {
    setLoginMessage('Account created successfully! Now login and start shopping! 🛍️');
    setPage('login');
  };

  // After successful password reset, redirect to login page
  const handleResetSuccess = () => {
    setLoginMessage('Password reset successful! Login with your shiny new password! ✨');
    setPage('login');
  };

  // Load wishlist IDs when logged in
  const loadWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getWishlist(token);
      if (Array.isArray(data)) {
        setWishlistIds(data.map((p) => p._id));
      }
    } catch (err) { /* ignore */ }
  }, [token]);

  useEffect(() => {
    if (token) loadWishlist();
  }, [token, loadWishlist]);

  const handleToggleWishlist = async (productId) => {
    if (!token) return;
    const data = await toggleWishlistItem(token, productId);
    if (Array.isArray(data)) {
      setWishlistIds(data.map((p) => p._id));
    }
  };

  const handleNavigate = (target) => {
    if (target === 'account') {
      setAccountTab(null);
      setPage('account');
    } else if (target === 'account-wishlist') {
      setAccountTab('wishlist');
      setPage('account');
    } else {
      setPage(target);
    }
  };

  // Add to cart helper for wishlist -> cart move
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const addToCartFromWishlist = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.1rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    );
  }

  if (page === 'account' && token) {
    return (
      <MyAccount
        token={token}
        user={user}
        onBack={() => setPage('shop')}
        onAddToCart={addToCartFromWishlist}
        defaultTab={accountTab}
      />
    );
  }

  if (page === 'shop' && token) {
    return (
      <Shop
        user={user}
        token={token}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
      />
    );
  }

  return (
    <div className="app">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Thriya Stores</h1>
        </div>

        <div className="tab-buttons">
          <button
            className={`tab-btn ${page === 'login' ? 'active' : ''}`}
            onClick={() => setPage('login')}
          >
            Login
          </button>
          <button
            className={`tab-btn ${page === 'register' ? 'active' : ''}`}
            onClick={() => setPage('register')}
          >
            Register
          </button>
        </div>

        {page === 'forgot-password' ? (
          <ForgotPassword
            onBack={() => setPage('login')}
            onResetSuccess={handleResetSuccess}
          />
        ) : page === 'login' ? (
          <Login
            onAuth={handleAuth}
            onSwitch={() => setPage('register')}
            onForgotPassword={() => setPage('forgot-password')}
            incomingMessage={loginMessage}
          />
        ) : (
          <Register onRegisterSuccess={handleRegisterSuccess} onSwitch={() => setPage('login')} />
        )}
      </div>
    </div>
  );
}

export default App;
