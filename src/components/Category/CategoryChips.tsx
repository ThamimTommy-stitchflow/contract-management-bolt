import React from 'react';

interface CategoryChipsProps {
  categories: readonly string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedApps: any[];
}

export function CategoryChips({ 
  categories, 
  selectedCategory, 
  onSelectCategory
}: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}