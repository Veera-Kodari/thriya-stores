import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getProfile,
  updateProfile,
  uploadProfilePic,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlistItem,
  getOrders,
  cancelOrder,
} from '../services/api';

// Fallback images by subcategory (same as ProductCard)
const fallbackImages = {
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=520&fit=crop',
  lehengas: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=400&h=520&fit=crop',
  'salwar-suits': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
  kurtis: 'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
  dupattas: 'https://images.unsplash.com/photo-1614886137299-130f7b108f5c?w=400&h=520&fit=crop',
  blouses: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=520&fit=crop',
  kurtas: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop',
  sherwanis: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=520&fit=crop',
  shirts: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=520&fit=crop',
  pants: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=520&fit=crop',
  jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=520&fit=crop',
  lungis: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop',
  footwear: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=520&fit=crop',
  jewellery: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=520&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=520&fit=crop',
  'kids-ethnic': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
  'kids-casual': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
  'kids-frocks': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
  'kids-sets': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=520&fit=crop',
};
const defaultFallback = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=520&fit=crop';

const getProductImage = (product) => fallbackImages[product.subcategory] || defaultFallback;

// ── Validation helpers ──
const validateIndianPhone = (phone) => {
  if (!phone) return ''; // optional
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Accept: 10 digits, +91 + 10 digits, 91 + 10 digits, 0 + 10 digits
  if (/^(\+91|91|0)?[6-9]\d{9}$/.test(cleaned)) return '';
  return 'Enter a valid Indian mobile number (10 digits starting with 6-9)';
};

// eslint-disable-next-line no-unused-vars
const validateEmailField = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
};

const validatePincode = (pincode) => {
  if (!pincode) return '';
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return 'Enter a valid 6-digit Indian pincode';
  return '';
};

// Format phone: auto-prefix +91 and format as +91 XXXXX XXXXX
const formatPhoneInput = (value) => {
  // Strip the "+91 " prefix first before extracting digits to avoid doubling
  let raw = value.replace(/^\+91[\s-]?/, '');
  let digits = raw.replace(/\D/g, '');
  // Remove leading 91 or 0 country code if user typed it
  if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length > 10) digits = digits.slice(1);
  // Limit to 10 digits
  digits = digits.slice(0, 10);
  if (!digits) return '';
  if (digits.length <= 5) return `+91 ${digits}`;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const TABS = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'wishlist', label: 'Wishlist', icon: '♡' },
  { key: 'addresses', label: 'Addresses', icon: '📍' },
];

function MyAccount({ token, user, onBack, onAddToCart, defaultTab }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || defaultTab || 'profile');
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  // Profile form state
  const [form, setForm] = useState({ name: '', phone: '', gender: '', dateOfBirth: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [addrErrors, setAddrErrors] = useState({});

  // Address form state
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editAddrId, setEditAddrId] = useState(null);
  const [addrForm, setAddrForm] = useState({
    label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', isDefault: false,
  });

  useEffect(() => {
    loadTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    setMsg('');
    try {
      if (tab === 'profile') {
        const data = await getProfile(token);
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
        });
      } else if (tab === 'orders') {
        const data = await getOrders(token);
        setOrders(Array.isArray(data) ? data : []);
      } else if (tab === 'wishlist') {
        const data = await getWishlist(token);
        setWishlist(Array.isArray(data) ? data : []);
      } else if (tab === 'addresses') {
        const data = await getAddresses(token);
        setAddresses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setMsg('Failed to load data');
    }
    setLoading(false);
  };

  // ─── Profile ────────────────────────────────
  const handleProfileSave = async () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Name is required';
    const phoneErr = validateIndianPhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const data = await updateProfile(token, form);
    if (data && !data.error) {
      setProfile(data);
      setEditingProfile(false);
      setMsg('Profile updated successfully');
    } else {
      setMsg(data?.error || 'Failed to update');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setMsg('Image must be under 500KB');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setSaving(true);
      const data = await uploadProfilePic(token, base64);
      if (data && !data.error) {
        setProfile(data);
        setMsg('Profile picture updated');
      } else {
        setMsg('Failed to upload picture');
      }
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  // ─── Addresses ──────────────────────────────
  const resetAddrForm = () => {
    setAddrForm({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
    setEditAddrId(null);
    setShowAddrForm(false);
  };

  const handleAddrSave = async () => {
    const errs = {};
    if (!addrForm.fullName?.trim()) errs.fullName = 'Full name is required';
    const phoneErr = validateIndianPhone(addrForm.phone);
    if (addrForm.phone && phoneErr) errs.phone = phoneErr;
    if (!addrForm.phone?.trim()) errs.phone = 'Phone number is required';
    if (!addrForm.addressLine1?.trim()) errs.addressLine1 = 'Address is required';
    if (!addrForm.city?.trim()) errs.city = 'City is required';
    if (!addrForm.state?.trim()) errs.state = 'State is required';
    const pincodeErr = validatePincode(addrForm.pincode);
    if (!addrForm.pincode?.trim()) errs.pincode = 'Pincode is required';
    else if (pincodeErr) errs.pincode = pincodeErr;
    setAddrErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    let data;
    if (editAddrId) {
      data = await updateAddress(token, editAddrId, addrForm);
    } else {
      data = await addAddress(token, addrForm);
    }
    if (Array.isArray(data)) {
      setAddresses(data);
      resetAddrForm();
      setMsg(editAddrId ? 'Address updated' : 'Address added');
    } else {
      setMsg(data?.error || 'Failed to save address');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAddrEdit = (addr) => {
    setAddrForm({
      label: addr.label, fullName: addr.fullName, phone: addr.phone,
      addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || '',
      city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault,
    });
    setEditAddrId(addr._id);
    setShowAddrForm(true);
  };

  const handleAddrDelete = async (id) => {
    const data = await deleteAddress(token, id);
    if (Array.isArray(data)) {
      setAddresses(data);
      setMsg('Address removed');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  // ─── Wishlist ───────────────────────────────
  const handleRemoveWishlist = async (productId) => {
    const data = await toggleWishlistItem(token, productId);
    if (Array.isArray(data)) setWishlist(data);
  };

  // ─── Orders ─────────────────────────────────
  const handleCancelOrder = async (orderId) => {
    const data = await cancelOrder(token, orderId);
    if (data && !data.error) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      setMsg('Order cancelled');
    } else {
      setMsg(data?.error || 'Failed to cancel');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const getStatusColor = (status) => {
    const colors = { placed: '#e67e22', confirmed: '#2980b9', shipped: '#8e44ad', delivered: '#27ae60', cancelled: '#c0392b' };
    return colors[status] || '#888';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="account-page">
      {/* Header */}
      <div className="account-header">
        <button className="account-back" onClick={() => navigate('/')}>← Back to Home</button>
        <h2>My Account</h2>
        {user?.role === 'admin' && <button className="admin-link-btn" onClick={() => navigate('/admin')}>🔐 Admin Panel</button>}
      </div>

      {msg && <div className="account-msg">{msg}</div>}

      <div className="account-body">
        {/* Sidebar Tabs */}
        <aside className="account-sidebar">
          <div className="account-user-brief">
            <div className="account-avatar" onClick={() => { setActiveTab('profile'); fileRef.current?.click(); }}>
              {profile?.profilePic ? (
                <img src={profile.profilePic} alt="Profile" />
              ) : (
                <span>{getInitials(profile?.name || user?.name)}</span>
              )}
              <div className="avatar-edit-badge">📷</div>
            </div>
            <p className="account-user-name">{profile?.name || user?.name}</p>
            <p className="account-user-email">{profile?.email || user?.email}</p>
          </div>
          <nav className="account-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`account-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="tab-icon">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="account-main">
          {loading ? (
            <div className="account-loading">Loading...</div>
          ) : (
            <>
              {/* ─── PROFILE TAB ─── */}
              {activeTab === 'profile' && profile && (
                <div className="account-section">
                  <div className="section-header">
                    <h3>Personal Information</h3>
                    {!editingProfile && (
                      <button className="edit-btn" onClick={() => setEditingProfile(true)}>Edit</button>
                    )}
                  </div>
                  <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />

                  <div className="profile-pic-section">
                    <div className="profile-pic-large" onClick={() => fileRef.current?.click()}>
                      {profile.profilePic ? (
                        <img src={profile.profilePic} alt="Profile" />
                      ) : (
                        <span className="pic-initials">{getInitials(profile.name)}</span>
                      )}
                      <div className="pic-overlay">Change Photo</div>
                    </div>
                    <p className="pic-hint">Click to upload (max 500KB)</p>
                  </div>

                  {editingProfile ? (
                    <div className="profile-form">
                      <div className={`form-row ${formErrors.name ? 'has-error' : ''}`}>
                        <label>Full Name</label>
                        <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }} />
                        {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                      </div>
                      <div className="form-row">
                        <label>Email</label>
                        <input value={profile.email} disabled className="input-disabled" />
                      </div>
                      <div className={`form-row ${formErrors.phone ? 'has-error' : ''}`}>
                        <label>Phone</label>
                        <input
                          value={form.phone}
                          onChange={(e) => {
                            const formatted = formatPhoneInput(e.target.value);
                            setForm({ ...form, phone: formatted });
                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                          }}
                          onBlur={() => {
                            const err = validateIndianPhone(form.phone);
                            if (err) setFormErrors({ ...formErrors, phone: err });
                          }}
                          placeholder="+91 XXXXX XXXXX"
                          maxLength={16}
                        />
                        {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                      </div>
                      <div className="form-row">
                        <label>Gender</label>
                        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Date of Birth</label>
                        <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                      </div>
                      <div className="form-actions">
                        <button className="save-btn" onClick={handleProfileSave} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingProfile(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-info-grid">
                      <div className="info-item"><span className="info-label">Name</span><span className="info-value">{profile.name}</span></div>
                      <div className="info-item"><span className="info-label">Email</span><span className="info-value">{profile.email}</span></div>
                      <div className="info-item"><span className="info-label">Phone</span><span className="info-value">{profile.phone || 'Not set'}</span></div>
                      <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'}</span></div>
                      <div className="info-item"><span className="info-label">Date of Birth</span><span className="info-value">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : 'Not set'}</span></div>
                      <div className="info-item"><span className="info-label">Member Since</span><span className="info-value">{new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span></div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── ORDERS TAB ─── */}
              {activeTab === 'orders' && (
                <div className="account-section">
                  <div className="section-header"><h3>My Orders</h3></div>
                  {orders.length === 0 ? (
                    <div className="empty-section">
                      <span className="empty-icon">📦</span>
                      <h4>No orders yet</h4>
                      <p>Your order history will appear here</p>
                      <button className="shop-now-btn" onClick={onBack}>Start Shopping</button>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders.map((order) => (
                        <div key={order._id} className="order-card">
                          <div className="order-top">
                            <div>
                              <span className="order-number">#{order.orderNumber}</span>
                              <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <span className="order-status" style={{ background: getStatusColor(order.status) }}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="order-items">
                            {order.items.map((item, i) => (
                              <div key={i} className="order-item">
                                <img src={item.image} alt={item.name} className="order-item-img" onError={(e) => { e.target.onerror = null; e.target.src = defaultFallback; }} />
                                <div className="order-item-info">
                                  <p className="order-item-name">{item.name}</p>
                                  <p className="order-item-meta">Qty: {item.qty} × ₹{item.price?.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="order-bottom">
                            <span className="order-total">Total: ₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                            <div className="order-actions">
                              <button className="track-order-btn" onClick={() => navigate(`/account/orders/${order._id}`)}>Track Order →</button>
                              {!['delivered', 'cancelled'].includes(order.status) && (
                                <button className="cancel-order-btn" onClick={() => handleCancelOrder(order._id)}>Cancel</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── WISHLIST TAB ─── */}
              {activeTab === 'wishlist' && (
                <div className="account-section">
                  <div className="section-header"><h3>My Wishlist ({wishlist.length})</h3></div>
                  {wishlist.length === 0 ? (
                    <div className="empty-section">
                      <span className="empty-icon">♡</span>
                      <h4>Your wishlist is empty</h4>
                      <p>Save items you love for later</p>
                      <button className="shop-now-btn" onClick={onBack}>Browse Products</button>
                    </div>
                  ) : (
                    <div className="wishlist-grid">
                      {wishlist.map((product) => (
                        <div key={product._id} className="wishlist-card">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="wishlist-img"
                            onError={(e) => { e.target.onerror = null; e.target.src = getProductImage(product); }}
                          />
                          <div className="wishlist-info">
                            <p className="wishlist-brand">{product.brand}</p>
                            <h4 className="wishlist-name">{product.name}</h4>
                            <div className="wishlist-price">
                              <span className="wishlist-current">₹{product.price?.toLocaleString('en-IN')}</span>
                              {product.originalPrice > product.price && (
                                <span className="wishlist-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            <div className="wishlist-actions">
                              <button className="wishlist-cart-btn" onClick={() => { onAddToCart(product); handleRemoveWishlist(product._id); }}>
                                Move to Cart
                              </button>
                              <button className="wishlist-remove-btn" onClick={() => handleRemoveWishlist(product._id)}>✕</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── ADDRESSES TAB ─── */}
              {activeTab === 'addresses' && (
                <div className="account-section">
                  <div className="section-header">
                    <h3>Saved Addresses</h3>
                    {!showAddrForm && (
                      <button className="edit-btn" onClick={() => { resetAddrForm(); setShowAddrForm(true); }}>+ Add Address</button>
                    )}
                  </div>

                  {showAddrForm && (
                    <div className="addr-form">
                      <h4>{editAddrId ? 'Edit Address' : 'Add New Address'}</h4>
                      <div className="addr-form-grid">
                        <div className="form-row">
                          <label>Label</label>
                          <select value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}>
                            <option>Home</option>
                            <option>Work</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className={`form-row ${addrErrors.fullName ? 'has-error' : ''}`}>
                          <label>Full Name *</label>
                          <input value={addrForm.fullName} onChange={(e) => { setAddrForm({ ...addrForm, fullName: e.target.value }); if (addrErrors.fullName) setAddrErrors({ ...addrErrors, fullName: '' }); }} />
                          {addrErrors.fullName && <span className="field-error">{addrErrors.fullName}</span>}
                        </div>
                        <div className={`form-row ${addrErrors.phone ? 'has-error' : ''}`}>
                          <label>Phone *</label>
                          <input
                            value={addrForm.phone}
                            onChange={(e) => {
                              const formatted = formatPhoneInput(e.target.value);
                              setAddrForm({ ...addrForm, phone: formatted });
                              if (addrErrors.phone) setAddrErrors({ ...addrErrors, phone: '' });
                            }}
                            onBlur={() => {
                              const err = validateIndianPhone(addrForm.phone);
                              if (err) setAddrErrors({ ...addrErrors, phone: err });
                            }}
                            placeholder="+91 XXXXX XXXXX"
                            maxLength={16}
                          />
                          {addrErrors.phone && <span className="field-error">{addrErrors.phone}</span>}
                        </div>
                        <div className={`form-row full ${addrErrors.addressLine1 ? 'has-error' : ''}`}>
                          <label>Address Line 1 *</label>
                          <input value={addrForm.addressLine1} onChange={(e) => { setAddrForm({ ...addrForm, addressLine1: e.target.value }); if (addrErrors.addressLine1) setAddrErrors({ ...addrErrors, addressLine1: '' }); }} placeholder="House/Flat No., Street" />
                          {addrErrors.addressLine1 && <span className="field-error">{addrErrors.addressLine1}</span>}
                        </div>
                        <div className="form-row full">
                          <label>Address Line 2</label>
                          <input value={addrForm.addressLine2} onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })} placeholder="Landmark (optional)" />
                        </div>
                        <div className={`form-row ${addrErrors.city ? 'has-error' : ''}`}>
                          <label>City *</label>
                          <input value={addrForm.city} onChange={(e) => { setAddrForm({ ...addrForm, city: e.target.value }); if (addrErrors.city) setAddrErrors({ ...addrErrors, city: '' }); }} />
                          {addrErrors.city && <span className="field-error">{addrErrors.city}</span>}
                        </div>
                        <div className={`form-row ${addrErrors.state ? 'has-error' : ''}`}>
                          <label>State *</label>
                          <input value={addrForm.state} onChange={(e) => { setAddrForm({ ...addrForm, state: e.target.value }); if (addrErrors.state) setAddrErrors({ ...addrErrors, state: '' }); }} />
                          {addrErrors.state && <span className="field-error">{addrErrors.state}</span>}
                        </div>
                        <div className={`form-row ${addrErrors.pincode ? 'has-error' : ''}`}>
                          <label>Pincode *</label>
                          <input
                            value={addrForm.pincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setAddrForm({ ...addrForm, pincode: val });
                              if (addrErrors.pincode) setAddrErrors({ ...addrErrors, pincode: '' });
                            }}
                            onBlur={() => {
                              const err = validatePincode(addrForm.pincode);
                              if (err) setAddrErrors({ ...addrErrors, pincode: err });
                            }}
                            placeholder="6-digit pincode"
                            maxLength={6}
                          />
                          {addrErrors.pincode && <span className="field-error">{addrErrors.pincode}</span>}
                        </div>
                        <div className="form-row checkbox-row">
                          <label>
                            <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                            Set as default address
                          </label>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button className="save-btn" onClick={handleAddrSave} disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
                        <button className="cancel-btn" onClick={resetAddrForm}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {addresses.length === 0 && !showAddrForm ? (
                    <div className="empty-section">
                      <span className="empty-icon">📍</span>
                      <h4>No saved addresses</h4>
                      <p>Add your delivery address for faster checkout</p>
                      <button className="shop-now-btn" onClick={() => setShowAddrForm(true)}>Add Address</button>
                    </div>
                  ) : (
                    <div className="addr-grid">
                      {addresses.map((addr) => (
                        <div key={addr._id} className={`addr-card ${addr.isDefault ? 'default' : ''}`}>
                          <div className="addr-card-top">
                            <span className="addr-label">{addr.label}</span>
                            {addr.isDefault && <span className="addr-default-badge">Default</span>}
                          </div>
                          <p className="addr-name">{addr.fullName}</p>
                          <p className="addr-line">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="addr-line">{addr.addressLine2}</p>}
                          <p className="addr-line">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="addr-phone">Phone: {addr.phone}</p>
                          <div className="addr-actions">
                            <button className="addr-edit-btn" onClick={() => handleAddrEdit(addr)}>Edit</button>
                            <button className="addr-delete-btn" onClick={() => handleAddrDelete(addr._id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default MyAccount;
