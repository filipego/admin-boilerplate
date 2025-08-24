'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  className?: string;
  description?: string;
}

export function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  defaultValue,
  className,
  description
}: SliderControlProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
      setInputValue(defaultValue.toString());
    }
  };

  const formatValue = (val: number): string => {
    return `${val}${unit}`;
  };

  return (
    <div
      className={className}
      onMouseDownCapture={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onTouchStartCapture={(e) => e.stopPropagation()}
      onClickCapture={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-20 h-8 text-sm text-right"
            type="number"
            min={min}
            max={max}
            step={step}
          />
          <span className="text-sm text-muted-foreground min-w-[2ch]">{unit}</span>
          {defaultValue !== undefined && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={handleReset}
              title={`Reset to ${formatValue(defaultValue)}`}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="px-1">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
        
        {/* Value indicators */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatValue(min)}</span>
          <span className="font-medium">{formatValue(value)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export const SliderPresets = {
  spacing: {
    min: 0,
    max: 64,
    step: 1,
    unit: 'px',
    defaultValue: 16
  },
  borderRadius: {
    min: 0,
    max: 32,
    step: 1,
    unit: 'px',
    defaultValue: 8
  },
  fontSize: {
    min: 8,
    max: 72,
    step: 1,
    unit: 'px',
    defaultValue: 16
  },
  lineHeight: {
    min: 0.8,
    max: 3,
    step: 0.1,
    unit: '',
    defaultValue: 1.5
  },
  opacity: {
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    defaultValue: 1
  },
  shadowBlur: {
    min: 0,
    max: 50,
    step: 1,
    unit: 'px',
    defaultValue: 10
  },
  shadowSpread: {
    min: -20,
    max: 20,
    step: 1,
    unit: 'px',
    defaultValue: 0
  }
};