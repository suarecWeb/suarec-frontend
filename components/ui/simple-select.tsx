"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
}

export const SimpleSelect = ({
  value,
  onValueChange,
  placeholder,
  className,
  children,
}: SimpleSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className || ""}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span>{selectedValue || placeholder || "Seleccionar..."}</span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-1 max-h-96 overflow-auto rounded-md border bg-white shadow-lg">
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement(child) &&
              child.type === SimpleSelectItem
            ) {
              return React.cloneElement(child, {
                onSelect: handleSelect,
              } as any);
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SimpleSelectItem = React.forwardRef<
  HTMLDivElement,
  SimpleSelectItemProps & { onSelect?: (value: string) => void }
>(({ value, children, className, onSelect }, ref) => (
  <div
    ref={ref}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 ${className || ""}`}
    onClick={() => onSelect?.(value)}
  >
    {children}
  </div>
));
SimpleSelectItem.displayName = "SimpleSelectItem";
