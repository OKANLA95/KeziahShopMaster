import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicDashboard from './pages/PublicDashboard';
import ManagerSignup from './pages/ManagerSignup';
import ShopSetup from './pages/ShopSetup';
import ManagerDashboard from './pages/ManagerDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import SalesDashboard from './pages/SalesDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/signup" element={<ManagerSignup />} />
        <Route path="/setup-shop" element={<ShopSetup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/finance" element={<FinanceDashboard />} />
        <Route path="/dashboard/sales" element={<SalesDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
