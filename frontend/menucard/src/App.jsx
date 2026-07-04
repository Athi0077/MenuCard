import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryFilter from './components/CategoryFilter';
import DishCard from './components/DishCard';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navebar';
import CartSidePanel from './components/CardSidePanel';

export default function App() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_session_token') || '');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const seenNotificationsRef = useRef(new Set());

  // Fetch food menu live from MongoDB database on load
  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) {
      fetch('http://localhost:5000/api/dishes')
        .then(res => res.json())
        .then(data => {
          setDishes(data);
          // Pull unique categories out of the database entries automatically
          const uniqueCats = ['All', ...new Set(data.map(dish => dish.category))];
          setCategories(uniqueCats);
        })
        .catch(err => console.error("Error connecting to backend dishes API:", err));
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const eventSource = new EventSource('http://localhost:5000/api/orders/stream');

    eventSource.onmessage = (event) => {
      try {
        const order = JSON.parse(event.data);
        const savedOrderIds = JSON.parse(localStorage.getItem('user_orders') || '[]');

        if (!order?._id || !savedOrderIds.includes(order._id)) return;

        const notificationKey = `${order._id}:${order.status}`;
        if (seenNotificationsRef.current.has(notificationKey)) return;
        seenNotificationsRef.current.add(notificationKey);

        const savedBills = JSON.parse(localStorage.getItem('user_bills') || '[]');
        const billIndex = savedBills.findIndex(b => b._id === order._id);
        if (billIndex !== -1) {
          if (order.status === 'Cancelled') {
            savedBills.splice(billIndex, 1);
          } else {
            savedBills[billIndex].status = order.status;
          }
          localStorage.setItem('user_bills', JSON.stringify(savedBills));
        }

        const statusMessages = {
          Preparing: 'Your order is now being prepared.',
          Ready: 'Your order is ready to serve.',
          Delivered: 'Your order has been delivered.',
          Cancelled: 'Your order was cancelled.'
        };

        const message = statusMessages[order.status] || 'Your order status has been updated.';
        toast.info(message, { autoClose: 4000 });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Order Update', {
            body: `${order.customerName || 'Your order'} — ${message}`,
            icon: '/favicon.ico'
          });
        }
      } catch (error) {
        console.error('Error processing order update notification:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('Order update stream disconnected.');
    };

    return () => eventSource.close();
  }, []);

  // Admin Auth Route Handlers
  const handleLogin = (token) => {
    localStorage.setItem('admin_session_token', token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session_token');
    setAdminToken('');
  };

  // Cart Operation Management Handlers
  const addToCart = (dish) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item._id === dish._id);
      if (existingItem) {
        return prevCart.map(item => item._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...dish, quantity: 1 }];
    });

    if (window.innerWidth < 1024) {
      toast.success("Cart Added, Scrolldown see the Your Order", {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const clearCart = () => setCart([]);

  // Filter local array calculation logic
  const filteredDishes = selectedCategory === 'All'
    ? dishes
    : dishes.filter(dish => dish.category === selectedCategory);

  // ROUTE 1: Admin Panel Dashboard Paths
  if (window.location.pathname.startsWith('/admin')) {
    if (!adminToken) {
      return (
        <>
          <ToastContainer position="top-right" autoClose={3000} />
          <AdminAuth onLoginSuccess={handleLogin} />
        </>
      );
    }
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <AdminDashboard token={adminToken} onLogout={handleLogout} />
      </>
    );
  }

  // ROUTE 2: Complete Customer Menu QR Destination View
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-gray-50 text-gray-800 antialiased">
      <Navbar isTrackingOpen={isTrackingOpen} onOpenTracking={setIsTrackingOpen} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Menu Left / Center column workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore dishes</h2>
            <p className="text-gray-500 mb-6 text-sm">Freshly prepared resort favorites right to your table.</p>
            
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          </div>

          {filteredDishes.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm">
              No dishes found under this category selection.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDishes.map(dish => (
                <DishCard key={dish._id} dish={dish} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side Customer Ordering Panel Container */}
        <div className="lg:col-span-1">
          <CartSidePanel 
            cart={cart} 
            table={selectedTable} 
            onTableChange={setSelectedTable}
            onUpdateQty={updateQuantity} 
            onOrderSuccess={clearCart}
            onOpenTracking={setIsTrackingOpen}
          />
        </div>
      </main>
    </div>
    </>
  );
}
