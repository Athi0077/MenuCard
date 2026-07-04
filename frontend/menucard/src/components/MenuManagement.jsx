import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function MenuManagement({ token }) {
  const [menuItems, setMenuItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Breakfast', description: '', imageUrl: '', price: 0, prepTime: 15, tags: '', dietaryPreference: 'None', isAvailable: true, specialItemName: '', specialItemPrice: 0
  });

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dishes`);
      const data = await response.json();
      if (response.ok) {
        setMenuItems(data);
      } else {
        toast.error('Failed to load menu items from server.');
      }
    } catch (err) {
      toast.error('Failed to load menu items from server.');
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', category: 'Breakfast', description: '', imageUrl: '', price: 0, prepTime: 15, tags: '', dietaryPreference: 'None', isAvailable: true, specialItemName: '', specialItemPrice: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!editingId;
    const url = isEditing
      ? `${import.meta.env.VITE_API_URL}/api/admin/dishes/${editingId}`
      : `${import.meta.env.VITE_API_URL}/api/admin/dishes`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      toast.success(isEditing ? 'Menu item updated!' : 'Menu item created!');
      resetForm();
      fetchMenu();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditItem = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || '',
      category: item.category || 'Breakfast',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      price: item.price || 0,
      prepTime: item.prepTime || 15,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      dietaryPreference: item.dietaryPreference || 'None',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      specialItemName: item.specialItemName || '',
      specialItemPrice: item.specialItemPrice || 0
    });
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dishes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Dish deleted successfully.');
        if (editingId === id) resetForm();
        fetchMenu();
      } else {
        toast.error('Failed to delete dish.');
      }
    } catch (err) {
      toast.error('Failed to delete dish.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit menu item' : 'Create menu item'}
          </h2>
          <p className="text-xs text-gray-400">
            {editingId ? 'Update the dish details below and save.' : 'Add a new dish to the menu.'}
          </p>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            ✕ Cancel editing — switch to create mode
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-gray-500 uppercase">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Dish name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case" />
            </div>
            <div>
              <label className="block mb-1">Category</label>
              <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Tea & Coffee">Tea & Coffee</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case font-normal" />
          </div>
          <div>
            <label className="block mb-1">Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case font-normal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Price</label>
              <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 font-bold" />
            </div>
            <div>
              <label className="block mb-1">Prep time in minutes</label>
              <input type="number" name="prepTime" required value={formData.prepTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Tags (Comma separated)</label>
              <input type="text" name="tags" placeholder="e.g. Spicy, Popular" value={formData.tags} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case placeholder-gray-300 font-normal" />
            </div>
            <div>
              <label className="block mb-1">Dietary Preference</label>
              <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-800">
                <option value="None">None</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Side Dish</label>
              <input type="text" name="specialItemName" placeholder="e.g. Vada,Samosa" value={formData.specialItemName} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 normal-case font-normal placeholder-gray-300" />
            </div>
            <div>
              <label className="block mb-1">Side Dish price</label>
              <input type="number" name="specialItemPrice" value={formData.specialItemPrice} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 font-bold" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" name="isAvailable" id="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="rounded text-teal-800 focus:ring-teal-500/20 w-4 h-4" />
            <label htmlFor="isAvailable" className="cursor-pointer tracking-wide text-gray-700 select-none">Available for ordering</label>
          </div>
          <button
            type="submit"
            className={`w-full font-bold py-3 rounded-xl tracking-wide shadow-md transition-colors text-sm uppercase ${
              editingId
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-teal-800 hover:bg-teal-900 text-white'
            }`}
          >
            {editingId ? 'Save changes' : 'Add menu item'}
          </button>
        </form>
      </div>

      {/* Menu List Section */}
      <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Current menu</h2>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">Total items: {menuItems.length}</p>
        </div>
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-2">
          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No dishes in the menu yet. Add one using the form.</p>
          ) : (
            menuItems.map((item) => (
              <div key={item._id} className={`py-3.5 flex items-center justify-between gap-4 ${editingId === item._id ? 'bg-amber-50/50 -mx-2 px-2 rounded-xl' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 object-cover rounded-xl bg-gray-100 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">
                      {item.name}
                      {item.dietaryPreference && item.dietaryPreference !== 'None' && (
                        <span className={`ml-2 inline-block w-2 h-2 rounded-full ${item.dietaryPreference === 'Veg' || item.dietaryPreference === 'Vegan' ? 'bg-green-500' : 'bg-red-500'}`} title={item.dietaryPreference}></span>
                      )}
                    </h4>
                    <p className="text-xs text-teal-800 font-bold">{item.category} • ₹{item.price}</p>
                    {!item.isAvailable && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">Unavailable</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
