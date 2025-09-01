// src/pages/PublicDashboard.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function PublicDashboard() {
  useEffect(() => {
    // Animate floating icons
    const icons = document.querySelectorAll('.floating-icon');
    icons.forEach((icon, i) => {
      let direction = 1;
      setInterval(() => {
        const top = parseFloat(icon.style.top);
        if (top >= 20) direction = -1;
        if (top <= 0) direction = 1;
        icon.style.top = `${top + 0.2 * direction}px`;
      }, 20 + i * 5);
    });
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoTitle}>
          <img src={logo} alt="Keziah Logo" style={styles.logo} />
          <h1 style={styles.title}>Keziah Shop Master</h1>
        </div>
        <nav style={styles.nav}>
          <Link to="/About" style={styles.link}>About</Link>
          <Link to="/ContactSupport" style={styles.link}>Contact</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="floating-icon" style={{...styles.floatingIcon, left: '10%'}}>💎</div>
        <div className="floating-icon" style={{...styles.floatingIcon, left: '70%'}}>🚀</div>
        <h2 className="hero-text" style={styles.heroTitle}>Master Your Inventory. Maximize Your Sales.</h2>
        <p className="hero-text" style={styles.heroText}>
          Keziah Shop Master helps you track stock, manage sales, and make data-driven decisions — all in one intuitive dashboard.
        </p>
        <Link to="/signup" style={styles.cta}>Get Started Free</Link>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h3 style={styles.featuresTitle}>Why Keziah Shop Master?</h3>
        <div style={styles.featureGrid}>
          <div className="feature-card" style={styles.featureCard}>
            <div style={styles.featureIcon}>📦</div>
            <h4>Inventory Control</h4>
            <p>Monitor stock levels in real time. Receive alerts on low stock and expiry dates.</p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h4>Sales Tracking</h4>
            <p>Track your daily, weekly, and monthly sales with clear, actionable reports.</p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <div style={styles.featureIcon}>👥</div>
            <h4>Multi-user Access</h4>
            <p>Empower your team with role-based access to update stock and manage transactions securely.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={styles.ctaBanner}>
        <h3>Take Control of Your Shop Today</h3>
        <Link to="/signup" style={styles.ctaBannerBtn}>Try Keziah Shop Master Free</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Keziah Shop Master. All rights reserved.</p>
        <div style={styles.footerLinks}>
          <a href="mailto:support@keziahshopmaster.com" style={styles.footerLink}>Contact Support</a> | 
          <Link to="/about" style={styles.footerLink}>About</Link>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        .hero-text {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 1s forwards;
        }
        .hero-text:nth-child(1) { animation-delay: 0.2s; }
        .hero-text:nth-child(2) { animation-delay: 0.4s; }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .feature-card:hover {
          transform: translateY(-10px) rotate(1deg);
          box-shadow: 0 16px 32px rgba(0,0,0,0.2);
        }

        .cta:hover {
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Segoe UI', sans-serif", color: '#1f2937' },
  header: {
    background: '#1e293b',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  logoTitle: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { height: '60px', width: 'auto' },
  title: { margin: 0, fontSize: '1.8rem', fontWeight: 'bold' },
  nav: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', fontWeight: '600', transition: 'color 0.3s' },
  hero: {
    textAlign: 'center',
    padding: '6rem 2rem',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingIcon: {
    position: 'absolute',
    top: '10px',
    fontSize: '2rem',
    opacity: 0.7,
  },
  heroTitle: { fontSize: '2.5rem', marginBottom: '1rem' },
  heroText: { fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.6' },
  cta: {
    backgroundColor: '#27ae60',
    padding: '0.8rem 2rem',
    borderRadius: '30px',
    color: 'white',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s',
  },
  features: { padding: '4rem 2rem', backgroundColor: '#f6f9fc', textAlign: 'center' },
  featuresTitle: { fontSize: '2rem', marginBottom: '3rem', color: '#1e3c72' },
  featureGrid: { display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' },
  featureCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    width: '300px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  featureIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  ctaBanner: { backgroundColor: '#1e293b', color: 'white', textAlign: 'center', padding: '3rem 2rem' },
  ctaBannerBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  footer: { padding: '2rem', textAlign: 'center', backgroundColor: '#1e293b', color: 'white', marginTop: '3rem' },
  footerLinks: { marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' },
  footerLink: { color: '#27ae60', textDecoration: 'none', fontWeight: '500' },
};
