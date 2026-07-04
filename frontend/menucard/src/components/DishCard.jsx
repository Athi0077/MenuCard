import React, { useState } from 'react';

export default function DishCard({ dish, onAdd }) {
  const [addSpecial, setAddSpecial] = useState(false);
  const fallbackImage = 'https://placeholder.com';

  const handleAdd = () => {
    if (addSpecial && dish.specialItemName) {
      onAdd({
        ...dish,
        _id: dish._id + '_special',
        baseId: dish._id,
        name: `${dish.name} (+ ${dish.specialItemName})`,
        price: dish.price + (dish.specialItemPrice || 0),
        specialItem: dish.specialItemName
      });
      setAddSpecial(false);
    } else {
      onAdd({ ...dish, baseId: dish._id });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm flex gap-4 items-center hover:shadow-md transition-shadow">
      <img 
        src={dish.imageUrl || fallbackImage} 
        alt={dish.name} 
        className="w-24 h-24 object-cover rounded-xl bg-gray-100 flex-shrink-0" 
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 min-w-0 pr-1 py-1">
            <span className="truncate">{dish.name}</span>
            {(!dish.dietaryPreference || dish.dietaryPreference === 'None') && (
              <span className="flex-shrink-0 inline-block w-2 h-2 rounded-full bg-gray-400 ring-2 ring-gray-100 ring-offset-1" title="Not specified"></span>
            )}
            {dish.dietaryPreference === 'Veg' && (
              <span className="flex-shrink-0 inline-block w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-200 ring-offset-1" title="Veg"></span>
            )}
            {dish.dietaryPreference === 'Non-Veg' && (
              <span className="flex-shrink-0 inline-block w-2 h-2 rounded-full bg-red-500 ring-2 ring-red-200 ring-offset-1" title="Non-Veg"></span>
            )}
            {dish.dietaryPreference === 'Vegan' && (
              <span className="flex-shrink-0 inline-flex items-center" title="Vegan">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-200 ring-offset-1 z-10"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 ring-2 ring-red-200 ring-offset-1 -ml-1.5"></span>
              </span>
            )}
          </h3>
          {!dish.isAvailable && (
            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0">
              Out of stock
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 font-medium uppercase mb-1">{dish.category}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{dish.description || 'No description provided.'}</p>
        {dish.tags && <p className="text-sm text-gray-500 line-clamp-2 mb-2">{dish.tags}</p>}
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-teal-800">₹{dish.price.toFixed(2)}</span>
          <div className="flex flex-col items-end gap-1">
            {dish.specialItemName && dish.isAvailable && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={addSpecial} 
                  onChange={(e) => setAddSpecial(e.target.checked)} 
                  className="rounded text-teal-700 w-3 h-3"
                />
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Add {dish.specialItemName} (+₹{dish.specialItemPrice})
                </span>
              </label>
            )}
            <button 
              onClick={handleAdd}
              disabled={!dish.isAvailable}
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
