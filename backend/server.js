const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.js');
const authController = require('./controllers/authController');
const dishController = require('./controllers/dishController');
const orderController = require('./controllers/orderController');
const protectAdmin = require('./middleware/authMiddleware');


const app = express();
connectDB();

app.use(cors({
  origin: 'https://menu-card-cyan.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json()); 

// Public routes (User-side)
app.get('/api/dishes', dishController.getDishes);
app.post('/api/orders', orderController.placeOrder);
app.get('/api/orders/stream', orderController.streamOrderUpdates);
app.get('/api/orders/:id', orderController.getOrderById);
app.put('/api/orders/:id/cancel', orderController.cancelOrder);



// Admin auth routes
app.post('/api/admin/register', authController.registerAdmin);
app.post('/api/admin/login', authController.loginAdmin);

// Protected admin routes

app.get('/api/admin/orders/stream', protectAdmin, orderController.streamOrders);
app.post('/api/admin/dishes', protectAdmin, dishController.createDish);
app.put('/api/admin/dishes/:id', protectAdmin, dishController.updateDish);
app.delete('/api/admin/dishes/:id', protectAdmin, dishController.deleteDish);
app.get('/api/admin/orders', protectAdmin, orderController.getAllOrders);
app.delete('/api/admin/orders/history', protectAdmin, orderController.deleteOrderHistory);
app.put('/api/admin/orders/:id', protectAdmin, orderController.updateOrderStatus);
app.put('/api/admin/orders/:id/accept', protectAdmin, orderController.acceptOrder);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
