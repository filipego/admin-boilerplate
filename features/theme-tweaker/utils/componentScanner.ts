'use client';

import { ComponentScanner as RepoComponentScanner, ComponentInfo, ComponentStyle } from './repoScanner';

/**
 * Component scanning utilities for discovering components with data-ui attributes
 * Now uses the repo-agnostic scanner for better discovery
 */

export { ComponentInfo, ComponentStyle } from './repoScanner';

export interface ScannedComponent {
  id: string;
  selector: string;
  type: string;
  classes: string[];
  styles: Record<string, string>;
}

export class ComponentScanner {
  private static instance: ComponentScanner;
  private repoScanner: RepoComponentScanner;

  constructor() {
    this.repoScanner = RepoComponentScanner.getInstance();
  }

  static getInstance(): ComponentScanner {
    if (!ComponentScanner.instance) {
      ComponentScanner.instance = new ComponentScanner();
    }
    return ComponentScanner.instance;
  }

  async scanComponents(): Promise<ScannedComponent[]> {
    const rawComponents = await this.repoScanner.scanComponents();

    // Group by data-ui so we return one logical component per type
    const byDataUi = new Map<string, {
      selector: string;
      classes: Set<string>;
      styles: Record<string, string>;
    }>();

    for (const comp of rawComponents) {
      const dataUi = comp.dataUi || comp.selector || 'component';
      const existing = byDataUi.get(dataUi);

      const elementClasses = comp.element instanceof Element
        ? Array.from(comp.element.classList)
        : [];

      const styleRecord: Record<string, string> = {};
      for (const s of comp.styles) {
        // Prefer computed value if present, otherwise the raw value
        styleRecord[s.property] = (s as any).computed ?? s.value;
      }

      if (existing) {
        elementClasses.forEach(c => existing.classes.add(c));
        // Merge styles (do not remove existing properties)
        Object.assign(existing.styles, styleRecord);
      } else {
        byDataUi.set(dataUi, {
          selector: comp.selector,
          classes: new Set(elementClasses),
          styles: styleRecord,
        });
      }
    }

    // Build ScannedComponent list
    const result: ScannedComponent[] = Array.from(byDataUi.entries()).map(([dataUi, info]) => {
      return {
        id: dataUi,
        selector: info.selector || `[data-ui="${dataUi}"]`,
        type: dataUi,
        classes: Array.from(info.classes),
        styles: info.styles,
      };
    });

    return result;
  }

  /**
   * Gets components by data-ui attribute pattern
   */
  async getComponentsByPattern(pattern: string): Promise<ComponentInfo[]> {
    const components = await this.scanComponents();
    const regex = new RegExp(pattern, 'i');
    
    return components.filter(component => 
      regex.test(component.dataUi)
    );
  }

  /**
   * Gets components by type (based on data-ui prefix)
   */
  async getComponentsByType(type: string): Promise<ComponentInfo[]> {
    const components = await this.scanComponents();
    
    return components.filter(component => 
      component.dataUi.startsWith(type)
    );
  }

  /**
   * Searches components by data-ui or selector
   */
  async searchComponents(query: string): Promise<ComponentInfo[]> {
    const components = await this.scanComponents();
    const lowerQuery = query.toLowerCase();
    
    return components.filter(component => 
      component.dataUi.toLowerCase().includes(lowerQuery) ||
      component.selector.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Gets component variants
   */
  async getVariants(): Promise<Record<string, string[]>> {
    const components = await this.scanComponents();
    const variants: Record<string, string[]> = {};
    
    for (const component of components) {
      const baseType = component.dataUi.split(':')[0];
      if (!variants[baseType]) {
        variants[baseType] = [];
      }
      
      for (const variant of component.variants) {
        if (!variants[baseType].includes(variant)) {
          variants[baseType].push(variant);
        }
      }
    }
    
    return variants;
  }

  /**
   * Gets component statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    withVariants: number;
    totalVariants: number;
  }> {
    const components = await this.scanComponents();
    
    const byType: Record<string, number> = {};
    let withVariants = 0;
    let totalVariants = 0;
    
    for (const component of components) {
      const baseType = component.dataUi.split(':')[0];
      byType[baseType] = (byType[baseType] || 0) + 1;
      
      if (component.variants.length > 0) {
        withVariants++;
        totalVariants += component.variants.length;
      }
    }
    
    return {
      total: components.length,
      byType,
      withVariants,
      totalVariants
    };
  }

  /**
   * Finds component by element
   */
  async findComponentByElement(element: Element): Promise<ComponentInfo | null> {
    const components = await this.scanComponents();
    
    return components.find(component => 
      component.element === element
    ) || null;
  }

  /**
   * Gets all unique component types
   */
  async getComponentTypes(): Promise<string[]> {
    const components = await this.scanComponents();
    const types = new Set<string>();
    
    for (const component of components) {
      const baseType = component.dataUi.split(':')[0];
      types.add(baseType);
    }
    
    return Array.from(types).sort();
  }

  /**
   * Clears the component cache
   */
  clearCache(): void {
    this.repoScanner.clearCache();
  }

  /**
   * Rescans components
   */
  async rescan(): Promise<ComponentInfo[]> {
    this.clearCache();
    return this.scanComponents();
  }
}