'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// removed internal tabs; always show grouped view
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SliderControl } from '../controls/SliderControl';
import { SelectControl } from '../controls/SelectControl';
import { UISearchBar } from '../common/UISearchBar';
import { UIFilterButtons } from '../common/UIFilterButtons';
import {
  Layout,
  Grid,
  Columns,
  Rows,
  Move,
  Maximize,
  Minimize,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutProperty {
  id: string;
  name: string;
  category: 'spacing' | 'sizing' | 'positioning' | 'display' | 'responsive';
  property: string;
  value: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

interface ResponsiveBreakpoint {
  name: string;
  width: string;
  icon: React.ReactNode;
  active: boolean;
}

export function ToolLayoutTab() {
  const { 
    layoutEdits, 
    updateLayoutEdit, 
    activeBreakpoint, 
    setActiveBreakpoint 
  } = useThemeTweakerStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Define responsive breakpoints
  const breakpoints: ResponsiveBreakpoint[] = [
    {
      name: 'mobile',
      width: '375px',
      icon: <Smartphone className="w-4 h-4" />,
      active: previewMode === 'mobile'
    },
    {
      name: 'tablet',
      width: '768px',
      icon: <Tablet className="w-4 h-4" />,
      active: previewMode === 'tablet'
    },
    {
      name: 'desktop',
      width: '1024px',
      icon: <Monitor className="w-4 h-4" />,
      active: previewMode === 'desktop'
    }
  ];

  // Define layout properties
  const layoutProperties: LayoutProperty[] = [
    // Spacing
    {
      id: 'container-padding',
      name: 'Container Padding',
      category: 'spacing',
      property: '--container-padding',
      value: '1rem',
      unit: 'rem',
      min: 0,
      max: 5,
      step: 0.25,
      description: 'Padding inside containers'
    },
    {
      id: 'section-spacing',
      name: 'Section Spacing',
      category: 'spacing',
      property: '--section-spacing',
      value: '4rem',
      unit: 'rem',
      min: 0,
      max: 10,
      step: 0.5,
      description: 'Vertical spacing between sections'
    },
    {
      id: 'grid-gap',
      name: 'Grid Gap',
      category: 'spacing',
      property: '--grid-gap',
      value: '1.5rem',
      unit: 'rem',
      min: 0,
      max: 4,
      step: 0.25,
      description: 'Gap between grid items'
    },
    
    // Sizing
    {
      id: 'container-max-width',
      name: 'Container Max Width',
      category: 'sizing',
      property: '--container-max-width',
      value: '1200px',
      unit: 'px',
      min: 800,
      max: 1600,
      step: 50,
      description: 'Maximum width of main containers'
    },
    {
      id: 'sidebar-width',
      name: 'Sidebar Width',
      category: 'sizing',
      property: '--sidebar-width',
      value: '280px',
      unit: 'px',
      min: 200,
      max: 400,
      step: 10,
      description: 'Width of sidebar navigation'
    },
    {
      id: 'header-height',
      name: 'Header Height',
      category: 'sizing',
      property: '--header-height',
      value: '64px',
      unit: 'px',
      min: 48,
      max: 100,
      step: 4,
      description: 'Height of main header'
    },
    
    // Display
    {
      id: 'grid-columns',
      name: 'Grid Columns',
      category: 'display',
      property: '--grid-columns',
      value: '12',
      options: ['1', '2', '3', '4', '6', '8', '12', '16'],
      description: 'Number of grid columns'
    },
    {
      id: 'flex-direction',
      name: 'Flex Direction',
      category: 'display',
      property: '--flex-direction',
      value: 'row',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      description: 'Default flex direction'
    },
    {
      id: 'justify-content',
      name: 'Justify Content',
      category: 'display',
      property: '--justify-content',
      value: 'flex-start',
      options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
      description: 'Default justify content'
    },
    
    // Positioning
    {
      id: 'z-index-header',
      name: 'Header Z-Index',
      category: 'positioning',
      property: '--z-index-header',
      value: '100',
      min: 1,
      max: 1000,
      step: 10,
      description: 'Z-index for header elements'
    },
    {
      id: 'z-index-sidebar',
      name: 'Sidebar Z-Index',
      category: 'positioning',
      property: '--z-index-sidebar',
      value: '90',
      min: 1,
      max: 1000,
      step: 10,
      description: 'Z-index for sidebar elements'
    },
    {
      id: 'z-index-modal',
      name: 'Modal Z-Index',
      category: 'positioning',
      property: '--z-index-modal',
      value: '1000',
      min: 100,
      max: 10000,
      step: 100,
      description: 'Z-index for modal overlays'
    }
  ];

  // Prepare filter options for common component
  const filterOptions = useMemo(() => {
    const options = [
      { key: 'all', label: 'All', count: layoutProperties.length }
    ];

    (['spacing', 'sizing', 'positioning', 'display'] as const).forEach(category => {
      const count = layoutProperties.filter(p => p.category === category).length;
      if (count > 0) {
        options.push({
          key: category,
          label: category,
          count
        });
      }
    });

    return options;
  }, [layoutProperties]);

  // Filter properties based on search and category
  const filteredProperties = useMemo(() => {
    let filtered = layoutProperties;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prop => prop.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prop =>
        prop.name.toLowerCase().includes(query) ||
        prop.property.toLowerCase().includes(query) ||
        prop.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Group properties by category
  const propertyGroups = useMemo(() => {
    const groups = new Map<string, LayoutProperty[]>();
    
    filteredProperties.forEach(prop => {
      const existing = groups.get(prop.category) || [];
      groups.set(prop.category, [...existing, prop]);
    });

    return Array.from(groups.entries()).map(([category, properties]) => ({
      category,
      properties,
      icon: getCategoryIcon(category),
      color: getCategoryColor(category)
    }));
  }, [filteredProperties]);

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'spacing': return <Move className="w-4 h-4" />;
      case 'sizing': return <Maximize className="w-4 h-4" />;
      case 'positioning': return <Layout className="w-4 h-4" />;
      case 'display': return <Grid className="w-4 h-4" />;
      case 'responsive': return <Smartphone className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case 'spacing': return 'bg-blue-100 text-blue-800';
      case 'sizing': return 'bg-green-100 text-green-800';
      case 'positioning': return 'bg-purple-100 text-purple-800';
      case 'display': return 'bg-orange-100 text-orange-800';
      case 'responsive': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const handlePropertyChange = (propertyId: string, value: string) => {
    const property = layoutProperties.find(p => p.id === propertyId);
    if (!property) return;

    const breakpointKey = `${previewMode}-${propertyId}`;
    updateLayoutEdit(breakpointKey, {
      property: property.property,
      value,
      originalValue: property.value,
      breakpoint: previewMode,
      category: property.category
    });
  };

  const handleBreakpointChange = (breakpoint: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(breakpoint);
    setActiveBreakpoint(breakpoint);
    
    // Apply viewport simulation
    const viewport = breakpoints.find(bp => bp.name === breakpoint);
    if (viewport) {
      // This would typically update a preview iframe or container
      toast.info(`Switched to ${breakpoint} preview (${viewport.width})`);
    }
  };

  const resetProperty = (propertyId: string) => {
    const breakpointKey = `${previewMode}-${propertyId}`;
    const property = layoutProperties.find(p => p.id === propertyId);
    if (property) {
      updateLayoutEdit(breakpointKey, {
        property: property.property,
        value: property.value,
        originalValue: property.value,
        breakpoint: previewMode,
        category: property.category
      });
      toast.success(`Reset ${property.name}`);
    }
  };

  const resetAllProperties = () => {
    layoutProperties.forEach(property => {
      const breakpointKey = `${previewMode}-${property.id}`;
      updateLayoutEdit(breakpointKey, {
        property: property.property,
        value: property.value,
        originalValue: property.value,
        breakpoint: previewMode,
        category: property.category
      });
    });
    toast.success(`Reset all ${previewMode} layout properties`);
  };

  const renderPropertyControl = (property: LayoutProperty) => {
    const breakpointKey = `${previewMode}-${property.id}`;
    const currentEdit = layoutEdits ? layoutEdits[breakpointKey] : undefined;
    const currentValue = currentEdit?.value || property.value;
    const hasChanged = currentEdit && currentEdit.value !== currentEdit.originalValue;

    if (property.options) {
      return (
        <SelectControl
          label={property.name}
          value={currentValue}
          onChange={(value) => handlePropertyChange(property.id, value)}
          options={property.options}
          defaultValue={property.value}
          description={property.description}
        />
      );
    }

    if (property.min !== undefined && property.max !== undefined) {
      const numericValue = parseFloat(currentValue.replace(/[^\d.-]/g, ''));
      return (
        <SliderControl
          value={numericValue}
          originalValue={parseFloat(property.value.replace(/[^\d.-]/g, ''))}
          onChange={(value) => {
            const newValue = property.unit ? `${value}${property.unit}` : value.toString();
            handlePropertyChange(property.id, newValue);
          }}
          min={property.min}
          max={property.max}
          step={property.step || 1}
          unit={property.unit}
          hasChanged={hasChanged}
        />
      );
    }

    return (
      <Input
        value={currentValue}
        onChange={(e) => handlePropertyChange(property.id, e.target.value)}
        className={hasChanged ? 'ring-2 ring-blue-500' : ''}
      />
    );
  };

  const renderPropertyItem = (property: LayoutProperty) => {
    const breakpointKey = `${previewMode}-${property.id}`;
    const currentEdit = layoutEdits[breakpointKey];
    const hasChanged = currentEdit && currentEdit.value !== currentEdit.originalValue;

    return (
      <Card key={property.id} className={`transition-all ${hasChanged ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{property.name}</h4>
              {hasChanged && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetProperty(property.id)}
              disabled={!hasChanged}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
          
          {property.description && (
            <p className="text-xs text-muted-foreground">{property.description}</p>
          )}
          
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
            {property.property}
          </code>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Current: <code className="bg-muted px-1 py-0.5 rounded">
                {currentEdit?.value || property.value}
              </code>
            </div>
            {renderPropertyControl(property)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Layout Controls</h3>
          <p className="text-sm text-muted-foreground">
            Adjust spacing, sizing, and positioning properties
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetAllProperties}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset All
        </Button>
      </div>

      {/* Responsive Breakpoint Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Responsive Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {breakpoints.map(breakpoint => (
              <Button
                key={breakpoint.name}
                variant={previewMode === breakpoint.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleBreakpointChange(breakpoint.name as any)}
                className="flex items-center gap-2 shrink-0"
              >
                {breakpoint.icon}
                <span className="capitalize">{breakpoint.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {breakpoint.width}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <UISearchBar
          placeholder="Search properties..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <UIFilterButtons
          options={filterOptions}
          selectedKey={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Properties */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-8">
          <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="w-full mt-4">
          <div className="space-y-6">
            {propertyGroups.map(({ category, properties, icon, color }) => (
              <div key={`group-${category}`}>
                <div className="flex items-center gap-2 mb-3">
                  {icon}
                  <h4 className="font-medium capitalize">{category}</h4>
                  <Badge className={color}>
                    {properties.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {properties.map(property => renderPropertyItem(property))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}