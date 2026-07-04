import React, { useState } from 'react';
import TrackOrder from './TrackOrder';
import Bills from './Bills';

export default function Navbar({ isTrackingOpen, onOpenTracking }) {
  const [isBillsOpen, setIsBillsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:h-20 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <span className="inline-block bg-teal-50 text-teal-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider mb-1">
            QR Digital Dining Menu
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Resort Menu Card</h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsBillsOpen(true)}
            className="flex-1 sm:flex-none text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors shadow-sm text-center"
          >
            My Bills
          </button>
          
          <button 
            onClick={() => onOpenTracking(true)}
            className="flex-1 sm:flex-none text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-colors shadow-sm text-center"
          >
            Track Orders
          </button>
        </div>
      </div>
      
      <TrackOrder isOpen={isTrackingOpen} onClose={() => onOpenTracking(false)} />
      <Bills isOpen={isBillsOpen} onClose={() => setIsBillsOpen(false)} />
    </header>
  );
}
