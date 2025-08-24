/**
 * CSS export utilities for ThemeTweaker
 * Handles generation of CSS files, theme packages, and configuration exports
 */

import { TokenEdit, ComponentEdit, RuntimeStyleEdit } from '../../store/useThemeTweakerStore';

export interface ExportOptions {
  format: 'css' | 'scss' | 'json' | 'js' | 'ts';
  includeComments?: boolean;
  minify?: boolean;
  prefix?: string;
  scope?: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * Generates CSS custom properties from token edits
 */
export class CSSTokenExporter {
  /**
   * Exports token edits as CSS custom properties
   */
  static exportTokens(tokenEdits: TokenEdit[], options: ExportOptions = { format: 'css' }): ExportResult {
    const { format, includeComments = true, minify = false, prefix = '', scope = ':root' } = options;

    let content = '';
    const timestamp = new Date().toISOString();

    if (format === 'css') {
      if (includeComments && !minify) {
        content += `/* ThemeTweaker Generated Tokens */\n`;
        content += `/* Generated on: ${timestamp} */\n\n`;
      }

      content += `${scope} {\n`;
      
      for (const edit of tokenEdits) {
        const tokenName = prefix ? `${prefix}${edit.token}` : edit.token;
        const line = minify 
          ? `${tokenName}:${edit.value};`
          : `  ${tokenName}: ${edit.value};`;
        
        if (includeComments && !minify && edit.originalValue) {
          content += `  /* Original: ${edit.originalValue} */\n`;
        }
        
        content += line + (minify ? '' : '\n');
      }
      
      content += minify ? '}' : '}\n';
    } else if (format === 'scss') {
      if (includeComments && !minify) {
        content += `// ThemeTweaker Generated Tokens\n`;
        content += `// Generated on: ${timestamp}\n\n`;
      }

      for (const edit of tokenEdits) {
        const variableName = edit.token.replace('--', '$');
        const line = `${variableName}: ${edit.value};`;
        
        if (includeComments && !minify && edit.originalValue) {
          content += `// Original: ${edit.originalValue}\n`;
        }
        
        content += line + '\n';
      }
    } else if (format === 'json') {
      const tokens: Record<string, any> = {};
      
      for (const edit of tokenEdits) {
        const key = edit.token.replace('--', '');
        tokens[key] = {
          value: edit.value,
          originalValue: edit.originalValue,
          type: this.inferTokenType(edit.token, edit.value)
        };
      }
      
      content = JSON.stringify({
        meta: {
          generator: 'ThemeTweaker',
          timestamp,
          version: '1.0.0'
        },
        tokens
      }, null, minify ? 0 : 2);
    } else if (format === 'js' || format === 'ts') {
      const isTypeScript = format === 'ts';
      
      if (includeComments && !minify) {
        content += `// ThemeTweaker Generated Tokens\n`;
        content += `// Generated on: ${timestamp}\n\n`;
      }
      
      if (isTypeScript) {
        content += `export interface ThemeTokens {\n`;
        for (const edit of tokenEdits) {
          const key = edit.token.replace('--', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          content += `  ${key}: string;\n`;
        }
        content += `}\n\n`;
      }
      
      content += `export const themeTokens${isTypeScript ? ': ThemeTokens' : ''} = {\n`;
      
      for (const edit of tokenEdits) {
        const key = edit.token.replace('--', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        content += `  ${key}: '${edit.value}',\n`;
      }
      
      content += `};\n`;
    }

    return {
      content,
      filename: this.generateFilename('tokens', format),
      mimeType: this.getMimeType(format)
    };
  }

  /**
   * Infers the type of a token based on its name and value
   */
  private static inferTokenType(token: string, value: string): string {
    if (token.includes('color') || token.includes('brand') || value.match(/^#|rgb|hsl|oklch/)) {
      return 'color';
    }
    if (token.includes('space') || token.includes('gap') || token.includes('margin') || token.includes('padding')) {
      return 'spacing';
    }
    if (token.includes('radius') || token.includes('border-radius')) {
      return 'radius';
    }
    if (token.includes('shadow')) {
      return 'shadow';
    }
    if (token.includes('font') || token.includes('text')) {
      return 'typography';
    }
    return 'other';
  }

  private static generateFilename(type: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `themetweaker-${type}-${timestamp}.${format}`;
  }

  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      css: 'text/css',
      scss: 'text/scss',
      json: 'application/json',
      js: 'text/javascript',
      ts: 'text/typescript'
    };
    return mimeTypes[format] || 'text/plain';
  }
}

/**
 * Generates component styles from component edits
 */
export class ComponentStyleExporter {
  /**
   * Exports component edits as CSS classes
   */
  static exportComponents(componentEdits: ComponentEdit[], options: ExportOptions = { format: 'css' }): ExportResult {
    const { format, includeComments = true, minify = false, scope = '' } = options;

    let content = '';
    const timestamp = new Date().toISOString();

    if (format === 'css') {
      if (includeComments && !minify) {
        content += `/* ThemeTweaker Generated Component Styles */\n`;
        content += `/* Generated on: ${timestamp} */\n\n`;
      }

      // Group edits by selector
      const groupedEdits = this.groupEditsBySelector(componentEdits);
      
      for (const [selector, edits] of groupedEdits.entries()) {
        const fullSelector = scope ? `${scope} ${selector}` : selector;
        content += `${fullSelector} {\n`;
        
        for (const edit of edits) {
          const line = minify 
            ? `${edit.property}:${edit.value};`
            : `  ${edit.property}: ${edit.value};`;
          
          if (includeComments && !minify && edit.originalValue) {
            content += `  /* Original: ${edit.originalValue} */\n`;
          }
          
          content += line + (minify ? '' : '\n');
        }
        
        content += minify ? '}' : '}\n\n';
      }
    } else if (format === 'json') {
      const components: Record<string, any> = {};
      const groupedEdits = this.groupEditsBySelector(componentEdits);
      
      for (const [selector, edits] of groupedEdits.entries()) {
        components[selector] = {};
        
        for (const edit of edits) {
          components[selector][edit.property] = {
            value: edit.value,
            originalValue: edit.originalValue
          };
        }
      }
      
      content = JSON.stringify({
        meta: {
          generator: 'ThemeTweaker',
          timestamp,
          version: '1.0.0'
        },
        components
      }, null, minify ? 0 : 2);
    }

    return {
      content,
      filename: this.generateFilename('components', format),
      mimeType: this.getMimeType(format)
    };
  }

  private static groupEditsBySelector(edits: ComponentEdit[]): Map<string, ComponentEdit[]> {
    const grouped = new Map<string, ComponentEdit[]>();
    
    for (const edit of edits) {
      if (!grouped.has(edit.selector)) {
        grouped.set(edit.selector, []);
      }
      grouped.get(edit.selector)!.push(edit);
    }
    
    return grouped;
  }

  private static generateFilename(type: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `themetweaker-${type}-${timestamp}.${format}`;
  }

  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      css: 'text/css',
      scss: 'text/scss',
      json: 'application/json',
      js: 'text/javascript',
      ts: 'text/typescript'
    };
    return mimeTypes[format] || 'text/plain';
  }
}

/**
 * Main theme exporter that combines all edits
 */
export class ThemeExporter {
  /**
   * Exports a complete theme package with all edits
   */
  static exportCompleteTheme(
    tokenEdits: TokenEdit[],
    componentEdits: ComponentEdit[],
    runtimeEdits: RuntimeStyleEdit[],
    options: ExportOptions = { format: 'css' }
  ): ExportResult {
    const { format, includeComments = true, minify = false } = options;

    let content = '';
    const timestamp = new Date().toISOString();

    if (format === 'css') {
      if (includeComments && !minify) {
        content += `/* ThemeTweaker Complete Theme Export */\n`;
        content += `/* Generated on: ${timestamp} */\n`;
        content += `/* Tokens: ${tokenEdits.length}, Components: ${componentEdits.length}, Runtime: ${runtimeEdits.length} */\n\n`;
      }

      // Export tokens
      if (tokenEdits.length > 0) {
        const tokenResult = CSSTokenExporter.exportTokens(tokenEdits, { ...options, includeComments: false });
        content += tokenResult.content + '\n\n';
      }

      // Export components
      if (componentEdits.length > 0) {
        const componentResult = ComponentStyleExporter.exportComponents(componentEdits, { ...options, includeComments: false });
        content += componentResult.content + '\n\n';
      }

      // Export runtime styles
      if (runtimeEdits.length > 0) {
        if (includeComments && !minify) {
          content += `/* Runtime Styles */\n`;
        }
        
        for (const edit of runtimeEdits) {
          const selector = `[data-ui="${edit.selector}"]`;
          content += `${selector} {\n`;
          content += `  ${edit.property}: ${edit.value};\n`;
          content += `}\n\n`;
        }
      }
    } else if (format === 'json') {
      const theme = {
        meta: {
          generator: 'ThemeTweaker',
          timestamp,
          version: '1.0.0',
          stats: {
            tokens: tokenEdits.length,
            components: componentEdits.length,
            runtime: runtimeEdits.length
          }
        },
        tokens: {},
        components: {},
        runtime: {}
      };

      // Add tokens
      for (const edit of tokenEdits) {
        const key = edit.token.replace('--', '');
        (theme.tokens as any)[key] = {
          value: edit.value,
          originalValue: edit.originalValue
        };
      }

      // Add components
      const groupedComponents = ComponentStyleExporter.prototype.constructor.groupEditsBySelector(componentEdits);
      for (const [selector, edits] of groupedComponents.entries()) {
        (theme.components as any)[selector] = {};
        for (const edit of edits) {
          (theme.components as any)[selector][edit.property] = {
            value: edit.value,
            originalValue: edit.originalValue
          };
        }
      }

      // Add runtime styles
      for (const edit of runtimeEdits) {
        if (!(theme.runtime as any)[edit.selector]) {
          (theme.runtime as any)[edit.selector] = {};
        }
        (theme.runtime as any)[edit.selector][edit.property] = {
          value: edit.value,
          originalValue: edit.originalValue
        };
      }

      content = JSON.stringify(theme, null, minify ? 0 : 2);
    }

    return {
      content,
      filename: this.generateFilename('complete-theme', format),
      mimeType: this.getMimeType(format)
    };
  }

  /**
   * Downloads the exported content as a file
   */
  static downloadExport(exportResult: ExportResult): void {
    const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = exportResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Copies the exported content to clipboard
   */
  static async copyToClipboard(exportResult: ExportResult): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(exportResult.content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  private static generateFilename(type: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `themetweaker-${type}-${timestamp}.${format}`;
  }

  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      css: 'text/css',
      scss: 'text/scss',
      json: 'application/json',
      js: 'text/javascript',
      ts: 'text/typescript'
    };
    return mimeTypes[format] || 'text/plain';
  }
}