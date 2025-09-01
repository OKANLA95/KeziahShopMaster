// src/components/LoginForm.js
import React from 'react';
import { Link } from 'react-router-dom'; // Added for routing

export default function LoginForm({
  email, setEmail,
  password, setPassword,
  phone, setPhone,
  otp, setOtp,
  isOtpSent, handleSendOtp,
  handleVerifyOtp, handleForgotPassword,
  handleLogin, handleGoogleSignIn,
  loading
}) {
  return (
    <div className="login-form-wrapper">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="button" onClick={handleForgotPassword}>Forgot Password?</button>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="phone-auth">
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {isOtpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}
        <button onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}>
          {isOtpSent ? 'Verify OTP' : 'Send OTP'}
        </button>
        <div id="recaptcha-container"></div>
      </div>

      <div className="divider">or</div>

      <button onClick={handleGoogleSignIn} className="google-signin-btn">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
        />
        <span>Sign in with Google</span>
      </button>

      <div className="signup-prompt">
        <p>
          Don’t have an account?{' '}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
