"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Select = ({ value, onValueChange, children, className }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              ref: triggerRef,
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue,
            } as any)
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onSelect: handleSelect,
            } as any)
          }
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, { children: React.ReactNode; className?: string; onClick?: () => void; isOpen?: boolean; selectedValue?: string }>(
  ({ children, className, onClick, isOpen, selectedValue }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className || ""}`}
    >
      <span>{selectedValue || children}</span>
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ children }: { children: React.ReactNode }) => <>{children}</>

const SelectContent = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; onSelect?: (value: string) => void }>(
  ({ children, className, onSelect }, ref) => (
    <div
      ref={ref}
      className={`absolute top-full left-0 z-50 w-full mt-1 max-h-96 overflow-auto rounded-md border bg-white shadow-lg ${className || ""}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, {
            onSelect,
          } as any)
        }
        return child
      })}
    </div>
  )
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, { value: string; children: React.ReactNode; className?: string; onSelect?: (value: string) => void }>(
  ({ value, children, className, onSelect }, ref) => (
    <div
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 ${className || ""}`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} 