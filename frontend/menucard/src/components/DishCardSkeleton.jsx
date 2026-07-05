import React from 'react';

export default function DishCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm flex gap-4 items-center animate-pulse" aria-hidden="true">
      {/* Image Skeleton */}
      <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0"></div>
      
      <div className="flex-1 min-w-0 py-1">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
        
        {/* Category Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
        
        {/* Description Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5 mb-3"></div>
        
        {/* Footer Skeleton: Price and Button */}
        <div className="flex items-center justify-between mt-3">
          <div className="h-5 bg-gray-200 rounded w-1/5"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
        </div>
      </div>
    </div>
  );
}
