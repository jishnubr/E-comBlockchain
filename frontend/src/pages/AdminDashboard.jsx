import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Scale, LogOut, FileSignature, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = () => {
    axiosInstance.get('/admin/orders')
      .then(response => {
        setOrders(response.data);
        setIsLoading(false);
      })
      .catch(error => console.error(error));
  };

  const settleContract = async (orderId) => {
    try {
      const res = await axiosInstance.post('/contracts/sign', { orderId });
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Settlement failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-950 text-white shadow-lg border-b border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-amber-500" />
              <span className="font-bold text-xl tracking-tight">Arbitrator Node</span>
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 bg-indigo-900 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Global Ledger</h1>
          <p className="text-slate-500 mt-1">Settle delivered contracts and redistribute collateral escrow.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Contract Ref</th>
                  <th className="px-6 py-4 font-semibold">Value</th>
                  <th className="px-6 py-4 font-semibold">State</th>
                  <th className="px-6 py-4 font-semibold text-right">Arbitration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Decrypting ledger...</td></tr>
                ) : orders.filter(o => o.orderLevel === 'DELIVERED').length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No contracts awaiting settlement.</td></tr>
                ) : (
                  orders.filter(o => o.orderLevel === 'DELIVERED').map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">#{order.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-amber-700">${order.price}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                          {order.orderLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => settleContract(order.id)}
                          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                        >
                          <FileSignature className="w-4 h-4" /> Settle Escrow
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
