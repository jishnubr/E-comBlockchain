import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Truck, MapPin, ShieldCheck, LogOut, CheckCircle } from 'lucide-react';

export default function TransporterDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = () => {
    axiosInstance.get('/transporter/orders')
      .then(response => {
        setOrders(response.data);
        setIsLoading(false);
      })
      .catch(error => console.error(error));
  };

  const signContractAndDeliver = async (orderId) => {
    try {
      const res = await axiosInstance.post('/contracts/sign', { orderId });
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Verify delivery failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl tracking-tight">LogisticsNode</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-indigo-200 text-sm hidden sm:block">Transporter: <span className="text-white font-semibold">{user?.name}</span></span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Active Shipments</h1>
          <p className="text-slate-500 mt-1">Track and sign deliveries to complete smart contracts.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Syncing routes...</td></tr>
                ) : orders.filter(o => o.orderLevel === 'SELLER_SIGNED' || o.orderLevel === 'IN_TRANSIT').length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No ready shipments found.</td></tr>
                ) : (
                  orders.filter(o => o.orderLevel === 'SELLER_SIGNED' || o.orderLevel === 'IN_TRANSIT').map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="w-4 h-4 text-indigo-500" /> {order.currLocation || 'Warehouse P'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {order.orderLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => signContractAndDeliver(order.id)}
                          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" /> Verify Delivery
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
