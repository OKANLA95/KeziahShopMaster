import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    shopName: '',
    shopLocation: '',
    shopContact: '',
  });

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role !== 'Manager' && data.role !== 'Finance') {
          alert('Access denied. Only Managers and Finance users can update profile.');
          navigate('/');
          return;
        }

        setUserData(data);
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          shopName: data.shopName || '',
          shopLocation: data.shopLocation || '',
          shopContact: data.shopContact || '',
        });
      } else {
        alert('User data not found.');
        navigate('/');
      }
      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        email: formData.email.toLowerCase(),
        shopName: formData.shopName,
        shopLocation: formData.shopLocation,
        shopContact: formData.shopContact,
      });
      alert('✅ Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update profile: ' + err.message);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</p>;

  // Generate initials for avatar if no photoURL
  const initials = userData.fullName
    ? userData.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div style={styles.container}>
      {/* Header with avatar and role badge */}
      <div style={styles.header}>
        <div style={styles.avatar}>{initials}</div>
        <div>
          <h2 style={styles.heading}>{userData.fullName}</h2>
          <span style={styles.roleBadge}>{userData.role}</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdate} style={styles.form}>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
          style={styles.input}
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={styles.input}
        />
        <input
          name="shopName"
          value={formData.shopName}
          onChange={handleChange}
          placeholder="Shop Name"
          required
          style={styles.input}
        />
        <input
          name="shopLocation"
          value={formData.shopLocation}
          onChange={handleChange}
          placeholder="Shop Location"
          required
          style={styles.input}
        />
        <input
          name="shopContact"
          value={formData.shopContact}
          onChange={handleChange}
          placeholder="Shop Contact"
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>💾 Save Changes</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '50px auto',
    padding: 30,
    background: 'linear-gradient(135deg, #f5f5ff, #e0e0ff)',
    borderRadius: 20,
    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 30,
    gap: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: '#4a3aff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  heading: {
    margin: 0,
    fontSize: 24,
    color: '#333',
  },
  roleBadge: {
    display: 'inline-block',
    marginTop: 5,
    padding: '4px 10px',
    backgroundColor: '#362bd9',
    color: '#fff',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  input: {
    padding: '12px 15px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  button: {
    padding: '14px',
    border: 'none',
    borderRadius: 10,
    background: '#4a3aff',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: 10,
  },
};
