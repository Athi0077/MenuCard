import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function OrderHistory({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredHistory = history.filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.customerName?.toLowerCase().includes(q) ||
      order.table?.toLowerCase().includes(q) ||
      order.mobileNumber?.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <input 
          type="text" 
          placeholder="Search by customer, table, or mobile..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 outline-none transition-all"
        />
        <button
          onClick={fetchHistory}
          className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          ↻ Refresh History
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading history...</p>
      ) : filteredHistory.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          {history.length === 0 ? "No delivered orders found." : "No orders match your search."}
        </p>
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
                <th className="p-4">Ended At</th>
                <th className="p-4">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredHistory.map((order) => {
                const isCancelled = order.status === 'Cancelled';
                return (
                <tr key={order._id} className={`transition-colors ${isCancelled ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50/50'}`}>
                  <td className="p-4 font-medium text-gray-900">
                    <div className="font-bold">ORD-{order._id.slice(-4).toUpperCase()}</div>
                    <div className="text-[10px] text-teal-700 font-semibold mt-1 mb-1.5">Table {order.table}</div>
                    {isCancelled ? (
                      <div className="text-[10px] text-red-700 bg-red-100 font-bold px-1.5 py-0.5 rounded w-max border border-red-200 uppercase tracking-wider">Cancelled</div>
                    ) : (
                      <div className="text-[10px] text-green-700 bg-green-100 font-bold px-1.5 py-0.5 rounded w-max border border-green-200 uppercase tracking-wider">Delivered</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 text-sm">{order.customerName}</div>
                    <div className="text-xs text-gray-400">{order.mobileNumber}</div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <ul className="space-y-0.5">
                      {order.items.map((item, idx) => {
                        const dietary = item.dish?.dietaryPreference;
                        return (
                          <li key={idx} className="text-gray-600 text-xs flex items-center gap-1 flex-wrap">
                            <span className="font-bold text-gray-800">{item.quantity}x</span> 
                            <span>{item.dish?.name || 'Unknown'}</span>
                            {dietary && dietary !== 'None' && (
                              <span className={`flex-shrink-0 inline-block w-1.5 h-1.5 rounded-full ${dietary === 'Veg' || dietary === 'Vegan' ? 'bg-green-500' : 'bg-red-500'}`} title={dietary}></span>
                            )}
                            {item.specialItem && <span className="text-teal-700 font-bold">(+ {item.specialItem})</span>}
                          </li>
                        );
                      })}
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
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isCancelled ? 'text-red-700 bg-red-100/70' : 'text-teal-700 bg-teal-50'}`}>
                      {Math.floor((new Date(order.updatedAt) - new Date(order.createdAt)) / 60000)} mins
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
