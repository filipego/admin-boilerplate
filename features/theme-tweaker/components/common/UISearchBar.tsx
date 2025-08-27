"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UISearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function UISearchBar({
  placeholder,
  value,
  onChange,
  className = ""
}: UISearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-10 tt-search"
      />
    </div>
  );
}
