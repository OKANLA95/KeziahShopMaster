// src/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const linkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (date) =>
    date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">Admin Panel</h2>

      <div className="clock-container">
        <div className="clock-particles"></div>
        <div className="clock-time">{formatTime(currentTime)}</div>
        <div className="clock-date">{formatDate(currentTime)}</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin" className={linkClass}>
          🏠 Dashboard
        </NavLink>
        <button className="logout-btn" onClick={handleLogout}>
          🔓 Logout
        </button>
      </nav>

      <style>{`
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #6a5aff, #4a3aff);
          color: #fff;
          min-height: 100vh;
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sidebar-logo {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 30px;
          text-align: center;
          letter-spacing: 1px;
        }

        /* Clock container with neon border, gradient, pulse, and particles */
        .clock-container {
          position: relative;
          text-align: center;
          margin-bottom: 40px;
          padding: 25px 15px;
          border-radius: 20px;
          background: linear-gradient(270deg, #6a5aff, #ff4a4a, #4aff6a, #6a5aff);
          background-size: 800% 800%;
          animation: rotateGradient 10s ease infinite, pulse 2s infinite alternate, neonBorder 2s infinite alternate;
          box-shadow: 0 0 30px rgba(0,0,0,0.4);
          border: 3px solid #fff;
          overflow: hidden;
        }

        .clock-particles {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          background-image: radial-gradient(#fff 1px, transparent 1px);
          background-size: 10px 10px;
          animation: particlesMove 5s linear infinite;
          opacity: 0.3;
        }

        .clock-time {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #b3b3ff,
            0 0 20px #b3b3ff,
            0 0 30px #6a5aff,
            0 0 40px #6a5aff,
            0 0 50px #6a5aff,
            0 0 60px #6a5aff;
          animation: glow 1.5s infinite alternate;
          position: relative;
          z-index: 2;
        }

        .clock-date {
          font-size: 1rem;
          margin-top: 8px;
          color: #e0e0ff;
          text-shadow: 0 0 5px #b3b3ff;
          animation: fade 4s infinite alternate;
          position: relative;
          z-index: 2;
        }

        @keyframes glow {
          0% { text-shadow: 0 0 5px #fff, 0 0 10px #b3b3ff, 0 0 20px #6a5aff; }
          50% { text-shadow: 0 0 10px #fff, 0 0 20px #b3b3ff, 0 0 40px #6a5aff; }
          100% { text-shadow: 0 0 5px #fff, 0 0 10px #b3b3ff, 0 0 20px #6a5aff; }
        }

        @keyframes fade {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }

        @keyframes rotateGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes neonBorder {
          0% { border-color: #fff; box-shadow: 0 0 20px #6a5aff, 0 0 40px #b3b3ff; }
          50% { border-color: #b3b3ff; box-shadow: 0 0 30px #ff4a4a, 0 0 50px #4aff6a; }
          100% { border-color: #fff; box-shadow: 0 0 20px #6a5aff, 0 0 40px #b3b3ff; }
        }

        @keyframes particlesMove {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex-grow: 1;
        }

        .sidebar-link {
          color: #fff;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 12px;
          transition: all 0.3s;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.2);
        }

        .sidebar-link.active {
          background: #fff;
          color: #4a3aff;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(255,255,255,0.6);
        }

        .logout-btn {
          margin-top: auto;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: #ff4a4a;
          color: #fff;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: bold;
          transition: background 0.3s, transform 0.2s;
        }

        .logout-btn:hover {
          background: #d93636;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            min-height: auto;
            flex-direction: row;
            overflow-x: auto;
            padding: 10px;
            align-items: center;
          }
          .sidebar-nav {
            flex-direction: row;
            gap: 10px;
          }
          .sidebar-logo {
            display: none;
          }
          .sidebar-link, .logout-btn {
            flex-shrink: 0;
            padding: 8px 12px;
            font-size: 0.9rem;
          }
          .clock-container {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
