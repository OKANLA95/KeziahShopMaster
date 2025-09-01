// src/pages/dashboards/AddSale.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function AddSale() {
  const [products, setProducts] = useState([]);
  const [saleItems, setSaleItems] = useState([{ productId: '', quantity: '', amount: 0 }]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [shopId, setShopId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setShopId(userData.shopId || null);
          setSalesperson(userData.fullName || user.displayName || user.email || "Unknown Salesperson");

          if (userData.shopId) {
            const q = query(collection(db, "inventory"), where("shopId", "==", userData.shopId));
            const snapshot = await getDocs(q);
            const productList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setProducts(productList);
          }
        }
      } catch (err) {
        console.error("Error fetching shop data:", err);
      }
    };
    fetchShopData();
  }, []);

  const addItemRow = () => setSaleItems([...saleItems, { productId: '', quantity: '', amount: 0 }]);
  const removeItemRow = (index) => {
    const items = [...saleItems];
    items.splice(index, 1);
    setSaleItems(items);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...saleItems];
    items[index][field] = value;

    const product = products.find(p => p.id === items[index].productId);
    const qty = Number(items[index].quantity);

    if (product && qty > 0) {
      const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
      items[index].amount = Number((discountedPrice * qty).toFixed(2));
    } else {
      items[index].amount = 0;
    }

    setSaleItems(items);
  };

  const totalAmount = saleItems.reduce((sum, i) => sum + (i.amount || 0), 0);

  const generateInvoiceNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `INV-${dateStr}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i of saleItems) {
      const product = products.find(p => p.id === i.productId);
      if (!product || !i.quantity) {
        alert("Please fill all product fields.");
        return;
      }
      if (Number(i.quantity) > product.stock) {
        alert(`Not enough stock for ${product.name}.`);
        return;
      }
    }
    if (!customerName || !customerPhone) {
      alert("Please fill customer info.");
      return;
    }

    setLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      console.log("Generated Invoice Number:", invoiceNumber);

      for (let item of saleItems) {
        const product = products.find(p => p.id === item.productId);

        await addDoc(collection(db, "sales"), {
          shopId,
          invoiceNumber,
          customerName,
          customerPhone,
          productName: product.name,
          productId: product.id,
          quantity: Number(item.quantity),
          amount: item.amount,
          discount: product.discount || 0,
          costPrice: product.costPrice || 0,
          salesperson,
          createdBy: auth.currentUser?.uid || "unknown",
          createdAt: Timestamp.now(),
          status: "confirmed"
        });

        const inventoryRef = doc(db, "inventory", product.id);
        await updateDoc(inventoryRef, { stock: product.stock - Number(item.quantity) });
      }

      navigate(`/invoice/${invoiceNumber}`);
    } catch (err) {
      console.error("Error saving sale:", err);
      alert("Failed to save sale.");
    }
    setLoading(false);
  };

  return (
    <div className="add-sale-container">
      <h2>🧾 Record a New Sale</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Customer Phone</label>
            <input
              type="tel"
              placeholder="055XXXXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {saleItems.map((item, index) => (
          <div className="form-row" key={index}>
            <div className="form-group">
              <label>Select Product</label>
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                required
              >
                <option value="">-- Choose a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — GHS {p.price} {p.discount ? `(Discount: ${p.discount}%)` : ""} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="text" value={`GHS ${item.amount}`} disabled />
            </div>
            {saleItems.length > 1 && (
              <div className="form-group">
                <label>&nbsp;</label>
                <button type="button" onClick={() => removeItemRow(index)} style={{ background: "#ff4d4d" }}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        <button type="button" onClick={addItemRow} style={{ background: "#4ac45a" }}>
          ➕ Add Another Product
        </button>

        <div className="form-group">
          <label>Salesperson</label>
          <input type="text" value={salesperson} readOnly />
        </div>

        <div className="form-group">
          <label>Total Amount</label>
          <input type="text" value={`GHS ${totalAmount}`} disabled />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving Sale..." : "💾 Save & Generate Invoice"}
        </button>
      </form>

      <style>{`
        .add-sale-container {
          max-width: 850px;
          margin: 50px auto;
          padding: 30px;
          background: #fefefe;
          border-radius: 15px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', sans-serif;
        }
        .add-sale-container h2 {
          text-align: center;
          font-size: 2rem;
          color: #4a3aff;
          margin-bottom: 30px;
        }
        .form-row { display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-end; }
        .form-group { flex: 1; display: flex; flex-direction: column; }
        label { font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; color: #555; }
        input, select, button {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          transition: border 0.3s, box-shadow 0.3s;
        }
        input:focus, select:focus { border-color: #4a3aff; box-shadow: 0 0 5px rgba(74,58,255,0.4); outline: none; }
        input[disabled] { background: #f1f1f1; cursor: not-allowed; }
        button { border: none; color: white; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
        button:hover:not(:disabled) { transform: scale(1.02); }
        button:disabled { background: #aaa; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default AddSale;
