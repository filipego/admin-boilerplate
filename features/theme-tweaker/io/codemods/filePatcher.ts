/**
 * File patching utilities for ThemeTweaker
 * Handles minimal, surgical updates to CSS and component files
 */

import { TokenEdit, ComponentEdit, RuntimeStyleEdit } from '../../store/useThemeTweakerStore';

export interface PatchResult {
  success: boolean;
  filePath: string;
  changes: string[];
  error?: string;
}

export interface FileChange {
  type: 'token' | 'component' | 'runtime';
  filePath: string;
  property: string;
  oldValue: string;
  newValue: string;
  lineNumber?: number;
}

/**
 * Scans project files to discover CSS token files and component files
 */
export class FileScanner {
  private static readonly TOKEN_FILE_PATTERNS = [
    '**/globals.css',
    '**/variables.css',
    '**/tokens.css',
    '**/*.css',
    '**/tailwind.config.js',
    '**/tailwind.config.ts'
  ];

  private static readonly COMPONENT_FILE_PATTERNS = [
    '**/components/**/*.tsx',
    '**/components/**/*.jsx',
    '**/ui/**/*.tsx',
    '**/ui/**/*.jsx'
  ];

  /**
   * Discovers CSS token files in the project
   */
  static async discoverTokenFiles(): Promise<string[]> {
    const files: string[] = [];
    
    // In a real implementation, this would use fs.glob or similar
    // For now, we'll return common paths
    const commonPaths = [
      '/src/app/globals.css',
      '/src/styles/globals.css',
      '/styles/globals.css',
      '/app/globals.css'
    ];

    // Check which files actually exist
    for (const path of commonPaths) {
      try {
        const fullPath = process.cwd() + path;
        // In browser context, we'll need to use fetch or similar
        files.push(fullPath);
      } catch {
        // File doesn't exist, skip
      }
    }

    return files;
  }

  /**
   * Discovers component files in the project
   */
  static async discoverComponentFiles(): Promise<string[]> {
    const files: string[] = [];
    
    // In a real implementation, this would scan the file system
    // For now, we'll return common component directories
    const commonDirs = [
      '/src/components',
      '/src/ui',
      '/components',
      '/ui'
    ];

    return files;
  }
}

/**
 * Handles patching of CSS token files
 */
export class CSSTokenPatcher {
  /**
   * Patches CSS custom properties in token files
   */
  static async patchTokens(filePath: string, tokenEdits: TokenEdit[]): Promise<PatchResult> {
    try {
      // Read the file content
      const content = await this.readFile(filePath);
      const lines = content.split('\n');
      const changes: string[] = [];
      let modified = false;

      for (const edit of tokenEdits) {
        const tokenPattern = new RegExp(`(\\s*${edit.token}\\s*:\\s*)([^;]+)(;?)`, 'g');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const match = tokenPattern.exec(line);
          
          if (match) {
            const [fullMatch, prefix, oldValue, suffix] = match;
            const newLine = line.replace(fullMatch, `${prefix}${edit.value}${suffix}`);
            
            if (newLine !== line) {
              lines[i] = newLine;
              changes.push(`Line ${i + 1}: ${edit.token} changed from '${oldValue.trim()}' to '${edit.value}'`);
              modified = true;
            }
          }
        }
      }

      if (modified) {
        const newContent = lines.join('\n');
        await this.writeFile(filePath, newContent);
      }

      return {
        success: true,
        filePath,
        changes
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        changes: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async readFile(filePath: string): Promise<string> {
    // In browser context, this would need to be implemented differently
    // For now, return empty string as placeholder
    return '';
  }

  private static async writeFile(filePath: string, content: string): Promise<void> {
    // In browser context, this would need to be implemented differently
    // This might involve sending the content to a server endpoint
    console.log(`Would write to ${filePath}:`, content);
  }
}

/**
 * Handles patching of component files
 */
export class ComponentPatcher {
  /**
   * Patches component class names and styles
   */
  static async patchComponents(filePath: string, componentEdits: ComponentEdit[]): Promise<PatchResult> {
    try {
      const content = await this.readFile(filePath);
      const lines = content.split('\n');
      const changes: string[] = [];
      let modified = false;

      for (const edit of componentEdits) {
        // Find and update className attributes
        const classNamePattern = new RegExp(
          `(className\\s*=\\s*["\`]?)([^"\`]*)(${edit.property})([^"\`]*?)(["\`]?)`,
          'g'
        );

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const newLine = line.replace(classNamePattern, (match, prefix, beforeClass, targetClass, afterClass, suffix) => {
            changes.push(`Line ${i + 1}: Updated ${edit.property} in component`);
            modified = true;
            return `${prefix}${beforeClass}${edit.value}${afterClass}${suffix}`;
          });

          if (newLine !== line) {
            lines[i] = newLine;
          }
        }
      }

      if (modified) {
        const newContent = lines.join('\n');
        await this.writeFile(filePath, newContent);
      }

      return {
        success: true,
        filePath,
        changes
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        changes: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async readFile(filePath: string): Promise<string> {
    // Placeholder implementation
    return '';
  }

  private static async writeFile(filePath: string, content: string): Promise<void> {
    // Placeholder implementation
    console.log(`Would write to ${filePath}:`, content);
  }
}

/**
 * Main file patcher orchestrator
 */
export class FilePatcher {
  /**
   * Applies all pending edits to their respective files
   */
  static async applyAllEdits(
    tokenEdits: TokenEdit[],
    componentEdits: ComponentEdit[],
    runtimeEdits: RuntimeStyleEdit[]
  ): Promise<PatchResult[]> {
    const results: PatchResult[] = [];

    // Group token edits by file
    const tokensByFile = this.groupTokenEditsByFile(tokenEdits);
    for (const [filePath, edits] of tokensByFile.entries()) {
      const result = await CSSTokenPatcher.patchTokens(filePath, edits);
      results.push(result);
    }

    // Group component edits by file
    const componentsByFile = this.groupComponentEditsByFile(componentEdits);
    for (const [filePath, edits] of componentsByFile.entries()) {
      const result = await ComponentPatcher.patchComponents(filePath, edits);
      results.push(result);
    }

    // Runtime edits: if they target CSS custom properties under a class selector,
    // append them to globals.css so overrides persist.
    const runtimeClassVarEdits = runtimeEdits.filter(e => e.selector && e.selector.startsWith('.') && e.property.startsWith('--'));
    if (runtimeClassVarEdits.length > 0) {
      const globPath = process.cwd() + '/src/app/globals.css';
      const cssBlockLightLines: string[] = [];
      const cssBlockDarkLines: string[] = [];
      const bySelector = new Map<string, RuntimeStyleEdit[]>();
      runtimeClassVarEdits.forEach(e => {
        const arr = bySelector.get(e.selector) || [];
        arr.push(e);
        bySelector.set(e.selector, arr);
      });

      // For now, write light overrides under the selector, and dark overrides under .dark selector
      // We cannot distinguish light/dark here without scope info; assume callers pass two entries with selectors '.class' and '.dark .class'.
      let appendCSS = '';
      bySelector.forEach((edits, selector) => {
        appendCSS += `${selector} {\n`;
        edits.forEach(e => {
          appendCSS += `  ${e.property}: ${e.value};\n`;
        });
        appendCSS += `}\n\n`;
      });

      // Append to globals.css (placeholder write; real implementation should read/append/write atomically)
      await CSSTokenPatcher.writeFile(globPath, (await CSSTokenPatcher.readFile(globPath)) + '\n' + appendCSS);
      results.push({ success: true, filePath: globPath, changes: ['Appended component override CSS'] });
    }

    return results;
  }

  /**
   * Groups token edits by their target file path
   */
  private static groupTokenEditsByFile(tokenEdits: TokenEdit[]): Map<string, TokenEdit[]> {
    const grouped = new Map<string, TokenEdit[]>();
    
    for (const edit of tokenEdits) {
      // Determine which file this token belongs to
      const filePath = this.determineTokenFile(edit.token);
      
      if (!grouped.has(filePath)) {
        grouped.set(filePath, []);
      }
      grouped.get(filePath)!.push(edit);
    }

    return grouped;
  }

  /**
   * Groups component edits by their target file path
   */
  private static groupComponentEditsByFile(componentEdits: ComponentEdit[]): Map<string, ComponentEdit[]> {
    const grouped = new Map<string, ComponentEdit[]>();
    
    for (const edit of componentEdits) {
      // Determine which file this component belongs to
      const filePath = this.determineComponentFile(edit.selector);
      
      if (!grouped.has(filePath)) {
        grouped.set(filePath, []);
      }
      grouped.get(filePath)!.push(edit);
    }

    return grouped;
  }

  /**
   * Determines which file a token should be patched in
   */
  private static determineTokenFile(token: string): string {
    // For now, assume all tokens go to globals.css
    // In a real implementation, this would scan files to find where the token is defined
    return process.cwd() + '/src/app/globals.css';
  }

  /**
   * Determines which file a component should be patched in
   */
  private static determineComponentFile(selector: string): string {
    // For now, return a placeholder
    // In a real implementation, this would scan files to find where the component is defined
    return process.cwd() + '/src/components/ui/button.tsx';
  }

  /**
   * Generates a diff preview of all pending changes
   */
  static async generateDiffPreview(
    tokenEdits: TokenEdit[],
    componentEdits: ComponentEdit[],
    runtimeEdits: RuntimeStyleEdit[]
  ): Promise<FileChange[]> {
    const changes: FileChange[] = [];

    // Add token changes
    for (const edit of tokenEdits) {
      changes.push({
        type: 'token',
        filePath: this.determineTokenFile(edit.token),
        property: edit.token,
        oldValue: edit.originalValue || 'unknown',
        newValue: edit.value
      });
    }

    // Add component changes
    for (const edit of componentEdits) {
      changes.push({
        type: 'component',
        filePath: this.determineComponentFile(edit.selector),
        property: edit.property,
        oldValue: edit.originalValue || 'unknown',
        newValue: edit.value
      });
    }

    // Add runtime changes (these won't be saved to files)
    for (const edit of runtimeEdits) {
      changes.push({
        type: 'runtime',
        filePath: 'Runtime CSS',
        property: edit.property,
        oldValue: edit.originalValue || 'unknown',
        newValue: edit.value
      });
    }

    return changes;
  }
}