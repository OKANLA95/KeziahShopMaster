// src/components/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Sidebar() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Only render if user is a Manager
  if (userData?.role !== 'Manager') return null;

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>Manager Panel</h3>

      <div style={styles.clock}>
        <div style={styles.date}>{formattedDate}</div>
        <div style={styles.time}>{formattedTime}</div>
      </div>

      <ul style={styles.nav}>
        <li><Link to="/dashboard/manager" style={styles.link}>🏠 Dashboard</Link></li>
        <li><Link to="/inventory" style={styles.link}>📦 Inventory</Link></li>
        <li><Link to="/profile" style={styles.link}>👤 Profile</Link></li>
        <li><button onClick={handleLogout} style={styles.button}>🚪 Logout</button></li>
      </ul>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    background: '#1e293b',
    color: 'white',
    padding: '20px',
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: '20px',
    fontSize: '1.5rem',
    textAlign: 'center',
    color: '#4a90ff',
  },
  clock: {
    background: '#111f3f',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    boxShadow: '0 0 15px rgba(74,144,255,0.5)',
  },
  date: {
    fontSize: '0.9rem',
    color: '#a0c4ff',
  },
  time: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4a90ff',
    textShadow: '0 0 8px #4a90ff, 0 0 12px #4a90ff, 0 0 16px #4a90ff',
  },
  nav: {
    listStyle: 'none',
    padding: 0,
    flexGrow: 1,
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    display: 'block',
    margin: '15px 0',
    padding: '8px 10px',
    borderRadius: '5px',
    transition: 'background 0.2s',
  },
  button: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '8px 10px',
    fontSize: '16px',
    borderRadius: '5px',
    transition: 'background 0.2s',
  },
};
