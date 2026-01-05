import React, { useState, useRef, useEffect } from "react";

interface ProfessionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  label?: string;
  placeholder?: string;
}

const ProfessionAutocomplete: React.FC<ProfessionAutocompleteProps> = ({
  value,
  onChange,
  suggestions,
  label = "Profesión",
  placeholder = "Escribe o selecciona tu profesión",
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const filteredSuggestions = suggestions
    .filter((prof) => prof.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  const handleFocus = () => {
    if (inputValue) setShowSuggestions(true);
  };

  return (
    <div className="space-y-2 relative">
      <label
        htmlFor="profession-autocomplete"
        className="block text-sm font-semibold text-gray-800"
      >
        {label}
      </label>
      <input
        id="profession-autocomplete"
        name="profession"
        type="text"
        autoComplete="off"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-all outline-none bg-white"
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls="profession-suggestions"
        aria-activedescendant={
          showSuggestions && filteredSuggestions.length > 0
            ? `suggestion-0`
            : undefined
        }
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="profession-suggestions"
          className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion, idx) => (
            <div
              key={suggestion}
              id={`suggestion-${idx}`}
              role="option"
              tabIndex={-1}
              aria-selected={inputValue === suggestion}
              className="px-4 py-2 cursor-pointer hover:bg-[#097EEC]/10"
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Ejemplo: Desarrollador web, Abogado, Chef...
      </p>
    </div>
  );
};

export default ProfessionAutocomplete;
