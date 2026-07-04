const Order = require('../models/Order');
const Admin = require('../models/Admin');
const adminFirebase = require('../config/firebaseAdmin');
const EventEmitter = require('events');

const orderEmitter = new EventEmitter();

const notifyAdminsNewOrder = async (order) => {
  if (!adminFirebase.apps.length) return;
  try {
    const admins = await Admin.find({});
    const tokens = admins.reduce((acc, admin) => acc.concat(admin.fcmTokens || []), []);
    if (tokens.length > 0) {
      await adminFirebase.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: 'New Order Received',
          body: `Table ${order.table} - ${order.customerName}`,
        }
      });
    }
  } catch (err) {
    console.error("FCM Admin Notify Error:", err);
  }
};

const notifyUserOrderStatus = async (order) => {
  if (!adminFirebase.apps.length || !order.fcmToken) return;
  try {
    const statusMessages = {
      Preparing: 'Your order is now being prepared.',
      Ready: 'Your order is ready to serve.',
      Delivered: 'Your order has been delivered.',
      Cancelled: 'Your order was cancelled.'
    };
    const messageBody = statusMessages[order.status] || `Your order status is now ${order.status}`;
    
    await adminFirebase.messaging().send({
      token: order.fcmToken,
      notification: {
        title: 'Order Update',
        body: messageBody,
      }
    });
  } catch (err) {
    console.error("FCM User Notify Error:", err);
  }
};


exports.placeOrder = async (req, res) => {
  try {
    const { table, customerName, mobileNumber, emailAddress, items, totalAmount, tasteInstructions, fcmToken } = req.body;
    if (!table || !customerName || !mobileNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'Table, customer name, mobile number, and at least one item are required.' });
    }
    const order = await Order.create({ table, customerName, mobileNumber, emailAddress, items, totalAmount, tasteInstructions, fcmToken });

    // Emit event for admin and customer real-time updates
    orderEmitter.emit('newOrder', order);
    orderEmitter.emit('orderUpdated', order);

    notifyAdminsNewOrder(order);

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.dish').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, prepTime } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (prepTime !== undefined) updateFields.prepTime = prepTime;

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { returnDocument: 'after' }).populate('items.dish');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    orderEmitter.emit('orderUpdated', order);
    notifyUserOrderStatus(order);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const { timerMinutes } = req.body;
    if (!timerMinutes || timerMinutes <= 0) {
      return res.status(400).json({ message: 'Please set a valid timer (in minutes).' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Preparing',
        acceptedAt: new Date(),
        timerMinutes: timerMinutes
      },
      { returnDocument: 'after' }
    ).populate('items.dish');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    orderEmitter.emit('orderUpdated', order);
    notifyUserOrderStatus(order);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.dish');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled.' });
    }

    const timeElapsed = Date.now() - new Date(order.createdAt).getTime();
    if (timeElapsed > 90 * 1000) {
      return res.status(400).json({ message: 'Cancellation time has expired.' });
    }

    order.status = 'Cancelled';
    await order.save();

    orderEmitter.emit('orderUpdated', order);
    notifyUserOrderStatus(order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.streamOrderUpdates = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onOrderUpdate = (order) => {
    res.write(`data: ${JSON.stringify(order)}\n\n`);
  };

  orderEmitter.on('orderUpdated', onOrderUpdate);

  req.on('close', () => {
    orderEmitter.removeListener('orderUpdated', onOrderUpdate);
  });
};

exports.streamOrders = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onNewOrder = (order) => {
    res.write(`data: ${JSON.stringify(order)}\n\n`);
  };

  orderEmitter.on('newOrder', onNewOrder);

  req.on('close', () => {
    orderEmitter.removeListener('newOrder', onNewOrder);
  });
};
