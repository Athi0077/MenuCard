import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function AdminAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await fetch(`https://menucard-e73d.onrender.com/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication error processing credentials');
      onLoginSuccess(data.token);
      toast.success(isLogin ? 'Logged in successfully!' : 'Account registered successfully!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-sm w-full space-y-6">
        <div className="text-center">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">Staff Portal Gate</span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{isLogin ? 'Resort Admin Login' : 'Register Manager'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
            <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <button type="submit" className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-colors">{isLogin ? 'Login' : 'Register Account'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs text-gray-400 font-semibold hover:text-teal-800 transition-colors">
          {isLogin ? "Need a staff profile? Register here" : "Already registered? Switch to login"}
        </button>
      </div>
    </div>
  );
}
