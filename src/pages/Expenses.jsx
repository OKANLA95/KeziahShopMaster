import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";

const Expenses = () => {
  const [currentShopId, setCurrentShopId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Suppliers");
  const [responsible, setResponsible] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch current user's shopId
  useEffect(() => {
    const fetchUserShop = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.shopId) {
            setCurrentShopId(data.shopId);
          } else {
            setMessage("No shop assigned to your account.");
          }
        } else {
          setMessage("User data not found.");
        }
      } catch (err) {
        console.error("Error fetching user shop:", err);
        setMessage("Failed to fetch shop information.");
      }
    };
    fetchUserShop();
  }, []);

  // Fetch users for responsible dropdown
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      },
      (error) => console.error("Error fetching users:", error)
    );
    return () => unsubscribe();
  }, []);

  // Fetch live expenses for current shop
  useEffect(() => {
    if (!currentShopId) return;
    const expensesRef = collection(db, "shops", currentShopId, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setExpenses(data);
        const totalAmount = data.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
        setTotal(totalAmount);
      },
      (error) => console.error("Error fetching expenses:", error)
    );

    return () => unsubscribe();
  }, [currentShopId]);

  // Add or update expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!description.trim()) {
      setMessage("Please enter a description.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage("Please enter a valid amount greater than 0.");
      return;
    }
    if (!responsible || !responsible.trim()) {
      setMessage("Please select a responsible person.");
      return;
    }
    if (!currentShopId) {
      setMessage("Cannot save expense. Shop not found.");
      return;
    }

    try {
      const expensesRef = collection(db, "shops", currentShopId, "expenses");

      if (editingId) {
        const expenseRef = doc(expensesRef, editingId);
        await updateDoc(expenseRef, {
          date: date || new Date().toISOString().split("T")[0],
          description: description.trim(),
          amount: numAmount,
          category,
          responsible,
        });
        setMessage("Expense updated successfully!");
        setEditingId(null);
      } else {
        await addDoc(expensesRef, {
          date: date || new Date().toISOString().split("T")[0],
          description: description.trim(),
          amount: numAmount,
          category,
          responsible,
          createdAt: serverTimestamp(),
        });
        setMessage("Expense added successfully!");
      }

      // Clear form
      setDate("");
      setDescription("");
      setAmount("");
      setCategory("Suppliers");
      setResponsible("");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding/updating expense:", error);
      setMessage("Failed to save expense. Check console for details.");
    }
  };

  // Edit expense
  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setDate(exp.date);
    setDescription(exp.description);
    setAmount(exp.amount);
    setCategory(exp.category);
    setResponsible(exp.responsible);
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (!currentShopId) return;
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteDoc(doc(db, "shops", currentShopId, "expenses", id));
        setMessage("Expense deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting expense:", error);
        setMessage("Failed to delete expense. Check console for details.");
      }
    }
  };

  if (!currentShopId) {
    return (
      <div className="expenses-container">
        <p style={{ textAlign: "center", color: "red" }}>
          {message || "Loading your shop information..."}
        </p>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      <style>{`
        .expenses-container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .expenses-container h2 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }
        .expense-form {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
        }
        .expense-form input,
        .expense-form select {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }
        .expense-form button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
        }
        .expense-form button:hover {
          background: linear-gradient(135deg, #0056b3, #003f7f);
        }
        .expenses-list {
          margin-top: 20px;
        }
        .expense-card {
          background: white;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          display: grid;
          grid-template-columns: 100px 130px 1fr 100px 150px 120px;
          gap: 10px;
          align-items: center;
        }
        .expense-card strong {
          color: #007bff;
        }
        .expense-actions {
          display: flex;
          gap: 10px;
        }
        .edit-btn, .delete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .edit-btn {
          background: #ffc107;
          color: #000;
        }
        .delete-btn {
          background: #dc3545;
          color: #fff;
        }
        .total-expenses {
          margin-top: 25px;
          padding: 20px;
          text-align: center;
          background: linear-gradient(135deg, #28a745, #218838);
          color: #fff;
          border-radius: 12px;
          font-size: 18px;
          font-weight: bold;
        }
        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 6px;
          background: #d4edda;
          color: #155724;
        }
      `}</style>

      <h2>Expenses Dashboard</h2>

      {message && <div className="message">{message}</div>}

      {/* Expense Form */}
      <form className="expense-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Suppliers">Orders from Suppliers</option>
          <option value="Admin">Administrative Cost</option>
          <option value="Salaries">Salaries</option>
          <option value="Operations">Operational Cost</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Expense details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          required
        >
          <option value="" disabled>
            -- Select Responsible --
          </option>
          {users.map((user) => (
            <option
              key={user.id}
              value={user.fullName || user.email || "Unknown"}
            >
              {user.fullName || user.email || "Unknown"}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? "Update Expense" : "+ Add Expense"}</button>
      </form>

      {/* Expense List */}
      <div className="expenses-list">
        {expenses.length === 0 && <p>No expenses yet.</p>}
        {expenses.map((exp) => (
          <div key={exp.id} className="expense-card">
            <span>{exp.date}</span>
            <span>{exp.category}</span>
            <div>
              <strong>{exp.description}</strong>
            </div>
            <span>₵{exp.amount}</span>
            <span>{exp.responsible}</span>
            <div className="expense-actions">
              <button className="edit-btn" onClick={() => handleEdit(exp)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(exp.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="total-expenses">Total Expenses: ₵{total}</div>
    </div>
  );
};

export default Expenses;
