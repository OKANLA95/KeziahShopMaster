// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./ChangePassword.css";

export default function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Show/hide password toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength meter
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 0: return { label: "Too Short", color: "#ff4d4d", width: "10%" };
      case 1: return { label: "Weak", color: "#ff6f61", width: "25%" };
      case 2: return { label: "Moderate", color: "#f1c40f", width: "50%" };
      case 3: return { label: "Strong", color: "#2ecc71", width: "75%" };
      case 4: return { label: "Very Strong", color: "#27ae60", width: "100%" };
      default: return { label: "", color: "#ccc", width: "0%" };
    }
  };

  const strength = calculateStrength(newPassword);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        mustResetPassword: false,
        passwordChanged: true,
        password: newPassword
      });

      setSuccess("Password updated successfully!");

      const roleKey = userData.role?.toLowerCase();
      const path = {
        admin: '/admin',
        manager: '/dashboard/manager',
        sales: '/dashboard/sales',
        finance: '/dashboard/finance',
      }[roleKey] || '/dashboard';

      setTimeout(() => navigate(path, { replace: true }), 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-container">
      <h2>Set Your New Password</h2>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <form onSubmit={handlePasswordChange} className="password-form">

        <div className="form-group">
          <label>Current / Default Password</label>
          <div className="password-input">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowOld(!showOld)}>
              {showOld ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>New Password</label>
          <div className="password-input">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowNew(!showNew)}>
              {showNew ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          <div className="password-strength">
            <div className="strength-bar" style={{ width: strength.width, backgroundColor: strength.color }}></div>
            <p style={{ color: strength.color }}>{strength.label}</p>
          </div>
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <div className="password-input">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
