import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
// import SellerDashboard from './pages/SellerDashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth(); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard/buyer" element={
          user?.role === 'BUYER' ? <BuyerDashboard /> : <Navigate to="/" />
        } />
        
        {/* <Route path="/dashboard/seller" element={
          user?.role === 'SELLER' ? <SellerDashboard /> : <Navigate to="/" />
        } /> */}
      </Routes>
    </Router>
  );
}

export default App;
