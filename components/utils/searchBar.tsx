'use client'
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  isScrolled?: boolean;
}

const SearchBar = ({ isScrolled = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', query);
    // search logic
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
          isScrolled ? 'text-gray-400' : 'text-white/60'
        }`} />
        <Input
          type="text"
          placeholder="Buscar publicaciones, empresas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`pl-10 pr-4 py-2 w-64 lg:w-80 backdrop-blur-sm border rounded-full focus:ring-2 transition-all duration-300 font-eras ${
            isScrolled 
              ? 'bg-white/80 border-gray-200 text-gray-700 placeholder:text-gray-500 focus:ring-[#097EEC]/30 focus:border-[#097EEC]' 
              : 'bg-white/10 border-white/20 text-white placeholder:text-white/90 focus:ring-white/30 focus:border-white/40'
          }`}          
        />
      </div>
      
      <Button
        onClick={handleSearch}
        className={`ml-2 p-2 backdrop-blur-sm border rounded-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 border-gray-200 text-gray-600 hover:bg-white hover:text-gray-800' 
            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
        }`}
        size="sm"
      >
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SearchBar;
