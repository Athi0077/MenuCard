import React, { useState } from 'react';
import MenuManagement from '../components/MenuManagement';
import OrdersTable from '../components/OrderTable';
import OrderHistory from '../components/OrderHistory';
import { requestPermission } from '../notification';

export default function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');

  let staffName = 'Admin';
  let adminId = null;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.username) staffName = payload.username;
      if (payload.id) adminId = payload.id;
    }
  } catch (e) {
    console.error('Error decoding token', e);
  }

  React.useEffect(() => {
    if (token && adminId) {
      requestPermission().then((fcmToken) => {
        if (fcmToken) {
          fetch(`${import.meta.env.VITE_API_URL}/api/fcm/save-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminId, token: fcmToken })
          }).catch(err => console.error('Failed to register Admin FCM token', err));
        }
      });
    }
  }, [token, adminId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 antialiased">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">Operations Dashboard</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resort Staff Control Center</h1>
             {/*welcome staff name*/}
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Welcome, {staffName}!</h2>
            <p className="text-gray-500 text-sm">Manage menu inventory, customer orders, preparation times, and live order progress.</p>
          </div>
          <button onClick={onLogout} className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2 rounded-xl text-sm transition-colors shadow-sm">Logout</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-teal-800 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600'}`}>Live Orders</button>
          <button onClick={() => setActiveTab('history')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-teal-800 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600'}`}>Order History</button>
          <button onClick={() => setActiveTab('menu')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'menu' ? 'bg-teal-800 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600'}`}>Menu Management</button>
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Live customer orders</h2>
              <p className="text-gray-500 text-sm">Monitor table orders in real time. Delivered orders are moved to history.</p>
            </div>
            <OrdersTable token={token} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Order history</h2>
              <p className="text-gray-500 text-sm">View past completed and delivered orders.</p>
            </div>
            <OrderHistory token={token} />
          </div>
        )}

        {activeTab === 'menu' && (
          <MenuManagement token={token} />
        )}
      </main>
    </div>
  );
}
