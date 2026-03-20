import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Scale, LogOut, FileSignature, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setIsLoading(true);
    axiosInstance.get('/admin/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to decrypt ledger'))
      .finally(() => setIsLoading(false));
  };

  const settleContract = async (orderId) => {
    setSettlingId(orderId);
    const promise = axiosInstance.post('/contracts/sign', { orderId })
      .then(r => { fetchOrders(); return r.data.message; });
    toast.promise(promise, {
      loading: 'Settling escrow on blockchain...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Settlement failed',
    });
    promise.finally(() => setSettlingId(null));
  };

  const resolveDispute = async (orderId, winner) => {
    setSettlingId(orderId);
    const promise = axiosInstance.post(`/contracts/${orderId}/resolve/${winner}`)
      .then(r => { fetchOrders(); return r.data.message; });
    toast.promise(promise, {
      loading: 'Executing Arbitration Consensus...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Resolution failed',
    });
    promise.finally(() => setSettlingId(null));
  };

  const activeOrders = orders.filter(o => o.orderLevel === 'DELIVERED' || o.orderLevel === 'DISPUTED');

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-950 text-white shadow-lg border-b border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-amber-500" />
              <span className="font-bold text-xl tracking-tight">Arbitrator Node</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-indigo-300 text-sm hidden sm:block">{user?.name}</span>
              <button onClick={logout} className="flex items-center gap-2 bg-indigo-900 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Global Ledger Arbitration</h1>
          <p className="text-slate-500 mt-1">Settle delivered contracts and resolve multi-party active disputes.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Contract Ref</th>
                  <th className="px-6 py-4 font-semibold">Value</th>
                  <th className="px-6 py-4 font-semibold">State</th>
                  <th className="px-6 py-4 font-semibold text-right">Arbitration Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Decrypting ledger...</td></tr>
                ) : activeOrders.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No contracts require arbitration at this time.</td></tr>
                ) : (
                  activeOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">#{order.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-amber-700">${order.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${order.orderLevel === 'DISPUTED' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' : 'bg-green-50 text-green-700'}`}>
                          {order.orderLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.orderLevel === 'DELIVERED' ? (
                          <button
                            disabled={settlingId === order.id}
                            onClick={() => settleContract(order.id)}
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
                          >
                            {settlingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                            Settle Escrow
                          </button>
                        ) : (
                           <div className="flex justify-end gap-2">
                              <button onClick={() => resolveDispute(order.id, 'BUYER')} disabled={settlingId === order.id} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">Refund Buyer</button>
                              <button onClick={() => resolveDispute(order.id, 'SELLER')} disabled={settlingId === order.id} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">Pay Seller</button>
                              <button onClick={() => resolveDispute(order.id, 'TRANSPORTER')} disabled={settlingId === order.id} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">Pay Transporter</button>
                           </div>
                        )}
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
