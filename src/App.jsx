import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/PublicDashboard';
import About from './pages/About';
import ContactSupport from './pages/ContactSupport';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import SalesDashboard from './pages/dashboards/SalesDashboard';
import FinanceDashboard from './pages/dashboards/FinanceDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AssignRole from './pages/AssignRole';
import Profile from './pages/Profile';
import Inventory from './pages/Inventory';
import AddSale from './pages/sales/AddSale';
import EditSale from './pages/sales/EditSale';
import Invoice from './pages/Invoice';
import AddProduct from "./pages/AddProduct";
import ProductList from './pages/sales/ProductList';
import Expenses from './pages/Expenses';
import ChangePassword from './pages/ChangePassword'; // Added

// Components
import ProtectedRoute from './components/ProtectedRoute';
import SalesFormPage from './components/SalesForm';

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/about" element={<About />} />
        <Route path="/contactsupport" element={<ContactSupport />} />

        {/* 🔐 General Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* 🎯 Role-Based Dashboards */}
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sales"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/finance"
          element={
            <ProtectedRoute allowedRoles={['Finance']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🛒 Sales Routes - Sales Role Only */}
        <Route
          path="/add-sale"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <AddSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/new"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <SalesFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-sale/:id"
          element={
            <ProtectedRoute allowedRoles={['Sales']}>
              <EditSale />
            </ProtectedRoute>
          }
        />

        {/* 🧾 Invoice - Public */}
        <Route path="/invoice/:id" element={<Invoice />} />

        {/* 📦 Inventory & Products - Manager Only */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* 💰 Expenses - Finance Only */}
        <Route
          path="/expenses"
          element={
            <ProtectedRoute allowedRoles={['Finance']}>
              <Expenses />
            </ProtectedRoute>
          }
        />

        {/* 🛡 Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assign-role"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AssignRole />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
