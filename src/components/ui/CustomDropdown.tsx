import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get the label for the current value
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="text-xs text-gray-400 block mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:outline-none focus:border-gold-500/50 transition-all flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold-500/30 cursor-pointer'
        } ${isOpen ? 'border-gold-500/50 bg-black/70' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
          {displayLabel}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-5 w-5 text-gold-500/60" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#141414] border border-gold-500/30 shadow-2xl shadow-gold-500/10 z-50"
            role="listbox"
          >
            <div className="max-h-64 overflow-y-auto py-2">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-400 text-sm">
                  No options available
                </div>
              ) : (
                options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3 ${
                      value === option.value
                        ? 'bg-gold-500/20 border-l-2 border-gold-500 text-gold-400'
                        : 'text-gray-300 hover:bg-gold-500/10 hover:text-gold-300'
                    }`}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    {/* Checkmark for selected option */}
                    {value === option.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                    )}
                    <span className="flex-1">{option.label}</span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
