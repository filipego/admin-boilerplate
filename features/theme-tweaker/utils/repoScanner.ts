'use client';

/**
 * Repo-agnostic scanning utilities to discover token files and components
 * without hardcoded paths. Works by analyzing the DOM and file patterns.
 */

export interface TokenFile {
  path: string;
  type: 'css' | 'scss' | 'js' | 'ts';
  tokens: CSSToken[];
}

export interface CSSToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'radius' | 'shadow' | 'font' | 'other';
  file: string;
  line?: number;
}

export interface ComponentInfo {
  selector: string;
  element: Element;
  dataUi: string;
  variants: string[];
  styles: ComponentStyle[];
}

export interface ComponentStyle {
  property: string;
  value: string;
  computed: string;
}

/**
 * Scans the DOM for CSS custom properties (tokens)
 */
export class TokenScanner {
  private static instance: TokenScanner;
  private cachedTokens: CSSToken[] | null = null;

  static getInstance(): TokenScanner {
    if (!TokenScanner.instance) {
      TokenScanner.instance = new TokenScanner();
    }
    return TokenScanner.instance;
  }

  /**
   * Discovers all CSS custom properties from computed styles
   */
  async scanTokens(): Promise<CSSToken[]> {
    if (this.cachedTokens) {
      return this.cachedTokens;
    }

    const tokens: CSSToken[] = [];
    const seenTokens = new Set<string>();

    try {
      // Get all stylesheets
      const stylesheets = Array.from(document.styleSheets);
      
      for (const stylesheet of stylesheets) {
        try {
          const rules = Array.from(stylesheet.cssRules || []);
          
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              const style = rule.style;
              
              // Extract custom properties from CSS rules
              for (let i = 0; i < style.length; i++) {
                const property = style.item(i);
                
                if (property.startsWith('--')) {
                  const value = style.getPropertyValue(property);
                  const tokenKey = `${property}:${value}`;
                  
                  if (!seenTokens.has(tokenKey)) {
                    seenTokens.add(tokenKey);
                    
                    tokens.push({
                      name: property,
                      value: value.trim(),
                      category: this.categorizeToken(property, value),
                      file: this.getStylesheetSource(stylesheet)
                    });
                  }
                }
              }
            }
          }
        } catch (e) {
          // Skip inaccessible stylesheets (CORS)
          continue;
        }
      }

      // Also scan computed styles from document root
      const rootStyles = getComputedStyle(document.documentElement);
      const rootProps = Array.from(rootStyles).filter(prop => prop.startsWith('--'));
      
      for (const property of rootProps) {
        const value = rootStyles.getPropertyValue(property);
        const tokenKey = `${property}:${value}`;
        
        if (!seenTokens.has(tokenKey)) {
          seenTokens.add(tokenKey);
          
          tokens.push({
            name: property,
            value: value.trim(),
            category: this.categorizeToken(property, value),
            file: 'computed-styles'
          });
        }
      }

      this.cachedTokens = tokens;
      return tokens;
    } catch (error) {
      console.error('Error scanning tokens:', error);
      return [];
    }
  }

  /**
   * Categorizes a token based on its name and value
   */
  private categorizeToken(name: string, value: string): CSSToken['category'] {
    const lowerName = name.toLowerCase();
    const lowerValue = value.toLowerCase();

    // Color tokens
    if (
      lowerName.includes('color') ||
      lowerName.includes('bg') ||
      lowerName.includes('border') ||
      lowerName.includes('text') ||
      lowerName.includes('brand') ||
      lowerValue.match(/^#[0-9a-f]{3,8}$/i) ||
      lowerValue.startsWith('rgb') ||
      lowerValue.startsWith('hsl') ||
      lowerValue.startsWith('oklch') ||
      lowerValue.match(/^(red|blue|green|yellow|purple|pink|gray|black|white)$/i)
    ) {
      return 'color';
    }

    // Spacing tokens
    if (
      lowerName.includes('space') ||
      lowerName.includes('gap') ||
      lowerName.includes('margin') ||
      lowerName.includes('padding') ||
      lowerName.includes('size') ||
      lowerValue.match(/^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/)
    ) {
      return 'spacing';
    }

    // Radius tokens
    if (
      lowerName.includes('radius') ||
      lowerName.includes('rounded') ||
      lowerName.includes('border-radius')
    ) {
      return 'radius';
    }

    // Shadow tokens
    if (
      lowerName.includes('shadow') ||
      lowerName.includes('elevation') ||
      lowerValue.includes('box-shadow')
    ) {
      return 'shadow';
    }

    // Font tokens
    if (
      lowerName.includes('font') ||
      lowerName.includes('text') ||
      lowerName.includes('letter') ||
      lowerName.includes('line')
    ) {
      return 'font';
    }

    return 'other';
  }

  /**
   * Gets the source file of a stylesheet
   */
  private getStylesheetSource(stylesheet: CSSStyleSheet): string {
    if (stylesheet.href) {
      return stylesheet.href.split('/').pop() || 'external';
    }
    
    if (stylesheet.ownerNode) {
      const node = stylesheet.ownerNode as HTMLElement;
      if (node.id) {
        return `#${node.id}`;
      }
      if (node.getAttribute('data-source')) {
        return node.getAttribute('data-source') || 'inline';
      }
    }
    
    return 'inline';
  }

  /**
   * Clears the token cache
   */
  clearCache(): void {
    this.cachedTokens = null;
  }
}

/**
 * Scans the DOM for components with data-ui attributes
 */
export class ComponentScanner {
  private static instance: ComponentScanner;
  private cachedComponents: ComponentInfo[] | null = null;

  static getInstance(): ComponentScanner {
    if (!ComponentScanner.instance) {
      ComponentScanner.instance = new ComponentScanner();
    }
    return ComponentScanner.instance;
  }

  /**
   * Discovers all components with data-ui attributes
   */
  async scanComponents(): Promise<ComponentInfo[]> {
    if (this.cachedComponents) {
      return this.cachedComponents;
    }

    try {
      const components: ComponentInfo[] = [];
      const elements = document.querySelectorAll('[data-ui]');

      for (const element of elements) {
        const dataUi = element.getAttribute('data-ui');
        if (!dataUi) continue;

        const componentInfo: ComponentInfo = {
          selector: this.generateSelector(element),
          element,
          dataUi,
          variants: this.extractVariants(element),
          styles: this.extractStyles(element)
        };

        components.push(componentInfo);
      }

      this.cachedComponents = components;
      return components;
    } catch (error) {
      console.error('Error scanning components:', error);
      return [];
    }
  }

  /**
   * Generates a CSS selector for an element
   */
  private generateSelector(element: Element): string {
    const dataUi = element.getAttribute('data-ui');
    if (dataUi) {
      return `[data-ui="${dataUi}"]`;
    }

    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    
    return `${tagName}${id}${classes}`;
  }

  /**
   * Extracts variant information from element classes
   */
  private extractVariants(element: Element): string[] {
    const variants: string[] = [];
    const classList = Array.from(element.classList);

    // Common variant patterns
    const variantPatterns = [
      /^(primary|secondary|tertiary|destructive|outline|ghost|link)$/,
      /^(sm|md|lg|xl)$/,
      /^(default|dark|light)$/,
      /^variant-(.+)$/
    ];

    for (const className of classList) {
      for (const pattern of variantPatterns) {
        if (pattern.test(className)) {
          variants.push(className);
          break;
        }
      }
    }

    return variants;
  }

  /**
   * Extracts relevant styles from an element
   */
  private extractStyles(element: Element): ComponentStyle[] {
    const styles: ComponentStyle[] = [];
    const computedStyle = getComputedStyle(element);

    // Key properties to extract
    const keyProperties = [
      'color',
      'background-color',
      'border-color',
      'border-width',
      'border-radius',
      'padding',
      'margin',
      'font-size',
      'font-weight',
      'line-height',
      'box-shadow',
      'opacity',
      'transform'
    ];

    for (const property of keyProperties) {
      const value = computedStyle.getPropertyValue(property);
      if (value && value !== 'none' && value !== 'normal') {
        styles.push({
          property,
          value: this.getOriginalValue(element, property) || value,
          computed: value
        });
      }
    }

    return styles;
  }

  /**
   * Attempts to get the original CSS value (before computation)
   */
  private getOriginalValue(element: Element, property: string): string | null {
    // Try to find the original value from inline styles or CSS custom properties
    const inlineStyle = (element as HTMLElement).style.getPropertyValue(property);
    if (inlineStyle) {
      return inlineStyle;
    }

    // Check if it's using a CSS custom property
    const computedValue = getComputedStyle(element).getPropertyValue(property);
    if (computedValue.includes('var(')) {
      return computedValue;
    }

    return null;
  }

  /**
   * Clears the component cache
   */
  clearCache(): void {
    this.cachedComponents = null;
  }
}

/**
 * File system scanner for discovering theme-related files
 * Note: This is limited in browser environment, mainly for reference
 */
export class FileScanner {
  /**
   * Discovers potential theme files based on common patterns
   */
  static async discoverThemeFiles(): Promise<TokenFile[]> {
    // In a browser environment, we can't directly scan the file system
    // This method serves as a reference for server-side scanning
    
    const potentialFiles: TokenFile[] = [];
    
    // Common theme file patterns to look for
    const themeFilePatterns = [
      'globals.css',
      'variables.css',
      'tokens.css',
      'theme.css',
      'colors.css',
      'spacing.css',
      'typography.css',
      'components.css'
    ];

    // In a real implementation, this would scan the project directory
    // For now, we return an empty array as file system access is limited
    
    return potentialFiles;
  }

  /**
   * Parses CSS content to extract tokens
   */
  static parseCSSTokens(cssContent: string, filePath: string): CSSToken[] {
    const tokens: CSSToken[] = [];
    const lines = cssContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const customPropertyMatch = line.match(/^(--[\w-]+):\s*([^;]+);?/);
      
      if (customPropertyMatch) {
        const [, name, value] = customPropertyMatch;
        
        tokens.push({
          name: name.trim(),
          value: value.trim(),
          category: TokenScanner.getInstance()['categorizeToken'](name, value),
          file: filePath,
          line: i + 1
        });
      }
    }
    
    return tokens;
  }
}

/**
 * Main scanner orchestrator
 */
export class RepoScanner {
  private tokenScanner: TokenScanner;
  private componentScanner: ComponentScanner;

  constructor() {
    this.tokenScanner = TokenScanner.getInstance();
    this.componentScanner = ComponentScanner.getInstance();
  }

  /**
   * Performs a full scan of tokens and components
   */
  async fullScan(): Promise<{
    tokens: CSSToken[];
    components: ComponentInfo[];
  }> {
    const [tokens, components] = await Promise.all([
      this.tokenScanner.scanTokens(),
      this.componentScanner.scanComponents()
    ]);

    return { tokens, components };
  }

  /**
   * Clears all caches and rescans
   */
  async rescan(): Promise<{
    tokens: CSSToken[];
    components: ComponentInfo[];
  }> {
    this.tokenScanner.clearCache();
    this.componentScanner.clearCache();
    
    return this.fullScan();
  }

  /**
   * Finds component by element
   */
  async findComponentByElement(element: Element): Promise<ComponentInfo | null> {
    const components = await this.componentScanner.scanComponents();
    
    return components.find(component => 
      component.element === element
    ) || null;
  }

  /**
   * Gets scanner statistics
   */
  async getStats(): Promise<{
    tokenCount: number;
    componentCount: number;
    categories: Record<string, number>;
  }> {
    const { tokens, components } = await this.fullScan();
    
    const categories: Record<string, number> = {};
    for (const token of tokens) {
      categories[token.category] = (categories[token.category] || 0) + 1;
    }

    return {
      tokenCount: tokens.length,
      componentCount: components.length,
      categories
    };
  }
}