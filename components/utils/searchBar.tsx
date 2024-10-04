'use client'
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchBar = () => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', query);
    // search logic
  };

  return (
    <div className="flex items-center space-x-2">
      <Input 
        type="text" 
        placeholder="Buscar..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        className="w-64 bg-secondary"
      />
      <Button onClick={handleSearch} className='bg-primary-darker'>Buscar</Button>
    </div>
  );
};

export default SearchBar;
