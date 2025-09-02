// src/components/LoginHeader.js
import React from 'react';
import logo from "../assets/logo.png";


export default function LoginHeader({ darkMode, toggleDarkMode }) {
  return (
    <header className="login-header">
      <img src={logo} alt="Logo" />
      <h1>Keziah Shop Master</h1>
      <button onClick={toggleDarkMode}>
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </header>
  );
}
