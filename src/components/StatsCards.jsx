// src/components/StatsCards.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const StatsCards = () => {
  const [sales, setSales] = useState([]);
  const [topProduct, setTopProduct] = useState('');
  const [salesTarget, setSalesTarget] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesData = snapshot.docs.map((doc) => doc.data());
      setSales(salesData);

      // Calculate total sales
      const totalSales = salesData.reduce((sum, s) => sum + s.amount, 0);
      const target = 1000; // Set your target here
      setSalesTarget(Math.min(100, Math.round((totalSales / target) * 100)));

      // Find top product by quantity
      const productCount = {};
      salesData.forEach((sale) => {
        if (!productCount[sale.productName]) productCount[sale.productName] = 0;
        productCount[sale.productName] += sale.quantity;
      });
      const top = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0];
      setTopProduct(top ? top[0] : 'N/A');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {/* Sales Target */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500 text-sm">Sales Target</div>
        <div className="text-2xl font-bold text-blue-600 mt-2">{salesTarget}% Achieved</div>
        <div className="w-full bg-gray-200 h-2 rounded mt-4">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${salesTarget}%` }}
          ></div>
        </div>
      </div>

      {/* Top Product */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500 text-sm">Top Product</div>
        <div className="text-2xl font-bold text-green-600 mt-2">{topProduct}</div>
      </div>
    </div>
  );
};

export default StatsCards;
