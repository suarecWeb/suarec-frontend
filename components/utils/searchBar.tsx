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
      
    </div>
  );
};

export default SearchBar;
