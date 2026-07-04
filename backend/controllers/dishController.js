const Dish = require('../models/Dish');

exports.getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDish = async (req, res) => {
  try {
    const { name, category, description, imageUrl, price, prepTime, tags, isAvailable, specialItemName, specialItemPrice, dietaryPreference } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required.' });
    }
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    const dish = await Dish.create({ name, category, description, imageUrl, price, prepTime, tags: parsedTags, isAvailable, specialItemName, specialItemPrice, dietaryPreference });
    res.status(201).json(dish);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDish = async (req, res) => {
  try {
    const { name, category, description, imageUrl, price, prepTime, tags, isAvailable, specialItemName, specialItemPrice, dietaryPreference } = req.body;
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    const updateData = { name, category, description, imageUrl, price, prepTime, tags: parsedTags, isAvailable, specialItemName, specialItemPrice, dietaryPreference };

    const dish = await Dish.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });
    if (!dish) return res.status(404).json({ message: 'Dish not found.' });
    res.json(dish);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ message: 'Dish not found.' });
    res.json({ message: 'Dish deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
