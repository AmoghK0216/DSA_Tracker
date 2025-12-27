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
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-text-muted" size={18} />
      <input
        ref={ref}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-app-card border border-app-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-app-accent transition-colors"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-text-muted hover:text-app-text-secondary transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
