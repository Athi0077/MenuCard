import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function CartSidePanel({ cart, table, onTableChange, onUpdateQty, onOrderSuccess, onOpenTracking }) {
  const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', tasteInstructions: '' });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return toast.warn('Your cart is empty.');
    if (!table) return toast.warn('Please select a table.');
    if (!formData.name || !formData.mobile) return toast.warn('Name and Mobile Number are required.');

    setLoading(true);

    const orderData = {
      table,
      customerName: formData.name,
      mobileNumber: formData.mobile,
      emailAddress: formData.email,
      tasteInstructions: formData.tasteInstructions,
      items: cart.map(item => ({
        dish: item.baseId || item._id,
        quantity: item.quantity,
        specialItem: item.specialItem || ''
      })),
      totalAmount: cartTotal
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();

      if (response.ok) {
        // Save order ID to localStorage for tracking history
        const savedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        savedOrders.push(responseData._id);
        localStorage.setItem('user_orders', JSON.stringify(savedOrders));

        // Save bill to localStorage
        const savedBills = JSON.parse(localStorage.getItem('user_bills') || '[]');
        savedBills.push({
          _id: responseData._id,
          totalAmount: cartTotal,
          items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
          date: new Date().toISOString(),
          status: 'Pending'
        });
        localStorage.setItem('user_bills', JSON.stringify(savedBills));

        setOrderPlaced(true);
        setFormData({ name: '', mobile: '', email: '', tasteInstructions: '' });
        toast.success('Order placed successfully!');
        
        // Open TrackOrder after 500ms
        setTimeout(() => {
          onOpenTracking(true);
        }, 500);
        
        setTimeout(() => {
          setOrderPlaced(false);
          onOrderSuccess();
        }, 3000); 
      } else {
        toast.error(responseData.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state after order placement
  if (orderPlaced) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm sticky top-28 space-y-4">
        <div className="py-12 text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Order placed!</h3>
          <p className="text-sm text-gray-500">Your order has been sent to the kitchen. Sit back and relax!</p>
          <div className="text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg font-semibold inline-block">
            Table {table}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm sticky top-28 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your order</h2>
          {table && <p className="text-xs text-gray-400 font-bold uppercase">Table {table}</p>}
        </div>
        <span className="text-xl font-black text-teal-800">₹{cartTotal.toFixed(2)}</span>
      </div>

      {cart.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-bold text-gray-700 mb-1">Cart is empty</p>
          <p className="text-sm text-gray-400">Select dishes from the menu to continue.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between items-center text-sm">
              <div className="truncate max-w-[60%]">
                <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => onUpdateQty(item._id, -1)}
                  className="px-2 font-bold hover:text-red-500"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-gray-700">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(item._id, 1)}
                  className="px-2 font-bold hover:text-teal-600"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Form */}
      <form onSubmit={handlePlaceOrder} className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Select table *</label>
          <select
            required
            value={table}
            onChange={(e) => onTableChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all outline-none"
          >
            <option value="" disabled>Select a table</option>
            {tables.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Customer name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mobile number *</label>
          <input
            type="tel"
            name="mobile"
            required
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit phone number"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email address (Optional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Add your taste (Optional)</label>
          <textarea
            name="tasteInstructions"
            value={formData.tasteInstructions}
            onChange={handleInputChange}
            placeholder="e.g. make it more spicy, add extra pepper..."
            rows="2"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800 transition-all outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
        >
          {loading ? 'Processing...' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
