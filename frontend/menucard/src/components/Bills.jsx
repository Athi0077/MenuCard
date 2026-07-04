import React, { useState, useEffect } from 'react';

export default function Bills({ isOpen, onClose }) {
  const [bills, setBills] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const savedBills = JSON.parse(localStorage.getItem('user_bills') || '[]');
      // Filter out only Delivered orders (or old orders without status)
      const deliveredBills = savedBills.filter(b => b.status === 'Delivered' || !b.status);
      
      // Sort newest first
      deliveredBills.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBills(deliveredBills);
      
      const total = deliveredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      setTotalSpent(total);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[999] transition-opacity" onClick={onClose} />
      
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-[1000] transform transition-transform overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Bills</h2>
            <p className="text-xs text-gray-500 font-medium">Your total order receipts</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 space-y-6 bg-gray-50/50">
          
          {/* Total Summary Card */}
          <div className="bg-teal-800 text-white p-6 rounded-2xl shadow-sm text-center space-y-1">
            <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Total Spent</p>
            <p className="text-4xl font-black tabular-nums">₹{totalSpent.toFixed(2)}</p>
            <p className="text-teal-200 text-xs pt-1">Across {bills.length} orders</p>
          </div>

          {bills.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-bold text-gray-900">No bills found</p>
              <p className="text-xs text-gray-500">Your future order receipts will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-200 pb-2">Past Receipts</h3>
              {bills.map((bill, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  
                  {/* Receipt styling decoration */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between overflow-hidden opacity-20">
                     {[...Array(15)].map((_, i) => (
                       <div key={i} className="w-3 h-3 bg-gray-50 rounded-full -mt-1.5 shadow-inner"></div>
                     ))}
                  </div>

                  <div className="flex items-start justify-between relative z-10 pt-2">
                    <div>
                      <span className="font-black text-gray-900">RECEIPT</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        {new Date(bill.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      ORD-{bill._id.slice(-4).toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 py-2 border-y border-dashed border-gray-200 relative z-10">
                    <ul className="space-y-1.5">
                      {bill.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex justify-between">
                          <span>
                            <span className="font-bold mr-1 text-gray-900">{item.quantity}x</span> 
                            {item.name}
                          </span>
                          <span className="font-medium text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center relative z-10 pt-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                    <span className="font-black text-gray-900 text-lg">₹{bill.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
