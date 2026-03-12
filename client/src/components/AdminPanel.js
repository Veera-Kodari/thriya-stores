import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats, getAdminOrders, updateOrderStatus,
  getAdminUsers, createAdminProduct, updateAdminProduct, deleteAdminProduct
} from '../services/api';

const ORDER_STATUSES = ['placed','confirmed','shipped','out_for_delivery','delivered','cancelled','returned'];
const CATEGORIES = ['men','women','kids'];
const SUBCATEGORIES = [
  'sarees','lehengas','salwar-suits','kurtis','dupattas','blouses',
  'kurtas','sherwanis','shirts','pants','jeans','lungis',
  'footwear','jewellery','accessories',
  'kids-ethnic','kids-casual','kids-frocks','kids-sets'
];

function AdminPanel({ token, user }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [actionMsg, setActionMsg] = useState('');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [pForm, setPForm] = useState({
    name:'', description:'', price:'', originalPrice:'', category:'men',
    subcategory:'kurtas', brand:'', image:'', sizes:'S,M,L,XL', colors:'',
    tags:'', featured: false, inStock: true
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadTab(tab);
  }, [tab, token]); // eslint-disable-line

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'overview') {
        const data = await getAdminStats(token);
        if (!data.error) setStats(data);
      } else if (t === 'orders') {
        await fetchOrders();
      } else if (t === 'users') {
        const data = await getAdminUsers(token);
        if (Array.isArray(data)) setUsers(data);
      }
    } catch(e) {}
    setLoading(false);
  };

  const fetchOrders = async (pg = 1, status = orderFilter) => {
    const data = await getAdminOrders(token, pg, 20, status);
    if (!data.error) {
      setOrders(data.orders || []);
      setTotalOrders(data.total || 0);
      setOrderPage(pg);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const note = window.prompt(`Note for status "${newStatus}" (optional):`);
    const data = await updateOrderStatus(token, orderId, newStatus, note || '');
    if (!data.error) {
      setActionMsg(`Order updated to ${newStatus}`);
      fetchOrders(orderPage, orderFilter);
    } else {
      setActionMsg(data.error);
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const resetProductForm = () => {
    setPForm({ name:'', description:'', price:'', originalPrice:'', category:'men', subcategory:'kurtas', brand:'', image:'', sizes:'S,M,L,XL', colors:'', tags:'', featured:false, inStock:true });
    setEditProduct(null);
    setShowProductForm(false);
  };

  const handleProductSubmit = async () => {
    const payload = {
      ...pForm,
      price: Number(pForm.price),
      originalPrice: pForm.originalPrice ? Number(pForm.originalPrice) : undefined,
      sizes: pForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: pForm.colors.split(',').map(s => s.trim()).filter(Boolean),
      tags: pForm.tags.split(',').map(s => s.trim()).filter(Boolean),
    };
    let data;
    if (editProduct) {
      data = await updateAdminProduct(token, editProduct._id, payload);
    } else {
      data = await createAdminProduct(token, payload);
    }
    if (data.error) {
      setActionMsg(data.error);
    } else {
      setActionMsg(editProduct ? 'Product updated!' : 'Product created!');
      resetProductForm();
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleDeleteProduct = async (productId, productName) => { // eslint-disable-line no-unused-vars
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    const data = await deleteAdminProduct(token, productId);
    if (!data.error) {
      setActionMsg('Product deleted');
      loadTab('overview');
    } else setActionMsg(data.error);
    setTimeout(() => setActionMsg(''), 3000);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <span className="empty-icon">🔒</span>
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <button className="submit-btn" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <h2>Admin Panel</h2>
        </div>
        <span className="admin-user">👤 {user.name}</span>
      </div>

      {actionMsg && <div className="admin-action-msg">{actionMsg}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview','orders','products','users'].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 Overview' : t === 'orders' ? '📦 Orders' : t === 'products' ? '🏷️ Products' : '👥 Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner"></div><p>Loading...</p></div>
      ) : (
        <div className="admin-content">
          {/* OVERVIEW */}
          {tab === 'overview' && stats && (
            <div className="admin-overview">
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon">👥</span><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
                <div className="stat-card"><span className="stat-icon">🏷️</span><h3>{stats.totalProducts}</h3><p>Total Products</p></div>
                <div className="stat-card"><span className="stat-icon">📦</span><h3>{stats.totalOrders}</h3><p>Total Orders</p></div>
                <div className="stat-card revenue"><span className="stat-icon">💰</span><h3>₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</h3><p>Total Revenue</p></div>
              </div>
              {stats.ordersByStatus && (
                <div className="status-breakdown">
                  <h4>Orders by Status</h4>
                  <div className="status-chips">
                    {stats.ordersByStatus.map(s => (
                      <span key={s._id} className={`status-chip ${s._id}`}>{s._id}: {s.count}</span>
                    ))}
                  </div>
                </div>
              )}
              {stats.recentOrders?.length > 0 && (
                <div className="recent-orders-admin">
                  <h4>Recent Orders</h4>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {stats.recentOrders.map(o => (
                          <tr key={o._id}>
                            <td>#{o._id.slice(-6).toUpperCase()}</td>
                            <td>{o.user?.name || 'N/A'}</td>
                            <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                            <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                            <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="admin-orders">
              <div className="admin-orders-filter">
                <select value={orderFilter} onChange={e => { setOrderFilter(e.target.value); fetchOrders(1, e.target.value); }}>
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="order-count">{totalOrders} orders</span>
              </div>
              {orders.length === 0 ? (
                <p className="admin-empty">No orders found</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td>#{o._id.slice(-6).toUpperCase()}</td>
                          <td>{o.user?.name || 'N/A'}</td>
                          <td>{o.items?.length || 0}</td>
                          <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                          <td>{o.paymentMethod}</td>
                          <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                          <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <select value="" onChange={e => { if (e.target.value) handleUpdateStatus(o._id, e.target.value); }} className="status-select">
                              <option value="">Update →</option>
                              {ORDER_STATUSES.filter(s => s !== o.status).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalOrders > 20 && (
                <div className="admin-pagination">
                  <button disabled={orderPage <= 1} onClick={() => fetchOrders(orderPage-1)}>← Prev</button>
                  <span>Page {orderPage}</span>
                  <button disabled={orderPage * 20 >= totalOrders} onClick={() => fetchOrders(orderPage+1)}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <div className="admin-products">
              {!showProductForm ? (
                <button className="admin-add-btn" onClick={() => { resetProductForm(); setShowProductForm(true); }}>+ Add New Product</button>
              ) : (
                <div className="admin-product-form">
                  <h4>{editProduct ? 'Edit Product' : 'Add New Product'}</h4>
                  <div className="apf-grid">
                    <input placeholder="Product Name *" value={pForm.name} onChange={e => setPForm({...pForm, name: e.target.value})} />
                    <input placeholder="Brand *" value={pForm.brand} onChange={e => setPForm({...pForm, brand: e.target.value})} />
                    <input placeholder="Price *" type="number" value={pForm.price} onChange={e => setPForm({...pForm, price: e.target.value})} />
                    <input placeholder="Original Price (MRP)" type="number" value={pForm.originalPrice} onChange={e => setPForm({...pForm, originalPrice: e.target.value})} />
                    <select value={pForm.category} onChange={e => setPForm({...pForm, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={pForm.subcategory} onChange={e => setPForm({...pForm, subcategory: e.target.value})}>
                      {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="Image URL" value={pForm.image} onChange={e => setPForm({...pForm, image: e.target.value})} className="apf-full" />
                    <input placeholder="Sizes (comma-separated)" value={pForm.sizes} onChange={e => setPForm({...pForm, sizes: e.target.value})} />
                    <input placeholder="Colors (comma-separated)" value={pForm.colors} onChange={e => setPForm({...pForm, colors: e.target.value})} />
                    <input placeholder="Tags (comma-separated)" value={pForm.tags} onChange={e => setPForm({...pForm, tags: e.target.value})} className="apf-full" />
                    <textarea placeholder="Description *" value={pForm.description} onChange={e => setPForm({...pForm, description: e.target.value})} className="apf-full" rows={3} />
                    <label className="apf-check"><input type="checkbox" checked={pForm.featured} onChange={e => setPForm({...pForm, featured: e.target.checked})} /> Featured</label>
                    <label className="apf-check"><input type="checkbox" checked={pForm.inStock} onChange={e => setPForm({...pForm, inStock: e.target.checked})} /> In Stock</label>
                  </div>
                  <div className="apf-actions">
                    <button className="submit-btn" onClick={handleProductSubmit}>{editProduct ? 'Update Product' : 'Create Product'}</button>
                    <button className="submit-btn outline" onClick={resetProductForm}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="admin-users">
              <h4>{users.length} Users</h4>
              {users.length === 0 ? (
                <p className="admin-empty">No users found</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || '-'}</td>
                          <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                          <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
