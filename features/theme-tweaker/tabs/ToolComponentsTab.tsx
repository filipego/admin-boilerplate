'use client';

import { useState, useEffect } from 'react';
import { Search, Component, Eye, Code, Palette } from 'lucide-react';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { ColorPicker } from '../controls/ColorPicker';
import { SliderControl } from '../controls/SliderControl';
import { TextControl } from '../controls/TextControl';

interface ComponentInfo {
  name: string;
  selector: string;
  dataUi: string;
  elements: Element[];
  variants: string[];
  commonClasses: string[];
}

export const ToolComponentsTab: React.FC = () => {
  const { 
    componentEdits, 
    addComponentEdit, 
    removeComponentEdit,
    setSelectedElement 
  } = useThemeTweakerStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  // Scan for components with data-ui attributes
  const scanComponents = () => {
    setIsScanning(true);
    
    try {
      const elementsWithDataUi = document.querySelectorAll('[data-ui]');
      const componentMap = new Map<string, ComponentInfo>();
      
      elementsWithDataUi.forEach((element) => {
        const dataUi = element.getAttribute('data-ui');
        if (!dataUi) return;
        
        const existing = componentMap.get(dataUi);
        if (existing) {
          existing.elements.push(element);
        } else {
          // Extract variants from classes (assuming BEM-like naming)
          const classes = Array.from(element.classList);
          const variants = classes.filter(cls => 
            cls.includes('--') || 
            cls.includes('variant-') || 
            cls.includes('size-') ||
            cls.includes('color-')
          );
          
          componentMap.set(dataUi, {
            name: dataUi.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            selector: `[data-ui="${dataUi}"]`,
            dataUi,
            elements: [element],
            variants,
            commonClasses: classes.filter(cls => !variants.includes(cls)),
          });
        }
      });
      
      setComponents(Array.from(componentMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      
    } catch (error) {
      console.error('Error scanning components:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanComponents();
  }, []);

  const handleComponentStyleChange = (selector: string, property: string, value: string) => {
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
      // Get original value from first matching element
      const element = document.querySelector(selector);
      if (element) {
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
    }
  };

  const getComponentStyleValue = (selector: string, property: string, defaultValue: string) => {
    const edit = componentEdits.find(edit => 
      edit.selector === selector && edit.property === property
    );
    return edit ? edit.value : defaultValue;
  };

  const highlightComponent = (component: ComponentInfo) => {
    // Temporarily highlight all instances of this component
    component.elements.forEach((element) => {
      element.style.outline = '2px solid #3b82f6';
      element.style.outlineOffset = '2px';
    });
    
    setTimeout(() => {
      component.elements.forEach((element) => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      });
    }, 2000);
  };

  const selectComponentElement = (component: ComponentInfo) => {
    if (component.elements.length > 0) {
      setSelectedElement(component.elements[0]);
      component.elements[0].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const filteredComponents = components.filter(component => 
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.dataUi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedComponentData = components.find(c => c.dataUi === selectedComponent);

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Component List or Editor */}
      <div className="flex-1 overflow-y-auto">
        {!selectedComponentData ? (
          <div className="p-4">
            {isScanning ? (
              <div className="flex items-center justify-center py-8">
                <Component size={20} className="animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Scanning components...</span>
              </div>
            ) : filteredComponents.length > 0 ? (
              <div className="space-y-2">
                {filteredComponents.map((component) => {
                  const hasEdits = componentEdits.some(edit => edit.selector === component.selector);
                  
                  return (
                    <div
                      key={component.dataUi}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        hasEdits 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedComponent(component.dataUi)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Component size={16} className="text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {component.name}
                            </span>
                            {hasEdits && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" title="Modified" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {component.elements.length} instance{component.elements.length !== 1 ? 's' : ''}
                            {component.variants.length > 0 && (
                              <span className="ml-2">
                                • {component.variants.length} variant{component.variants.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              highlightComponent(component);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Highlight instances"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectComponentElement(component);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Select element"
                          >
                            <Code size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Component size={32} className="mx-auto mb-2 opacity-50" />
                <p>No components found</p>
                <button
                  onClick={scanComponents}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Rescan components
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {/* Component Editor Header */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setSelectedComponent('')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to components
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {selectedComponentData.name}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {selectedComponentData.selector}
                </code>
                <span className="ml-2">
                  {selectedComponentData.elements.length} instance{selectedComponentData.elements.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Style Controls */}
            <div className="space-y-4">
              {/* Colors */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={14} />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>
                </div>
                
                {['color', 'background-color', 'border-color'].map((property) => {
                  const element = selectedComponentData.elements[0];
                  const computedValue = element ? getComputedStyle(element).getPropertyValue(property) : '';
                  const currentValue = getComponentStyleValue(selectedComponentData.selector, property, computedValue);
                  
                  return (
                    <ColorPicker
                      key={property}
                      label={property.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      value={currentValue}
                      onChange={(value) => handleComponentStyleChange(selectedComponentData.selector, property, value)}
                    />
                  );
                })}
              </div>

              {/* Spacing */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Spacing</h4>
                
                {['padding', 'margin'].map((property) => {
                  const element = selectedComponentData.elements[0];
                  const computedValue = element ? getComputedStyle(element).getPropertyValue(property) : '';
                  const currentValue = getComponentStyleValue(selectedComponentData.selector, property, computedValue);
                  
                  return (
                    <TextControl
                      key={property}
                      label={property.charAt(0).toUpperCase() + property.slice(1)}
                      value={currentValue}
                      onChange={(value) => handleComponentStyleChange(selectedComponentData.selector, property, value)}
                      placeholder={`Enter ${property} value...`}
                    />
                  );
                })}
              </div>

              {/* Border & Effects */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Border & Effects</h4>
                
                {['border-radius', 'box-shadow', 'border-width'].map((property) => {
                  const element = selectedComponentData.elements[0];
                  const computedValue = element ? getComputedStyle(element).getPropertyValue(property) : '';
                  const currentValue = getComponentStyleValue(selectedComponentData.selector, property, computedValue);
                  
                  if (property === 'border-radius' || property === 'border-width') {
                    return (
                      <SliderControl
                        key={property}
                        label={property.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        value={currentValue}
                        onChange={(value) => handleComponentStyleChange(selectedComponentData.selector, property, value)}
                        min={0}
                        max={property === 'border-radius' ? 50 : 10}
                        step={0.25}
                        unit="px"
                      />
                    );
                  }
                  
                  return (
                    <TextControl
                      key={property}
                      label={property.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      value={currentValue}
                      onChange={(value) => handleComponentStyleChange(selectedComponentData.selector, property, value)}
                      placeholder={`Enter ${property} value...`}
                    />
                  );
                })}
              </div>

              {/* Variants */}
              {selectedComponentData.variants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Variants</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedComponentData.variants.map((variant, index) => (
                      <span
                        key={`${variant}-${index}`}
                        className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded"
                      >
                        {variant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};