'use client';

import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface SliderControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  className?: string;
  originalValue?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  className = '',
  originalValue,
}) => {
  const [numericValue, setNumericValue] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Extract numeric value from CSS value
  const extractNumericValue = (cssValue: string): number => {
    if (!cssValue) return min;
    
    // Remove unit and parse number
    const match = cssValue.match(/^([+-]?\d*\.?\d+)/);
    if (match) {
      const num = parseFloat(match[1]);
      return isNaN(num) ? min : Math.max(min, Math.min(max, num));
    }
    
    return min;
  };

  // Format value with unit
  const formatValue = (num: number): string => {
    return `${num}${unit}`;
  };

  useEffect(() => {
    const extracted = extractNumericValue(value);
    setNumericValue(extracted);
    setInputValue(extracted.toString());
  }, [value, min, max]);

  const handleSliderChange = (newValue: number) => {
    setNumericValue(newValue);
    setInputValue(newValue.toString());
    onChange(formatValue(newValue));
  };

  const handleInputChange = (inputVal: string) => {
    setInputValue(inputVal);
    
    const num = parseFloat(inputVal);
    if (!isNaN(num)) {
      const clampedValue = Math.max(min, Math.min(max, num));
      setNumericValue(clampedValue);
      onChange(formatValue(clampedValue));
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      // Reset to current slider value if input is invalid
      setInputValue(numericValue.toString());
    } else {
      // Clamp and update
      const clampedValue = Math.max(min, Math.min(max, num));
      setNumericValue(clampedValue);
      setInputValue(clampedValue.toString());
      onChange(formatValue(clampedValue));
    }
  };

  const resetToOriginal = () => {
    if (originalValue) {
      const originalNumeric = extractNumericValue(originalValue);
      setNumericValue(originalNumeric);
      setInputValue(originalNumeric.toString());
      onChange(originalValue);
    }
  };

  const hasChanged = originalValue && value !== originalValue;
  const percentage = ((numericValue - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Reset */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        
        <div className="flex items-center gap-2">
          {hasChanged && (
            <button
              onClick={resetToOriginal}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Reset to original value"
            >
              <RotateCcw size={12} />
            </button>
          )}
          
          {/* Value Input */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={isInputFocused ? inputValue : numericValue.toString()}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={handleInputBlur}
              className="w-16 px-2 py-1 text-xs text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[1.5rem]">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        
        {/* Progress Track */}
        <div 
          className="absolute top-0 h-2 bg-blue-500 rounded-lg pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Slider Thumb */}
        <div 
          className="absolute top-0 w-2 h-2 bg-white border-2 border-blue-500 rounded-full transform -translate-y-0 pointer-events-none shadow-sm"
          style={{ left: `calc(${percentage}% - 4px)` }}
        />
      </div>

      {/* Range Labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      
      {/* Change Indicator */}
      {hasChanged && (
        <div className="text-xs text-green-600 dark:text-green-400">
          Changed from {originalValue}
        </div>
      )}
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb:hover {
          background: #2563eb;
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};