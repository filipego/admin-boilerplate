'use client';

import { useState } from 'react';
import { Palette, Settings, Eye, EyeOff } from 'lucide-react';
import { useThemeTweakerStore } from './store/useThemeTweakerStore';
import { toggleInspectorMode } from './runtime/selectionOverlay';

export const ToolFab: React.FC = () => {
  const { 
    isToolOpen, 
    isInspectorMode, 
    setToolOpen, 
    setInspectorMode 
  } = useThemeTweakerStore();
  
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleTool = () => {
    setToolOpen(!isToolOpen);
    setIsExpanded(false);
  };

  const handleToggleInspector = () => {
    const newMode = !isInspectorMode;
    setInspectorMode(newMode);
    toggleInspectorMode(newMode);
    setIsExpanded(false);
  };

  return (
    <div data-theme-tweaker-ui className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-2">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          {/* Inspector Mode Toggle */}
          <button
            onClick={handleToggleInspector}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-200
              ${isInspectorMode 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }
            `}
            title={isInspectorMode ? 'Exit Inspector Mode' : 'Enter Inspector Mode'}
          >
            {isInspectorMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-sm font-medium">
              {isInspectorMode ? 'Exit Inspector' : 'Inspector'}
            </span>
          </button>
          
          {/* Theme Panel Toggle */}
          <button
            onClick={handleToggleTool}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-200
              ${isToolOpen 
                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }
            `}
            title={isToolOpen ? 'Close Theme Panel' : 'Open Theme Panel'}
          >
            <Palette size={16} />
            <span className="text-sm font-medium">
              {isToolOpen ? 'Close Panel' : 'Theme Panel'}
            </span>
          </button>
        </div>
      )}
      
      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center
          ${isExpanded 
            ? 'bg-gray-500 text-white hover:bg-gray-600 rotate-45' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
          }
        `}
        title="ThemeTweaker"
      >
        {isExpanded ? (
          <div className="w-6 h-0.5 bg-white" />
        ) : (
          <Settings size={20} className="animate-pulse" />
        )}
      </button>
      
      {/* Status Indicators */}
      <div className="flex gap-1 mt-1">
        {isToolOpen && (
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Theme Panel Open" />
        )}
        {isInspectorMode && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Inspector Mode Active" />
        )}
      </div>
      
      {/* Backdrop for closing expanded state */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
