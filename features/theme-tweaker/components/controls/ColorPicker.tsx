'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidColor(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const isValidColor = (color: string): boolean => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  };

  const getDisplayColor = (): string => {
    if (isValidColor(inputValue)) {
      return inputValue;
    }
    return '#000000';
  };

  const commonColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2 mt-1">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="#000000 or rgb(0,0,0)"
            className="font-mono text-sm"
          />
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 p-0 border-2"
              style={{ backgroundColor: getDisplayColor() }}
            >
              <Palette className="w-4 h-4" style={{ 
                color: getContrastColor(getDisplayColor()) 
              }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-4">
              {/* Native color picker */}
              <div>
                <Label className="text-sm">Color Picker</Label>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={getDisplayColor()}
                  onChange={handleColorInputChange}
                  className="w-full h-10 rounded border cursor-pointer"
                />
              </div>
              
              {/* Common colors */}
              <div>
                <Label className="text-sm">Common Colors</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {commonColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setInputValue(color);
                        onChange(color);
                      }}
                      className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              {/* HSL/RGB inputs */}
              <div>
                <Label className="text-sm">Manual Input</Label>
                <Input
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter color value"
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: #hex, rgb(), hsl(), named colors
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// Helper function to get contrasting color for text
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}