import React from 'react';
import { useNavigate } from 'react-router-dom';

function About() {
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
        <h1>About Us</h1>

        <section>
          <h2>Our Story</h2>
          <p>
            Thriya Stores was born from a love for traditional Indian fashion and a vision to make it accessible to everyone.
            Founded by Sandhya, Thriya curates the finest ethnic wear — from handwoven sarees to contemporary fusion styles —
            bringing the richness of Indian craftsmanship to your doorstep.
          </p>
        </section>

        <section>
          <h2>What We Offer</h2>
          <p>
            We specialize in authentic Indian fashion for Women, Men, and Kids. Our collections include handpicked sarees, lehengas,
            kurtas, sherwanis, and much more — sourced directly from artisans and trusted manufacturers across India.
          </p>
          <ul>
            <li>Handcrafted ethnic wear with premium fabrics</li>
            <li>Curated collections for every occasion</li>
            <li>Affordable prices with quality assurance</li>
            <li>Pan-India delivery with Cash on Delivery</li>
          </ul>
        </section>

        <section>
          <h2>Our Promise</h2>
          <p>
            Every product at Thriya Stores is quality-checked before dispatch. We believe in transparent pricing,
            easy exchanges, and exceptional customer service. Your satisfaction is our priority.
          </p>
        </section>

        <section>
          <h2>Connect With Us</h2>
          <p>
            Follow us on <a href="https://www.instagram.com/thriya_by_sandhya?igsh=MTF1ZmtqeGRoaTBn" target="_blank" rel="noopener noreferrer">Instagram @thriya_by_sandhya</a> for
            the latest drops, styling tips, and exclusive offers.
          </p>
          <p>
            For any queries, reach out to us at <strong>support@thriya.com</strong> or
            chat with us on <a href="https://wa.me/916305563286" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
