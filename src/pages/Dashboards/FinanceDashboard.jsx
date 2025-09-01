// src/pages/dashboards/FinanceDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { commonStyles } from '../../styles/commonStyles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showCount, setShowCount] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc');
  const reportRef = useRef();

  // Fetch logged-in user data
  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) throw new Error('User data not found');
      setUserData(userDoc.data());
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Live transactions
  useEffect(() => {
    if (!userData?.shopId) return;
    const q = query(collection(db, 'transactions'), where('shopId', '==', userData.shopId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(txns);
      },
      (error) => console.error('Error listening to transactions:', error)
    );
    return () => unsubscribe();
  }, [userData]);

  // Live sales with proper COGS
  useEffect(() => {
    if (!userData?.shopId) return;
    const q = query(collection(db, 'sales'), where('shopId', '==', userData.shopId));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const salesData = [];
        for (let docSnap of snapshot.docs) {
          const sale = { id: docSnap.id, ...docSnap.data() };
          try {
            const productDoc = await getDoc(doc(db, 'inventory', sale.productId));
            if (productDoc.exists()) {
              const product = productDoc.data();
              sale.costPrice = safeNumber(product.costPrice); // cost per unit
              sale.quantity = safeNumber(sale.quantity);
              sale.totalCOGS = sale.costPrice * sale.quantity; // total COGS for this sale
              sale.productName = product.name || 'Sale';
            } else {
              sale.costPrice = 0;
              sale.quantity = safeNumber(sale.quantity);
              sale.totalCOGS = 0;
              sale.productName = 'Sale';
            }
          } catch {
            sale.costPrice = 0;
            sale.quantity = safeNumber(sale.quantity);
            sale.totalCOGS = 0;
            sale.productName = 'Sale';
          }
          salesData.push(sale);
        }
        setSales(salesData);
      },
      (error) => console.error('Error listening to sales:', error)
    );
    return () => unsubscribe();
  }, [userData]);

  // Live shop expenses
  useEffect(() => {
    if (!userData?.shopId) return;
    const q = query(collection(db, 'shops', userData.shopId, 'expenses'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenses(expData);
      },
      (error) => console.error('Error listening to expenses:', error)
    );
    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const safeNumber = (val) => (typeof val === 'number' ? val : Number(val) || 0);

  // Totals
  const totalRevenue = sales.reduce((acc, s) => acc + safeNumber(s.amount), 0);
  const totalCOGS = sales.reduce((acc, s) => acc + safeNumber(s.totalCOGS), 0); // sum of sold items only
  const totalExpenses = [
    ...transactions.filter(txn => txn.type === 'expense'),
    ...expenses
  ].reduce((acc, item) => acc + safeNumber(item.amount), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(value || 0);

  const combinedEntries = [
    ...transactions.map(txn => ({
      ...txn,
      entryType: 'transaction',
      date: txn.createdAt?.toDate?.() || new Date(0)
    })),
    ...sales.map(sale => ({
      ...sale,
      entryType: 'sale',
      date: sale.createdAt?.toDate?.() || new Date(0)
    })),
    ...expenses.map(exp => ({
      ...exp,
      entryType: 'expense',
      date: exp.createdAt?.toDate?.() || new Date(0)
    }))
  ].sort((a, b) => sortOrder === 'desc' ? b.date - a.date : a.date - b.date);

  // Chart remains unchanged
  const chartData = {
    labels: ['Revenue', 'Expenses', 'Net Profit'],
    datasets: [
      {
        label: 'GHS',
        data: [totalRevenue, totalExpenses, netProfit],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',
          'rgba(244, 67, 54, 0.7)',
          'rgba(33, 150, 243, 0.7)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(33, 150, 243, 1)'
        ],
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Financial Overview',
        font: { size: 18, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (context) => `GHS ${context.raw.toLocaleString()}`
        }
      },
      datalabels: {
        color: '#000',
        anchor: 'end',
        align: 'end',
        formatter: (value) => `GHS ${value.toLocaleString()}`,
        font: { weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val) => `GHS ${val.toLocaleString()}` },
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      x: { grid: { display: false } }
    }
  };

  // Export functions unchanged (PDF & Excel)
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`Finance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Finance Summary');
    worksheet.columns = [
      { header: 'Category', key: 'Category', width: 30 },
      { header: 'Type', key: 'Type', width: 20 },
      { header: 'Revenue (GHS)', key: 'Revenue', width: 15 },
      { header: 'COGS (GHS)', key: 'COGS', width: 15 },
      { header: 'Profit (GHS)', key: 'Profit', width: 15 },
      { header: 'Date', key: 'Date', width: 20 }
    ];

    const rows = combinedEntries.map(entry => {
      if (entry.entryType === 'sale') {
        const revenue = safeNumber(entry.amount);
        const cogs = safeNumber(entry.totalCOGS);
        const profit = revenue - cogs;
        return {
          Category: entry.productName || 'Sale',
          Type: 'Revenue',
          Revenue: revenue,
          COGS: cogs,
          Profit: profit,
          Date: entry.date?.toLocaleDateString() || 'N/A'
        };
      } else if (entry.entryType === 'expense') {
        return {
          Category: entry.category || 'Other',
          Type: 'Shop Expense',
          Revenue: 0,
          COGS: 0,
          Profit: -safeNumber(entry.amount),
          Date: entry.date?.toLocaleDateString() || 'N/A'
        };
      } else { // transaction
        return {
          Category: entry.category || 'N/A',
          Type: entry.type || 'N/A',
          Revenue: 0,
          COGS: 0,
          Profit: safeNumber(entry.amount),
          Date: entry.date?.toLocaleDateString() || 'N/A'
        };
      }
    });

    worksheet.addRows(rows);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Finance_Summary_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div style={styles.container} ref={reportRef}>
      <header style={styles.header}>
        <h2>Finance Dashboard</h2>
        <div>
          <button style={styles.primaryBtn} onClick={() => navigate('/expenses')}>
            💰 Go to Expenses
          </button>
          <button onClick={() => navigate('/login')} style={{ ...styles.logoutButton, marginLeft: 10 }}>
            Logout
          </button>
        </div>
      </header>

      {/* Professional Chart */}
      <section style={{ marginBottom: 20 }}>
        <Bar data={chartData} options={chartOptions} />
      </section>

      {/* Stats Cards */}
      <section style={styles.stats}>
        <div style={styles.card}>
          <h4>Total Revenue</h4>
          <p style={{ color: totalRevenue < 0 ? 'red' : 'black' }}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div style={styles.card}>
          <h4>Cost of Goods Sold</h4>
          <p>{formatCurrency(totalCOGS)}</p>
        </div>
        <div style={styles.card}>
          <h4>Gross Profit</h4>
          <p style={{ color: grossProfit < 0 ? 'red' : 'black' }}>{formatCurrency(grossProfit)}</p>
        </div>
        <div style={styles.card}>
          <h4>Total Expenses</h4>
          <p>{formatCurrency(totalExpenses)}</p>
        </div>
        <div style={styles.card}>
          <h4>Net Profit</h4>
          <p style={{ color: netProfit < 0 ? 'red' : 'black' }}>{formatCurrency(netProfit)}</p>
        </div>
      </section>

      {/* Table & Exports */}
      <div style={{ marginBottom: 15 }}>
        <button style={styles.primaryBtn} onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
          {sortOrder === 'desc' ? 'Sort Oldest First' : 'Sort Newest First'}
        </button>
        <button style={{ ...styles.primaryBtn, marginLeft: 10 }} onClick={exportToPDF}>
          📄 Export PDF
        </button>
        <button style={{ ...styles.primaryBtn, marginLeft: 10 }} onClick={exportToExcel}>
          📊 Export Excel
        </button>
      </div>

      <section>
        <h3>Financial Summary</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Revenue (GHS)</th>
              <th>COGS (GHS)</th>
              <th>Profit (GHS)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {combinedEntries.slice(0, showCount).map(entry => {
              const revenue = entry.entryType === 'sale' ? safeNumber(entry.amount) : 0;
              const cogs = entry.entryType === 'sale' ? safeNumber(entry.totalCOGS) : 0;
              const profit = entry.entryType === 'sale' ? revenue - cogs : entry.entryType === 'expense' ? -safeNumber(entry.amount) : safeNumber(entry.amount);

              return (
                <tr key={`${entry.entryType}-${entry.id}`}>
                  <td>{entry.entryType === 'sale' ? entry.productName : entry.category || 'N/A'}</td>
                  <td>{entry.entryType === 'sale' ? 'Revenue' : entry.entryType === 'expense' ? 'Shop Expense' : entry.type || 'N/A'}</td>
                  <td style={{ color: revenue < 0 ? 'red' : 'black' }}>{formatCurrency(revenue)}</td>
                  <td style={{ color: cogs < 0 ? 'red' : 'black' }}>{formatCurrency(cogs)}</td>
                  <td style={{ color: profit < 0 ? 'red' : 'black', fontWeight: profit < 0 ? 'bold' : 'normal' }}>{formatCurrency(profit)}</td>
                  <td>{entry.date ? entry.date.toLocaleDateString() : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {showCount < combinedEntries.length && (
          <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={() => setShowCount(showCount + 10)}>
            See More
          </button>
        )}
      </section>
    </div>
  );
};

const styles = {
  ...commonStyles()
};

export default FinanceDashboard;
