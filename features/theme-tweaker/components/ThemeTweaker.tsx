'use client';

import React, { useEffect, useState } from 'react';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { ThemePanel } from './ThemePanel';
import { Button } from '@/components/ui/button';
import { Palette, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { RepoScanner } from '../utils/repoScanner';
import { RuntimeCSSEngine } from '../utils/runtimeCSSEngine';

// Feature flag check
const isThemeTweakerEnabled = process.env.NEXT_PUBLIC_THEMETWEAKER === '1';

export function ThemeTweaker() {
  const { 
    isToolOpen, 
    setToolOpen, 
    tokenEdits, 
    componentEdits, 
    runtimeStyles
  } = useThemeTweakerStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [runtimeEngine, setRuntimeEngine] = useState<RuntimeCSSEngine | null>(null);
  const [repoScanner, setRepoScanner] = useState<RepoScanner | null>(null);

  // Initialize the theme tweaker
  useEffect(() => {
    if (!isThemeTweakerEnabled || isInitialized) return;

    const initializeThemeTweaker = async () => {
      try {
        // Initialize runtime CSS engine
        const engine = new RuntimeCSSEngine();
        setRuntimeEngine(engine);

        // Initialize repo scanner
        const scanner = new RepoScanner();
        setRepoScanner(scanner);

        // Perform initial scan
        await scanner.fullScan();
        
        setIsInitialized(true);
        console.log('ThemeTweaker initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ThemeTweaker:', error);
        toast.error('Failed to initialize Theme Tweaker');
      }
    };

    initializeThemeTweaker();
  }, [isInitialized]);

  // Apply runtime CSS changes
  useEffect(() => {
    if (!runtimeEngine) return;

    try {
      // Combine all edits
      const allEdits = {
        ...tokenEdits,
        ...componentEdits,
        ...runtimeStyles
      };

      // Apply to runtime engine
      runtimeEngine.applyEdits(allEdits);
    } catch (error) {
      console.error('Failed to apply runtime CSS:', error);
    }
  }, [runtimeEngine, tokenEdits, componentEdits, runtimeStyles]);

  // Handle click-to-edit functionality
  useEffect(() => {
    if (!isToolOpen || !repoScanner) return;

    const handleElementClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dataUi = target.getAttribute('data-ui');
      
      if (dataUi && event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        
        // Find component and highlight for editing
        const component = repoScanner.findComponentByElement(target);
        if (component) {
          toast.success(`Selected ${component.name} for editing`);
          // Switch to components tab and highlight the component
          // This would be handled by the store
        }
      }
    };

    document.addEventListener('click', handleElementClick, true);
    return () => document.removeEventListener('click', handleElementClick, true);
  }, [isToolOpen, repoScanner]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle theme tweaker with Cmd/Ctrl + Shift + T
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        handleToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggle = () => {
    if (!isInitialized) {
      toast.error('Theme Tweaker is still initializing...');
      return;
    }
    
    setToolOpen(!isToolOpen);
    
    // No toast on open
  };

  const handleClose = () => {
    setToolOpen(false);
  };

  // Don't render if feature flag is disabled
  if (!isThemeTweakerEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isToolOpen && (
        <Button
          onClick={handleToggle}
          disabled={!isInitialized}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-[9998]"
          size="icon"
          title="Open Theme Tweaker (Cmd+Shift+T)"
        >
          {isInitialized ? (
            <Palette className="w-6 h-6" />
          ) : (
            <Settings className="w-6 h-6 animate-spin" />
          )}
        </Button>
      )}

      {/* Theme Panel */}
      {isToolOpen && (
        <ThemePanel onClose={handleClose} />
      )}

      {/* Click-to-edit overlay hint */}
      {isToolOpen && (
        <div className="fixed bottom-6 left-6 bg-background border border-border rounded-lg p-3 shadow-lg z-[9997]">
          <p className="text-sm text-muted-foreground">
            Hold <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Alt</kbd> + click to edit components
          </p>
        </div>
      )}
    </>
  );
}

// Export a conditional wrapper that only renders when feature flag is enabled
export function ThemeTweakerProvider({ children }: { children: React.ReactNode }) {
  if (!isThemeTweakerEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <ThemeTweaker />
    </>
  );
}