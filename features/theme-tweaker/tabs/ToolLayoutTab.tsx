'use client';

import { useState, useEffect } from 'react';
import { Layout, Grid, Smartphone, Tablet, Monitor, Maximize } from 'lucide-react';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { SliderControl } from '../controls/SliderControl';
import { TextControl } from '../controls/TextControl';
import { SelectControl } from '../controls/SelectControl';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface LayoutProperty {
  name: string;
  property: string;
  type: 'slider' | 'text' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const layoutProperties: LayoutProperty[] = [
  {
    name: 'Container Max Width',
    property: 'max-width',
    type: 'slider',
    min: 320,
    max: 1920,
    step: 16,
    unit: 'px',
  },
  {
    name: 'Grid Columns',
    property: 'grid-template-columns',
    type: 'text',
  },
  {
    name: 'Grid Gap',
    property: 'gap',
    type: 'slider',
    min: 0,
    max: 4,
    step: 0.25,
    unit: 'rem',
  },
  {
    name: 'Flex Direction',
    property: 'flex-direction',
    type: 'select',
    options: ['row', 'column', 'row-reverse', 'column-reverse'],
  },
  {
    name: 'Justify Content',
    property: 'justify-content',
    type: 'select',
    options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
  },
  {
    name: 'Align Items',
    property: 'align-items',
    type: 'select',
    options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
  },
];

const breakpoints = {
  mobile: { name: 'Mobile', icon: Smartphone, maxWidth: '640px' },
  tablet: { name: 'Tablet', icon: Tablet, maxWidth: '768px' },
  desktop: { name: 'Desktop', icon: Monitor, maxWidth: '1024px' },
  wide: { name: 'Wide', icon: Maximize, maxWidth: '1280px+' },
};

export const ToolLayoutTab: React.FC = () => {
  const { 
    componentEdits, 
    addComponentEdit, 
    removeComponentEdit 
  } = useThemeTweakerStore();
  
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<Breakpoint>('desktop');
  const [layoutElements, setLayoutElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  // Scan for layout-related elements
  const scanLayoutElements = () => {
    const elements = Array.from(document.querySelectorAll('*')).filter((element) => {
      const computedStyle = getComputedStyle(element);
      return (
        computedStyle.display === 'flex' ||
        computedStyle.display === 'grid' ||
        computedStyle.display === 'block' ||
        element.classList.contains('container') ||
        element.classList.contains('grid') ||
        element.classList.contains('flex') ||
        element.hasAttribute('data-ui')
      );
    });
    
    setLayoutElements(elements.slice(0, 50)); // Limit to first 50 for performance
  };

  useEffect(() => {
    scanLayoutElements();
  }, []);

  const getElementSelector = (element: Element): string => {
    const dataUi = element.getAttribute('data-ui');
    if (dataUi) {
      return `[data-ui="${dataUi}"]`;
    }
    
    const id = element.id;
    if (id) {
      return `#${id}`;
    }
    
    const classes = Array.from(element.classList);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
    
    return element.tagName.toLowerCase();
  };

  const getBreakpointSelector = (baseSelector: string, breakpoint: Breakpoint): string => {
    const mediaQueries = {
      mobile: `@media (max-width: 640px)`,
      tablet: `@media (min-width: 641px) and (max-width: 768px)`,
      desktop: `@media (min-width: 769px) and (max-width: 1024px)`,
      wide: `@media (min-width: 1025px)`,
    };
    
    return breakpoint === 'desktop' ? baseSelector : `${mediaQueries[breakpoint]} { ${baseSelector}`;
  };

  const handleLayoutStyleChange = (element: Element, property: string, value: string) => {
    const baseSelector = getElementSelector(element);
    const selector = getBreakpointSelector(baseSelector, selectedBreakpoint);
    
    const existingEdit = componentEdits.find(edit => 
      edit.selector === selector && edit.property === property
    );
    
    if (existingEdit) {
      if (value === existingEdit.originalValue) {
        removeComponentEdit(selector, property);
      } else {
        addComponentEdit({
          selector,
          property,
          value,
          originalValue: existingEdit.originalValue,
        });
      }
    } else {
      const originalValue = getComputedStyle(element).getPropertyValue(property);
      if (value !== originalValue) {
        addComponentEdit({
          selector,
          property,
          value,
          originalValue,
        });
      }
    }
  };

  const getLayoutStyleValue = (element: Element, property: string, defaultValue: string) => {
    const baseSelector = getElementSelector(element);
    const selector = getBreakpointSelector(baseSelector, selectedBreakpoint);
    
    const edit = componentEdits.find(edit => 
      edit.selector === selector && edit.property === property
    );
    return edit ? edit.value : defaultValue;
  };

  const highlightElement = (element: Element) => {
    element.style.outline = '2px solid #10b981';
    element.style.outlineOffset = '2px';
    
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 2000);
  };

  const getElementDescription = (element: Element): string => {
    const dataUi = element.getAttribute('data-ui');
    if (dataUi) {
      return dataUi.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    
    const id = element.id;
    if (id) {
      return `#${id}`;
    }
    
    const classes = Array.from(element.classList);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
    
    return element.tagName.toLowerCase();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Breakpoint Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {Object.entries(breakpoints).map(([key, breakpoint]) => {
            const Icon = breakpoint.icon;
            const isActive = selectedBreakpoint === key;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedBreakpoint(key as Breakpoint)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                title={breakpoint.maxWidth}
              >
                <Icon size={14} />
                <span>{breakpoint.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Element List or Editor */}
      <div className="flex-1 overflow-y-auto">
        {!selectedElement ? (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Layout Elements
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select an element to edit its layout properties for {breakpoints[selectedBreakpoint].name.toLowerCase()} screens.
              </p>
            </div>
            
            <div className="space-y-2">
              {layoutElements.map((element, index) => {
                const description = getElementDescription(element);
                const computedStyle = getComputedStyle(element);
                const displayType = computedStyle.display;
                
                const hasEdits = componentEdits.some(edit => {
                  const baseSelector = getElementSelector(element);
                  const selector = getBreakpointSelector(baseSelector, selectedBreakpoint);
                  return edit.selector === selector;
                });
                
                return (
                  <div
                    key={`${element.tagName}-${element.id || index}`}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      hasEdits 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Layout size={16} className="text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {description}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            {displayType}
                          </span>
                          {hasEdits && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Modified" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {element.tagName.toLowerCase()}
                          {element.id && ` #${element.id}`}
                          {element.classList.length > 0 && ` .${Array.from(element.classList).slice(0, 2).join(' .')}`}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          highlightElement(element);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Highlight element"
                      >
                        <Grid size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {layoutElements.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Layout size={32} className="mx-auto mb-2 opacity-50" />
                <p>No layout elements found</p>
                <button
                  onClick={scanLayoutElements}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Rescan elements
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {/* Element Editor Header */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setSelectedElement(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to elements
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {getElementDescription(selectedElement)}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono">
                  {getElementSelector(selectedElement)}
                </span>
                <span className="ml-2">
                  @ {breakpoints[selectedBreakpoint].name}
                </span>
              </div>
            </div>

            {/* Layout Controls */}
            <div className="space-y-4">
              {layoutProperties.map((layoutProp) => {
                const computedValue = getComputedStyle(selectedElement).getPropertyValue(layoutProp.property);
                const currentValue = getLayoutStyleValue(selectedElement, layoutProp.property, computedValue);
                
                if (layoutProp.type === 'slider') {
                  return (
                    <SliderControl
                      key={layoutProp.property}
                      label={layoutProp.name}
                      value={currentValue}
                      onChange={(value) => handleLayoutStyleChange(selectedElement, layoutProp.property, value)}
                      min={layoutProp.min!}
                      max={layoutProp.max!}
                      step={layoutProp.step!}
                      unit={layoutProp.unit!}
                    />
                  );
                }
                
                if (layoutProp.type === 'select') {
                  return (
                    <SelectControl
                      key={layoutProp.property}
                      label={layoutProp.name}
                      value={currentValue}
                      options={layoutProp.options!}
                      onChange={(value) => handleLayoutStyleChange(selectedElement, layoutProp.property, value)}
                    />
                  );
                }
                
                return (
                  <TextControl
                    key={layoutProp.property}
                    label={layoutProp.name}
                    value={currentValue}
                    onChange={(value) => handleLayoutStyleChange(selectedElement, layoutProp.property, value)}
                    placeholder={`Enter ${layoutProp.name.toLowerCase()}...`}
                  />
                );
              })}
            </div>

            {/* Current Computed Styles */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Current Computed Styles
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  'display',
                  'position',
                  'width',
                  'height',
                  'flex-direction',
                  'justify-content',
                  'align-items',
                  'grid-template-columns',
                  'gap',
                ].map((property) => {
                  const value = getComputedStyle(selectedElement).getPropertyValue(property);
                  if (!value || value === 'none' || value === 'normal') return null;
                  
                  return (
                    <div key={property} className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{property}:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};