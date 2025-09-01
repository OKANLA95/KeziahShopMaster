import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProductList from "../components/ProductList";

export default function AddProduct() {
  const { userData, loading } = useAuth();
  const formRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    costPrice: "",
    discount: "",
    category: "",
    unit: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  const categories = {
    Electronic: ["Piece", "Box", "Set"],
    Food: ["Kg", "Gram", "Packet"],
    Wears: ["Piece", "Set"],
    Electricals: ["Piece", "Box"],
    Vehicles: ["Unit", "Set"],
    Medical: ["Bottle", "Pack", "Unit"],
    Toiletries: ["Piece", "Pack"],
    Others: ["Piece", "Pack", "Unit"],
  };

  // 🔹 Real-time fetch from 'inventory' collection with safety check
  useEffect(() => {
    if (!loading && userData?.shopId) {
      setProductsLoading(true);
      const q = query(
        collection(db, "inventory"),
        where("shopId", "==", userData.shopId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          items.sort((a, b) => a.name.localeCompare(b.name));
          setProducts(items);
          setProductsLoading(false);
        },
        (error) => {
          console.error("Error fetching products:", error);
          setProducts([]);
          setProductsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      console.warn("No shopId available. Skipping Firestore listener.");
      setProducts([]);
      setProductsLoading(false);
    }
  }, [userData, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "category") {
      setForm((prev) => ({ ...prev, unit: categories[value]?.[0] || "" }));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      costPrice: "",
      discount: "",
      category: "",
      unit: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData?.shopId) {
      alert("Cannot save product: Shop ID missing!");
      return;
    }

    const { name, price, stock, costPrice, discount, category, unit } = form;
    if (!name || !price || !stock || !category || !unit) {
      alert("Please fill all required fields");
      return;
    }

    setLoadingAction(true);

    try {
      const productData = {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        unit,
        discount: parseFloat(discount || 0),
        updatedAt: serverTimestamp(),
        shopId: userData.shopId,
      };

      if (userData.role === "Manager" || userData.role === "Finance") {
        productData.costPrice = parseFloat(costPrice || 0);
      }

      if (editingId) {
        await updateDoc(doc(db, "inventory", editingId), productData);
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, "inventory"), productData);
      }

      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      costPrice: product.costPrice || "",
      discount: product.discount || 0,
      category: product.category || "",
      unit: product.unit || "",
    });
    setEditingId(product.id);
    if (formRef.current) formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "inventory", id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  if (loading || !userData) return <p>Loading Products...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card} ref={formRef}>
        <h2 style={styles.subHeading}>
          {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="name" placeholder="Product name" value={form.name} onChange={handleChange} required style={styles.input} />
          <input type="number" name="price" placeholder="Selling Price" value={form.price} onChange={handleChange} required style={styles.input} />
          <input type="number" name="stock" placeholder="Stock Quantity" value={form.stock} onChange={handleChange} required style={styles.input} />
          {(userData.role === "Manager" || userData.role === "Finance") && (
            <input type="number" name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} style={styles.input} />
          )}
          <input type="number" name="discount" placeholder="Discount (%)" value={form.discount} onChange={handleChange} style={styles.input} />
          <select name="category" value={form.category} onChange={handleChange} required style={styles.input}>
            <option value="">Select Category</option>
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select name="unit" value={form.unit} onChange={handleChange} required style={styles.input}>
            <option value="">Select Unit</option>
            {categories[form.category]?.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loadingAction} style={styles.button}>
              {editingId ? (loadingAction ? "Updating..." : "Update Product") : (loadingAction ? "Saving..." : "Add Product")}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} disabled={loadingAction} style={styles.cancelButton}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <ProductList
        products={products}
        userRole={userData.role}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={productsLoading}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "50px auto",
    padding: 30,
    background: "linear-gradient(135deg, #f5f5ff, #e0e0ff)",
    borderRadius: 20,
    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    padding: 25,
    borderRadius: 15,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    marginBottom: 40,
  },
  subHeading: { marginBottom: 20, fontSize: "1.5rem", color: "#362bd9", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  input: { padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, outline: "none", transition: "all 0.3s" },
  button: { flex: 1, padding: 14, border: "none", borderRadius: 10, background: "#4a3aff", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", transition: "all 0.3s ease" },
  cancelButton: { flex: 1, padding: 14, border: "none", borderRadius: 10, background: "#ccc", color: "#333", fontSize: 16, cursor: "pointer" },
};
