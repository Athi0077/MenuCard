import React, { useState, useEffect } from 'react';

export default function InlineOrderTracker({ isTrackingOpen, onOpenTracking }) {
  const [latestOrder, setLatestOrder] = useState(null);
  const [hideDelivered, setHideDelivered] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    let intervalId;
    if (latestOrder && latestOrder.status === 'Preparing' && latestOrder.acceptedAt && latestOrder.timerMinutes > 0) {
      intervalId = setInterval(() => {
        const acceptedTime = new Date(latestOrder.acceptedAt).getTime();
        const endTime = acceptedTime + (latestOrder.timerMinutes * 60 * 1000);
        const remaining = endTime - Date.now();
        setCountdown(remaining > 0 ? remaining : 0);
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => clearInterval(intervalId);
  }, [latestOrder]);

  const formatCountdown = (ms) => {
    if (ms <= 0) return "(Soon!)";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `(${min}:${sec.toString().padStart(2, '0')})`;
  };

  const fetchLatestOrder = async () => {
    const savedIds = JSON.parse(localStorage.getItem('user_orders') || '[]');
    if (savedIds.length === 0) return;
    
    // Fetch the most recent order
    const latestId = savedIds[savedIds.length - 1];
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${latestId}`);
      if (res.ok) {
        const order = await res.json();
        setLatestOrder(order);
        
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
          // Hide 1 minute after it was updated to Delivered/Cancelled
          const updatedTime = new Date(order.updatedAt).getTime();
          if (Date.now() - updatedTime > 60 * 1000) {
            setHideDelivered(true);
          } else {
            setHideDelivered(false);
          }
        } else {
          setHideDelivered(false);
        }
      }
    } catch (e) {
      console.error("Failed to fetch inline order status", e);
    }
  };

  useEffect(() => {
    fetchLatestOrder();
    const interval = setInterval(fetchLatestOrder, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (!latestOrder || hideDelivered) return null;

  const steps = ['Pending', 'Preparing', 'Ready', 'Delivered'];
  const currentStatus = latestOrder.status;
  
  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center text-red-600 font-bold mb-6">
        Your last order (ORD-{latestOrder._id.slice(-4).toUpperCase()}) was cancelled.
      </div>
    );
  }

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div 
      className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 mb-6 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onOpenTracking && onOpenTracking(true)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-700 transition-colors">Live Order Tracking</h3>
          <p className="text-xs text-gray-500 font-medium">
            ORD-{latestOrder._id.slice(-4).toUpperCase()} • Table {latestOrder.table} • {new Date(latestOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            <span className="text-teal-600 ml-2 group-hover:underline">View details &rarr;</span>
          </p>
        </div>
        <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-100 uppercase tracking-wider flex items-center gap-1">
          {currentStatus} 
          {countdown !== null && <span className="font-black text-teal-900 ml-1">{formatCountdown(countdown)}</span>}
        </span>
      </div>
      
      <div className="py-2 flex items-center justify-between relative px-2 sm:px-8">
        {/* Background Line */}
        <div className="absolute top-1/2 left-6 right-6 sm:left-12 sm:right-12 h-1.5 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
        {/* Active Line */}
        <div 
          className="absolute top-1/2 left-6 sm:left-12 h-1.5 bg-teal-400 -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`, maxWidth: 'calc(100% - 3rem)' }}
        ></div>
  
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-4 transition-colors duration-500 ${isCompleted ? 'bg-teal-500 border-white text-white shadow-md' : 'bg-gray-50 border-white text-gray-400'} ${isActive ? 'ring-4 ring-teal-100' : ''}`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`text-[9px] sm:text-xs font-extrabold uppercase tracking-wider ${isActive ? 'text-teal-700' : (isCompleted ? 'text-gray-700' : 'text-gray-400')}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
