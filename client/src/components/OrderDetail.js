import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';

const statusSteps = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
const statusLabels = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};
const statusIcons = {
  placed: '📋',
  confirmed: '✅',
  shipped: '🚚',
  out_for_delivery: '🏍️',
  delivered: '📦',
  cancelled: '❌',
  returned: '↩️',
};

function OrderDetail({ token }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getProfile(token);
        if (data.orders) {
          const found = data.orders.find(o => o._id === orderId);
          setOrder(found || null);
        }
      } catch (e) {
        setOrder(null);
      }
      setLoading(false);
    };
    if (token) fetchOrder();
  }, [token, orderId]);

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="od-loading">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="od-not-found">
          <span className="empty-icon">📦</span>
          <h3>Order not found</h3>
          <button className="submit-btn" onClick={() => navigate('/account')}>Back to My Account</button>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isReturned = order.status === 'returned';
  const currentStepIndex = isCancelled || isReturned ? -1 : statusSteps.indexOf(order.status);

  const historyMap = {};
  if (order.statusHistory) {
    order.statusHistory.forEach(h => {
      historyMap[h.status] = h;
    });
  }

  const orderDate = new Date(order.createdAt);
  const estDelivery = new Date(orderDate);
  estDelivery.setDate(estDelivery.getDate() + 7);

  return (
    <div className="order-detail-page">
      <div className="od-header">
        <button className="back-btn" onClick={() => navigate('/account')}>← Back</button>
        <h2>Order Details</h2>
      </div>

      {/* Order ID Card */}
      <div className="od-id-card">
        <div className="od-id-row">
          <span className="od-label">Order ID</span>
          <span className="od-value">#{order._id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="od-id-row">
          <span className="od-label">Placed on</span>
          <span className="od-value">{orderDate.toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</span>
        </div>
        <div className="od-id-row">
          <span className="od-label">Payment</span>
          <span className="od-value">{order.paymentMethod === 'COD' ? '💰 Cash on Delivery' : '💳 Online'}</span>
        </div>
        <div className="od-id-row">
          <span className="od-label">Status</span>
          <span className={`od-status-badge ${order.status}`}>{statusLabels[order.status] || order.status}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="od-timeline-section">
        <h3>Order Timeline</h3>
        {isCancelled || isReturned ? (
          <div className="od-timeline">
            <div className="od-timeline-step cancelled">
              <div className="od-step-icon">{statusIcons[order.status]}</div>
              <div className="od-step-info">
                <h4>{statusLabels[order.status]}</h4>
                {historyMap[order.status] && (
                  <>
                    <p className="od-step-date">{new Date(historyMap[order.status].timestamp).toLocaleString('en-IN')}</p>
                    {historyMap[order.status].note && <p className="od-step-note">{historyMap[order.status].note}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="od-timeline">
            {statusSteps.map((s, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const histItem = historyMap[s];
              return (
                <div key={s} className={`od-timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="od-step-line">
                    <div className="od-step-dot"></div>
                    {i < statusSteps.length - 1 && <div className="od-step-connector"></div>}
                  </div>
                  <div className="od-step-info">
                    <div className="od-step-header">
                      <span className="od-step-emoji">{statusIcons[s]}</span>
                      <h4>{statusLabels[s]}</h4>
                    </div>
                    {histItem ? (
                      <>
                        <p className="od-step-date">{new Date(histItem.timestamp).toLocaleString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                        {histItem.note && <p className="od-step-note">{histItem.note}</p>}
                      </>
                    ) : (
                      !isCompleted && i === currentStepIndex + 1 && (
                        <p className="od-step-est">Expected by {estDelivery.toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</p>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="od-items-section">
        <h3>Items ({order.items.length})</h3>
        <div className="od-items-list">
          {order.items.map((item, i) => (
            <div key={i} className="od-item" onClick={() => item.product && navigate(`/product/${typeof item.product === 'object' ? item.product._id : item.product}`)}>
              <img src={item.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'} alt={item.name} className="od-item-img" onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'; }} />
              <div className="od-item-info">
                <p className="od-item-name">{item.name}</p>
                <p className="od-item-meta">
                  {item.size && `Size: ${item.size}`}{item.color && ` | Color: ${item.color}`}
                </p>
                <p className="od-item-qty">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
              </div>
              <span className="od-item-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      {order.shippingAddress && (
        <div className="od-address-section">
          <h3>Delivery Address</h3>
          <div className="od-address-card">
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            {order.shippingAddress.phone && <p>📞 {order.shippingAddress.phone}</p>}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="od-price-section">
        <h3>Price Details</h3>
        <div className="od-price-rows">
          <div className="od-price-row"><span>Subtotal</span><span>₹{(order.totalAmount - (order.totalAmount >= 999 ? 0 : 79)).toLocaleString('en-IN')}</span></div>
          <div className="od-price-row"><span>Delivery</span><span className={order.totalAmount >= 999 ? 'free-ship' : ''}>{order.totalAmount >= 999 ? 'FREE' : '₹79'}</span></div>
          <div className="od-price-row total"><span>Total</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span></div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
