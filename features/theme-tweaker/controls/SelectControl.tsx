'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw, Check } from 'lucide-react';

interface SelectControlProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  originalValue?: string;
}

export const SelectControl: React.FC<SelectControlProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option...',
  className = '',
  originalValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const resetToOriginal = () => {
    if (originalValue !== undefined) {
      onChange(originalValue);
    }
  };

  const hasChanged = originalValue !== undefined && value !== originalValue;
  const displayValue = value || placeholder;
  const isValueSelected = !!value;

  return (
    <div ref={containerRef} className={`relative space-y-2 ${className}`}>
      {/* Label and Reset */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        
        {hasChanged && (
          <button
            onClick={resetToOriginal}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Reset to original value"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {/* Select Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm transition-colors
          ${isOpen
            ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500 dark:ring-blue-400'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isValueSelected
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400'
          }
          bg-white dark:bg-gray-800
          focus:outline-none
        `}
      >
        <span className={`truncate ${isValueSelected ? 'font-mono' : ''}`}>
          {displayValue}
        </span>
        <ChevronDown 
          size={16} 
          className={`flex-shrink-0 ml-2 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search options..."
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            />
          </div>
          
          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option === value;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors
                      ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="font-mono truncate">{option}</span>
                    {isSelected && (
                      <Check size={14} className="flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No matching options' : 'No options available'}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {options.length > 5 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              {filteredOptions.length} of {options.length} options
            </div>
          )}
        </div>
      )}
      
      {/* Change Indicator */}
      {hasChanged && (
        <div className="text-xs text-green-600 dark:text-green-400">
          Changed from: <span className="font-mono">{originalValue}</span>
        </div>
      )}
      
      {/* Helper Text */}
      {!hasChanged && options.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {options.length} option{options.length !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
};