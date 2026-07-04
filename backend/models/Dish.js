const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  price: { type: Number, required: true, default: 0 },
  prepTime: { type: Number, required: true, default: 15 },
  tags: [{ type: String }],
  specialItemName: { type: String, default: '' },
  specialItemPrice: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Dish', DishSchema);
