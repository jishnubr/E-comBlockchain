import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Truck, MapPin, LogOut, CheckCircle, Loader2 } from 'lucide-react';

export default function TransporterDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setIsLoading(true);
    axiosInstance.get('/transporter/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to sync shipment list'))
      .finally(() => setIsLoading(false));
  };

  const verifyDelivery = async (orderId) => {
    setVerifyingId(orderId);
    const promise = axiosInstance.post('/contracts/sign', { orderId })
      .then(r => { fetchOrders(); return r.data.message; });
    toast.promise(promise, {
      loading: 'Verifying delivery on blockchain...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Verification failed',
    });
    promise.finally(() => setVerifyingId(null));
  };

  const claimOrder = async (orderId) => {
    setVerifyingId(orderId);
    const promise = axiosInstance.post('/contracts/claim/' + orderId)
      .then(r => { fetchOrders(); return r.data.message; });
    toast.promise(promise, {
      loading: 'Claiming shipment...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Failed to claim',
    });
    promise.finally(() => setVerifyingId(null));
  };

  const handoverOrder = async (orderId) => {
    const nextId = prompt("Enter the numerical ID of the next Transporter:");
    if (!nextId) return;
    setVerifyingId(orderId);
    const promise = axiosInstance.post(`/contracts/handover/${orderId}/${nextId}`)
      .then(r => { fetchOrders(); return r.data.message; });
    toast.promise(promise, {
      loading: 'Processing handover...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Handover failed',
    });
    promise.finally(() => setVerifyingId(null));
  };

  const activeOrders = orders.filter(o => o.orderLevel === 'SELLER_SIGNED' || o.orderLevel === 'IN_TRANSIT');

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
              <button onClick={logout} className="flex items-center gap-2 bg-indigo-800 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Active Shipments</h1>
          <p className="text-slate-500 mt-1">Track and sign deliveries to unlock escrow payouts.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Syncing logistics routes...</td></tr>
                ) : activeOrders.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No ready shipments assigned.</td></tr>
                ) : (
                  activeOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="w-4 h-4 text-indigo-500" /> {order.currLocation || 'Warehouse 1A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{order.orderLevel}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.orderLevel === 'SELLER_SIGNED' ? (
                          <button
                            disabled={verifyingId === order.id}
                            onClick={() => claimOrder(order.id)}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
                          >
                            {verifyingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                            Claim
                          </button>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={verifyingId === order.id}
                              onClick={() => handoverOrder(order.id)}
                              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
                            >
                              Handover
                            </button>
                            <button
                              disabled={verifyingId === order.id}
                              onClick={() => verifyDelivery(order.id)}
                              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
                            >
                              Deliver
                            </button>
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
