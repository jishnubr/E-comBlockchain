import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Package, ShieldCheck, LogOut, PlusCircle, Loader2 } from 'lucide-react';

export default function SellerDashboard() {
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [signingOrderId, setSigningOrderId] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setIsLoading(true);
    axiosInstance.get('/seller/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setIsLoading(false));
  };

  const signContract = async (orderId) => {
    setSigningOrderId(orderId);
    const promise = axiosInstance.post('/contracts/sign', { orderId })
      .then(r => { fetchOrders(); return r.data.message; });
    toast.promise(promise, {
      loading: 'Broadcasting signature to blockchain...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Signature failed',
    });
    promise.finally(() => setSigningOrderId(null));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const promise = axiosInstance.post('/products', newProduct)
      .then(r => { setNewProduct({ name: '', price: '', quantity: '' }); return r.data.message; });
    toast.promise(promise, {
      loading: 'Listing product on-chain...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Failed to add product',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl tracking-tight">SellerPortal</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-indigo-200 text-sm hidden sm:block">Logged in as <span className="text-white font-semibold">{user?.name}</span></span>
              <button onClick={logout} className="flex items-center gap-2 bg-indigo-800 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-500"/> List New Product
              </h3>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($)</label>
                <input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity</label>
                <input required type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all active:scale-95">
                Add to Catalog
              </button>
            </form>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500"/> Incoming Contracts
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Scanning Blockchain...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No active orders found.</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">#{order.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">${order.price}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">{order.orderLevel}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            disabled={order.orderLevel !== 'BUYER_SIGNED' || signingOrderId === order.id}
                            onClick={() => signContract(order.id)}
                            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {signingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Sign & Pack
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
