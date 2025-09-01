// src/components/RecentSales.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function RecentSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (!user?.shopId) return;

    const q = query(
      collection(db, "sales"),
      where("shopId", "==", user.shopId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSales(salesData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="recent-sales-container">
      <h2>Recent Sales</h2>
      {sales.length === 0 ? (
        <p>No sales yet for your shop.</p>
      ) : (
        <ul>
          {sales.map((sale) => (
            <li key={sale.id}>
              <strong>Invoice:</strong> {sale.invoiceNumber || `INV-${sale.id.slice(0,6).toUpperCase()}`} <br />
              <strong>Amount:</strong> GHS {sale.amount} <br />
              <strong>Status:</strong> {sale.status === "pending" ? "Confirmed" : sale.status} <br />
              <strong>Sold By:</strong> {sale.soldBy || "Unknown"} <br />
              <small>{sale.createdAt?.toDate().toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
