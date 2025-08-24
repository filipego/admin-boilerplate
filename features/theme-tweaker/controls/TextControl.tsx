'use client';

import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface TextControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  originalValue?: string;
  multiline?: boolean;
  rows?: number;
}

export const TextControl: React.FC<TextControlProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  className = '',
  originalValue,
  multiline = false,
  rows = 3,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Trim whitespace on blur
    const trimmedValue = inputValue.trim();
    if (trimmedValue !== inputValue) {
      setInputValue(trimmedValue);
      onChange(trimmedValue);
    }
  };

  const resetToOriginal = () => {
    if (originalValue !== undefined) {
      setInputValue(originalValue);
      onChange(originalValue);
    }
  };

  const hasChanged = originalValue !== undefined && value !== originalValue;
  const isEmpty = !inputValue.trim();

  return (
    <div className={`space-y-2 ${className}`}>
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

      {/* Input Field */}
      {multiline ? (
        <textarea
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full px-3 py-2 border rounded-md text-sm font-mono resize-vertical transition-colors
            ${isEmpty && !isFocused
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
            }
            ${isFocused
              ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500 dark:ring-blue-400'
              : 'hover:border-gray-400 dark:hover:border-gray-500'
            }
            bg-white dark:bg-gray-800
            focus:outline-none
          `}
        />
      ) : (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border rounded-md text-sm font-mono transition-colors
            ${isEmpty && !isFocused
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
            }
            ${isFocused
              ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500 dark:ring-blue-400'
              : 'hover:border-gray-400 dark:hover:border-gray-500'
            }
            bg-white dark:bg-gray-800
            focus:outline-none
          `}
        />
      )}

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-500 dark:text-gray-400">
          {isEmpty && !isFocused && (
            <span>Enter a value...</span>
          )}
          {!isEmpty && (
            <span>{inputValue.length} characters</span>
          )}
        </div>
        
        {hasChanged && (
          <div className="text-green-600 dark:text-green-400">
            Modified
          </div>
        )}
      </div>
      
      {/* Original Value Display */}
      {hasChanged && originalValue && (
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded border">
          <span className="font-medium">Original:</span>
          <span className="ml-2 font-mono">{originalValue}</span>
        </div>
      )}
    </div>
  );
};