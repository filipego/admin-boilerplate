'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { ComponentScanner, ScannedComponent } from '../../utils/componentScanner';
import { RepoScanner } from '../../utils/repoScanner';
import { formatCSSValue } from '../../utils/colorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UniversalColorInput } from '../common/UniversalColorInput';
import { SliderControl } from '../controls/SliderControl';
import { SelectControl } from '../controls/SelectControl';
import { UISearchBar } from '../common/UISearchBar';
import { UIFilterButtons } from '../common/UIFilterButtons';
import {
  Component,
  Layers,
  RefreshCw,
  Filter,
  Zap,
  MousePointer,
  Palette
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

  // Token usage state for component overrides
  const [componentTokenOverrides, setComponentTokenOverrides] = useState<Record<string, Record<string, { light?: string; dark?: string }>>>({});
  


  const componentScanner = useMemo(() => ComponentScanner.getInstance(), []);
  const repoScanner = useMemo(() => new RepoScanner(), []);

  // Function to detect which CSS custom properties (tokens) a component uses
  // TODO: Tomorrow - Fix token detection to properly analyze actual CSS usage instead of guessing
  const detectComponentTokens = (component: ScannedComponent): string[] => {
    const tokens = new Set<string>();

    // Most components use these core design system tokens
    const commonTokens = ['--background', '--foreground', '--border', '--muted', '--muted-foreground'];

    // Check if component uses color-related classes
    const hasColorClasses = component.classes.some(cls =>
      cls.startsWith('bg-') || cls.startsWith('text-') || cls.startsWith('border-')
    );

    // If component uses any color classes, assume it uses core tokens
    if (hasColorClasses) {
      tokens.add('--background');
      tokens.add('--foreground');
      tokens.add('--border');
    } else {
      // Even components without explicit color classes typically inherit from design system
      tokens.add('--background');
      tokens.add('--foreground');
    }

    return Array.from(tokens);
  };

  // Cache token values to avoid repeated document reflows when rendering many cards
  const tokenValuesCache = React.useRef<Map<string, { light: string; dark: string }>>(new Map());

  // Function to get resolved light/dark values for tokens (memoized)
  const getTokenValues = (tokenName: string): { light: string; dark: string } => {
    const cached = tokenValuesCache.current.get(tokenName);
    if (cached) return cached;
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');

    let lightValue = '';
    let darkValue = '';

    try {
      // Light mode
      html.classList.remove('dark');
      void html.offsetHeight;
      lightValue = getComputedStyle(html).getPropertyValue(tokenName).trim();

      // Dark mode
      html.classList.add('dark');
      void html.offsetHeight;
      darkValue = getComputedStyle(html).getPropertyValue(tokenName).trim();

      // Restore original state
      if (!wasDark) html.classList.remove('dark');
    } catch (error) {
      console.error('Error getting token values:', error);
    }

    const result = {
      light: lightValue || '—',
      dark: darkValue || '—'
    } as const;
    tokenValuesCache.current.set(tokenName, result as { light: string; dark: string });
    return result as { light: string; dark: string };
  };

  // Function to check if component has custom classes (non-utility)
  const hasCustomClasses = (component: ScannedComponent): boolean => {
    // For now, let's be more permissive - if component has any classes at all,
    // assume it could have custom classes. In a real implementation, you'd
    // check the actual element's classes against a comprehensive list of utilities
    return component.classes.length > 0;
  };

  // Function to handle component token overrides
  const handleComponentTokenOverride = (componentId: string, tokenName: string, value: string, theme: 'light' | 'dark') => {
    setComponentTokenOverrides(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [tokenName]: {
          ...prev[componentId]?.[tokenName],
          [theme]: value
        }
      }
    }));

    // Apply the override using the existing runtime style system
    const selector = theme === 'dark' ? `.dark [data-component-id="${componentId}"]` : `[data-component-id="${componentId}"]`;
    addRuntimeStyle({
      id: `${componentId}-${tokenName}-${theme}`,
      selector,
      property: tokenName,
      value,
      element: document.querySelector(`[data-component-id="${componentId}"]`) || document.body,
      type: 'token'
    });
  };



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

  // When selecting a type via the filter chips, auto-select and highlight
  // the first component of that type so both the tool and the page highlight.
  useEffect(() => {
    if (selectedType === 'all') return;
    const firstOfType = components.find(c => c.type === selectedType);
    if (firstOfType && firstOfType.id !== highlightedComponent) {
      setHighlightedComponent(firstOfType.id);
    }
  }, [selectedType, components]);

  // If "All" is selected, clear any highlight/selection both in the tool and on the page
  useEffect(() => {
    if (selectedType !== 'all') return;
    // Clear page highlights
    document.querySelectorAll('.tt-selected').forEach(el => el.classList.remove('tt-selected'));
    document.querySelectorAll('.tt-highlight').forEach(el => el.classList.remove('tt-highlight'));
    // Clear store highlight
    setHighlightedComponent(null);
  }, [selectedType]);



  // Apply page-level selection outline when highlightedComponent changes (Alt+Click or card click)
  useEffect(() => {
    // Clear any previous selection
    document.querySelectorAll('.tt-selected').forEach(el => el.classList.remove('tt-selected'));
    if (!highlightedComponent) return;
    const comp = components.find(c => c.id === highlightedComponent);
    if (comp) {
      document.querySelectorAll(comp.selector).forEach(el => {
        if (!(el as HTMLElement).closest('[data-theme-tweaker-ui]')) {
          el.classList.add('tt-selected');
        }
      });
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
      // Convert ComponentInfo[] to ScannedComponent[]
      const scannedComponents: ScannedComponent[] = newComponents.map(comp => ({
        id: comp.dataUi || comp.selector,
        selector: comp.selector,
        type: comp.dataUi.split(':')[0] || 'component',
        classes: comp.element instanceof Element ? Array.from(comp.element.classList) : [],
        styles: comp.styles.reduce((acc, style) => {
          acc[style.property] = (style as any).computed ?? style.value;
          return acc;
        }, {} as Record<string, string>)
      }));


      setComponents(scannedComponents);
      toast.success(`Rescanned and found ${scannedComponents.length} components`);
    } catch (error) {
      console.error('Error rescanning:', error);
      toast.error('Failed to rescan components');
    } finally {
      setIsScanning(false);
    }
  };

  // Prepare filter options for common component
  const filterOptions = useMemo(() => {
    const typeCounts = new Map<string, number>();
    components.forEach(component => {
      typeCounts.set(component.type, (typeCounts.get(component.type) || 0) + 1);
    });

    const options = [
      { key: 'all', label: 'All', count: components.length }
    ];

    Array.from(typeCounts.entries()).forEach(([type, count]) => {
      options.push({
        key: type,
        label: type,
        count
      });
    });

    return options;
  }, [components]);

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

    updateComponentEdit(`${componentId}-${property}`, value);
  };

  const handleComponentHover = (componentId: string | null) => {
    setHoveredComponent(componentId);
    if (componentId) {
      const component = components.find(c => c.id === componentId);
      if (component) {
        // Highlight the component in the DOM (exclude Theme Tweaker UI)
        const elements = document.querySelectorAll(component.selector);
        elements.forEach(el => {
          if (!(el as HTMLElement).closest('[data-theme-tweaker-ui]')) {
            el.classList.add('tt-highlight');
          }
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
        document.querySelectorAll(component.selector).forEach(el => {
          if (!(el as HTMLElement).closest('[data-theme-tweaker-ui]')) {
            el.classList.add('tt-selected');
          }
        });
      }
    }
    setHighlightedComponent(next);
  };

  const renderStyleControl = (component: ScannedComponent, property: string, value: string) => {
    const editId = `${component.id}-${property}`;
    const currentEdit = componentEdits[editId];
    const currentValue = currentEdit?.value || value;
    const hasChanged = currentEdit && currentEdit.value !== currentEdit.originalValue;

    // Determine control type based on property and value
    if (property.includes('color') || property.includes('Color') ||
        (typeof value === 'string' && value.match(/^#[0-9a-fA-F]{6}$|^rgb|^hsl|^oklch|^lab/))) {
      // Format color value for display in UniversalColorInput
      const displayValue = formatCSSValue(property, currentValue);
      return (
        <UniversalColorInput
          value={displayValue}
          onChange={(newValue) => handleComponentEdit(component.id, property, newValue)}
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
          label={property}
          value={currentValue}
          originalValue={value}
          onChange={(newValue) => handleComponentEdit(component.id, property, newValue)}
          min={0}
          max={property.includes('radius') ? 50 : 100}
          step={0.5}
          unit={unit}
        />
      );
    }

    // For other properties, use select or text input
    return (
      <SelectControl
        label={property}
        value={currentValue}
        originalValue={value}
        onChange={(newValue) => handleComponentEdit(component.id, property, newValue)}
        options={getPropertyOptions(property)}
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

    // Find all edits for this component
    const componentEditKeys = Object.keys(componentEdits).filter(key => key.startsWith(`${component.id}-`));
    const hasChanges = componentEditKeys.length > 0;
    const isHighlighted = highlightedComponent === component.id;
    const isHovered = hoveredComponent === component.id;
    const isExpanded = !!expandedComponents[component.id];

    return (
      <Card 
        className={`transition-all cursor-pointer ${
          hasChanges ? 'ring-2 ring-blue-500' : ''
        } ${
          isHighlighted ? 'ring-2 ring-yellow-500' : ''
        } ${
          isHovered ? 'shadow-sm' : ''
        }`}
        data-tt-component-id={component.id}
        data-component-id={component.id}
        onMouseEnter={() => handleComponentHover(component.id)}
        onMouseLeave={() => handleComponentHover(null)}
        onClick={() => handleComponentClick(component.id)}
      >
        {/* Header removed — group already shows the component type */}
        
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
                    {formatCSSValue(property, value)}
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

            {/* Token Usage & Overrides Section */}
            {/* Performance: only render this heavy section when the card is highlighted or expanded */}
            {(isHighlighted || isExpanded) && (() => {
              const componentTokens = detectComponentTokens(component);
              const canOverride = hasCustomClasses(component);

              // Always show at least some common tokens for demonstration
              const tokensToShow = componentTokens.length > 0 ? componentTokens : ['--background', '--foreground'];



              return (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette size={14} className="text-blue-500" />
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Token Usage {canOverride && <span className="text-xs text-green-600">(Overrideable)</span>}
                    </h5>
                  </div>

                  <div className="space-y-3">
                    {tokensToShow.map(tokenName => {
                      const values = getTokenValues(tokenName);
                      const overrides = componentTokenOverrides[component.id]?.[tokenName] || {};

                      return (
                        <div key={tokenName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              {tokenName}
                            </code>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">Light</div>
                              <code className="block bg-muted px-2 py-1 rounded font-mono text-xs">
                                {values.light}
                              </code>
                              {canOverride && (
                                <div className="mt-1">
                                  <UniversalColorInput
                                    value={overrides.light || ''}
                                    onChange={(value) => handleComponentTokenOverride(component.id, tokenName, value, 'light')}
                                    className="scale-90"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">Dark</div>
                              <code className="block bg-muted px-2 py-1 rounded font-mono text-xs">
                                {values.dark}
                              </code>
                              {canOverride && (
                                <div className="mt-1">
                                  <UniversalColorInput
                                    value={overrides.dark || ''}
                                    onChange={(value) => handleComponentTokenOverride(component.id, tokenName, value, 'dark')}
                                    className="scale-90"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {!canOverride && (
                      <div className="text-xs text-muted-foreground p-2 border rounded-lg">
                        Add a custom class (e.g. <code className="font-mono">.my-component</code>) to enable overrides
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
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
        <UISearchBar
          placeholder="Search components..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <UIFilterButtons
          options={filterOptions}
          selectedKey={selectedType}
          onSelect={setSelectedType}
        />
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
