'use client';

import { useState } from 'react';
import { Save, Download, RotateCcw, FileText, Palette, Layout, Code2 } from 'lucide-react';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { applyRuntime } from '../runtime/applyRuntime';

type ChangeType = 'token' | 'component' | 'runtime';

interface Change {
  type: ChangeType;
  selector: string;
  property: string;
  value: string;
  originalValue: string;
  file?: string;
}

const changeTypeIcons = {
  token: Palette,
  component: Layout,
  runtime: Code2,
};

const changeTypeLabels = {
  token: 'CSS Token',
  component: 'Component Style',
  runtime: 'Runtime Style',
};

export const ToolDiffTab: React.FC = () => {
  const { 
    tokenEdits, 
    componentEdits, 
    runtimeStyles,
    clearAllEdits,
    removeTokenEdit,
    removeComponentEdit,
    removeRuntimeStyle
  } = useThemeTweakerStore();
  
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Combine all changes into a unified list
  const getAllChanges = (): Change[] => {
    const changes: Change[] = [];
    
    // Token edits
    tokenEdits.forEach((edit) => {
      changes.push({
        type: 'token',
        selector: ':root',
        property: edit.token,
        value: edit.value,
        originalValue: edit.originalValue,
        file: 'globals.css',
      });
    });
    
    // Component edits
    componentEdits.forEach((edit) => {
      changes.push({
        type: 'component',
        selector: edit.selector,
        property: edit.property,
        value: edit.value,
        originalValue: edit.originalValue,
      });
    });
    
    // Runtime styles
    Object.entries(runtimeStyles).forEach(([selector, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        changes.push({
          type: 'runtime',
          selector,
          property,
          value,
          originalValue: '', // Runtime styles don't have original values
        });
      });
    });
    
    return changes;
  };

  const changes = getAllChanges();
  const hasChanges = changes.length > 0;

  const getChangeId = (change: Change): string => {
    return `${change.type}-${change.selector}-${change.property}`;
  };

  const toggleChangeSelection = (changeId: string) => {
    const newSelection = new Set(selectedChanges);
    if (newSelection.has(changeId)) {
      newSelection.delete(changeId);
    } else {
      newSelection.add(changeId);
    }
    setSelectedChanges(newSelection);
  };

  const selectAllChanges = () => {
    setSelectedChanges(new Set(changes.map(getChangeId)));
  };

  const deselectAllChanges = () => {
    setSelectedChanges(new Set());
  };

  const removeChange = (change: Change) => {
    switch (change.type) {
      case 'token':
        removeTokenEdit(change.property);
        break;
      case 'component':
        removeComponentEdit(change.selector, change.property);
        break;
      case 'runtime':
        removeRuntimeStyle(change.selector, change.property);
        break;
    }
    
    // Remove from selection
    const changeId = getChangeId(change);
    const newSelection = new Set(selectedChanges);
    newSelection.delete(changeId);
    setSelectedChanges(newSelection);
  };

  const generateCSS = (changesToExport: Change[]): string => {
    const css: string[] = [];
    
    // Group changes by type and selector
    const tokenChanges = changesToExport.filter(c => c.type === 'token');
    const componentChanges = changesToExport.filter(c => c.type === 'component');
    const runtimeChanges = changesToExport.filter(c => c.type === 'runtime');
    
    // Add token changes
    if (tokenChanges.length > 0) {
      css.push('/* CSS Token Overrides */');
      css.push(':root {');
      tokenChanges.forEach(change => {
        css.push(`  ${change.property}: ${change.value};`);
      });
      css.push('}');
      css.push('');
    }
    
    // Add component changes grouped by selector
    if (componentChanges.length > 0) {
      css.push('/* Component Style Overrides */');
      const groupedBySelector = componentChanges.reduce((acc, change) => {
        if (!acc[change.selector]) {
          acc[change.selector] = [];
        }
        acc[change.selector].push(change);
        return acc;
      }, {} as Record<string, Change[]>);
      
      Object.entries(groupedBySelector).forEach(([selector, selectorChanges]) => {
        css.push(`${selector} {`);
        selectorChanges.forEach(change => {
          css.push(`  ${change.property}: ${change.value};`);
        });
        css.push('}');
        css.push('');
      });
    }
    
    // Add runtime changes
    if (runtimeChanges.length > 0) {
      css.push('/* Runtime Style Overrides */');
      const groupedBySelector = runtimeChanges.reduce((acc, change) => {
        if (!acc[change.selector]) {
          acc[change.selector] = [];
        }
        acc[change.selector].push(change);
        return acc;
      }, {} as Record<string, Change[]>);
      
      Object.entries(groupedBySelector).forEach(([selector, selectorChanges]) => {
        css.push(`${selector} {`);
        selectorChanges.forEach(change => {
          css.push(`  ${change.property}: ${change.value};`);
        });
        css.push('}');
        css.push('');
      });
    }
    
    return css.join('\n');
  };

  const exportChanges = async () => {
    setIsExporting(true);
    
    try {
      const changesToExport = selectedChanges.size > 0 
        ? changes.filter(change => selectedChanges.has(getChangeId(change)))
        : changes;
      
      const css = generateCSS(changesToExport);
      
      // Create and download file
      const blob = new Blob([css], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-overrides-${new Date().toISOString().split('T')[0]}.css`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export changes:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const resetAllChanges = () => {
    clearAllEdits();
    setSelectedChanges(new Set());
    
    // Clear runtime styles
    applyRuntime({}, {}, {});
  };

  const formatValue = (value: string): string => {
    if (value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    return value;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Changes ({changes.length})
          </h3>
          
          {hasChanges && (
            <div className="flex gap-2">
              <button
                onClick={exportChanges}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
              >
                <Download size={14} />
                {isExporting ? 'Exporting...' : 'Export CSS'}
              </button>
              
              <button
                onClick={resetAllChanges}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <RotateCcw size={14} />
                Reset All
              </button>
            </div>
          )}
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={selectAllChanges}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select All
            </button>
            <span className="text-gray-400">•</span>
            <button
              onClick={deselectAllChanges}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Deselect All
            </button>
            {selectedChanges.size > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedChanges.size} selected
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto">
        {!hasChanges ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Changes Yet</h3>
            <p className="text-sm text-center max-w-sm">
              Make some edits in the Tokens, Components, or Layout tabs to see them here.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {changes.map((change) => {
              const changeId = getChangeId(change);
              const isSelected = selectedChanges.has(changeId);
              const Icon = changeTypeIcons[change.type];
              
              return (
                <div
                  key={changeId}
                  className={`border rounded-lg p-3 transition-colors ${
                    isSelected 
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleChangeSelection(changeId)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    {/* Change Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon size={16} className="text-gray-500" />
                    </div>
                    
                    {/* Change Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                          {changeTypeLabels[change.type]}
                        </span>
                        {change.file && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {change.file}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {change.selector} → {change.property}
                      </div>
                      
                      <div className="text-xs space-y-1">
                        {change.originalValue && (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 px-1 rounded">
                              - {formatValue(change.originalValue)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-1 rounded">
                            + {formatValue(change.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeChange(change)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remove change"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="mb-1">
              <strong>Export:</strong> Download selected changes as a CSS file that can be imported into your project.
            </p>
            <p>
              <strong>Reset:</strong> Clear all changes and return to the original theme state.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};