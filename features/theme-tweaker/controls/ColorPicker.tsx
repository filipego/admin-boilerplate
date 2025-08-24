'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Pipette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isEyedropping, setIsEyedropping] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidColor(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    if (!isValidColor(inputValue)) {
      setInputValue(value); // Reset to last valid value
    }
  };

  const isValidColor = (color: string): boolean => {
    if (!color) return false;
    
    // Check for hex colors
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) return true;
    
    // Check for rgb/rgba
    if (/^rgba?\(/.test(color)) return true;
    
    // Check for hsl/hsla
    if (/^hsla?\(/.test(color)) return true;
    
    // Check for oklch
    if (/^oklch\(/.test(color)) return true;
    
    // Check for CSS color names
    const colorNames = [
      'transparent', 'currentColor', 'inherit', 'initial', 'unset',
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
      'gray', 'grey', 'orange', 'purple', 'pink', 'brown', 'lime', 'indigo',
      'violet', 'navy', 'teal', 'olive', 'maroon', 'silver', 'gold'
    ];
    
    return colorNames.includes(color.toLowerCase());
  };

  const convertToHex = (color: string): string => {
    if (color.startsWith('#')) return color;
    
    // Create a temporary element to get computed color
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    
    const computedColor = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
    
    // Convert rgb to hex
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${[r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }
    
    return color;
  };

  const startEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      alert('EyeDropper API is not supported in this browser');
      return;
    }

    try {
      setIsEyedropping(true);
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      
      if (result.sRGBHex) {
        const newColor = result.sRGBHex;
        setInputValue(newColor);
        onChange(newColor);
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Eyedropper cancelled or failed:', error);
    } finally {
      setIsEyedropping(false);
    }
  };

  const presetColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#f3f4f6',
  ];

  const displayColor = isValidColor(inputValue) ? inputValue : '#000000';
  const hexColor = convertToHex(displayColor);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      <div className="flex gap-2">
        {/* Color Preview & Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <div
            className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: displayColor }}
          />
          <Palette size={16} className="text-gray-500" />
        </button>
        
        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          className={`flex-1 px-3 py-2 border rounded-md text-sm font-mono transition-colors ${
            isValidColor(inputValue)
              ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
              : 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          placeholder="#000000 or rgb(0,0,0)"
        />
        
        {/* Eyedropper */}
        {'EyeDropper' in window && (
          <button
            onClick={startEyedropper}
            disabled={isEyedropping}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
            title="Pick color from screen"
          >
            <Pipette size={16} className={isEyedropping ? 'text-blue-500' : 'text-gray-500'} />
          </button>
        )}
      </div>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[280px]">
          {/* Native Color Input */}
          <div className="mb-4">
            <input
              ref={colorInputRef}
              type="color"
              value={hexColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setInputValue(newColor);
                onChange(newColor);
              }}
              className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
          </div>
          
          {/* Preset Colors */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preset Colors
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setInputValue(color);
                    onChange(color);
                  }}
                  className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Format Examples */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-1"><strong>Supported formats:</strong></p>
            <p>• Hex: #ff0000, #f00</p>
            <p>• RGB: rgb(255, 0, 0)</p>
            <p>• HSL: hsl(0, 100%, 50%)</p>
            <p>• OKLCH: oklch(0.6 0.2 0)</p>
          </div>
        </div>
      )}
    </div>
  );
};