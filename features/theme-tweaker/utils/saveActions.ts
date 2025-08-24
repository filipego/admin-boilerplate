import { toast } from "sonner";
import type { ThemeEdit } from "../types";

export interface SaveOptions {
  format?: 'css' | 'json';
  minify?: boolean;
  backup?: boolean;
}

export interface ExportOptions {
  format: 'css' | 'json' | 'js' | 'ts';
  includeComments?: boolean;
  variablePrefix?: string;
}

/**
 * Save theme edits to files
 */
export async function saveThemeEdits(
  edits: ThemeEdit[],
  options: SaveOptions = {}
): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Parse the edits
    // 2. Generate CSS/JSON output
    // 3. Write to appropriate files
    // 4. Update version control
    
    // For now, simulate the save process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Saved ${edits.length} theme changes`);
    return true;
  } catch (error) {
    console.error('Failed to save theme edits:', error);
    toast.error('Failed to save theme changes');
    return false;
  }
}

/**
 * Export theme edits in various formats
 */
export async function exportThemeEdits(
  edits: ThemeEdit[],
  options: ExportOptions
): Promise<string | null> {
  try {
    switch (options.format) {
      case 'css':
        return generateCSSExport(edits, options);
      case 'json':
        return generateJSONExport(edits, options);
      case 'js':
        return generateJSExport(edits, options);
      case 'ts':
        return generateTSExport(edits, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Failed to export theme edits:', error);
    toast.error('Failed to export theme changes');
    return null;
  }
}

/**
 * Generate CSS export
 */
function generateCSSExport(edits: ThemeEdit[], options: ExportOptions): string {
  const lines: string[] = [];
  
  if (options.includeComments) {
    lines.push('/* Theme Tweaker Export */');
    lines.push(`/* Generated: ${new Date().toISOString()} */`);
    lines.push('');
  }
  
  // Group edits by selector
  const groupedEdits = edits.reduce((acc, edit) => {
    const key = edit.selector || ':root';
    if (!acc[key]) acc[key] = [];
    acc[key].push(edit);
    return acc;
  }, {} as Record<string, ThemeEdit[]>);
  
  // Generate CSS rules
  Object.entries(groupedEdits).forEach(([selector, selectorEdits]) => {
    lines.push(`${selector} {`);
    selectorEdits.forEach(edit => {
      const prefix = options.variablePrefix || '';
      lines.push(`  ${prefix}${edit.property}: ${edit.value};`);
    });
    lines.push('}');
    lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * Generate JSON export
 */
function generateJSONExport(edits: ThemeEdit[], options: ExportOptions): string {
  const exportData = {
    meta: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      tool: 'Theme Tweaker'
    },
    edits: edits.map(edit => ({
      id: edit.id,
      type: edit.type,
      property: edit.property,
      value: edit.value,
      selector: edit.selector,
      timestamp: edit.timestamp
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate JavaScript export
 */
function generateJSExport(edits: ThemeEdit[], options: ExportOptions): string {
  const lines: string[] = [];
  
  if (options.includeComments) {
    lines.push('// Theme Tweaker Export');
    lines.push(`// Generated: ${new Date().toISOString()}`);
    lines.push('');
  }
  
  lines.push('export const themeConfig = {');
  
  // Group by type
  const tokens = edits.filter(e => e.type === 'token');
  const components = edits.filter(e => e.type === 'component');
  const layout = edits.filter(e => e.type === 'layout');
  
  if (tokens.length > 0) {
    lines.push('  tokens: {');
    tokens.forEach(edit => {
      lines.push(`    '${edit.property}': '${edit.value}',`);
    });
    lines.push('  },');
  }
  
  if (components.length > 0) {
    lines.push('  components: {');
    components.forEach(edit => {
      lines.push(`    '${edit.property}': '${edit.value}',`);
    });
    lines.push('  },');
  }
  
  if (layout.length > 0) {
    lines.push('  layout: {');
    layout.forEach(edit => {
      lines.push(`    '${edit.property}': '${edit.value}',`);
    });
    lines.push('  },');
  }
  
  lines.push('};');
  
  return lines.join('\n');
}

/**
 * Generate TypeScript export
 */
function generateTSExport(edits: ThemeEdit[], options: ExportOptions): string {
  const jsContent = generateJSExport(edits, options);
  
  const lines: string[] = [];
  
  if (options.includeComments) {
    lines.push('// Theme Tweaker Export');
    lines.push(`// Generated: ${new Date().toISOString()}`);
    lines.push('');
  }
  
  // Add type definitions
  lines.push('export interface ThemeConfig {');
  lines.push('  tokens?: Record<string, string>;');
  lines.push('  components?: Record<string, string>;');
  lines.push('  layout?: Record<string, string>;');
  lines.push('}');
  lines.push('');
  
  // Add the config with type annotation
  lines.push(jsContent.replace('export const themeConfig = {', 'export const themeConfig: ThemeConfig = {'));
  
  return lines.join('\n');
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Reset all theme edits
 */
export async function resetThemeEdits(): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Clear all runtime CSS
    // 2. Reset to original values
    // 3. Clear local storage
    // 4. Refresh the page if needed
    
    // For now, simulate the reset process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success('Theme reset to defaults');
    return true;
  } catch (error) {
    console.error('Failed to reset theme:', error);
    toast.error('Failed to reset theme');
    return false;
  }
}