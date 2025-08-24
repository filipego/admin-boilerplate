'use client';

import React, { useState, useMemo } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Copy, 
  RotateCcw, 
  FileText, 
  Palette, 
  Layout, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { saveThemeEdits, exportThemeEdits, resetThemeEdits, downloadFile } from '../../utils/saveActions';
import { toast } from 'sonner';

interface DiffEntry {
  type: 'token' | 'component' | 'layout';
  key: string;
  originalValue: string;
  newValue: string;
  category?: string;
  file?: string;
}

export function ToolDiffTab() {
  const { 
    tokenEdits, 
    componentEdits, 
    layoutEdits,
    resetAllEdits,
    resetTokenEdit,
    resetComponentEdit,
    resetLayoutEdit
  } = useThemeTweakerStore();
  
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate diff entries from all edits
  const diffEntries = useMemo((): DiffEntry[] => {
    const entries: DiffEntry[] = [];

    // Token edits
    Object.entries(tokenEdits).forEach(([key, edit]) => {
      entries.push({
        type: 'token',
        key,
        originalValue: edit.originalValue,
        newValue: edit.value,
        category: edit.category
      });
    });

    // Component edits
    Object.entries(componentEdits).forEach(([key, edit]) => {
      entries.push({
        type: 'component',
        key,
        originalValue: edit.originalValue,
        newValue: edit.value,
        category: edit.property
      });
    });

    // Layout edits
    Object.entries(layoutEdits).forEach(([key, edit]) => {
      entries.push({
        type: 'layout',
        key,
        originalValue: edit.originalValue,
        newValue: edit.value,
        category: edit.breakpoint
      });
    });

    return entries;
  }, [tokenEdits, componentEdits, layoutEdits]);

  const totalChanges = diffEntries.length;
  const selectedCount = selectedChanges.size;

  // Group entries by type
  const groupedEntries = useMemo(() => {
    return {
      token: diffEntries.filter(entry => entry.type === 'token'),
      component: diffEntries.filter(entry => entry.type === 'component'),
      layout: diffEntries.filter(entry => entry.type === 'layout')
    };
  }, [diffEntries]);

  const handleSelectAll = () => {
    if (selectedCount === totalChanges) {
      setSelectedChanges(new Set());
    } else {
      setSelectedChanges(new Set(diffEntries.map(entry => `${entry.type}:${entry.key}`)));
    }
  };

  const handleSelectChange = (entryId: string, checked: boolean) => {
    const newSelected = new Set(selectedChanges);
    if (checked) {
      newSelected.add(entryId);
    } else {
      newSelected.delete(entryId);
    }
    setSelectedChanges(newSelected);
  };

  const handleResetSelected = async () => {
    try {
      for (const entryId of selectedChanges) {
        const [type, key] = entryId.split(':');
        
        switch (type) {
          case 'token':
            resetTokenEdit(key);
            break;
          case 'component':
            resetComponentEdit(key);
            break;
          case 'layout':
            resetLayoutEdit(key);
            break;
        }
      }
      
      setSelectedChanges(new Set());
      toast.success(`Reset ${selectedChanges.size} changes`);
    } catch (error) {
      toast.error('Failed to reset changes');
    }
  };

  const handleResetAll = async () => {
    try {
      resetAllEdits();
      setSelectedChanges(new Set());
      toast.success('Reset all changes');
    } catch (error) {
      toast.error('Failed to reset all changes');
    }
  };

  const handleExport = async (format: 'css' | 'json' | 'typescript') => {
    setIsExporting(true);
    try {
      // Convert store edits to ThemeEdit format
      const allEdits = [
        ...Object.entries(tokenEdits).map(([key, value]) => ({
          id: `token-${key}`,
          type: 'token' as const,
          property: key,
          value: value,
          selector: ':root',
          timestamp: Date.now()
        })),
        ...Object.entries(componentEdits).map(([key, value]) => ({
          id: `component-${key}`,
          type: 'component' as const,
          property: key,
          value: value,
          selector: undefined,
          timestamp: Date.now()
        })),
        ...Object.entries(layoutEdits).map(([key, value]) => ({
          id: `layout-${key}`,
          type: 'layout' as const,
          property: key,
          value: value,
          selector: undefined,
          timestamp: Date.now()
        }))
      ];
      
      const exportFormat = format === 'typescript' ? 'ts' : format;
      const content = await exportThemeEdits(allEdits, { format: exportFormat });
      
      if (content) {
        const filename = `theme-export.${exportFormat}`;
        downloadFile(content, filename);
        toast.success(`Exported ${totalChanges} changes as ${format.toUpperCase()}`);
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert store edits to ThemeEdit format
      const allEdits = [
        ...Object.entries(tokenEdits).map(([key, value]) => ({
          id: `token-${key}`,
          type: 'token' as const,
          property: key,
          value: value,
          selector: ':root',
          timestamp: Date.now()
        })),
        ...Object.entries(componentEdits).map(([key, value]) => ({
          id: `component-${key}`,
          type: 'component' as const,
          property: key,
          value: value,
          selector: undefined,
          timestamp: Date.now()
        })),
        ...Object.entries(layoutEdits).map(([key, value]) => ({
          id: `layout-${key}`,
          type: 'layout' as const,
          property: key,
          value: value,
          selector: undefined,
          timestamp: Date.now()
        }))
      ];
      
      const success = await saveThemeEdits(allEdits);
      
      if (success) {
        toast.success(`Saved ${totalChanges} changes to files`);
        resetAllEdits();
      } else {
        toast.error('Save failed');
      }
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCSS = async () => {
    try {
      // Convert store edits to ThemeEdit format
      const allEdits = [
        ...Object.entries(tokenEdits).map(([key, value]) => ({
          id: `token-${key}`,
          type: 'token' as const,
          property: key,
          value: value,
          selector: ':root',
          timestamp: Date.now()
        })),
        ...Object.entries(componentEdits).map(([key, value]) => ({
          id: `component-${key}`,
          type: 'component' as const,
          property: key,
          value: value,
          selector: undefined,
          timestamp: Date.now()
        })),
        ...Object.entries(layoutEdits).map(([key, value]) => ({
          id: `layout-${key}`,
          type: 'layout' as const,
          property: key,
          value: value,
          selector: undefined,
          timestamp: Date.now()
        }))
      ];
      
      const content = await exportThemeEdits(allEdits, { format: 'css' });
      
      if (content) {
        await navigator.clipboard.writeText(content);
        toast.success('CSS copied to clipboard');
      } else {
        toast.error('Failed to generate CSS');
      }
    } catch (error) {
      toast.error('Failed to copy CSS');
    }
  };

  const renderDiffEntry = (entry: DiffEntry) => {
    const entryId = `${entry.type}:${entry.key}`;
    const isSelected = selectedChanges.has(entryId);
    
    const getIcon = () => {
      switch (entry.type) {
        case 'token': return <Palette className="w-4 h-4" />;
        case 'component': return <FileText className="w-4 h-4" />;
        case 'layout': return <Layout className="w-4 h-4" />;
      }
    };

    return (
      <div key={entryId} className="flex items-start gap-3 p-3 border rounded-lg">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => handleSelectChange(entryId, e.target.checked)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getIcon()}
            <span className="font-medium text-sm">{entry.key}</span>
            <Badge variant="secondary" className="text-xs">
              {entry.type}
            </Badge>
            {entry.category && (
              <Badge variant="outline" className="text-xs">
                {entry.category}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">From:</span>
              <code className="bg-muted px-1 py-0.5 rounded text-red-600">
                {entry.originalValue}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">To:</span>
              <code className="bg-muted px-1 py-0.5 rounded text-green-600">
                {entry.newValue}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (totalChanges === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Changes Yet</h3>
        <p className="text-muted-foreground">
          Make some edits in the other tabs to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Theme Changes</h3>
          <p className="text-sm text-muted-foreground">
            {totalChanges} change{totalChanges !== 1 ? 's' : ''} pending
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-10"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedCount === totalChanges && totalChanges > 0}
            onChange={handleSelectAll}
          />
          <span className="text-sm">
            {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSelected}
              className="h-10"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset Selected
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="h-10"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCSS}
            className="h-10"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy CSS
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('css')}
            disabled={isExporting}
            className="h-10"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSS
          </Button>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Changes List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({totalChanges})
          </TabsTrigger>
          <TabsTrigger value="tokens">
            Tokens ({groupedEntries.token.length})
          </TabsTrigger>
          <TabsTrigger value="components">
            Components ({groupedEntries.component.length})
          </TabsTrigger>
          <TabsTrigger value="layout">
            Layout ({groupedEntries.layout.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-2">
            {diffEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No changes to display
              </div>
            ) : (
              diffEntries.map((entry) => renderDiffEntry(entry))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tokens" className="mt-4">
          <div className="space-y-2">
            {groupedEntries.token.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No token changes to display
              </div>
            ) : (
              groupedEntries.token.map((entry) => renderDiffEntry(entry))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="components" className="mt-4">
          <div className="space-y-2">
            {groupedEntries.component.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No component changes to display
              </div>
            ) : (
              groupedEntries.component.map((entry) => renderDiffEntry(entry))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="layout" className="mt-4">
          <div className="space-y-2">
            {groupedEntries.layout.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No layout changes to display
              </div>
            ) : (
              groupedEntries.layout.map((entry) => renderDiffEntry(entry))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}