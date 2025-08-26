'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';
import { getContrastColor } from '../controls/ColorPicker';
import { HexColorPicker } from 'react-colorful';

export interface UniversalColorInputProps {
  id?: string;
  label?: string;
  value: string; // accepts any CSS color string (hex, rgb, hsl, oklch, lab, named)
  onChange: (next: string) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

// Utility: quick validity check using the browser parser
function isValidCssColor(input: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('div');
    probe.style.color = '';
    probe.style.color = input;
    return probe.style.color !== '';
  } catch {
    return false;
  }
}

// Utility: normalize to hex for <input type="color"> compatibility when possible
function toHexForNativePicker(input: string): string | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (!isValidCssColor(input)) return null;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(input)) return input.toUpperCase();
  const temp = document.createElement('div');
  temp.style.color = input;
  document.body.appendChild(temp);
  const computed = getComputedStyle(temp).color; // rgb(...)
  document.body.removeChild(temp);
  const m = computed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return null;
  const r = Number(m[1]).toString(16).padStart(2, '0');
  const g = Number(m[2]).toString(16).padStart(2, '0');
  const b = Number(m[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

export const UniversalColorInput: React.FC<UniversalColorInputProps> = ({
  id,
  label,
  value,
  onChange,
  className = '',
  disabled,
  'aria-label': ariaLabel
}) => {
  // Use Popover uncontrolled behavior for reliability
  const [text, setText] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const swatch = useMemo(() => (isValidCssColor(text) ? text : value), [text, value]);
  const hexForPicker = useMemo(() => toHexForNativePicker(swatch) || '#000000', [swatch]);
  const iconColor = useMemo(() => getContrastColor(hexForPicker), [hexForPicker]);

  const commit = () => {
    if (!text) return;
    if (isValidCssColor(text)) {
      setError(null);
      onChange(text);
    } else {
      setError('Invalid color');
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="mb-1 block">
          {label}
        </Label>
      )}
      <div className="flex items-center gap-2">
        <Input
          id={id}
          aria-label={ariaLabel || label || 'Color input'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setText(value);
          }}
          disabled={disabled}
          placeholder="#RRGGBB, rgb(), hsl(), oklch(), lab(), red"
          className="font-mono text-sm flex-1"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Open color picker"
              className="w-10 h-10 p-0 border-2 border-border shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-ring"
              disabled={disabled}
              style={{ backgroundColor: swatch }}
            >
              <Palette className="w-4 h-4" style={{ color: iconColor }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-[10000]" align="end">
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label className="text-xs">Pick color</Label>
                <div className="rounded-md border border-border p-2 bg-background">
                  <HexColorPicker
                    color={hexForPicker}
                    onChange={(hex) => {
                      setText(hex);
                      setError(null);
                      onChange(hex);
                    }}
                    style={{ width: '100%', height: '180px' }}
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Custom value</Label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                  }}
                  className="font-mono text-xs"
                  placeholder="e.g. oklch(0.7 0.1 230) or red"
                />
                {error && <span className="text-xs text-destructive">{error}</span>}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default UniversalColorInput;


