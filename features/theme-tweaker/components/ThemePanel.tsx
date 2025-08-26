'use client';

import React, { useState, useEffect, useRef } from 'react';
import toolStyles from './tool-ui.module.css';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import UIButton from './common/UIButton';
import UICard from './common/UICard';
import { UICardContainer, UICardContent, UICardHeader, UICardTitle } from './common/UICardContainer';
import { UITabs, UITabsContent, UITabsList, UITabsTrigger } from './common/UITabs';
import UIBadge from './common/UIBadge';
import UISeparator from './common/UISeparator';
import ReactLazy = React.lazy;
const ToolTokensTab = React.lazy(() => import('./tabs/ToolTokensTab').then(m => ({ default: m.ToolTokensTab })));
const ToolComponentsTab = React.lazy(() => import('./tabs/ToolComponentsTab').then(m => ({ default: m.ToolComponentsTab }))); 
const ToolLayoutTab = React.lazy(() => import('./tabs/ToolLayoutTab').then(m => ({ default: m.ToolLayoutTab })));
import { ToolDiffTab } from './tabs/ToolDiffTab';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Settings, 
  Palette, 
  Component, 
  Layout, 
  FileText,
  Save,
  RotateCcw,
  Eye,
  EyeOff
  , PanelLeft,
  PanelRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ThemePanelProps {
  onClose: () => void;
}

export function ThemePanel({ onClose }: ThemePanelProps) {
  const { 
    activeTab,
    setActiveTab,
    tokenEdits, 
    componentEdits, 
    runtimeStyles,
    resetAll
  } = useThemeTweakerStore();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [panelWidth, setPanelWidth] = useState<number>(450);
  const isResizing = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const resizeSide = useRef<'left' | 'right'>('left');

  const [dock, setDock] = useState<'right' | 'left' | 'floating'>(() => {
    if (typeof window === 'undefined') return 'right';
    return (window.localStorage.getItem('tt-panel-dock') as any) || 'right';
  });
  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({ x: 16, y: 16 }));
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Lock tool UI to initial CSS variable values so site edits don't affect the tool
  const [lockedVars, setLockedVars] = useState<Record<string, string> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [showTabText, setShowTabText] = useState(true);
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!tabsListRef.current) return;
    const el = tabsListRef.current;
    const ro = new ResizeObserver(() => {
      // If each tab would get less than 100px, hide text
      const width = el.clientWidth;
      const minPerTab = 100; // threshold for showing labels
      const tabsCount = 4;
      setShowTabText(width / tabsCount >= minPerTab);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('tt-panel-width') : null;
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed)) setPanelWidth(parsed);
    }
    if (typeof window !== 'undefined') {
      const dockRaw = window.localStorage.getItem('tt-panel-dock');
      if (dockRaw === 'left' || dockRaw === 'right' || dockRaw === 'floating') setDock(dockRaw);
      const posRaw = window.localStorage.getItem('tt-panel-pos');
      if (posRaw) {
        try {
          const p = JSON.parse(posRaw);
          if (typeof p.x === 'number' && typeof p.y === 'number') setPosition(p);
        } catch {}
      }
      // Capture initial global CSS variables to isolate tool UI
      try {
        const names = [
          '--background','--foreground','--card','--card-foreground','--popover','--popover-foreground',
          '--muted','--muted-foreground','--accent','--accent-foreground','--primary','--primary-foreground',
          '--secondary','--secondary-foreground','--border','--input','--ring',
          '--sidebar','--sidebar-foreground','--sidebar-border','--sidebar-accent','--sidebar-accent-foreground'
        ];
        const cs = getComputedStyle(document.documentElement);
        const map: Record<string,string> = {};
        for (const n of names) {
          const v = cs.getPropertyValue(n).trim();
          if (v) map[n] = v;
        }
        setLockedVars(map);
      } catch {}
    }
  }, []);

  // Apply locked vars with !important to the panel wrapper to avoid runtime preview affecting the tool
  useEffect(() => {
    if (!lockedVars || !wrapperRef.current) return;
    try {
      const el = wrapperRef.current as HTMLElement;
      Object.entries(lockedVars).forEach(([name, value]) => {
        // Use priority 'important' so these beat global preview rules
        el.style.setProperty(name, value, 'important');
      });
    } catch {}
  }, [lockedVars]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tt-panel-width', String(panelWidth));
    }
  }, [panelWidth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tt-panel-dock', dock);
      if (dock === 'floating') {
        window.localStorage.setItem('tt-panel-pos', JSON.stringify(position));
      }
    }
  }, [dock, position]);

  // Calculate total changes across all tabs
  const totalChanges = tokenEdits.length + 
                      componentEdits.length + 
                      runtimeStyles.length;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'r':
            if (e.shiftKey) {
              e.preventDefault();
              handleResetAll();
            }
            break;
          case 'Escape':
            e.preventDefault();
            onClose();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle resize
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isResizing.current && !isMaximized) {
        let delta: number;
        
        if (dock === 'right') {
          // When docked on right, resize handle is on left side
          // Dragging left (decreasing clientX) should make panel wider
          delta = resizeStartX.current - e.clientX;
        } else if (dock === 'left') {
          // When docked on left, resize handle is on right side
          // Dragging right (increasing clientX) should make panel wider
          delta = e.clientX - resizeStartX.current;
        } else {
          // Floating mode - use the original logic
          delta = resizeSide.current === 'right'
            ? e.clientX - resizeStartX.current
            : resizeStartX.current - e.clientX;
        }
        
        const nextWidth = Math.max(350, Math.min(900, resizeStartWidth.current + delta));
        setPanelWidth(nextWidth);
      }
      if (isDragging.current && dock === 'floating' && !isMaximized) {
        const nx = e.clientX - dragOffset.current.x;
        const ny = e.clientY - dragOffset.current.y;
        const clampedX = Math.max(8, Math.min(window.innerWidth - panelWidth - 8, nx));
        const clampedY = Math.max(8, Math.min(window.innerHeight - 120, ny));
        setPosition({ x: clampedX, y: clampedY });
      }
    };
    
    const onMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        window.localStorage.setItem('tt-panel-width', String(panelWidth));
      }
      if (isDragging.current) {
        isDragging.current = false;
        if (dock === 'floating') {
          window.localStorage.setItem('tt-panel-pos', JSON.stringify(position));
        }
        document.body.style.userSelect = '';
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [panelWidth, isMaximized, dock, position]);

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/theme-tweaker/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenEdits, runtimeStyles })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || 'Failed');
      toast.success('Theme changes saved');
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const handleExport = () => {
    // This would typically trigger the export pipeline
    toast.success('Theme exported!');
  };

  const handleResetAll = () => {
    resetAll();
    toast.success('All changes reset!');
  };

  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
    toast.info(previewMode ? 'Preview mode disabled' : 'Preview mode enabled');
  };

  // Component is always visible when rendered

  let wrapperClasses = 'fixed z-[9999] transition-all duration-300';
  if (isMaximized) {
    wrapperClasses += ' inset-4';
  } else if (dock === 'right') {
    wrapperClasses += ' top-4 right-4 h-[calc(100vh-2rem)]';
  } else if (dock === 'left') {
    wrapperClasses += ' top-4 left-4 h-[calc(100vh-2rem)]';
  } else {
    wrapperClasses += '';
  }
  if (isMinimized) wrapperClasses += ' h-14';

  return (
    <div
      ref={wrapperRef}
      className={`${wrapperClasses} tt-scope ${toolStyles.scope}`}
      style={(() => {
        const posStyle = !isMaximized
          ? (dock === 'floating'
              ? { width: panelWidth, left: position.x, top: position.y, height: `calc(100vh - ${position.y + 16}px)` }
              : { width: panelWidth })
          : {};
        const varsStyle = (lockedVars || {}) as unknown as React.CSSProperties;
        return { ...posStyle, ...varsStyle } as React.CSSProperties;
      })()}
      data-tt-root
    >
      {/* Private CSS (module-scoped) applied via toolStyles.scope on wrapper */}
      <style jsx>{`
        .tab-text {
          transition: opacity 0.2s ease;
        }
        @media (max-width: 400px) {
          .tab-text {
            display: none;
          }
        }
        @media (max-width: 500px) {
          .tab-text {
            opacity: 0.7;
          }
        }
      `}</style>
      <UICardContainer className="bg-[#E9E2FF] dark:bg-[#5E3AD8] border border-[#E9E2FF] dark:border-[#5E3AD8] shadow-2xl h-full flex flex-col pt-0 tt-container">
        {/* Header */}
        <UICardHeader className="pt-0 pb-2 border-b border-transparent bg-[#E9E2FF] dark:bg-[#5E3AD8] select-none">
          {/* Draggable spacer equal to removed top padding */}
          <div
            className="h-6 w-full cursor-move"
            onMouseDown={(e) => {
              e.preventDefault();
              if (dock !== 'floating') setDock('floating');
              isDragging.current = true;
              dragStart.current = { x: e.clientX, y: e.clientY };
              dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
              document.body.style.userSelect = 'none';
            }}
            aria-label="Drag panel"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <UICardTitle className="text-lg">Theme Tweaker</UICardTitle>
              {totalChanges > 0 && (
                <UIBadge variant="secondary">
                  {totalChanges} change{totalChanges !== 1 ? 's' : ''}
                </UIBadge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <UIButton
                variant="ghost"
                size="sm"
                onClick={() => setDock(dock === 'left' ? 'right' : 'left')}
                title={dock === 'left' ? 'Dock Right' : 'Dock Left'}
              >
                {dock === 'left' ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </UIButton>
              
              <UIButton
                variant="ghost"
                size="sm"
                onClick={handlePreviewToggle}
                title={previewMode ? 'Disable preview' : 'Enable preview'}
              >
                {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </UIButton>
              
              <UIButton
                variant="ghost"
                size="sm"
                onClick={handleMaximize}
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </UIButton>
              
              <UIButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Close"
              >
                <X className="w-4 h-4" />
              </UIButton>
            </div>
          </div>
          
          {/* Quick Actions */}
          {!isMinimized && (
            <div className="flex items-center gap-2 mt-2">
              <UIButton
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={totalChanges === 0}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </UIButton>
              
              <UIButton
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                disabled={totalChanges === 0}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </UIButton>
            </div>
          )}
        </UICardHeader>

        {/* Content */}
        {!isMinimized && (
          <UICardContent className="p-0 flex-1 overflow-hidden">
            <UITabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
              <div className="px-4 pt-2">
                <UITabsList ref={tabsListRef as any} className="w-full gap-1 justify-between tt-tabs-list">
                  <UITabsTrigger value="tokens" className="flex items-center gap-1.5 text-xs px-2 py-1 flex-1 min-w-0 tt-tabs-trigger">
                    <Palette className="w-2.5 h-2.5 flex-shrink-0" />
                    {showTabText && <span className="tab-text">Tokens</span>}
                    {tokenEdits.length > 0 && (
                      <UIBadge variant="secondary" className="ml-1 text-xs flex-shrink-0">
                        {tokenEdits.length}
                      </UIBadge>
                    )}
                  </UITabsTrigger>
                  <UITabsTrigger value="components" className="flex items-center gap-1.5 text-xs px-2 py-1 flex-1 min-w-0 tt-tabs-trigger">
                    <Component className="w-2.5 h-2.5 flex-shrink-0" />
                    {showTabText && <span className="tab-text">Components</span>}
                    {componentEdits.length > 0 && (
                      <UIBadge variant="secondary" className="ml-1 text-xs flex-shrink-0">
                        {componentEdits.length}
                      </UIBadge>
                    )}
                  </UITabsTrigger>
                  <UITabsTrigger value="layout" className="flex items-center gap-1.5 text-xs px-2 py-1 flex-1 min-w-0 tt-tabs-trigger">
                    <Layout className="w-2.5 h-2.5 flex-shrink-0" />
                    {showTabText && <span className="tab-text">Layout</span>}
                    {runtimeStyles.length > 0 && (
                      <UIBadge variant="secondary" className="ml-1 text-xs flex-shrink-0">
                        {totalChanges}
                      </UIBadge>
                    )}
                  </UITabsTrigger>
                  <UITabsTrigger value="diff" className="flex items-center gap-1.5 text-xs px-2 py-1 flex-1 min-w-0 tt-tabs-trigger">
                    <FileText className="w-2.5 h-2.5 flex-shrink-0" />
                    {showTabText && <span className="tab-text">Diff</span>}
                    {totalChanges > 0 && (
                      <UIBadge variant="secondary" className="ml-1 text-xs flex-shrink-0">
                        {totalChanges}
                      </UIBadge>
                    )}
                  </UITabsTrigger>
                </UITabsList>
              </div>
              <div className="flex-1 overflow-hidden">
                <UITabsContent value="tokens" className="h-full m-0 p-4 overflow-auto">
                  <React.Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading tokens…</div>}>
                    <ToolTokensTab />
                  </React.Suspense>
                </UITabsContent>
                <UITabsContent value="components" className="h-full m-0 p-4 overflow-auto">
                  <React.Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading components…</div>}>
                    <ToolComponentsTab />
                  </React.Suspense>
                </UITabsContent>
                <UITabsContent value="layout" className="h-full m-0 p-4 overflow-auto">
                  <React.Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading layout…</div>}>
                    <ToolLayoutTab />
                  </React.Suspense>
                </UITabsContent>
                <UITabsContent value="diff" className="h-full m-0 p-4 overflow-auto">
                  <ToolDiffTab />
                </UITabsContent>
              </div>
            </UITabs>
          </UICardContent>
        )}
        
        {/* Minimized State */}
        {isMinimized && (
          <UICardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Theme Tweaker</span>
                {totalChanges > 0 && (
                  <UIBadge variant="secondary" className="text-xs">
                    {totalChanges}
                  </UIBadge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {totalChanges > 0 && (
                  <>
                    <UIButton variant="ghost" size="sm" onClick={handleSave}>
                      <Save className="w-3 h-3" />
                    </UIButton>
                  </>
                )}
              </div>
            </div>
          </UICardContent>
        )}
      </UICardContainer>
      
      {/* Resize handle */}
      {!isMinimized && !isMaximized && dock !== 'floating' && (
        <div
          className={`absolute top-0 bottom-0 ${dock === 'right' ? 'left-0' : 'right-0'} w-1 cursor-col-resize hover:bg-white/10`}
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
            resizeStartX.current = e.clientX;
            resizeStartWidth.current = panelWidth;
            // Set resize side based on dock position for proper calculation
            resizeSide.current = dock === 'right' ? 'left' : 'right';
          }}
          aria-label="Resize panel"
          role="separator"
          title="Drag to resize"
        />
      )}
    </div>
  );
}