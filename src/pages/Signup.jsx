// src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Header from '../components/loginHeader';
import Footer from '../components/Footer';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setPasswordMismatch(password && confirmPassword && password !== confirmPassword);
    setPasswordMatch(password && confirmPassword && password === confirmPassword);
  }, [password, confirmPassword]);

  const createAdminDoc = async (uid) => {
    const adminData = {
      fullName,
      email: email.toLowerCase(),
      role: 'Admin',       // Force admin role
      shopId: '',          // No shop
      mustResetPassword: false,
      active: true,
      dob,
      gender,
      phone,
      address,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), adminData); // overwrite any existing doc
    return adminData;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (passwordMismatch) return; // prevent submit if mismatch
    if (!password || !confirmPassword) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      await createAdminDoc(uid);

      alert('Admin account created successfully!');
      navigate('/login', { replace: true });
    } catch (error) {
      alert('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="signup-form-wrapper">
        <h2>Create Admin Account</h2>

        <form onSubmit={handleSignup} className="signup-form">
          <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 10, top: '50%', cursor: 'pointer', transform: 'translateY(-50%)' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{ borderColor: passwordMismatch ? 'red' : '#ddd' }}
            />
            {passwordMismatch && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                color: 'red',
                fontSize: '12px',
                marginTop: '3px'
              }}>
                Passwords do not match!
              </div>
            )}
            {passwordMatch && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                color: 'green',
                fontSize: '12px',
                marginTop: '3px'
              }}>
                ✅ Passwords match
              </div>
            )}
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 10, top: '50%', cursor: 'pointer', transform: 'translateY(-50%)' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} required />
          <select value={gender} onChange={e => setGender(e.target.value)} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
          <input type="text" placeholder="Address (optional)" value={address} onChange={e => setAddress(e.target.value)} />

          <button type="submit" disabled={loading || passwordMismatch}>{loading ? 'Creating...' : 'Sign Up'}</button>
        </form>

        <p className="login-redirect">Already have an account? <span onClick={() => navigate('/login')}>Login</span></p>

        <style>{`
          .signup-form-wrapper {
            max-width: 450px;
            margin:50px auto;
            padding:30px;
            background:#fff;
            box-shadow:0 10px 25px rgba(0,0,0,0.1);
            border-radius:12px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .signup-form-wrapper h2 {
            text-align:center;
            color:#333;
            margin-bottom:25px;
            font-size:28px;
          }
          .signup-form { display:flex; flex-direction:column; gap:15px; }
          .signup-form input, .signup-form select {
            padding:12px 15px;
            font-size:16px;
            border:1px solid #ddd;
            border-radius:8px;
            transition: all 0.2s;
          }
          .signup-form input:focus, .signup-form select:focus {
            outline:none;
            border-color:#007BFF;
            box-shadow:0 0 8px rgba(0,123,255,0.2);
          }
          .signup-form button {
            padding:12px;
            font-size:16px;
            border:none;
            background:linear-gradient(45deg,#6a11cb,#2575fc);
            color:#fff;
            border-radius:8px;
            cursor:pointer;
            transition: all 0.3s;
          }
          .signup-form button:hover {
            transform:translateY(-2px);
            box-shadow:0 8px 15px rgba(0,123,255,0.3);
          }
          .login-redirect { text-align:center; margin-top:20px; font-size:14px; }
          .login-redirect span { color:#007BFF; cursor:pointer; text-decoration:underline; }
        `}</style>
      </div>
      <Footer />
    </>
  );
}
