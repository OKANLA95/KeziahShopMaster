import React from 'react';
import './About.css'; // Link to the CSS file

const About = () => {
  return (
    <div className="about-container">
      <h1>About Keziah Shop Master</h1>

      <p>
        <strong>Keziah Shop Master</strong> is a powerful inventory control and sales management system 
        designed specifically for small and medium-sized shop owners. Our platform helps you track stock 
        levels, record daily sales, and analyze business performance—all in one easy-to-use interface.
      </p>

      <h2>Our Mission</h2>
      <p>
        To empower local businesses with smart, affordable digital tools that simplify inventory 
        management, improve sales tracking, and drive data-informed decisions for business growth.
      </p>

      <h2>What You Can Do with Keziah Shop Master</h2>
      <ul>
        <li>📦 Manage and monitor your inventory in real-time</li>
        <li>💰 Record and track daily sales transactions</li>
        <li>📈 Analyze sales data to identify trends and make informed decisions</li>
        <li>🧾 Generate reports for inventory, sales, and profits</li>
        <li>👥 Support multiple users and roles (e.g. manager, finance, sales)</li>
      </ul>

      <h2>Who It's For</h2>
      <p>
        Keziah Shop Master is built for small shops, retail outlets, mini-markets, and vendors who want 
        better control over their stock and sales without the complexity or high cost of enterprise systems.
      </p>

      <p className="closing-text">
        Start managing your shop the smart way—simple, powerful, and tailored for your business.
      </p>
    </div>
  );
};

export default About;
