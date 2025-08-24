'use client';

import { TokenScanner as RepoTokenScanner, CSSToken } from './repoScanner';

/**
 * Token scanning utilities for discovering CSS custom properties
 * Now uses the repo-agnostic scanner for better discovery
 */

export { CSSToken } from './repoScanner';

export class TokenScanner {
  private static instance: TokenScanner;
  private repoScanner: RepoTokenScanner;

  constructor() {
    this.repoScanner = RepoTokenScanner.getInstance();
  }

  static getInstance(): TokenScanner {
    if (!TokenScanner.instance) {
      TokenScanner.instance = new TokenScanner();
    }
    return TokenScanner.instance;
  }

  async scanTokens(): Promise<CSSToken[]> {
    return this.repoScanner.scanTokens();
  }

  /**
   * Categorizes a token based on its name and value
   */
  categorizeToken(name: string, value: string): CSSToken['category'] {
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
   * Clears the token cache
   */
  clearCache(): void {
    this.repoScanner.clearCache();
  }

  /**
   * Gets tokens by category
   */
  async getTokensByCategory(category: CSSToken['category']): Promise<CSSToken[]> {
    const tokens = await this.scanTokens();
    return tokens.filter(token => token.category === category);
  }

  /**
   * Searches tokens by name or value
   */
  async searchTokens(query: string): Promise<CSSToken[]> {
    const tokens = await this.scanTokens();
    const lowerQuery = query.toLowerCase();
    
    return tokens.filter(token => 
      token.name.toLowerCase().includes(lowerQuery) ||
      token.value.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Gets token statistics
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<CSSToken['category'], number>;
    byFile: Record<string, number>;
  }> {
    const tokens = await this.scanTokens();
    
    const byCategory: Record<CSSToken['category'], number> = {
      color: 0,
      spacing: 0,
      radius: 0,
      shadow: 0,
      font: 0,
      other: 0
    };
    
    const byFile: Record<string, number> = {};
    
    for (const token of tokens) {
      byCategory[token.category]++;
      byFile[token.file] = (byFile[token.file] || 0) + 1;
    }
    
    return {
      total: tokens.length,
      byCategory,
      byFile
    };
  }
}