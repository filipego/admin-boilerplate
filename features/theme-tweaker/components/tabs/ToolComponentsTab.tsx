'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { ComponentScanner, ScannedComponent } from '../../utils/componentScanner';
import { RepoScanner } from '../../utils/repoScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '../controls/ColorPicker';
import { SliderControl } from '../controls/SliderControl';
import { SelectControl } from '../controls/SelectControl';
import { 
  Search, 
  Component, 
  Layers, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Filter,
  Zap,
  MousePointer
} from 'lucide-react';
import { toast } from 'sonner';

interface ComponentGroup {
  type: string;
  components: ScannedComponent[];
  icon: React.ReactNode;
  color: string;
}

export function ToolComponentsTab() {
  const { 
    componentEdits, 
    updateComponentEdit, 
    highlightedComponent, 
    setHighlightedComponent 
  } = useThemeTweakerStore();
  
  const [components, setComponents] = useState<ScannedComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});

  const componentScanner = useMemo(() => ComponentScanner.getInstance(), []);
  const repoScanner = useMemo(() => new RepoScanner(), []);

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  // When highlightedComponent changes from outside (e.g., Alt+Click), scroll it into view
  useEffect(() => {
    if (!highlightedComponent) return;
    const el = document.querySelector(`[data-tt-component-id="${highlightedComponent}"]`);
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedComponent]);

  // Also switch the filter chip to the highlighted component's type
  useEffect(() => {
    if (!highlightedComponent) return;
    const comp = components.find(c => c.id === highlightedComponent);
    if (comp) {
      setSelectedType(comp.type);
    }
  }, [highlightedComponent, components]);

  // Apply page-level selection outline when highlightedComponent changes (Alt+Click or card click)
  useEffect(() => {
    // Clear any previous selection
    document.querySelectorAll('.tt-selected').forEach(el => el.classList.remove('tt-selected'));
    if (!highlightedComponent) return;
    const comp = components.find(c => c.id === highlightedComponent);
    if (comp) {
      document.querySelectorAll(comp.selector).forEach(el => el.classList.add('tt-selected'));
    }
  }, [highlightedComponent, components]);

  const loadComponents = async () => {
    setLoading(true);
    try {
      const scannedComponents = await componentScanner.scanComponents();
      setComponents(scannedComponents);
    } catch (error) {
      console.error('Error loading components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      const { components: newComponents } = await repoScanner.rescan();
      setComponents(newComponents);
      toast.success(`Rescanned and found ${newComponents.length} components`);
    } catch (error) {
      console.error('Error rescanning:', error);
      toast.error('Failed to rescan components');
    } finally {
      setIsScanning(false);
    }
  };

  // Filter components based on search and type
  const filteredComponents = useMemo(() => {
    let filtered = components;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(component => component.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component => 
        component.selector.toLowerCase().includes(query) ||
        component.type.toLowerCase().includes(query) ||
        component.classes.some(cls => cls.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [components, searchQuery, selectedType]);

  // Group components by type
  const componentGroups: ComponentGroup[] = useMemo(() => {
    const typeMap = new Map<string, ScannedComponent[]>();
    
    filteredComponents.forEach(component => {
      const existing = typeMap.get(component.type) || [];
      typeMap.set(component.type, [...existing, component]);
    });

    const groups: ComponentGroup[] = Array.from(typeMap.entries()).map(([type, comps]) => ({
      type,
      components: comps,
      icon: getTypeIcon(type),
      color: getTypeColor(type)
    }));

    return groups.sort((a, b) => b.components.length - a.components.length);
  }, [filteredComponents]);

  const MemoCard = React.memo(({ c }: { c: ScannedComponent }) => (
    <div key={c.id}>{renderComponentItem(c)}</div>
  ));

  function getTypeIcon(type: string) {
    switch (type.toLowerCase()) {
      case 'button': return <Zap className="w-4 h-4" />;
      case 'card': return <Layers className="w-4 h-4" />;
      case 'input': return <MousePointer className="w-4 h-4" />;
      default: return <Component className="w-4 h-4" />;
    }
  }

  function getTypeColor(type: string) {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }

  const handleComponentEdit = (componentId: string, property: string, value: string) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    updateComponentEdit(componentId, {
      [property]: {
        value,
        originalValue: component.styles[property] || '',
        property
      }
    });
  };

  const handleComponentHover = (componentId: string | null) => {
    setHoveredComponent(componentId);
    if (componentId) {
      const component = components.find(c => c.id === componentId);
      if (component) {
        // Highlight the component in the DOM
        const elements = document.querySelectorAll(component.selector);
        elements.forEach(el => {
          el.classList.add('tt-highlight');
        });
      }
    } else {
      // Remove all highlights
      document.querySelectorAll('.tt-highlight').forEach(el => el.classList.remove('tt-highlight'));
    }
  };

  const handleComponentClick = (componentId: string) => {
    const next = componentId === highlightedComponent ? null : componentId;
    // Clear previous selection outlines
    document.querySelectorAll('.tt-selected').forEach(el => el.classList.remove('tt-selected'));
    if (next) {
      const component = components.find(c => c.id === next);
      if (component) {
        document.querySelectorAll(component.selector).forEach(el => el.classList.add('tt-selected'));
      }
    }
    setHighlightedComponent(next);
  };

  const renderStyleControl = (component: ScannedComponent, property: string, value: string) => {
    const currentEdit = componentEdits[component.id]?.[property];
    const currentValue = currentEdit?.value || value;
    const hasChanged = currentEdit && currentEdit.value !== currentEdit.originalValue;

    // Determine control type based on property and value
    if (property.includes('color') || property.includes('Color') || 
        (typeof value === 'string' && value.match(/^#[0-9a-fA-F]{6}$|^rgb|^hsl/))) {
      return (
        <ColorPicker
          value={currentValue}
          originalValue={value}
          onChange={(newValue) => handleComponentEdit(component.id, property, newValue)}
          hasChanged={hasChanged}
        />
      );
    }

    if (property.includes('width') || property.includes('height') || 
        property.includes('margin') || property.includes('padding') ||
        property.includes('border') || property.includes('radius')) {
      const match = currentValue.toString().match(/^([\d.]+)(.*)$/);
      const numericValue = match ? parseFloat(match[1]) : 0;
      const unit = match ? match[2] : 'px';
      
      return (
        <SliderControl
          value={numericValue}
          originalValue={parseFloat(value.toString())}
          onChange={(newValue) => handleComponentEdit(component.id, property, `${newValue}${unit}`)}
          min={0}
          max={property.includes('radius') ? 50 : 100}
          step={0.5}
          unit={unit}
          hasChanged={hasChanged}
        />
      );
    }

    // For other properties, use select or text input
    return (
      <SelectControl
        value={currentValue.toString()}
        originalValue={value.toString()}
        onChange={(newValue) => handleComponentEdit(component.id, property, newValue)}
        options={getPropertyOptions(property)}
        hasChanged={hasChanged}
      />
    );
  };

  const getPropertyOptions = (property: string): string[] => {
    switch (property) {
      case 'display':
        return ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'];
      case 'position':
        return ['static', 'relative', 'absolute', 'fixed', 'sticky'];
      case 'textAlign':
        return ['left', 'center', 'right', 'justify'];
      case 'fontWeight':
        return ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      case 'fontSize':
        return ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
      default:
        return [];
    }
  };

  const renderComponentItem = (component: ScannedComponent) => {
    const currentEdits = componentEdits[component.id] || {};
    const hasChanges = Object.keys(currentEdits).length > 0;
    const isHighlighted = highlightedComponent === component.id;
    const isHovered = hoveredComponent === component.id;
    const isExpanded = !!expandedComponents[component.id];

    return (
      <Card 
        className={`transition-all cursor-pointer ${
          hasChanges ? 'ring-2 ring-blue-500' : ''
        } ${
          isHighlighted ? 'ring-2 ring-green-500' : ''
        } ${
          isHovered ? 'shadow-sm' : ''
        }`}
        data-tt-component-id={component.id}
        onMouseEnter={() => handleComponentHover(component.id)}
        onMouseLeave={() => handleComponentHover(null)}
        onClick={() => handleComponentClick(component.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {component.selector}
              </code>
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
              {isHighlighted && (
                <Badge variant="default" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Highlighted
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {component.type}
            </Badge>
          </div>
          
          {component.classes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {component.classes.slice(0, 5).map(cls => (
                <Badge key={cls} variant="outline" className="text-xs">
                  {cls}
                </Badge>
              ))}
              {component.classes.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{component.classes.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {Object.keys(component.styles).length} style properties
            </div>
            
            {/* Show key style properties */}
            {(isExpanded ? Object.entries(component.styles) : Object.entries(component.styles).slice(0, 3)).map(([property, value]) => (
              <div key={property} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">{property}</label>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {value}
                  </code>
                </div>
                {renderStyleControl(component, property, value)}
              </div>
            ))}
            
            {Object.keys(component.styles).length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedComponents(prev => ({
                    ...prev,
                    [component.id]: !prev[component.id]
                  }));
                }}
              >
                {isExpanded ? 'Show less' : `Show ${Object.keys(component.styles).length - 3} more properties`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Scanning for components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Components</h3>
          <p className="text-sm text-muted-foreground">
            {components.length} component{components.length !== 1 ? 's' : ''} discovered
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRescan}
          disabled={isScanning}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
          Rescan
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
            className="h-10"
          >
            All
          </Button>
          {Array.from(new Set(components.map(c => c.type))).map(type => {
            const count = components.filter(c => c.type === type).length;
            return (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="h-10"
              >
                {type} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Components */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-8">
          <Component className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No components found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedType !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'No components with data-ui attributes detected.'}
          </p>
        </div>
      ) : (
        <div className="w-full mt-4">
          <div className="space-y-6">
            {componentGroups.map(group => (
              <div key={group.type}>
                <div className="flex items-center gap-2 mb-3">
                  {group.icon}
                  <h4 className="font-medium capitalize">{group.type}</h4>
                  <Badge className={group.color}>
                    {group.components.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {group.components.map(component => (
                    <MemoCard key={component.id} c={component} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}