import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const { token, logout } = useAuth();

  // Fetch data from Spring Boot 4 when component mounts
  useEffect(() => {
    axios.get('http://localhost:8080/api/v1/buyer/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setOrders(response.data))
    .catch(error => console.error("Error fetching orders", error));
  }, [token]);

  const signContract = async (orderId) => {
    try {
      const res = await axios.post('http://localhost:8080/api/v1/contracts/sign', 
        { orderId: orderId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert(res.data.message); 
      // Refresh orders logic would go here
    } catch (err) {
      alert(err.response?.data?.message || "Sign failed");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Buyer Dashboard</h2>
        <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
      </div>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Order ID</th>
            <th className="px-4 py-2 border">Product</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.orderId} className="hover:bg-gray-50">
              <td className="px-4 py-2 border text-center">{order.orderId}</td>
              <td className="px-4 py-2 border">{order.productName}</td>
              <td className="px-4 py-2 border text-center">${order.price}</td>
              <td className="px-4 py-2 border text-center">
                <span className={`px-2 py-1 rounded text-xs ${order.orderLevel === 'SHIPPED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.orderLevel}
                </span>
              </td>
              <td className="px-4 py-2 border text-center">
                <button 
                  onClick={() => signContract(order.orderId)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                  Confirm Delivery
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
