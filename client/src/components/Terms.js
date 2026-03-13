import React from 'react';
import { useNavigate } from 'react-router-dom';

function Terms() {
  const navigate = useNavigate();

  return (
    <div className="static-page">
      <nav className="static-nav">
        <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">T</span>
          <span className="brand-text">THRIYA</span>
        </div>
        <button className="static-back" onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="static-content">
        <h1>Terms & Conditions</h1>
        <p className="static-updated">Last updated: March 2026</p>

        <section>
          <h2>1. General</h2>
          <p>
            By accessing and using Thriya Stores (thriya-stores.onrender.com), you agree to be bound by these Terms & Conditions.
            If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Products & Pricing</h2>
          <p>
            All product descriptions, images, and prices are provided in good faith. We reserve the right to modify prices
            without prior notice. Prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.
          </p>
        </section>

        <section>
          <h2>3. Orders & Payment</h2>
          <p>
            Orders are confirmed upon successful placement. We currently support Cash on Delivery (COD) as the primary payment method.
            We reserve the right to cancel any order due to stock unavailability or pricing errors.
          </p>
        </section>

        <section>
          <h2>4. Shipping & Delivery</h2>
          <p>
            We aim to deliver all orders within 5–10 business days across India. Delivery timelines may vary based on location
            and product availability. Free delivery is available on orders above ₹999.
          </p>
        </section>

        <section>
          <h2>5. Returns & Exchanges</h2>
          <p>
            We accept returns and exchanges within 7 days of delivery. Products must be in their original condition with tags intact.
            Refunds will be processed within 5–7 business days after receiving the returned product.
          </p>
        </section>

        <section>
          <h2>6. Privacy</h2>
          <p>
            We collect and use your personal information solely for order processing and communication purposes.
            We do not sell or share your data with third parties. See our Cookie Policy for details on cookie usage.
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            For any questions regarding these terms, contact us at <strong>support@thriya.com</strong> or
            via <a href="https://wa.me/916305563286" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;
