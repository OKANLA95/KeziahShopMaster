// src/pages/Invoice.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Invoice() {
  const { invoiceNumber } = useParams();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const q = query(collection(db, "sales"), where("invoiceNumber", "==", invoiceNumber));
        const snapshot = await getDocs(q);
        const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSales(salesData);
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
      setLoading(false);
    };

    fetchSales();
  }, [invoiceNumber]);

  const totalAmount = sales.reduce((sum, item) => sum + (item.amount || 0), 0);

  if (loading) return <p>Loading invoice...</p>;
  if (!sales.length) return <p>No sales found for this invoice.</p>;

  const customer = sales[0];

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h1>🧾 Invoice</h1>
        <p><strong>Invoice Number:</strong> {invoiceNumber}</p>
        <p><strong>Customer:</strong> {customer.customerName}</p>
        <p><strong>Phone:</strong> {customer.customerPhone}</p>
        <p><strong>Salesperson:</strong> {customer.salesperson}</p>
        <p><strong>Date:</strong> {new Date(customer.createdAt.seconds * 1000).toLocaleString()}</p>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price (GHS)</th>
            <th>Discount (%)</th>
            <th>Amount (GHS)</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(item => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{(item.amount / item.quantity).toFixed(2)}</td>
              <td>{item.discount || 0}</td>
              <td>{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" style={{ textAlign: "right", fontWeight: "bold" }}>Total:</td>
            <td style={{ fontWeight: "bold" }}>GHS {totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="invoice-actions">
        <button onClick={() => window.print()}>🖨️ Print Invoice</button>
        <button onClick={() => navigate(-1)} style={{ background: "#4a3aff" }}>⬅ Back</button>
      </div>

      {/* CSS */}
      <style>{`
        .invoice-container {
          max-width: 900px;
          margin: 50px auto;
          padding: 30px;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', sans-serif;
        }
        .invoice-header h1 {
          text-align: center;
          color: #4a3aff;
        }
        .invoice-header p {
          margin: 4px 0;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .invoice-table th, .invoice-table td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: center;
        }
        .invoice-table th {
          background: #f4f4f4;
        }
        .invoice-actions {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        .invoice-actions button {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .invoice-actions button:hover {
          transform: scale(1.05);
        }
        .invoice-actions button:first-child {
          background: #4ac45a;
        }
        .invoice-actions button:last-child {
          background: #4a3aff;
        }
        @media print {
          .invoice-actions { display: none; }
        }
      `}</style>
    </div>
  );
}

export default Invoice;
