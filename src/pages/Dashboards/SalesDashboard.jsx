import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';
import Sidebar from "../../components/SaleSidebar";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { userData, loading: authLoading } = useAuth();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleSalesCount, setVisibleSalesCount] = useState(5);
  const [filterDate, setFilterDate] = useState('');
  const [showProductsModal, setShowProductsModal] = useState(false);

  useEffect(() => {
    if (!userData) return;

    // Fetch sales
    const salesRef = query(
      collection(db, 'sales'),
      where('shopId', '==', userData.shopId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeSales = onSnapshot(salesRef, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(data);
    });

    // Fetch products & detect low stock
    const productsRef = query(
      collection(db, 'inventory'),
      where('shopId', '==', userData.shopId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeProducts = onSnapshot(productsRef, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);

      const lowStock = data.filter(p => p.stock <= 3);
      setLowStockProducts(lowStock);
    });

    return () => {
      unsubscribeSales();
      unsubscribeProducts();
    };
  }, [userData]);

  if (authLoading) return <p>Loading...</p>;

  const handleSell = async (product) => {
    if (product.stock <= 0) {
      alert(`⚠️ ${product.name} is out of stock!`);
      return;
    }

    try {
      await addDoc(collection(db, 'sales'), {
        customerName: 'Walk-in',
        productName: product.name,
        productId: product.id,
        quantity: 1,
        amount: product.price,
        shopId: userData.shopId,
        status: 'pending',
        createdAt: Timestamp.now(),
        salesperson: userData.fullName
      });

      await updateDoc(doc(db, 'inventory', product.id), {
        stock: product.stock - 1
      });

      alert('Sale recorded and stock updated!');
    } catch (err) {
      console.error('Error recording sale:', err);
      alert('Failed to record sale.');
    }
  };

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} — ₵${p.price} (Stock: ${p.stock})`,
    data: p
  }));

  const filteredSales = filterDate
    ? sales.filter(
        sale =>
          new Date(sale.createdAt.seconds * 1000).toLocaleDateString() ===
          new Date(filterDate).toLocaleDateString()
      )
    : sales;

  const topProduct = (() => {
    const countMap = {};
    filteredSales.forEach(sale => {
      countMap[sale.productName] = (countMap[sale.productName] || 0) + 1;
    });
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  })();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: 20, maxWidth: 1000, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 'bold', color: '#4f46e5' }}>Sales Dashboard</h2>
          <button onClick={() => navigate('/login')} style={logoutBtn}>Logout</button>
        </header>

        {/* 📊 Stats */}
        <section style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <h4>Total Orders</h4>
            <p>{sales.length}</p>
          </div>
          <div style={cardStyle}>
            <h4>Top Product</h4>
            <p>{topProduct}</p>
          </div>
          <div style={{ ...cardStyle, background: '#fff3cd', color: '#856404' }}>
            <h4>Low Stock</h4>
            <p>{lowStockProducts.length} items</p>
          </div>
        </section>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 15, marginTop: 20 }}>
          <button style={sellMainBtn} onClick={() => navigate('/add-sale')}>SELL NOW</button>
          <button style={primaryBtn} onClick={() => setShowProductsModal(true)}>📦 View Products</button>
        </div>

        {/* Search & Sell */}
        <section style={{ marginTop: 30 }}>
          <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Search & Sell Product</h3>
          <Select
            options={productOptions}
            onChange={setSelectedProduct}
            placeholder="🔍 Search a product..."
            styles={{
              control: base => ({ ...base, padding: 5, borderRadius: 6 }),
              menu: base => ({ ...base, zIndex: 999 })
            }}
          />
          {selectedProduct && (
            <div style={{ ...productCard, marginTop: 15 }}>
              <h4>{selectedProduct.data.name}</h4>
              <p>₵{selectedProduct.data.price}</p>
              <p style={{ color: selectedProduct.data.stock <= 3 ? 'red' : '#555' }}>
                Stock: {selectedProduct.data.stock}
              </p>
              <button
                onClick={() => handleSell(selectedProduct.data)}
                style={sellBtn}
                disabled={selectedProduct.data.stock <= 0}
              >
                Sell
              </button>
            </div>
          )}
        </section>

        {/* Recent Sales */}
        <section style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Recent Sales</h3>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ padding: 6, borderRadius: 6, marginBottom: 10 }}
          />
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Date</th>
                <th>Total (₵)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, visibleSalesCount).map(sale => (
                <tr key={sale.id}>
                  <td>{sale.customerName}</td>
                  <td>{sale.productName}</td>
                  <td>{sale.status}</td>
                  <td>{new Date(sale.createdAt.seconds * 1000).toLocaleDateString()}</td>
                  <td>{sale.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleSalesCount < filteredSales.length && (
            <button onClick={() => setVisibleSalesCount(prev => prev + 5)} style={primaryBtn}>
              See More
            </button>
          )}
        </section>

        {/* Modal */}
        {showProductsModal && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h3>Live Products</h3>
              <button onClick={() => setShowProductsModal(false)} style={closeBtn}>Close</button>
              {products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <ul>
                  {products.map(p => (
                    <li key={p.id}>{p.name} — ₵{p.price} — Stock: {p.stock}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Styles (keep your existing ones)
const cardStyle = { background: '#fff', padding: 20, borderRadius: 10, flex: 1, minWidth: 150, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const primaryBtn = { padding: '10px 20px', borderRadius: 6, background: '#4f46e5', color: '#fff', fontWeight: 'bold', cursor: 'pointer' };
const sellMainBtn = { padding: '10px 20px', borderRadius: 6, background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer' };
const logoutBtn = { padding: '10px 20px', borderRadius: 6, background: '#f87171', color: '#fff', fontWeight: 'bold', cursor: 'pointer' };
const productCard = { padding: 15, borderRadius: 10, background: '#f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' };
const sellBtn = { marginTop: 10, padding: '8px 12px', borderRadius: 6, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 10 };
const modalOverlay = { position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 999 };
const modalContent = { background:'#fff', padding:20, borderRadius:10, width:'80%', maxHeight:'80%', overflowY:'auto', boxShadow:'0 4px 12px rgba(0,0,0,0.2)' };
const closeBtn = { marginBottom:10, padding:'5px 10px', borderRadius:6, background:'#f87171', color:'#fff', border:'none', cursor:'pointer' };

export default SalesDashboard;
