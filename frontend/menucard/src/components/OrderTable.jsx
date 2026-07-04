import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function OrdersTable({ token }) {
  const playDing = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  };

  const [orders, setOrders] = useState([]);
  const [acceptTimers, setAcceptTimers] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  const intervalRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Only show active orders (hide Delivered and Cancelled)
        setOrders(data.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled'));
      } else {
        toast.error('Failed to fetch orders.');
      }
    } catch (err) {
      toast.error('Failed to fetch orders.');
    }
  };

  useEffect(() => { 
    fetchOrders(); 

    // Request Notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Setup Server-Sent Events (SSE) for real-time notifications
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/api/admin/orders/stream?token=${token}`);
    
    eventSource.onmessage = (event) => {
      try {
        const newOrder = JSON.parse(event.data);
        
        // Auto-refresh orders table
        fetchOrders();
        
        // Play sound
        playDing();

        // Trigger push notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("New Order Received!", {
            body: `Table ${newOrder.table} placed an order for ₹${newOrder.totalAmount}.`,
          });
        }
      } catch (err) {
        console.error('Error parsing SSE data', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  // Live countdown ticker — updates every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdowns(() => {
        const newCountdowns = {};
        orders.forEach(order => {
          if (order.acceptedAt && order.timerMinutes > 0 && order.status === 'Preparing') {
            const acceptedTime = new Date(order.acceptedAt).getTime();
            const endTime = acceptedTime + (order.timerMinutes * 60 * 1000);
            const remaining = endTime - Date.now();
            newCountdowns[order._id] = remaining > 0 ? remaining : 0;
          }
        });
        return newCountdowns;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [orders]);

  const handleLocalChange = (id, field, value) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, [field]: value } : o));
  };

  const handleUpdateServer = async (id) => {
    const target = orders.find(o => o._id === id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: target.status, prepTime: target.prepTime })
      });
      if (!response.ok) throw new Error('Update failed');
      toast.success('Order updated successfully!');
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAcceptOrder = async (id) => {
    const timerMinutes = acceptTimers[id];
    if (!timerMinutes || timerMinutes <= 0) {
      toast.error('Please set a valid timer before accepting.');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ timerMinutes: parseInt(timerMinutes) })
      });
      if (!response.ok) throw new Error('Failed to accept order');
      toast.success('Order accepted!');
      setAcceptTimers(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Time's up!";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Preparing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready': return 'bg-green-50 text-green-700 border-green-200';
      case 'Delivered': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto-refresh button */}
      <div className="flex justify-end">
        <button
          onClick={fetchOrders}
          className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          ↻ Refresh orders
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.status === 'Pending';
            const isPreparing = order.status === 'Preparing' && order.acceptedAt;
            const countdown = countdowns[order._id];
            const isTimedOut = countdown !== undefined && countdown <= 0;

            return (
              <div key={order._id} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4">
                {/* Order header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-lg">ORD-{order._id.slice(-4).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold w-max">Table {order.table}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-teal-900 text-xl">₹{order.totalAmount?.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Customer + Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Customer</p>
                    <p className="font-semibold text-gray-900 text-sm">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Items</p>
                    <ul className="space-y-0.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          <span className="font-bold text-gray-800">{item.quantity}x</span> {item.dish?.name || 'Unknown'}
                          {item.specialItem && <span className="text-teal-700 font-bold ml-1">(+ {item.specialItem})</span>}
                        </li>
                      ))}
                    </ul>
                    {order.tasteInstructions && (
                      <div className="mt-2 bg-amber-50 border border-amber-100 p-2 rounded text-xs text-amber-900">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-0.5">Customer Taste Notes</span>
                        {order.tasteInstructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Countdown Timer Display */}
                {isPreparing && countdown !== undefined && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isTimedOut ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className={`text-2xl font-black tabular-nums ${isTimedOut ? 'text-red-600' : 'text-blue-700'}`}>
                      {formatCountdown(countdown)}
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      {isTimedOut ? 'Timer expired — mark as Ready' : `${order.timerMinutes} min timer running`}
                    </div>
                  </div>
                )}

                {/* Accept Section (Pending orders only) */}
                {isPending && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <label className="text-xs font-bold text-amber-800 whitespace-nowrap">Set timer:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={acceptTimers[order._id] || ''}
                        onChange={(e) => setAcceptTimers(prev => ({ ...prev, [order._id]: e.target.value }))}
                        placeholder="15"
                        className="w-16 bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-center font-bold text-gray-800 text-xs focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 outline-none"
                      />
                      <span className="text-xs font-medium text-amber-600">mins</span>
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(order._id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-colors ml-auto"
                    >
                      Accept Order
                    </button>
                  </div>
                )}

                {/* Status & Update Controls (non-pending) */}
                {!isPending && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleLocalChange(order._id, 'status', e.target.value)}
                      className="text-xs font-bold rounded-xl border-gray-200 py-1.5 px-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all bg-white"
                    >
                      {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <button
                      onClick={() => handleUpdateServer(order._id)}
                      className="bg-teal-800 hover:bg-teal-900 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
