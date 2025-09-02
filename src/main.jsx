// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // ✅ Ensure file extension is correct
import { AuthProvider } from "./context/AuthContext.jsx"; // ✅ Import context
import "./styles/main.css"; // ✅ Use consistent CSS path (Tailwind entry point)

// Render the App wrapped with AuthProvider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

