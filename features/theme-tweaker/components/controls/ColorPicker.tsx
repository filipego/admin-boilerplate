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
  const [iconColor, setIconColor] = useState('#000000');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const lum = getLuminance(getDisplayColor());
    setIconColor(lum > 0.55 ? '#000000' : '#ffffff');
  }, [inputValue, isOpen]);

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
    const el = document.createElement('div');
    el.style.color = '';
    el.style.color = color;
    return el.style.color !== '';
  };

  const getDisplayColor = (): string => {
    if (isValidColor(inputValue)) {
      return inputValue;
    }
    return '#000000';
  };

  const getLuminance = (color: string): number => {
    // 1) Try computed style conversion via color property (handles most formats)
    try {
      const probe = document.createElement('div');
      probe.style.color = color;
      probe.style.display = 'none';
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color; // e.g. rgb(255 255 255) or rgb(255, 255, 255)
      document.body.removeChild(probe);
      const rgbMatch = computed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }
    } catch {}

    // 2) Hex fallback
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const parse = (s: string) => parseInt(s.length === 1 ? s + s : s, 16);
      const r = hex.length >= 2 ? parse(hex.slice(0, 2)) : 0;
      const g = hex.length >= 4 ? parse(hex.slice(2, 4)) : 0;
      const b = hex.length >= 6 ? parse(hex.slice(4, 6)) : 0;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    // 3) lab() fallback: use L channel (0-100%)
    const lab = color.match(/lab\(([^)]+)\)/i);
    if (lab) {
      const parts = lab[1].split(/[\s,]+/).filter(Boolean);
      if (parts.length > 0) {
        const lRaw = parts[0];
        const l = lRaw.includes('%') ? parseFloat(lRaw) : parseFloat(lRaw) * 100;
        return Math.max(0, Math.min(100, l)) / 100;
      }
    }

    // 4) oklch() fallback: use L (0-1 or 0-100%)
    const oklch = color.match(/oklch\(([^)]+)\)/i);
    if (oklch) {
      const parts = oklch[1].split(/[\s,]+/).filter(Boolean);
      if (parts.length > 0) {
        const lRaw = parts[0];
        const l = lRaw.includes('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
        return Math.max(0, Math.min(1, l));
      }
    }

    // 5) Last resort: try rgb() with spaces directly
    const spaceRgb = color.match(/rgba?\((\d+)[\s]+(\d+)[\s]+(\d+)/i);
    if (spaceRgb) {
      const r = parseInt(spaceRgb[1], 10);
      const g = parseInt(spaceRgb[2], 10);
      const b = parseInt(spaceRgb[3], 10);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    // Default luminance (dark)
    return 0;
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
              <Palette className="w-4 h-4" style={{ color: iconColor }} />
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
                  Supports: #hex, rgb(), hsl(), oklch(), lab(), named colors
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// Keep exported for reuse
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}