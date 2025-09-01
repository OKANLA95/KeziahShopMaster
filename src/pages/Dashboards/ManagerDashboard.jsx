import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import ProductList from '../../components/ProductList';
import ShopReportForm from '../../components/ShopReportForm';
import Expenses from '../Expenses';

const ManagerDashboard = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();

  const [recentSales, setRecentSales] = useState([]);
  const [previousSales, setPreviousSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [mostSoldProduct, setMostSoldProduct] = useState('');
  const [mostProfitableProduct, setMostProfitableProduct] = useState('');
  const [inventory, setInventory] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [salesFilters, setSalesFilters] = useState({
    product: '',
    customer: '',
    startDate: '',
    endDate: ''
  });

  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllPrevious, setShowAllPrevious] = useState(false);

  // Fetch sales safely
  useEffect(() => {
    if (!loading && userData?.shopId) {
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, where('shopId', '==', userData.shopId), orderBy('createdAt', 'desc'));

      const unsubscribeSales = onSnapshot(q, snapshot => {
        let total = 0;
        const recent = [];
        const previous = [];
        const productCount = {};
        const productRevenue = {};

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const amount = Number(data.amount) || 0;
          const createdAt = data.createdAt?.toDate() || new Date(0);

          total += amount;

          const sale = {
            id: doc.id,
            product: data.productName || "N/A",
            customer: data.customerName || "N/A",
            salesperson: data.salesperson || "N/A",
            date: createdAt.toLocaleDateString(),
            amount
          };

          if (createdAt >= oneDayAgo) recent.push(sale);
          else previous.push(sale);

          productCount[sale.product] = (productCount[sale.product] || 0) + 1;
          productRevenue[sale.product] = (productRevenue[sale.product] || 0) + sale.amount;
        });

        recent.sort((a,b) => new Date(b.date) - new Date(a.date));
        previous.sort((a,b) => new Date(b.date) - new Date(a.date));

        setRecentSales(recent);
        setPreviousSales(previous);
        setTotalSales(total);

        setMostSoldProduct(
          Object.keys(productCount).length
            ? Object.keys(productCount).reduce((a, b) => productCount[a] > productCount[b] ? a : b)
            : 'N/A'
        );

        setMostProfitableProduct(
          Object.keys(productRevenue).length
            ? Object.keys(productRevenue).reduce((a, b) => productRevenue[a] > productRevenue[b] ? a : b)
            : 'N/A'
        );
      });

      return () => unsubscribeSales();
    }
  }, [userData, loading]);

  // Fetch inventory safely
  useEffect(() => {
    const fetchInventory = async () => {
      if (!loading && userData?.shopId) {
        setProductsLoading(true);
        try {
          const inventoryRef = collection(db, 'inventory');
          const iq = query(inventoryRef, where('shopId', '==', userData.shopId), orderBy('name', 'asc'));
          const snapshot = await getDocs(iq);
          setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error('Error fetching inventory:', err);
          setInventory([]);
        }
        setProductsLoading(false);
      }
    };
    fetchInventory();
  }, [userData, loading]);

  // Fetch expenses safely
  useEffect(() => {
    if (!loading && userData?.shopId) {
      const expensesRef = collection(db, 'expenses'); // If you have subcollection: collection(db, 'shops', userData.shopId, 'expenses')
      const q = query(expensesRef, where('shopId', '==', userData.shopId), orderBy('createdAt', 'desc'));

      const unsubscribeExpenses = onSnapshot(q, snapshot => {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribeExpenses();
    }
  }, [userData, loading]);

  if (loading) return <p>Loading dashboard...</p>;

  // Apply filters to previous sales
  const filteredPrevious = previousSales.filter(s => {
    const matchesProduct = salesFilters.product ? s.product.toLowerCase().includes(salesFilters.product.toLowerCase()) : true;
    const matchesCustomer = salesFilters.customer ? s.customer.toLowerCase().includes(salesFilters.customer.toLowerCase()) : true;

    let matchesDate = true;
    if (salesFilters.startDate) matchesDate = new Date(s.date) >= new Date(salesFilters.startDate);
    if (salesFilters.endDate) matchesDate = matchesDate && (new Date(s.date) <= new Date(salesFilters.endDate));

    return matchesProduct && matchesCustomer && matchesDate;
  });

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2> Manager Dashboard</h2>
        </header>

        {/* Stats */}
        <section className="stats">
          <div className="card">
            <h4>Total Sales</h4>
            <p>GHS {(Number(totalSales) || 0).toFixed(2)}</p>
          </div>
          <div className="card">
            <h4>Most Sold Product</h4>
            <p>{mostSoldProduct || 'N/A'}</p>
          </div>
          <div className="card">
            <h4>Most Profitable Product</h4>
            <p>{mostProfitableProduct || 'N/A'}</p>
          </div>
        </section>

        {/* Actions */}
        <section className="actions">
          <button onClick={() => setShowProducts(true)}>📦 View Products</button>
          <button onClick={() => navigate('/add-product')}>➕ Add Product</button>
          <button onClick={() => setShowReportForm(true)}>📊 Create and View Report</button>
          <button onClick={() => setShowExpenses(true)}>💰 Manage Expenses</button>
        </section>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="modal-backdrop" onClick={() => setShowReportForm(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>📊 Shop Report</h3>
              <ShopReportForm shopId={userData.shopId} />
              <button onClick={() => setShowReportForm(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Expenses Modal */}
        {showExpenses && (
          <div className="modal-backdrop" onClick={() => setShowExpenses(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>💰 Expenses Dashboard</h3>
              <Expenses expenses={expenses} /> {/* pass expenses state if component accepts */}
              <button onClick={() => setShowExpenses(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Recent Sales */}
        <section className="recent-sales">
          <h3>🕒 Recent Sales (Last 24 Hours)</h3>
          {recentSales.length === 0 ? (
            <p style={{ padding: '10px', color: '#555' }}>No recent sales in the last 24 hours.</p>
          ) : (
            <>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                Total Recent Sales: GHS {recentSales.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Salesperson</th>
                      <th>Date</th>
                      <th>Amount (GHS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllRecent ? recentSales : recentSales.slice(0, 10)).map(s => (
                      <tr key={s.id}>
                        <td>{s.product}</td>
                        <td>{s.customer}</td>
                        <td>{s.salesperson}</td>
                        <td>{s.date}</td>
                        <td>GHS {s.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {recentSales.length > 10 && (
                <button
                  onClick={() => setShowAllRecent(!showAllRecent)}
                  className="view-more-btn"
                >
                  {showAllRecent ? 'View Less' : 'View More'}
                </button>
              )}
            </>
          )}
        </section>

        {/* Previous Sales */}
        <section className="previous-sales">
          <h3>📦 Previous Sales</h3>
          <div className="filters" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input placeholder="Product" value={salesFilters.product} onChange={e => setSalesFilters({ ...salesFilters, product: e.target.value })} />
            <input placeholder="Customer" value={salesFilters.customer} onChange={e => setSalesFilters({ ...salesFilters, customer: e.target.value })} />
            <input type="date" value={salesFilters.startDate} onChange={e => setSalesFilters({ ...salesFilters, startDate: e.target.value })} />
            <input type="date" value={salesFilters.endDate} onChange={e => setSalesFilters({ ...salesFilters, endDate: e.target.value })} />
          </div>
          {filteredPrevious.length === 0 ? (
            <p style={{ padding: '10px', color: '#555' }}>No previous sales match your filter criteria.</p>
          ) : (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Salesperson</th>
                      <th>Date</th>
                      <th>Amount (GHS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllPrevious ? filteredPrevious : filteredPrevious.slice(0, 10)).map(s => (
                      <tr key={s.id}>
                        <td>{s.product}</td>
                        <td>{s.customer}</td>
                        <td>{s.salesperson}</td>
                        <td>{s.date}</td>
                        <td>GHS {s.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPrevious.length > 10 && (
                <button
                  onClick={() => setShowAllPrevious(!showAllPrevious)}
                  className="view-more-btn"
                >
                  {showAllPrevious ? 'View Less' : 'View More'}
                </button>
              )}
            </>
          )}
        </section>

        {/* Product Modal */}
        {showProducts && (
          <div className="modal-backdrop" onClick={() => setShowProducts(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>📦 Shop Products</h3>
              {productsLoading ? (
                <p>Loading products...</p>
              ) : inventory.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <ProductList products={inventory} showActions={false} />
              )}
              <button onClick={() => setShowProducts(false)}>Close</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .dashboard-container { display: flex; font-family: 'Segoe UI', sans-serif; }
        .dashboard-main { margin-left: 240px; padding: 20px; width: 100%; background: #f9fafc; min-height: 100vh; }
        .dashboard-header h2 { font-size: 1.8rem; color: #333; margin-bottom: 20px; }
        .stats { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
        .card { flex: 1; min-width: 200px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; }
        .card h4 { margin-bottom: 10px; font-size: 1rem; color: #666; }
        .card p { font-size: 1.3rem; font-weight: bold; color: #222; }
        .actions { display: flex; gap: 15px; margin-bottom: 30px; }
        .actions button { flex: 1; padding: 14px; border: none; border-radius: 10px; background: #4a3aff; color: white; font-size: 1rem; cursor: pointer; transition: background 0.3s; }
        .actions button:hover { background: #362bd9; }
        .table-scroll { max-height: 400px; overflow-y: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 10px; }
        .table-scroll table { width: 100%; border-collapse: collapse; }
        .table-scroll th { position: sticky; top: 0; background: #f4f4f9; z-index: 1; }
        th, td { padding: 14px; border-bottom: 1px solid #eee; text-align: left; }
        th { font-size: 0.95rem; color: #555; }
        td { font-size: 0.9rem; color: #333; }
        .modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; }
        .modal-content { background:#fff; padding:20px; border-radius:12px; max-height:80%; overflow:auto; width:80%; }
        .modal-content h3 { margin-bottom: 15px; }
        .modal-content button { margin-top: 10px; padding: 10px 20px; border:none; border-radius:6px; background:#4a3aff; color:#fff; cursor:pointer; }
        .filters input { padding: 6px 10px; border-radius:6px; border:1px solid #ccc; }
        .view-more-btn { margin-top: 10px; padding: 8px 16px; cursor: pointer; border-radius: 6px; border: none; background: #4a3aff; color: #fff; }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;
