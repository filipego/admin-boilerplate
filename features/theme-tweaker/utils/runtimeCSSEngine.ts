'use client';

/**
 * RuntimeCSSEngine manages dynamic CSS injection for theme previews
 * Uses a single <style> tag with id="tt-runtime" for all runtime changes
 */
export class RuntimeCSSEngine {
  private styleElement: HTMLStyleElement | null = null;
  private currentCSS: string = '';
  private readonly styleId = 'tt-runtime';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeStyleElement();
    }
  }

  private initializeStyleElement(): void {
    // Remove existing style element if it exists
    const existing = document.getElementById(this.styleId);
    if (existing) {
      existing.remove();
    }

    // Create new style element
    this.styleElement = document.createElement('style');
    this.styleElement.id = this.styleId;
    this.styleElement.type = 'text/css';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Apply edits to the runtime CSS
   */
  applyEdits(edits: Record<string, any>): void {
    if (!this.styleElement) return;

    const css = this.generateCSS(edits);
    this.currentCSS = css;
    this.styleElement.textContent = css;
  }

  /**
   * Generate CSS from edits object
   */
  private generateCSS(edits: Record<string, any>): string {
    const cssRules: string[] = [];

    // Process token edits (CSS custom properties)
    Object.entries(edits).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        cssRules.push(`:root { ${key}: ${value}; }`);
      }
    });

    // Process component edits
    Object.entries(edits).forEach(([selector, styles]) => {
      if (!selector.startsWith('--') && typeof styles === 'object') {
        const styleDeclarations = Object.entries(styles)
          .map(([prop, val]) => `${this.kebabCase(prop)}: ${val}`)
          .join('; ');
        
        if (styleDeclarations) {
          cssRules.push(`${selector} { ${styleDeclarations}; }`);
        }
      }
    });

    return cssRules.join('\n');
  }

  /**
   * Convert camelCase to kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Clear all runtime CSS
   */
  clear(): void {
    if (this.styleElement) {
      this.styleElement.textContent = '';
      this.currentCSS = '';
    }
  }

  /**
   * Get current CSS content
   */
  getCurrentCSS(): string {
    return this.currentCSS;
  }

  /**
   * Destroy the runtime engine
   */
  destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    this.currentCSS = '';
  }

  /**
   * Apply a single CSS rule
   */
  applyRule(selector: string, property: string, value: string): void {
    if (!this.styleElement) return;

    const rule = `${selector} { ${property}: ${value}; }`;
    const existingCSS = this.currentCSS;
    
    // Simple rule replacement/addition
    const ruleRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 'g');
    
    if (ruleRegex.test(existingCSS)) {
      this.currentCSS = existingCSS.replace(ruleRegex, rule);
    } else {
      this.currentCSS = existingCSS + '\n' + rule;
    }
    
    this.styleElement.textContent = this.currentCSS;
  }

  /**
   * Remove a CSS rule
   */
  removeRule(selector: string): void {
    if (!this.styleElement) return;

    const ruleRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}\\s*`, 'g');
    this.currentCSS = this.currentCSS.replace(ruleRegex, '');
    this.styleElement.textContent = this.currentCSS;
  }
}