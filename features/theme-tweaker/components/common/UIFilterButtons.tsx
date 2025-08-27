"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface UIFilterButtonsProps {
  options: FilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function UIFilterButtons({
  options,
  selectedKey,
  onSelect,
  className = ""
}: UIFilterButtonsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {options.map(option => (
        <Button
          key={option.key}
          variant={selectedKey === option.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(option.key)}
          className="h-10"
        >
          {option.label}
          {option.count !== undefined && ` (${option.count})`}
        </Button>
      ))}
    </div>
  );
}
