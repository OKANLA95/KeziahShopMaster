// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import '../styles/main.css';
import LoginHeader from '../components/LoginHeader';
import LoginForm from '../components/LoginForm';
import LoginFooter from '../components/LoginFooter';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState(localStorage.getItem('prefillEmail') || '');
  const [password, setPassword] = useState(localStorage.getItem('prefillPassword') || '');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigateToDashboard = (role) => {
    if (!role) return navigate('/dashboard', { replace: true });
    const path = {
      admin: '/admin',
      manager: '/dashboard/manager',
      sales: '/dashboard/sales',
      finance: '/dashboard/finance',
    }[role.toLowerCase()] || '/dashboard';
    navigate(path, { replace: true });
  };

  const fetchUserRoleAndNavigate = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert('No user data found. Please contact admin.');
        return;
      }

      const userData = userSnap.data();
      userData.uid = user.uid; // include UID

      if (!userData.role) {
        alert('No role assigned. Please contact admin.');
        return;
      }

      if (userData.mustResetPassword) {
        // Pass full userData to ChangePassword
        navigate('/change-password', { state: { userData } });
        return;
      }

      navigateToDashboard(userData.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      alert('Failed to fetch role. Please contact admin.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Please enter email and password');
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('prefillEmail', email);
      localStorage.setItem('prefillPassword', password);
      await fetchUserRoleAndNavigate(user);
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert('Please enter your email first.');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, { email: user.email, role: 'Sales', mustResetPassword: false });
        navigateToDashboard('Sales');
      } else {
        await fetchUserRoleAndNavigate(user);
      }
    } catch (error) {
      alert(`Google Sign-In failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => alert('reCAPTCHA expired. Please try again.'),
      });
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return alert('Enter a valid phone number');
    try {
      setUpRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      alert('OTP sent! Please enter it to verify.');
    } catch (error) {
      alert(`OTP Error: ${error.message}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return alert('Enter OTP');
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, { phone: user.phoneNumber, role: 'Sales', mustResetPassword: false });
        navigateToDashboard('Sales');
      } else {
        await fetchUserRoleAndNavigate(user);
      }
    } catch (error) {
      alert(`OTP Verification failed: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <LoginHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="login-main">
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          phone={phone}
          setPhone={setPhone}
          otp={otp}
          setOtp={setOtp}
          isOtpSent={isOtpSent}
          handleSendOtp={handleSendOtp}
          handleVerifyOtp={handleVerifyOtp}
          handleForgotPassword={handleForgotPassword}
          handleLogin={handleLogin}
          handleGoogleSignIn={handleGoogleSignIn}
          loading={loading}
        />
      </main>
      <LoginFooter />
      <div id="recaptcha-container"></div>
    </div>
  );
}
