'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { ComponentScanner, ScannedComponent } from '../../utils/componentScanner';
import { RepoScanner } from '../../utils/repoScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SliderControl } from '../controls/SliderControl';
import { SelectControl } from '../controls/SelectControl';
import { formatCSSValue } from '../../utils/colorUtils';
import FourSideEditor from '../controls/FourSideEditor'
import CornerRadiusEditor from '../controls/CornerRadiusEditor'
import BoxShadowEditor, { ShadowLayer } from '../controls/BoxShadowEditor'
import TokenColorInput from '../controls/TokenColorInput'
import { UniversalColorInput } from '../common/UniversalColorInput';
import { UISearchBar } from '../common/UISearchBar';
import { UIFilterButtons } from '../common/UIFilterButtons';
import { Component, Layers, RefreshCw, Zap, MousePointer, Palette } from 'lucide-react';
import { toHEX } from '../../utils/colorUtils';
import { toast } from 'sonner';

interface ComponentGroup {
  type: string;
  components: ScannedComponent[];
  icon: React.ReactNode;
  color: string;
}

export function ToolComponentsTab() {
  const {
    highlightedComponent,
    setHighlightedComponent,
    addRuntimeStyle,
    runtimeStyles
  } = useThemeTweakerStore();


  
  const [components, setComponents] = useState<ScannedComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
  // User-provided scope selectors (prepended to component selector)
  const [scopeSelector, setScopeSelector] = useState<Record<string, string>>({});
  // Optional size scope per component (e.g., button)
  const [sizeScope, setSizeScope] = useState<Record<string, 'all' | 'sm' | 'default' | 'lg'>>({});
  const [variantScope, setVariantScope] = useState<Record<string, 'all' | 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'>>({});

  // Resolve the selector for a given component id, fallback to data-ui
  function getComponentSelectorById(id: string): string {
    const comp = components.find(c => c.id === id);
    return comp?.selector || `[data-ui="${id}"]`;
  }

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

  // No need to check for custom classes; overrides are always allowed with optional scope

  // Function to handle component token overrides (scoped, class-based)
  const handleComponentTokenOverride = (componentId: string, tokenName: string, value: string, theme: 'light' | 'dark') => {
    const hex = toHEX(value) || value;
    setComponentTokenOverrides(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [tokenName]: {
          ...prev[componentId]?.[tokenName],
          [theme]: hex
        }
      }
    }));

    // Apply as a class-scoped token so it only affects this component (optionally within user scope)
    const userScope = (scopeSelector[componentId] || '').trim();
    const size = (sizeScope[componentId] || 'all');
    const vr = (variantScope[componentId] || 'all');
    const sizeSuffix = size !== 'all' ? `[data-size="${size}"]` : '';
    const varSuffix = vr !== 'all' ? `[data-variant="${vr}"]` : '';
    const baseSelector = `${userScope ? userScope + ' ' : ''}${getComponentSelectorById(componentId)}${sizeSuffix}${varSuffix}`;
    const selector = theme === 'dark' ? `.dark ${baseSelector}` : baseSelector;
    addRuntimeStyle({
      id: `${componentId}-${tokenName}-${theme}`,
      selector,
      property: tokenName,
      value: hex,
      element: document.documentElement,
      type: 'class'
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

  // Utility: read computed style of first element matching component
  const getComputedFor = (selector: string): CSSStyleDeclaration | null => {
    const all = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const el = all.find(e => !(e.closest('[data-theme-tweaker-ui]')));
    if (!el) return null;
    return getComputedStyle(el);
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

  // Raw CSS property edits are not exposed in this simplified UI

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

  // No renderStyleControl; we show token-only controls
  const handleComponentStyleEdit = (componentId: string, property: string, value: string) => {
    const scope = (scopeSelector[componentId] || '').trim();
    const size = (sizeScope[componentId] || 'all');
    const base = `${scope ? scope + ' ' : ''}${getComponentSelectorById(componentId)}${size !== 'all' ? `[data-size="${size}"]` : ''}`;
    addRuntimeStyle({
      id: `${componentId}-${property}`,
      selector: base,
      property,
      value,
      element: document.documentElement,
      type: 'class'
    });
  };

  const renderStyleControl = (component: ScannedComponent, property: string, value: string) => {
    const scope = (scopeSelector[component.id] || '').trim();
    const disabled = scope.length === 0;
    // Current value: prefer runtime override if present
    const sizeSel = (sizeScope[component.id] || 'all');
    const base = `${scope ? scope + ' ' : ''}${getComponentSelectorById(component.id)}${sizeSel !== 'all' ? `[data-size="${sizeSel}"]` : ''}`;
    const override = runtimeStyles.find(s => s.selector === base && s.property === property);
    const currentValue = override?.value || value;

    if (property.includes('color') || property.includes('Color')) {
      // For now, color properties can be edited as text; tokens should be preferred above
      return (
        <Input
          value={formatCSSValue(property, currentValue)}
          disabled={disabled}
          onChange={(e) => handleComponentStyleEdit(component.id, property, e.target.value)}
          className="h-9 font-mono text-xs"
        />
      );
    }

    if (property.includes('width') || property.includes('height') || 
        property.includes('margin') || property.includes('padding') ||
        property.includes('border') || property.includes('radius')) {
      const match = currentValue.toString().match(/^([\d.]+)(.*)$/);
      const unit = match ? match[2] : 'px';
      return (
        <SliderControl
          label={property}
          value={currentValue}
          originalValue={value}
          onChange={(v) => handleComponentStyleEdit(component.id, property, v)}
          min={0}
          max={property.includes('radius') ? 50 : 100}
          step={0.5}
          unit={unit}
          disabled={disabled}
        />
      );
    }

    return (
      <SelectControl
        label={property}
        value={currentValue}
        originalValue={value}
        onChange={(v) => handleComponentStyleEdit(component.id, property, v)}
        options={getPropertyOptions(property)}
        disabled={disabled}
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

  // No property option mapping required in token-only UI



  const renderComponentItem = (component: ScannedComponent) => {

    // Detect if any runtime style currently targets this component
    const hasChanges = (runtimeStyles || []).some(s => s.selector.includes(component.selector));
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
          <div className="space-y-4">
            {/* Scope selector (prepended to component selector) */}
            <div onClick={(e) => e.stopPropagation()}>
              <label className="text-xs font-medium block mb-1">Scope selector (optional, prepended)</label>
              <Input
                placeholder="e.g. .my-landing or .dashboard"
                value={scopeSelector[component.id] || ''}
                onChange={(e) => setScopeSelector(prev => ({ ...prev, [component.id]: e.target.value }))}
                className="h-9"
              />
              <div className="text-[11px] text-muted-foreground mt-1">
                {(() => {
                  const scope = (scopeSelector[component.id] || '').trim();
                  const sz = (sizeScope[component.id] || 'all');
                  const vr = (variantScope[component.id] || 'all');
                  const suffix = (sz !== 'all' ? `[data-size="${sz}"]` : ``) + (vr !== 'all' ? `[data-variant="${vr}"]` : ``);
                  return (
                    <>
                      Applies to: <code className="font-mono bg-muted px-1 py-0.5 rounded">{`${scope ? (scope + ' ') : ''}${component.selector}${suffix}`}</code>
                    </>
                  );
                })()}
              </div>
              {component.id.toLowerCase().includes('button') && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium block mb-1">Button size</label>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm w-full"
                      value={sizeScope[component.id] || 'all'}
                      onChange={(e) => setSizeScope(prev => ({ ...prev, [component.id]: e.target.value as any }))}
                    >
                      <option value="all">all</option>
                      <option value="sm">sm</option>
                      <option value="default">default</option>
                      <option value="lg">lg</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Button variant</label>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm w-full"
                      value={variantScope[component.id] || 'all'}
                      onChange={(e) => setVariantScope(prev => ({ ...prev, [component.id]: e.target.value as any }))}
                    >
                      <option value="all">all</option>
                      <option value="default">default</option>
                      <option value="outline">outline</option>
                      <option value="secondary">secondary</option>
                      <option value="ghost">ghost</option>
                      <option value="destructive">destructive</option>
                      <option value="link">link</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Tokens (Light/Dark) same UI style as Tokens tab with Show more */}
            {(() => {
              const componentTokens = detectComponentTokens(component);
              const tokensToShow = componentTokens.length > 0 ? componentTokens : ['--background', '--foreground', '--border'];
              const showAll = !!expandedComponents[component.id + '-tokens'];
              const list = showAll ? tokensToShow : tokensToShow.slice(0, 2);
              return (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  {list.map((tokenName) => {
                    const values = getTokenValues(tokenName);
                    const overrides = componentTokenOverrides[component.id]?.[tokenName] || {};
                    const scope = (scopeSelector[component.id] || '').trim();
                    const disabled = scope.length === 0; // require scope to enable edits

                    const lightDisplay = overrides.light ?? (toHEX(values.light) || values.light || '');
                    const darkDisplay = overrides.dark ?? (toHEX(values.dark) || values.dark || '');

                    return (
                      <div key={tokenName} className="space-y-2 rounded-md border p-3 bg-background">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">{tokenName}</code>

                        <div className="space-y-2 mt-2">
                          <div className="text-xs text-muted-foreground">Light</div>
                          <UniversalColorInput
                            value={lightDisplay}
                            onChange={(value) => handleComponentTokenOverride(component.id, tokenName, value, 'light')}
                            disabled={disabled}
                          />
                        </div>

                        <div className="space-y-2 mt-2">
                          <div className="text-xs text-muted-foreground">Dark</div>
                          <UniversalColorInput
                            value={darkDisplay}
                            onChange={(value) => handleComponentTokenOverride(component.id, tokenName, value, 'dark')}
                            disabled={disabled}
                          />
                        </div>

                        {disabled && (
                          <div className="text-[11px] text-muted-foreground mt-1">Add a scope selector above to enable editing</div>
                        )}
                      </div>
                    );
                  })}
                  {tokensToShow.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={(e) => { e.stopPropagation(); setExpandedComponents(prev => ({ ...prev, [component.id + '-tokens']: !prev[component.id + '-tokens'] })); }}
                    >
                      {showAll ? 'Show less colors' : `Show ${tokensToShow.length - 2} more colors`}
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Spacing */}
            {(() => {
              const scope = (scopeSelector[component.id] || '').trim();
              const disabled = scope.length === 0;
              const sz = (sizeScope[component.id] || 'all');
              const vr = (variantScope[component.id] || 'all');
              const suffix = `${sz !== 'all' ? `[data-size=\"${sz}\"]` : ''}${vr !== 'all' ? `[data-variant=\"${vr}\"]` : ''}`;
              const fullSel = `${component.selector}${suffix}`;
              const cs = getComputedFor(fullSel);
              const pad = {
                top: cs?.paddingTop || '0px',
                right: cs?.paddingRight || '0px',
                bottom: cs?.paddingBottom || '0px',
                left: cs?.paddingLeft || '0px',
              };
              const mar = {
                top: cs?.marginTop || '0px',
                right: cs?.marginRight || '0px',
                bottom: cs?.marginBottom || '0px',
                left: cs?.marginLeft || '0px',
              };
              const base = `${scope ? scope + ' ' : ''}${fullSel}`;
              return (
                <div className="space-y-3 mt-2 pt-2 border-t">
                  <div className="text-sm font-medium">Spacing</div>
                  <FourSideEditor
                    title="Padding"
                    values={pad}
                    disabled={disabled}
                    onChange={(v) => {
                      addRuntimeStyle({ id: `${component.id}-padding-top`, selector: base, property: 'padding-top', value: v.top, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-padding-right`, selector: base, property: 'padding-right', value: v.right, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-padding-bottom`, selector: base, property: 'padding-bottom', value: v.bottom, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-padding-left`, selector: base, property: 'padding-left', value: v.left, element: document.documentElement, type: 'class' });
                    }}
                  />
                  <FourSideEditor
                    title="Margin"
                    values={mar}
                    allowNegative
                    disabled={disabled}
                    onChange={(v) => {
                      addRuntimeStyle({ id: `${component.id}-margin-top`, selector: base, property: 'margin-top', value: v.top, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-margin-right`, selector: base, property: 'margin-right', value: v.right, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-margin-bottom`, selector: base, property: 'margin-bottom', value: v.bottom, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-margin-left`, selector: base, property: 'margin-left', value: v.left, element: document.documentElement, type: 'class' });
                    }}
                  />
                </div>
              );
            })()}

            {/* Border */}
            {(() => {
              const scope = (scopeSelector[component.id] || '').trim();
              const disabled = scope.length === 0;
              const sz = (sizeScope[component.id] || 'all');
              const vr = (variantScope[component.id] || 'all');
              const suffix = `${sz !== 'all' ? `[data-size=\"${sz}\"]` : ''}${vr !== 'all' ? `[data-variant=\"${vr}\"]` : ''}`;
              const fullSel = `${component.selector}${suffix}`;
              const cs = getComputedFor(fullSel);
              const base = `${scope ? scope + ' ' : ''}${fullSel}`;
              const radius = {
                tl: cs?.borderTopLeftRadius || '0px',
                tr: cs?.borderTopRightRadius || '0px',
                br: cs?.borderBottomRightRadius || '0px',
                bl: cs?.borderBottomLeftRadius || '0px',
              };
              const width = {
                top: cs?.borderTopWidth || '0px',
                right: cs?.borderRightWidth || '0px',
                bottom: cs?.borderBottomWidth || '0px',
                left: cs?.borderLeftWidth || '0px',
              };
              const style = cs?.borderStyle || 'solid';
              const colorVal = cs?.borderColor || 'var(--border)';
              return (
                <div className="space-y-3 mt-2 pt-2 border-t">
                  <div className="text-sm font-medium">Border</div>
                  <CornerRadiusEditor
                    values={radius}
                    disabled={disabled}
                    onChange={(v) => {
                      addRuntimeStyle({ id: `${component.id}-radius-tl`, selector: base, property: 'border-top-left-radius', value: v.tl, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-radius-tr`, selector: base, property: 'border-top-right-radius', value: v.tr, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-radius-br`, selector: base, property: 'border-bottom-right-radius', value: v.br, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-radius-bl`, selector: base, property: 'border-bottom-left-radius', value: v.bl, element: document.documentElement, type: 'class' });
                    }}
                  />
                  <FourSideEditor
                    title="Border width"
                    values={width}
                    disabled={disabled}
                    onChange={(v) => {
                      addRuntimeStyle({ id: `${component.id}-bw-top`, selector: base, property: 'border-top-width', value: v.top, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-bw-right`, selector: base, property: 'border-right-width', value: v.right, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-bw-bottom`, selector: base, property: 'border-bottom-width', value: v.bottom, element: document.documentElement, type: 'class' });
                      addRuntimeStyle({ id: `${component.id}-bw-left`, selector: base, property: 'border-left-width', value: v.left, element: document.documentElement, type: 'class' });
                    }}
                  />
                  <SelectControl
                    label="Border style"
                    value={style}
                    originalValue={style}
                    onChange={(v) => addRuntimeStyle({ id: `${component.id}-bs`, selector: base, property: 'border-style', value: v, element: document.documentElement, type: 'class' })}
                    options={['none','solid','dashed','dotted']}
                  />
                  <TokenColorInput
                    label="Border color (token-first)"
                    value={colorVal}
                    disabled={disabled}
                    onChange={(v) => addRuntimeStyle({ id: `${component.id}-bc`, selector: base, property: 'border-color', value: v, element: document.documentElement, type: 'class' })}
                  />
                </div>
              );
            })()}

            {/* Shadows */}
            {(() => {
              const scope = (scopeSelector[component.id] || '').trim();
              const disabled = scope.length === 0;
              const sz = (sizeScope[component.id] || 'all');
              const vr = (variantScope[component.id] || 'all');
              const suffix = `${sz !== 'all' ? `[data-size=\"${sz}\"]` : ''}${vr !== 'all' ? `[data-variant=\"${vr}\"]` : ''}`;
              const fullSel = `${component.selector}${suffix}`;
              const cs = getComputedFor(fullSel);
              const base = `${scope ? scope + ' ' : ''}${fullSel}`;
              const boxShadow = cs?.boxShadow || 'none';
              const splitShadowLayers = (input: string): string[] => {
                const out: string[] = [];
                let depth = 0;
                let start = 0;
                for (let i = 0; i < input.length; i++) {
                  const ch = input[i];
                  if (ch === '(') depth++;
                  else if (ch === ')') depth = Math.max(0, depth - 1);
                  else if (ch === ',' && depth === 0) {
                    out.push(input.slice(start, i));
                    start = i + 1;
                  }
                }
                out.push(input.slice(start));
                return out.map(s => s.trim()).filter(Boolean);
              };
              const initial: any[] = boxShadow === 'none' ? [] : splitShadowLayers(boxShadow).map(s => {
                const parts = s.trim().split(/\s+(?![^()]*\))/);
                let inset = false; let idx=0;
                if (parts[0] === 'inset') { inset = true; idx = 1; }
                const x = parts[idx] || '0px';
                const y = parts[idx+1] || '0px';
                const blur = parts[idx+2] || '0px';
                const spread = parts[idx+3] || '0px';
                const color = parts.slice(idx+4).join(' ') || 'var(--border)';
                return { inset, x, y, blur, spread, color };
              });
              const showAllShadows = !!expandedComponents[component.id + '-shadow'];
              const layersToShow = showAllShadows ? initial : initial.slice(0, 1);
              return (
                <div className="space-y-3 mt-2 pt-2 border-t">
                  <div className="text-sm font-medium">Shadows</div>
                  <BoxShadowEditor
                    layers={layersToShow}
                    disabled={disabled}
                    onChange={(layers) => {
                      const css = layers.map((l: any) => `${l.inset? 'inset ': ''}${l.x} ${l.y} ${l.blur} ${l.spread} ${l.color}`).join(', ');
                      addRuntimeStyle({ id: `${component.id}-shadow`, selector: base, property: 'box-shadow', value: css || 'none', element: document.documentElement, type: 'class' });
                    }}
                  />
                  {initial.length > 1 && (
                    <button
                      className="w-full text-xs rounded-md border px-2 py-1"
                      onClick={(e) => { e.stopPropagation(); setExpandedComponents(prev => ({ ...prev, [component.id + '-shadow']: !prev[component.id + '-shadow'] })); }}
                    >
                      {showAllShadows ? 'Show less layers' : `Show ${initial.length - 1} more layers`}
                    </button>
                  )}
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
