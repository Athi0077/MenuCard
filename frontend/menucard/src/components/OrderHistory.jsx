import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function OrderHistory({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Filter only Delivered and Cancelled orders for the history tab
        setHistory(data.filter(order => order.status === 'Delivered' || order.status === 'Cancelled'));
      } else {
        toast.error('Failed to fetch order history.');
      }
    } catch (err) {
      toast.error('Failed to fetch order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={fetchHistory}
          className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          ↻ Refresh History
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No delivered orders found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Ordered Time</th>
                <th className="p-4">Delivered Time</th>
                <th className="p-4">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {history.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">
                    <div className="font-bold">ORD-{order._id.slice(-4).toUpperCase()}</div>
                    <div className="text-[10px] text-teal-700 font-semibold mt-1">Table {order.table}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 text-sm">{order.customerName}</div>
                    <div className="text-xs text-gray-400">{order.mobileNumber}</div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <ul className="space-y-0.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-gray-600 text-xs">
                          <span className="font-bold text-gray-800">{item.quantity}x</span> {item.dish?.name || 'Unknown'}
                          {item.specialItem && <span className="text-teal-700 font-bold ml-1">(+ {item.specialItem})</span>}
                        </li>
                      ))}
                    </ul>
                    {order.tasteInstructions && (
                      <div className="mt-1.5 text-[10px] text-amber-700 bg-amber-50 p-1 rounded font-medium">
                        Taste: {order.tasteInstructions}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-teal-900">₹{order.totalAmount?.toFixed(2)}</td>
                  <td className="p-4 text-xs font-bold text-gray-400 uppercase">
                    {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-400 uppercase">
                    {new Date(order.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-4 text-xs font-bold text-teal-700 bg-teal-50/50 rounded-lg">
                    {Math.floor((new Date(order.updatedAt) - new Date(order.createdAt)) / 60000)} mins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
