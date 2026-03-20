import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/register', { email, password });
      const { token, role, name } = response.data;
      
      login(token, { role, name });
      navigate(`/dashboard/${role.toLowerCase()}`);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 mb-4">
          Register
        </button>
        <div className="text-center text-sm">
          Already have an account? <Link to="/" className="text-blue-600 hover:underline">Log in</Link>
        </div>
      </form>
    </div>
  );
}
