// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Your shopId for dev purposes
  const shopId = "4a308fde-23c7-4ab8-8b52-bc9f5283a76f";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, "inventory"), 
          where("shopId", "==", shopId)
        );
        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(items);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId]);

  return (
    <div className="inventory-container">
      <style>{`
        .inventory-container {
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f9fafb;
          min-height: 100vh;
        }

        .inventory-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .product-card {
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
        }

        .product-name {
          font-size: 18px;
          font-weight: bold;
          color: #222;
          margin-bottom: 8px;
        }

        .product-category {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .product-price {
          font-size: 16px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 6px;
        }

        .product-stock {
          font-size: 14px;
          color: #16a34a;
          margin-bottom: 6px;
        }

        .product-unit {
          font-size: 14px;
          color: #444;
        }

        .no-products {
          font-size: 16px;
          color: #888;
          text-align: center;
          margin-top: 30px;
        }
      `}</style>

      <h2 className="inventory-title">📦 Shop Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length > 0 ? (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-name">{product.name}</div>
              <div className="product-category">{product.category}</div>
              <div className="product-price">Price: GH₵ {product.price}</div>
              <div className="product-stock">Stock: {product.stock}</div>
              <div className="product-unit">Unit: {product.unit}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-products">No products found</p>
      )}
    </div>
  );
}
