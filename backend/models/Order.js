const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  table: { type: String, required: true },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  emailAddress: { type: String },
  items: [{
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    quantity: { type: Number, required: true, min: 1 },
    specialItem: { type: String, default: '' }
  }],
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'], default: 'Pending' },
  tasteInstructions: { type: String, default: '' },
  prepTime: { type: Number, default: 15 },
  totalAmount: { type: Number, required: true },
  acceptedAt: { type: Date, default: null },
  timerMinutes: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
