'use client';

import { useEffect, useState } from 'react';
import { Target, Palette, Type, Box, Layers } from 'lucide-react';
import { useThemeTweakerStore } from './store/useThemeTweakerStore';
import { UniversalColorInput } from './components/common/UniversalColorInput';
import { SpacingControl } from './controls/SpacingControl';
import { BorderControl } from './controls/BorderControl';
import { TypographyControl } from './controls/TypographyControl';

export const ToolInspector: React.FC = () => {
  const { 
    selectedElement, 
    hoveredElement, 
    isInspectorMode,
    addRuntimeStyle 
  } = useThemeTweakerStore();
  
  const [elementInfo, setElementInfo] = useState<{
    tagName: string;
    dataUi: string;
    classes: string[];
    computedStyles: Record<string, string>;
  } | null>(null);

  const currentElement = selectedElement || hoveredElement;

  useEffect(() => {
    if (!currentElement) {
      setElementInfo(null);
      return;
    }

    const computedStyles = window.getComputedStyle(currentElement);
    const relevantStyles = {
      color: computedStyles.color,
      backgroundColor: computedStyles.backgroundColor,
      fontSize: computedStyles.fontSize,
      fontWeight: computedStyles.fontWeight,
      padding: computedStyles.padding,
      margin: computedStyles.margin,
      borderRadius: computedStyles.borderRadius,
      border: computedStyles.border,
      boxShadow: computedStyles.boxShadow,
    };

    setElementInfo({
      tagName: currentElement.tagName.toLowerCase(),
      dataUi: currentElement.getAttribute('data-ui') || 'none',
      classes: Array.from(currentElement.classList),
      computedStyles: relevantStyles,
    });
  }, [currentElement]);

  if (!isInspectorMode || !currentElement || !elementInfo) {
    return null;
  }

  const handleStyleChange = (property: string, value: string) => {
    if (!currentElement) return;
    
    // Generate a unique selector for this element
    const selector = currentElement.getAttribute('data-ui') 
      ? `[data-ui="${currentElement.getAttribute('data-ui')}"]`
      : `.${Array.from(currentElement.classList).join('.')}`;
    
    addRuntimeStyle({
      id: `${selector}-${property}`,
      selector,
      property,
      value,
      element: currentElement,
    });
  };

  return (
    <div className="fixed top-4 left-4 w-80 max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9998] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Element Inspector
          </h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">
              {elementInfo.tagName}
            </span>
            {elementInfo.dataUi !== 'none' && (
              <span className="font-mono bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1 rounded">
                data-ui="{elementInfo.dataUi}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Color Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette size={14} />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>
          </div>
          
          <UniversalColorInput
            label="Text Color"
            value={elementInfo.computedStyles.color}
            onChange={(value) => handleStyleChange('color', value)}
          />
          
          <UniversalColorInput
            label="Background"
            value={elementInfo.computedStyles.backgroundColor}
            onChange={(value) => handleStyleChange('background-color', value)}
          />
        </div>

        {/* Typography Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type size={14} />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Typography</h4>
          </div>
          
          <TypographyControl
            fontSize={elementInfo.computedStyles.fontSize}
            fontWeight={elementInfo.computedStyles.fontWeight}
            onFontSizeChange={(value) => handleStyleChange('font-size', value)}
            onFontWeightChange={(value) => handleStyleChange('font-weight', value)}
          />
        </div>

        {/* Spacing Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Box size={14} />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Spacing</h4>
          </div>
          
          <SpacingControl
            label="Padding"
            value={elementInfo.computedStyles.padding}
            onChange={(value) => handleStyleChange('padding', value)}
          />
          
          <SpacingControl
            label="Margin"
            value={elementInfo.computedStyles.margin}
            onChange={(value) => handleStyleChange('margin', value)}
          />
        </div>

        {/* Border Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={14} />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Border & Effects</h4>
          </div>
          
          <BorderControl
            border={elementInfo.computedStyles.border}
            borderRadius={elementInfo.computedStyles.borderRadius}
            boxShadow={elementInfo.computedStyles.boxShadow}
            onBorderChange={(value) => handleStyleChange('border', value)}
            onBorderRadiusChange={(value) => handleStyleChange('border-radius', value)}
            onBoxShadowChange={(value) => handleStyleChange('box-shadow', value)}
          />
        </div>

        {/* Applied Classes */}
        {elementInfo.classes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Applied Classes</h4>
            <div className="flex flex-wrap gap-1">
              {elementInfo.classes.map((className, index) => (
                <span
                  key={`${className}-${index}`}
                  className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded"
                >
                  {className}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {selectedElement ? 'Selected' : 'Hovered'} • Click to select
        </div>
      </div>
    </div>
  );
};