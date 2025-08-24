'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useThemeTweakerStore } from './store/useThemeTweakerStore';
import { ToolFab } from './ToolFab';
import { ToolPanel } from './ToolPanel';
import { ToolInspector } from './ToolInspector';
import { applyRuntimeStyles } from './runtime/applyRuntime';
import { initializeSelectionOverlay } from './runtime/selectionOverlay';

interface ThemeTweakerContextType {
  isEnabled: boolean;
  isDevMode: boolean;
}

const ThemeTweakerContext = createContext<ThemeTweakerContextType>({
  isEnabled: false,
  isDevMode: false,
});

export const useThemeTweaker = () => useContext(ThemeTweakerContext);

interface ToolProviderProps {
  children: React.ReactNode;
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const { isToolOpen, selectedElement, runtimeStyles } = useThemeTweakerStore();

  useEffect(() => {
    // Check feature flag and dev mode
    const featureFlag = process.env.NEXT_PUBLIC_THEMETWEAKER === '1';
    const devMode = process.env.NODE_ENV === 'development';
    
    setIsEnabled(featureFlag && devMode);
    setIsDevMode(devMode);

    if (featureFlag && devMode) {
      // Initialize runtime CSS engine
      applyRuntimeStyles(runtimeStyles);
      
      // Initialize selection overlay
      initializeSelectionOverlay();
    }
  }, [runtimeStyles]);

  // Don't render anything if not enabled
  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <ThemeTweakerContext.Provider value={{ isEnabled, isDevMode }}>
      {children}
      
      {/* ThemeTweaker UI Components */}
      <ToolFab />
      {isToolOpen && <ToolPanel />}
      {selectedElement && <ToolInspector />}
    </ThemeTweakerContext.Provider>
  );
};