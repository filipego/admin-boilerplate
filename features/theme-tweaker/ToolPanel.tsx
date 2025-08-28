'use client';

import { useState } from 'react';
import { X, Palette, Component, Layout, FileText } from 'lucide-react';
import { useThemeTweakerStore } from './store/useThemeTweakerStore';
import { ToolTokensTab } from './tabs/ToolTokensTab';
import { ToolComponentsTab } from './tabs/ToolComponentsTab';
import { ToolLayoutTab } from './tabs/ToolLayoutTab';
import { ToolDiffTab } from './tabs/ToolDiffTab';

export const ToolPanel: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setToolOpen,
    tokenEdits,
    componentEdits,
    runtimeStyles
  } = useThemeTweakerStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 450;
    const raw = window.localStorage.getItem('tt-legacy-panel-width');
    const val = raw ? parseInt(raw, 10) : 450;
    return Number.isNaN(val) ? 450 : val;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;
    const onMove = (ev: MouseEvent) => {
      const dx = startX - ev.clientX;
      const next = Math.max(350, Math.min(900, startWidth + dx));
      setPanelWidth(next);
      document.body.style.cursor = 'col-resize';
      (document.body as any).style.userSelect = 'none';
    };
    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      (document.body as any).style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('tt-legacy-panel-width', String(panelWidth));
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  
  const handleClose = () => {
    setToolOpen(false);
  };

  const tabs = [
    {
      id: 'tokens' as const,
      label: 'Tokens',
      icon: Palette,
      badge: tokenEdits.length > 0 ? tokenEdits.length : undefined,
    },
    {
      id: 'components' as const,
      label: 'Components',
      icon: Component,
      badge: componentEdits.length > 0 ? componentEdits.length : undefined,
    },
    {
      id: 'layout' as const,
      label: 'Layout',
      icon: Layout,
      badge: undefined,
    },
    {
      id: 'diff' as const,
      label: 'Diff',
      icon: FileText,
      badge: (tokenEdits.length + componentEdits.length) > 0 ? (tokenEdits.length + componentEdits.length) : undefined,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={handleClose} />
      
      {/* Modal Panel */}
      <div
        data-theme-tweaker-ui
        className={`fixed top-4 right-4 bottom-4 bg-[#774DFF] dark:bg-[#5E3AD8] border border-[#774DFF] dark:border-[#5E3AD8] rounded-lg shadow-xl z-[9999] flex flex-col min-h-0 ${isResizing ? 'cursor-col-resize select-none' : ''}`}
        style={{ width: panelWidth }}
      >
      {/* Header */}
      <div className="relative flex items-center justify-between p-3 sm:p-4 border-b border-transparent bg-[#774DFF] dark:bg-[#5E3AD8]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            ThemeTweaker
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Close Panel"
        >
          <X size={20} />
        </button>
        <div onMouseDown={handleResizeMouseDown} role="separator" aria-orientation="vertical" aria-label="Resize panel" className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-white/10" title="Drag to resize" />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-1 sm:px-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 text-sm font-medium transition-colors relative min-w-[80px] sm:min-w-[120px] justify-center whitespace-nowrap
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/50' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.slice(0, 3)}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden p-3 sm:p-4 md:p-6">
        <div className="h-full overflow-y-auto">
          {activeTab === 'tokens' && <ToolTokensTab />}
          {activeTab === 'components' && <ToolComponentsTab />}
          {activeTab === 'layout' && <ToolLayoutTab />}
          {activeTab === 'diff' && <ToolDiffTab />}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {runtimeStyles.length} runtime {runtimeStyles.length === 1 ? 'style' : 'styles'}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Preview
          </span>
        </div>
      </div>
    </div>
    </>
  );
};
