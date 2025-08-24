'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  description?: string;
}

export function SelectControl({
  label,
  value,
  onChange,
  options,
  defaultValue,
  placeholder = "Select an option...",
  className,
  description
}: SelectControlProps) {
  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {defaultValue !== undefined && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={handleReset}
            title={`Reset to ${defaultValue}`}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(options || []).map((option) => {
            const normalized =
              typeof option === 'string'
                ? { value: option, label: option }
                : option;
            return (
              <SelectItem key={normalized.value} value={normalized.value}>
                <div>
                  <div className="font-medium">{normalized.label}</div>
                  {normalized.description && (
                    <div className="text-xs text-muted-foreground">{normalized.description}</div>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// Preset configurations for common CSS properties
export const SelectPresets = {
  display: {
    options: [
      { value: 'block', label: 'Block' },
      { value: 'inline', label: 'Inline' },
      { value: 'inline-block', label: 'Inline Block' },
      { value: 'flex', label: 'Flex' },
      { value: 'inline-flex', label: 'Inline Flex' },
      { value: 'grid', label: 'Grid' },
      { value: 'inline-grid', label: 'Inline Grid' },
      { value: 'none', label: 'None' }
    ]
  },
  position: {
    options: [
      { value: 'static', label: 'Static', description: 'Default positioning' },
      { value: 'relative', label: 'Relative', description: 'Relative to normal position' },
      { value: 'absolute', label: 'Absolute', description: 'Relative to nearest positioned ancestor' },
      { value: 'fixed', label: 'Fixed', description: 'Relative to viewport' },
      { value: 'sticky', label: 'Sticky', description: 'Sticky positioning' }
    ]
  },
  flexDirection: {
    options: [
      { value: 'row', label: 'Row', description: 'Left to right' },
      { value: 'row-reverse', label: 'Row Reverse', description: 'Right to left' },
      { value: 'column', label: 'Column', description: 'Top to bottom' },
      { value: 'column-reverse', label: 'Column Reverse', description: 'Bottom to top' }
    ]
  },
  justifyContent: {
    options: [
      { value: 'flex-start', label: 'Start' },
      { value: 'flex-end', label: 'End' },
      { value: 'center', label: 'Center' },
      { value: 'space-between', label: 'Space Between' },
      { value: 'space-around', label: 'Space Around' },
      { value: 'space-evenly', label: 'Space Evenly' }
    ]
  },
  alignItems: {
    options: [
      { value: 'stretch', label: 'Stretch' },
      { value: 'flex-start', label: 'Start' },
      { value: 'flex-end', label: 'End' },
      { value: 'center', label: 'Center' },
      { value: 'baseline', label: 'Baseline' }
    ]
  },
  textAlign: {
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
      { value: 'justify', label: 'Justify' }
    ]
  },
  fontWeight: {
    options: [
      { value: '100', label: 'Thin (100)' },
      { value: '200', label: 'Extra Light (200)' },
      { value: '300', label: 'Light (300)' },
      { value: '400', label: 'Normal (400)' },
      { value: '500', label: 'Medium (500)' },
      { value: '600', label: 'Semi Bold (600)' },
      { value: '700', label: 'Bold (700)' },
      { value: '800', label: 'Extra Bold (800)' },
      { value: '900', label: 'Black (900)' }
    ]
  },
  borderStyle: {
    options: [
      { value: 'none', label: 'None' },
      { value: 'solid', label: 'Solid' },
      { value: 'dashed', label: 'Dashed' },
      { value: 'dotted', label: 'Dotted' },
      { value: 'double', label: 'Double' },
      { value: 'groove', label: 'Groove' },
      { value: 'ridge', label: 'Ridge' },
      { value: 'inset', label: 'Inset' },
      { value: 'outset', label: 'Outset' }
    ]
  },
  overflow: {
    options: [
      { value: 'visible', label: 'Visible' },
      { value: 'hidden', label: 'Hidden' },
      { value: 'scroll', label: 'Scroll' },
      { value: 'auto', label: 'Auto' }
    ]
  }
};