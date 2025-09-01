// src/components/SaleSidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const SaleSidebar = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [collapsed, setCollapsed] = useState(false); // new state for collapse

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

  // Calculator handlers
  const appendCalc = (val) => setCalcInput((prev) => prev + val);
  const clearCalc = () => setCalcInput("");
  const deleteLast = () => setCalcInput((prev) => prev.slice(0, -1));
  const calculate = () => {
    try {
      setCalcInput(eval(calcInput).toString());
    } catch {
      setCalcInput("Error");
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-logo">{collapsed ? "SP" : "Sales Panel"}</h2>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="clock-container">
            <div className="clock-particles"></div>
            <div className="clock-time">{formatTime(currentTime)}</div>
            <div className="clock-date">{formatDate(currentTime)}</div>
          </div>

          <button
            className="calc-toggle-btn"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            {showCalculator ? "Hide Calculator" : "Show Calculator"} 🖩
          </button>

          {showCalculator && (
            <div className="calculator">
              <input type="text" value={calcInput} readOnly className="calc-display" />
              <div className="calc-buttons">
                {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => btn === "=" ? calculate() : appendCalc(btn)}
                    className="calc-btn"
                  >
                    {btn}
                  </button>
                ))}
                <button onClick={clearCalc} className="calc-btn clear">C</button>
                <button onClick={deleteLast} className="calc-btn del">DEL</button>
              </div>
            </div>
          )}
        </>
      )}

      <nav className="sidebar-nav">
        <button className="logout-btn" onClick={handleLogout}>
          🔓 Logout
        </button>
      </nav>

      <style>{`
        .sidebar {
          width: 260px;
          transition: width 0.3s ease;
          background-color: #6f4e37;
          color: #fff;
          min-height: 100vh;
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .sidebar.collapsed {
          width: 80px;
          padding: 20px 10px;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .collapse-btn {
          background: #a5b1a6ff;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
        }
        .sidebar-logo {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 30px;
          text-align: center;
          letter-spacing: 1px;
        }
        .clock-container {
          position: relative;
          text-align: center;
          margin-bottom: 20px;
          padding: 25px 15px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 15px rgba(0,0,0,0.4);
          border: 2px solid #fff;
        }
        .clock-particles {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          background-image: radial-gradient(#fff 1px, transparent 1px);
          background-size: 10px 10px;
          opacity: 0.2;
        }
        .clock-time { font-size: 2rem; font-weight: 700; color: #fff; }
        .clock-date { font-size: 1rem; margin-top: 8px; color: #fff5e0; }
        .calc-toggle-btn { margin-bottom: 15px; background: #d0dad1ff; border: none; padding: 10px; font-weight: bold; border-radius: 10px; cursor: pointer; }
        .calculator { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 15px; margin-bottom: 30px; user-select: none; }
        .calc-display { width: 100%; padding: 10px; font-size: 1.2rem; margin-bottom: 10px; border-radius: 8px; border: none; text-align: right; }
        .calc-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .calc-btn { padding: 10px; border-radius: 8px; border: none; background: rgba(255,255,255,0.2); color: #fff; font-weight: bold; font-size: 1rem; cursor: pointer; transition: 0.2s; }
        .calc-btn:hover { background: rgba(255,255,255,0.4); }
        .calc-btn.clear { background: #c4bbbbff; }
        .calc-btn.del { background: #f0a500; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 20px; flex-grow: 1; }
        .logout-btn { margin-top: auto; padding: 12px 20px; border: none; border-radius: 12px; background: #ff4a4a; color: #fff; cursor: pointer; font-size: 1.1rem; font-weight: bold; transition: background 0.3s, transform 0.2s; }
        .logout-btn:hover { background: #ccbebeff; transform: scale(1.05); }
      `}</style>
    </aside>
  );
};

export default SaleSidebar;
