import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Store, ShoppingCart, LogOut, ArrowLeft, Loader2 } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/products')
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load catalog'))
      .finally(() => setIsLoading(false));
  }, []);

  const placeOrder = async (productId) => {
    setBuyingId(productId);
    const promise = axiosInstance.post('/contracts/buyer/place-order', { productId, quantity: 1 })
      .then(r => {
        navigate('/dashboard/buyer');
        return r.data.message;
      });
      
    toast.promise(promise, {
      loading: 'Initiating Contract...',
      success: (msg) => msg,
      error: (err) => err.response?.data?.message || 'Failed to place order',
    });
    
    promise.finally(() => setBuyingId(null));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-900 text-white shadow-lg border-b border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-emerald-400" />
              <span className="font-bold text-xl tracking-tight">BlockStore Marketplace</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-indigo-200 text-sm hidden sm:block">{user?.name}</span>
              <button onClick={() => navigate('/dashboard/buyer')} className="text-indigo-200 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                <ArrowLeft className="h-4 w-4"/> Dashboard
              </button>
              <button onClick={logout} className="flex items-center gap-2 bg-indigo-800 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Global Product Catalog</h1>
            <p className="text-slate-500 mt-1">Discover items verified on our decentralized network.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-3 text-slate-500 font-medium">Loading catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Store className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">The Catalog is Empty</h3>
            <p className="text-slate-500">There are currently no products listed on the blockchain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-slate-800">{product.name}</h3>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-sm border border-emerald-100">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-6">Authentic product tracked securely via smart contract.</p>
                </div>
                <button
                  disabled={buyingId === product.id}
                  onClick={() => placeOrder(product.id)}
                  className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70 mt-auto"
                >
                  {buyingId === product.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShoppingCart className="w-5 h-5"/>}
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
