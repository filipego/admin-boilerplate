"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: 'text' | 'url' | 'email';
  validation?: {
    pattern?: RegExp;
    message?: string;
  };
}

export const TextControl: React.FC<TextControlProps> = ({
  label,
  value,
  onChange,
  onReset,
  placeholder,
  className,
  disabled = false,
  type = 'text',
  validation
}) => {
  const [isValid, setIsValid] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Validate input if validation rules are provided
    if (validation?.pattern) {
      const valid = validation.pattern.test(newValue) || newValue === '';
      setIsValid(valid);
      setErrorMessage(valid ? '' : validation.message || 'Invalid input');
    }
    
    onChange(newValue);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setIsValid(true);
      setErrorMessage('');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={`text-${label}`} className="text-sm font-medium">
          {label}
        </Label>
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 w-6 p-0"
            title="Reset to default"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="space-y-1">
        <Input
          id={`text-${label}`}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-8 text-sm',
            !isValid && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        
        {!isValid && errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

// Preset configurations for common text inputs
export const TextPresets = {
  fontFamily: {
    validation: {
      pattern: /^[a-zA-Z0-9\s,\-'"]+$/,
      message: 'Invalid font family name'
    },
    placeholder: 'Inter, sans-serif'
  },
  url: {
    type: 'url' as const,
    validation: {
      pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message: 'Invalid URL format'
    },
    placeholder: 'https://example.com'
  },
  className: {
    validation: {
      pattern: /^[a-zA-Z0-9\s\-_:]+$/,
      message: 'Invalid CSS class name'
    },
    placeholder: 'my-custom-class'
  },
  cssValue: {
    validation: {
      pattern: /^[a-zA-Z0-9\s\-_%#.,()]+$/,
      message: 'Invalid CSS value'
    },
    placeholder: '1rem'
  }
};