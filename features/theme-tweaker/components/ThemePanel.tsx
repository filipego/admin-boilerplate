'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ToolTokensTab } from './tabs/ToolTokensTab';
import { ToolComponentsTab } from './tabs/ToolComponentsTab';
import { ToolLayoutTab } from './tabs/ToolLayoutTab';
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
  Download,
  RotateCcw,
  Eye,
  EyeOff
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

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('tt-panel-width') : null;
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed)) setPanelWidth(parsed);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tt-panel-width', String(panelWidth));
    }
  }, [panelWidth]);

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
      if (!isResizing.current || isMaximized) return;
      const dx = e.clientX - (window.innerWidth - panelWidth - 16); // 16px for right margin
      const nextWidth = Math.max(350, Math.min(900, panelWidth - dx));
      setPanelWidth(nextWidth);
    };
    
    const onMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        window.localStorage.setItem('tt-panel-width', String(panelWidth));
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [panelWidth, isMaximized]);

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleSave = () => {
    // This would typically trigger the save pipeline
    toast.success('Theme changes saved!');
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

  const wrapperClasses = `
    fixed z-[9999] transition-all duration-300
    ${isMaximized ? 'inset-4' : 'top-4 right-4 h-[calc(100vh-2rem)]'}
    ${isMinimized ? 'h-14' : ''}
  `;

  return (
    <div className={wrapperClasses} style={!isMaximized ? { width: panelWidth } : undefined}>
      <Card className="bg-[#774DFF] dark:bg-[#5E3AD8] border border-[#774DFF] dark:border-[#5E3AD8] shadow-2xl h-full flex flex-col">
        {/* Header */}
        <CardHeader className="pb-3 border-b border-transparent bg-[#774DFF] dark:bg-[#5E3AD8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <CardTitle className="text-lg">Theme Tweaker</CardTitle>
              {totalChanges > 0 && (
                <Badge variant="secondary">
                  {totalChanges} change{totalChanges !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviewToggle}
                title={previewMode ? 'Disable preview' : 'Enable preview'}
              >
                {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaximize}
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          {!isMinimized && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={totalChanges === 0}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={totalChanges === 0}
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                disabled={totalChanges === 0}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </CardHeader>

        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-0 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="w-full gap-2 justify-start">
                  <TabsTrigger value="tokens" className="flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  <span>Tokens</span>
                  {tokenEdits.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tokenEdits.length}
                    </Badge>
                  )}
                  </TabsTrigger>
                
                  <TabsTrigger value="components" className="flex items-center gap-1">
                  <Component className="w-3 h-3" />
                  <span>Components</span>
                  {componentEdits.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {componentEdits.length}
                    </Badge>
                  )}
                  </TabsTrigger>
                
                  <TabsTrigger value="layout" className="flex items-center gap-1">
                  <Layout className="w-3 h-3" />
                  <span>Layout</span>
                  {runtimeStyles.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {totalChanges}
                    </Badge>
                  )}
                  </TabsTrigger>
                
                  <TabsTrigger value="diff" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Diff</span>
                  {totalChanges > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {totalChanges}
                    </Badge>
                  )}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="tokens" className="h-full m-0 p-4 overflow-auto">
                  <ToolTokensTab />
                </TabsContent>
                
                <TabsContent value="components" className="h-full m-0 p-4 overflow-auto">
                  <ToolComponentsTab />
                </TabsContent>
                
                <TabsContent value="layout" className="h-full m-0 p-4 overflow-auto">
                  <ToolLayoutTab />
                </TabsContent>
                
                <TabsContent value="diff" className="h-full m-0 p-4 overflow-auto">
                  <ToolDiffTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        )}
        
        {/* Minimized State */}
        {isMinimized && (
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Theme Tweaker</span>
                {totalChanges > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalChanges}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {totalChanges > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleSave}>
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExport}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Resize handle */}
      {!isMinimized && !isMaximized && (
        <div
          className="absolute top-0 bottom-0 left-0 w-1 cursor-col-resize hover:bg-white/10"
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
          }}
          aria-label="Resize panel"
          role="separator"
          title="Drag to resize"
        />
      )}
    </div>
  );
}