// src/pages/sales/EditSale.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    amount: '',
    customerName: ''
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // 🔐 Fetch authenticated user and their role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserRole(data.role);

          if (data.role !== 'Sales' && data.role !== 'Manager') {
            alert('You are not authorized to edit sales.');
            navigate('/dashboard');
          }
        } else {
          alert('User profile not found');
          navigate('/login');
        }
      } else {
        alert('You must be logged in');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🔄 Load the existing sale
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const docRef = doc(db, 'sales', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSale({ id: docSnap.id, ...data });
          setFormData({
            productName: data.productName || '',
            quantity: data.quantity || 0,
            amount: data.amount || 0,
            customerName: data.customerName || '',
          });
        } else {
          alert('Sale not found');
          navigate('/dashboard/sales');
        }
      } catch (error) {
        console.error('Error loading sale:', error);
        alert('Failed to load sale data.');
        navigate('/dashboard/sales');
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id, navigate]);

  // 🧠 Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'amount' ? Number(value) : value
    }));
  };

  // ✅ Input validation
  const isValid = () => {
    if (!formData.productName.trim()) return false;
    if (!formData.customerName.trim()) return false;
    if (formData.quantity < 1) return false;
    if (formData.amount < 0) return false;
    return true;
  };

  // 💾 Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert('Please fill all fields correctly.');
      return;
    }

    try {
      const saleRef = doc(db, 'sales', id);
      await updateDoc(saleRef, {
        productName: formData.productName,
        quantity: formData.quantity,
        amount: formData.amount,
        customerName: formData.customerName,
        updatedAt: new Date(),
        updatedBy: currentUser?.email || currentUser?.uid || 'Unknown'
      });

      alert('Sale updated successfully!');
      navigate(`/invoice/${id}`);
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Failed to update sale.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="edit-sale-container">
      <h2>✏️ Edit Sale</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Amount (₵)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <button type="submit">💾 Save Changes</button>
      </form>

      {/* ✅ Embedded CSS */}
      <style>{`
        .edit-sale-container {
          max-width: 800px;
          margin: 50px auto;
          padding: 30px;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', sans-serif;
        }

        .edit-sale-container h2 {
          text-align: center;
          font-size: 2rem;
          color: #ff6b35;
          margin-bottom: 30px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: #555;
        }

        input {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          transition: border 0.3s, box-shadow 0.3s;
        }

        input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 5px rgba(255,107,53,0.4);
          outline: none;
        }

        button {
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: #ff6b35;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }

        button:hover {
          background: #e65a28;
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default EditSale;
