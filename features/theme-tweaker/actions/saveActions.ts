/**
 * Save and export actions for ThemeTweaker
 * Integrates file patching and export utilities with the store
 */

import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { FilePatcher, PatchResult, FileChange } from '../io/codemods/filePatcher';
import { ThemeExporter, CSSTokenExporter, ComponentStyleExporter, ExportOptions, ExportResult } from '../io/exporters/cssExporter';
import { toast } from 'sonner';

export interface SaveOptions {
  includeTokens?: boolean;
  includeComponents?: boolean;
  includeRuntime?: boolean;
  createBackup?: boolean;
}

export interface SaveResult {
  success: boolean;
  patchResults: PatchResult[];
  error?: string;
}

/**
 * Handles saving theme changes to files
 */
export class SaveManager {
  /**
   * Saves all pending edits to their respective files
   */
  static async saveAllChanges(options: SaveOptions = {}): Promise<SaveResult> {
    const {
      includeTokens = true,
      includeComponents = true,
      includeRuntime = false, // Runtime changes are not saved to files by default
      createBackup = true
    } = options;

    try {
      const store = useThemeTweakerStore.getState();
      const { tokenEdits, componentEdits, runtimeEdits } = store;

      // Filter edits based on options
      const tokensToSave = includeTokens ? tokenEdits : [];
      const componentsToSave = includeComponents ? componentEdits : [];
      const runtimeToSave = includeRuntime ? runtimeEdits : [];

      if (tokensToSave.length === 0 && componentsToSave.length === 0 && runtimeToSave.length === 0) {
        toast.info('No changes to save');
        return {
          success: true,
          patchResults: []
        };
      }

      // Create backup if requested
      if (createBackup) {
        await this.createBackup();
      }

      // Apply file patches
      const patchResults = await FilePatcher.applyAllEdits(
        tokensToSave,
        componentsToSave,
        runtimeToSave
      );

      // Check for any failures
      const failures = patchResults.filter(result => !result.success);
      if (failures.length > 0) {
        const errorMessage = `Failed to save ${failures.length} file(s): ${failures.map(f => f.error).join(', ')}`;
        toast.error(errorMessage);
        return {
          success: false,
          patchResults,
          error: errorMessage
        };
      }

      // Clear saved edits from store
      store.clearSavedEdits(tokensToSave, componentsToSave, runtimeToSave);

      // Show success message
      const totalChanges = patchResults.reduce((sum, result) => sum + result.changes.length, 0);
      toast.success(`Successfully saved ${totalChanges} change(s) to ${patchResults.length} file(s)`);

      return {
        success: true,
        patchResults
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Save failed: ${errorMessage}`);
      return {
        success: false,
        patchResults: [],
        error: errorMessage
      };
    }
  }

  /**
   * Creates a backup of the current theme state
   */
  private static async createBackup(): Promise<void> {
    try {
      const store = useThemeTweakerStore.getState();
      const { tokenEdits, componentEdits, runtimeEdits } = store;

      const backupData = {
        timestamp: new Date().toISOString(),
        tokens: tokenEdits,
        components: componentEdits,
        runtime: runtimeEdits
      };

      // Store backup in localStorage
      const backupKey = `themetweaker-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // Keep only the last 10 backups
      this.cleanupOldBackups();
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  /**
   * Cleans up old backups, keeping only the most recent 10
   */
  private static cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('themetweaker-backup-'))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('-').pop() || '0');
          const timestampB = parseInt(b.split('-').pop() || '0');
          return timestampB - timestampA; // Sort descending (newest first)
        });

      // Remove old backups beyond the limit
      const maxBackups = 10;
      if (backupKeys.length > maxBackups) {
        const keysToRemove = backupKeys.slice(maxBackups);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Restores theme state from a backup
   */
  static async restoreFromBackup(backupKey: string): Promise<boolean> {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        toast.error('Backup not found');
        return false;
      }

      const parsed = JSON.parse(backupData);
      const store = useThemeTweakerStore.getState();

      // Restore edits to store
      store.setTokenEdits(parsed.tokens || []);
      store.setComponentEdits(parsed.components || []);
      store.setRuntimeEdits(parsed.runtime || []);

      toast.success('Theme restored from backup');
      return true;
    } catch (error) {
      toast.error('Failed to restore backup');
      return false;
    }
  }

  /**
   * Lists available backups
   */
  static getAvailableBackups(): Array<{ key: string; timestamp: string; size: number }> {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith('themetweaker-backup-'))
        .map(key => {
          const data = localStorage.getItem(key);
          const parsed = data ? JSON.parse(data) : null;
          return {
            key,
            timestamp: parsed?.timestamp || 'Unknown',
            size: data?.length || 0
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.warn('Failed to get available backups:', error);
      return [];
    }
  }
}

/**
 * Handles exporting theme changes in various formats
 */
export class ExportManager {
  /**
   * Exports all pending changes as CSS
   */
  static async exportAsCSS(options: ExportOptions = {}): Promise<ExportResult> {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;

    const result = ThemeExporter.exportCompleteTheme(
      tokenEdits,
      componentEdits,
      runtimeEdits,
      { format: 'css', ...options }
    );

    toast.success('Theme exported as CSS');
    return result;
  }

  /**
   * Exports tokens only as CSS custom properties
   */
  static async exportTokensAsCSS(options: ExportOptions = {}): Promise<ExportResult> {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits } = store;

    const result = CSSTokenExporter.exportTokens(tokenEdits, { format: 'css', ...options });
    toast.success('Tokens exported as CSS');
    return result;
  }

  /**
   * Exports components only as CSS classes
   */
  static async exportComponentsAsCSS(options: ExportOptions = {}): Promise<ExportResult> {
    const store = useThemeTweakerStore.getState();
    const { componentEdits } = store;

    const result = ComponentStyleExporter.exportComponents(componentEdits, { format: 'css', ...options });
    toast.success('Components exported as CSS');
    return result;
  }

  /**
   * Exports all changes as JSON
   */
  static async exportAsJSON(options: ExportOptions = {}): Promise<ExportResult> {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;

    const result = ThemeExporter.exportCompleteTheme(
      tokenEdits,
      componentEdits,
      runtimeEdits,
      { format: 'json', ...options }
    );

    toast.success('Theme exported as JSON');
    return result;
  }

  /**
   * Exports all changes as TypeScript
   */
  static async exportAsTypeScript(options: ExportOptions = {}): Promise<ExportResult> {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;

    const result = ThemeExporter.exportCompleteTheme(
      tokenEdits,
      componentEdits,
      runtimeEdits,
      { format: 'ts', ...options }
    );

    toast.success('Theme exported as TypeScript');
    return result;
  }

  /**
   * Downloads an export result as a file
   */
  static downloadExport(exportResult: ExportResult): void {
    ThemeExporter.downloadExport(exportResult);
    toast.success(`Downloaded ${exportResult.filename}`);
  }

  /**
   * Copies an export result to clipboard
   */
  static async copyToClipboard(exportResult: ExportResult): Promise<boolean> {
    const success = await ThemeExporter.copyToClipboard(exportResult);
    if (success) {
      toast.success('Copied to clipboard');
    } else {
      toast.error('Failed to copy to clipboard');
    }
    return success;
  }
}

/**
 * Handles generating diff previews
 */
export class DiffManager {
  /**
   * Generates a preview of all pending changes
   */
  static async generateDiffPreview(): Promise<FileChange[]> {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;

    return FilePatcher.generateDiffPreview(tokenEdits, componentEdits, runtimeEdits);
  }

  /**
   * Generates a human-readable summary of changes
   */
  static generateChangeSummary(): string {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;

    const totalChanges = tokenEdits.length + componentEdits.length + runtimeEdits.length;
    
    if (totalChanges === 0) {
      return 'No pending changes';
    }

    const parts: string[] = [];
    
    if (tokenEdits.length > 0) {
      parts.push(`${tokenEdits.length} token${tokenEdits.length === 1 ? '' : 's'}`);
    }
    
    if (componentEdits.length > 0) {
      parts.push(`${componentEdits.length} component${componentEdits.length === 1 ? '' : 's'}`);
    }
    
    if (runtimeEdits.length > 0) {
      parts.push(`${runtimeEdits.length} runtime style${runtimeEdits.length === 1 ? '' : 's'}`);
    }

    return `${totalChanges} pending change${totalChanges === 1 ? '' : 's'}: ${parts.join(', ')}`;
  }

  /**
   * Resets all pending changes
   */
  static resetAllChanges(): void {
    const store = useThemeTweakerStore.getState();
    store.clearAllEdits();
    toast.success('All changes have been reset');
  }

  /**
   * Resets specific types of changes
   */
  static resetChanges(types: Array<'tokens' | 'components' | 'runtime'>): void {
    const store = useThemeTweakerStore.getState();
    
    if (types.includes('tokens')) {
      store.setTokenEdits([]);
    }
    
    if (types.includes('components')) {
      store.setComponentEdits([]);
    }
    
    if (types.includes('runtime')) {
      store.setRuntimeEdits([]);
    }

    const resetTypes = types.join(', ');
    toast.success(`Reset ${resetTypes} changes`);
  }
}

/**
 * Utility functions for save/export operations
 */
export class SaveExportUtils {
  /**
   * Validates that there are changes to save/export
   */
  static hasChanges(): boolean {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;
    return tokenEdits.length > 0 || componentEdits.length > 0 || runtimeEdits.length > 0;
  }

  /**
   * Gets the total number of pending changes
   */
  static getChangeCount(): number {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;
    return tokenEdits.length + componentEdits.length + runtimeEdits.length;
  }

  /**
   * Gets a breakdown of changes by type
   */
  static getChangeBreakdown(): { tokens: number; components: number; runtime: number } {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;
    
    return {
      tokens: tokenEdits.length,
      components: componentEdits.length,
      runtime: runtimeEdits.length
    };
  }

  /**
   * Estimates the impact of changes (file count, line count, etc.)
   */
  static estimateChangeImpact(): { files: number; estimatedLines: number } {
    const store = useThemeTweakerStore.getState();
    const { tokenEdits, componentEdits, runtimeEdits } = store;
    
    // Estimate number of files that will be affected
    const tokenFiles = new Set(tokenEdits.map(() => 'globals.css')); // Simplified
    const componentFiles = new Set(componentEdits.map(edit => edit.selector)); // Simplified
    const totalFiles = tokenFiles.size + componentFiles.size;
    
    // Estimate lines of code changes
    const estimatedLines = tokenEdits.length + componentEdits.length + runtimeEdits.length;
    
    return {
      files: totalFiles,
      estimatedLines
    };
  }
}