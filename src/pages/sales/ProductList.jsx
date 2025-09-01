import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const ProductList = ({ userRole, shopId, showActions = false, onEdit, onDelete }) => {
  const { userData } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;

    const q = query(
      collection(db, "inventory"),
      where("shopId", "==", shopId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [shopId]);

  const handleSell = async (product) => {
    if (product.stock <= 0) {
      alert(`⚠️ ${product.name} is out of stock!`);
      return;
    }

    try {
      await addDoc(collection(db, "sales"), {
        customerName: "Walk-in",
        productName: product.name,
        productId: product.id,
        quantity: 1,
        amount: product.price,
        shopId: shopId,
        status: "pending",
        createdAt: Timestamp.now(),
        salesperson: userData.fullName,
      });

      await updateDoc(doc(db, "inventory", product.id), {
        stock: product.stock - 1,
      });

      alert("Sale recorded and stock updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to record sale.");
    }
  };

  if (loading) return <p className="loading">Loading products...</p>;
  if (!products.length) return <p className="no-products">No products found.</p>;

  return (
    <>
      <style>{`
        .product-list { padding: 20px; }
        .title { font-size: 1.5rem; font-weight: bold; margin-bottom: 15px; color: #333; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .product-card { background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: transform 0.2s ease; }
        .product-card:hover { transform: scale(1.02); }
        .product-name { font-size: 1.2rem; font-weight: 600; margin-bottom: 10px; color: #444; }
        .loading, .no-products { text-align: center; font-size: 1.1rem; color: #666; }
        .low-stock { color: #e63946; font-weight: bold; }
        .in-stock { color: #2a9d8f; font-weight: bold; }
        .actions { margin-top: 12px; display: flex; gap: 10px; }
        .btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: background 0.3s ease; }
        .btn.edit { background: #2196f3; color: #fff; }
        .btn.edit:hover { background: #1976d2; }
        .btn.delete { background: #f44336; color: #fff; }
        .btn.delete:hover { background: #d32f2f; }
        .btn.sell { background: #10b981; color: #fff; }
        .btn.sell:hover { background: #0f9d77; }
      `}</style>

      <div className="product-list">
        <h2 className="title">📦 Product List</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h4 className="product-name">{product.name || "Unnamed Product"}</h4>
              <p>Price: ₵{Number(product.price || 0).toFixed(2)}</p>

              {userRole !== "Sales" && (
                <p>Cost Price: ₵{Number(product.costPrice || 0).toFixed(2)}</p>
              )}

              <p>Discount: {product.discount ?? 0}%</p>
              <p>
                Stock:{" "}
                <span className={product.stock <= 3 ? "low-stock" : "in-stock"}>
                  {product.stock ?? "N/A"}
                </span>
              </p>
              <p>Category: {product.category ?? "N/A"}</p>
              <p>Unit: {product.unit ?? "N/A"}</p>

              {/* Sell Button for Sales */}
              {userRole === "Sales" && (
                <button className="btn sell" onClick={() => handleSell(product)} disabled={product.stock <= 0}>
                  Sell Now
                </button>
              )}

              {/* Optional edit/delete actions */}
              {showActions && (
                <div className="actions">
                  <button onClick={() => onEdit(product)} className="btn edit">
                    Edit
                  </button>
                  <button onClick={() => onDelete(product.id)} className="btn delete">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductList;
