
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-placeholder-color" aria-hidden="true" />
      </div>
      <input
        type="search"
        name="global-search"
        id="global-search"
        className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-md leading-5 bg-input-bg text-dark-text placeholder-placeholder-color focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-subtle"
        placeholder="Search clients, tasks, team..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};