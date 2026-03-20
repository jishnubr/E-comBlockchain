import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, LogOut, Package, CheckCircle, Clock } from 'lucide-react';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    axiosInstance.get('/buyer/orders')
      .then(response => {
        setOrders(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching orders", error);
        setIsLoading(false);
      });
  }, [token]);

  const signContract = async (orderId) => {
    try {
      const res = await axiosInstance.post('/contracts/sign', { orderId: orderId });
      alert(res.data.message); 
    } catch (err) {
      alert(err.response?.data?.message || "Sign failed");
    }
  };

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch(status) {
      case 'SHIPPED': return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold"><Package className="w-3 h-3"/> Shipped</span>;
      case 'DELIVERED': return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold"><CheckCircle className="w-3 h-3"/> Delivered</span>;
      default: return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl tracking-tight">BlockStore</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-indigo-200 text-sm hidden sm:block">Logged in as <span className="text-white font-semibold">{user?.name || 'Buyer'}</span></span>
              <button 
                onClick={logout} 
                className="flex items-center gap-2 bg-indigo-800 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Buyer Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your smart contracts and track deliveries.</p>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500"/> Recent Contracts
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Amount Escrowed</th>
                  <th className="px-6 py-4 font-semibold">Contract Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading blockchain data...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No active contracts found.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">#{order.orderId}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{order.productName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">${order.price}</td>
                      <td className="px-6 py-4">{getStatusBadge(order.orderLevel)}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => signContract(order.orderId)}
                          className="inline-flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Sign & Confirm
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
