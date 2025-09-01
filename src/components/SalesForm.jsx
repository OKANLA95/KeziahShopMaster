import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SalesForm() {
  const [items, setItems] = useState([]);
  const [productName, setProductName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const addItem = () => {
    if (!productName || !unitPrice || !quantity) {
      alert('Please fill all item fields.');
      return;
    }

    const newItem = {
      productId: Date.now().toString(), // simple unique id
      productName,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      total: parseFloat(unitPrice) * parseInt(quantity),
    };

    setItems([...items, newItem]);
    setProductName('');
    setUnitPrice('');
    setQuantity('');
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert('Add at least one item to the sale.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'sales'), {
        userId: user.uid,
        userName: user.displayName || 'Unknown',
        timestamp: serverTimestamp(),
        totalAmount,
        paymentMethod,
        items,
      });

      alert('✅ Sale recorded successfully!');
      setItems([]);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>Record Sale</h2>

      <div style={{ marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Unit Price"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button onClick={addItem}>Add Item</button>
      </div>

      <h4>Items</h4>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            {item.quantity} x {item.productName} @ {item.unitPrice} = {item.total.toFixed(2)}
          </li>
        ))}
      </ul>

      <h3>Total: GHS {totalAmount.toFixed(2)}</h3>

      <label>
        Payment Method:
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="momo">Mobile Money</option>
          <option value="card">Card</option>
        </select>
      </label><br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Submit Sale'}
      </button>
    </div>
  );
}
