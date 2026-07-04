import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function TrackOrder({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [cancelCountdowns, setCancelCountdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchUserOrders = async (showLoader = true) => {
    const savedIds = JSON.parse(localStorage.getItem('user_orders') || '[]');
    if (savedIds.length === 0) {
      setOrders([]);
      return;
    }

    if (showLoader) setLoading(true);
    try {
      const fetchedOrders = [];
      for (const id of savedIds) {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          fetchedOrders.push(data);
        }
      }
      // Sort: Active orders first, then Delivered
      fetchedOrders.sort((a, b) => {
        if (a.status === 'Delivered' && b.status !== 'Delivered') return 1;
        if (a.status !== 'Delivered' && b.status === 'Delivered') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Failed to fetch user orders", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let pollInterval;
    if (isOpen) {
      fetchUserOrders(true); // Initial fetch with loader
      // Poll every 10 seconds silently
      pollInterval = setInterval(() => {
        fetchUserOrders(false);
      }, 10000);
    }
    return () => clearInterval(pollInterval);
  }, [isOpen]);

  // Live countdown timer for active orders
  useEffect(() => {
    if (!isOpen || orders.length === 0) return;

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

      setCancelCountdowns(() => {
        const newCancelCountdowns = {};
        orders.forEach(order => {
          if (order.status === 'Pending') {
            const createdTime = new Date(order.createdAt).getTime();
            const cancelEndTime = createdTime + (90 * 1000);
            const remaining = cancelEndTime - Date.now();
            newCancelCountdowns[order._id] = remaining > 0 ? remaining : 0;
          }
        });
        return newCancelCountdowns;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isOpen, orders]);

  const formatCountdown = (ms) => {
    if (ms <= 0) return "Almost Ready!";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCancelOrder = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/cancel`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchUserOrders(false);
        toast.success('Order cancelled successfully.');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while canceling order.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[60] transition-opacity" onClick={onClose} />
      
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-[70] transform transition-transform overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Track Orders</h2>
            <p className="text-xs text-gray-500 font-medium">Your active orders and history</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 space-y-4 bg-gray-50/50">
          {loading ? (
            <p className="text-center text-sm font-bold text-gray-400 py-12">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold text-gray-900">No order history found</p>
              <p className="text-xs text-gray-500">Orders you place on this device will appear here.</p>
            </div>
          ) : (
            orders.map(order => {
              const isDelivered = order.status === 'Delivered';
              const countdown = countdowns[order._id];
              const isPreparing = order.status === 'Preparing';
              
              let statusColor = 'bg-gray-100 text-gray-600 border-gray-200';
              if (order.status === 'Pending') statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
              if (order.status === 'Preparing') statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
              if (order.status === 'Ready') statusColor = 'bg-green-50 text-green-700 border-green-200';
              if (order.status === 'Cancelled') statusColor = 'bg-red-50 text-red-700 border-red-200';

              const cancelCountdown = cancelCountdowns[order._id];
              const canCancel = order.status === 'Pending' && cancelCountdown !== undefined && cancelCountdown > 0;

              return (
                <div key={order._id} className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 ${isDelivered ? 'opacity-70 border-gray-100' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-black text-gray-900">ORD-{order._id.slice(-4).toUpperCase()}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${statusColor}`}>
                      {order.status}
                    </span>
                  </div>

                  {isPreparing && countdown !== undefined && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Estimated Prep Time</p>
                      <div className="text-3xl font-black tabular-nums text-blue-800">
                        {formatCountdown(countdown)}
                      </div>
                    </div>
                  )}

                  {canCancel && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Cancel Order Window</p>
                      <div className="text-3xl font-black tabular-nums text-red-800">
                        {formatCountdown(cancelCountdown)}
                      </div>
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors uppercase tracking-wider"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase border-b border-gray-50 pb-1">Order Details</p>
                    <ul className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex justify-between">
                          <span>
                            <span className="font-bold mr-1">{item.quantity}x</span> {item.dish?.name || 'Item'}
                            {item.specialItem && <span className="text-teal-700 font-bold ml-1 text-xs">(+ {item.specialItem})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {order.tasteInstructions && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50/80 p-2 rounded-lg font-medium border border-amber-100">
                        <span className="block font-bold text-[10px] uppercase mb-0.5 opacity-80">My Taste Request</span>
                        {order.tasteInstructions}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">Total Paid</span>
                    <span className="font-black text-teal-800 text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
