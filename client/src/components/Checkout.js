import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder, getProfile } from '../services/api';

function Checkout({ token, cart, setCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' });
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAddrs = async () => {
      try {
        const data = await getProfile(token);
        if (data.addresses?.length > 0) {
          setAddresses(data.addresses);
          const def = data.addresses.find(a => a.isDefault) || data.addresses[0];
          setSelectedAddr(def);
        } else {
          setShowNewAddr(true);
        }
      } catch (e) {
        // ignore
      }
    };
    if (token) fetchAddrs();
  }, [token]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5 + Math.floor(Math.random() * 3));

  const handlePlaceOrder = async () => {
    const addr = selectedAddr || newAddr;
    if (!addr.addressLine1 || !addr.city || !addr.state || !addr.pincode || !addr.fullName || !addr.phone) {
      setError('Please fill in all address fields including name and phone');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          size: item.selectedSize || '',
          color: item.selectedColor || '',
          image: item.image,
        })),
        shippingAddress: {
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 || '',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        },
        paymentMethod: 'COD',
        totalAmount: total,
      };
      const data = await placeOrder(token, orderData);
      if (data.error) {
        setError(data.error);
      } else {
        setOrderPlaced(data.order || data);
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // Empty cart
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty!</h2>
          <p>Add some items before checking out</p>
          <button className="submit-btn" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  // Order confirmed
  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully! 🎉</h2>
          <p className="order-id-text">Order ID: <strong>#{orderPlaced._id?.slice(-8).toUpperCase()}</strong></p>
          <p className="delivery-est">Estimated Delivery: <strong>{deliveryDate.toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</strong></p>
          <p className="cod-note">💰 Pay ₹{total.toLocaleString('en-IN')} on delivery (Cash on Delivery)</p>
          <p className="email-note">📧 Order confirmation email has been sent to your registered email</p>
          <div className="success-actions">
            <button className="submit-btn" onClick={() => navigate(`/account/orders/${orderPlaced._id}`)}>Track Order</button>
            <button className="submit-btn outline" onClick={() => navigate('/shop')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Checkout</h2>
      </div>

      {/* Progress Steps */}
      <div className="checkout-steps">
        {['Address', 'Review', 'Confirm'].map((label, i) => (
          <div key={i} className={`step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`} onClick={() => { if (i + 1 < step) setStep(i + 1); }}>
            <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-body">
        {/* Step 1: Address */}
        {step === 1 && (
          <div className="checkout-step-content">
            <h3>Select Delivery Address</h3>
            {addresses.length > 0 && (
              <div className="addr-list">
                {addresses.map((addr, i) => (
                  <div key={i} className={`addr-card ${selectedAddr === addr ? 'selected' : ''}`} onClick={() => { setSelectedAddr(addr); setShowNewAddr(false); }}>
                    <span className="addr-radio">{selectedAddr === addr ? '●' : '○'}</span>
                    <div className="addr-details">
                      <p className="addr-name">{addr.fullName}</p>
                      <p>{addr.addressLine1}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p>📞 {addr.phone}</p>
                      {addr.isDefault && <span className="addr-default">Default</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="add-addr-btn" onClick={() => { setShowNewAddr(!showNewAddr); if (!showNewAddr) setSelectedAddr(null); }}>
              {showNewAddr ? 'Cancel' : '+ Add New Address'}
            </button>
            {showNewAddr && (
              <div className="new-addr-form">
                <input placeholder="Full Name *" value={newAddr.fullName} onChange={e => setNewAddr({...newAddr, fullName: e.target.value})} className="checkout-input" />
                <input placeholder="Phone Number *" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} className="checkout-input" maxLength={10} />
                <input placeholder="Address Line 1 (House No, Street) *" value={newAddr.addressLine1} onChange={e => setNewAddr({...newAddr, addressLine1: e.target.value})} className="checkout-input" />
                <div className="addr-row">
                  <input placeholder="City *" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className="checkout-input" />
                  <input placeholder="State *" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} className="checkout-input" />
                </div>
                <input placeholder="Pincode *" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value.replace(/\D/g,'').slice(0,6)})} className="checkout-input" maxLength={6} />
              </div>
            )}
            <button className="checkout-next-btn" onClick={() => {
              const addr = selectedAddr || newAddr;
              if (!addr.fullName || !addr.phone || !addr.addressLine1 || !addr.city || !addr.state || !addr.pincode) {
                setError('Please fill all address fields including name and phone'); return;
              }
              if (addr.phone.length !== 10) { setError('Phone number must be 10 digits'); return; }
              if (addr.pincode && addr.pincode.length !== 6) { setError('Pincode must be 6 digits'); return; }
              setError('');
              setStep(2);
            }}>Continue to Review →</button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="checkout-step-content">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {cart.map(item => (
                <div key={item._id} className="checkout-item">
                  <img src={item.image} alt={item.name} className="checkout-item-img" onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'; }} />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.name}</p>
                    <p className="checkout-item-meta">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && <span> | Color: {item.selectedColor}</span>}
                    </p>
                    <p className="checkout-item-price">₹{item.price.toLocaleString('en-IN')} × {item.qty}</p>
                  </div>
                  <span className="checkout-item-total">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary-box">
              <div className="summary-row"><span>Subtotal ({cart.reduce((s,i) => s+i.qty,0)} items)</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="summary-row"><span>Delivery</span><span className={shipping === 0 ? 'free-ship' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {shipping > 0 && <p className="free-ship-note">Add ₹{(999-subtotal).toLocaleString('en-IN')} more for free delivery</p>}
              <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="checkout-addr-summary">
              <h4>Delivering to:</h4>
              <p><strong>{(selectedAddr || newAddr).fullName}</strong> | 📞 {(selectedAddr || newAddr).phone}</p>
              <p>{(selectedAddr || newAddr).addressLine1}, {(selectedAddr || newAddr).city}, {(selectedAddr || newAddr).state} - {(selectedAddr || newAddr).pincode}</p>
            </div>
            <div className="checkout-nav-btns">
              <button className="checkout-back-btn" onClick={() => setStep(1)}>← Back to Address</button>
              <button className="checkout-next-btn" onClick={() => setStep(3)}>Proceed to Payment →</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Pay */}
        {step === 3 && (
          <div className="checkout-step-content">
            <h3>Payment</h3>
            <div className="payment-options">
              <div className="payment-option selected">
                <span className="payment-radio">●</span>
                <div className="payment-info">
                  <h4>💰 Cash on Delivery (COD)</h4>
                  <p>Pay when your order arrives at your doorstep</p>
                </div>
              </div>
              <div className="payment-option disabled">
                <span className="payment-radio">○</span>
                <div className="payment-info">
                  <h4>💳 Online Payment</h4>
                  <p>UPI / Cards / Net Banking — Coming Soon!</p>
                </div>
              </div>
            </div>
            <div className="checkout-summary-box final">
              <div className="summary-row total"><span>Amount to Pay on Delivery</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="checkout-nav-btns">
              <button className="checkout-back-btn" onClick={() => setStep(2)}>← Back</button>
              <button className="checkout-place-btn" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
