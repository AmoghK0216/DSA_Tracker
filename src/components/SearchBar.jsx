import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = React.forwardRef(({ searchTerm, onSearchChange, placeholder = "Search problems..." }, ref) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.target.blur();
    }
  };

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
      <input
        ref={ref}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
