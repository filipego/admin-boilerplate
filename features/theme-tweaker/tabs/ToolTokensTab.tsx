'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Palette, Spacing, Type, RefreshCw, Shadow, ChevronDown, ChevronRight, Star, Filter, Layers } from 'lucide-react';
import { useThemeTweakerStore } from '../store/useThemeTweakerStore';
import { UniversalColorInput } from '../components/common/UniversalColorInput';
import { SliderControl } from '../controls/SliderControl';
import { TextControl } from '../controls/TextControl';

interface TokenGroup {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  tokens: Array<{
    name: string;
    value: string;
    type: 'color' | 'spacing' | 'radius' | 'shadow' | 'font' | 'other';
    cssVar: string;
  }>;
}

export const ToolTokensTab: React.FC = () => {
  const {
    tokenEdits,
    addTokenEdit,
    updateTokenEdit,
    favoriteTokens,
    toggleFavoriteToken,
    tokenFilter,
    setTokenFilter,
    focusMode,
    setFocusMode,
    accordionState,
    setAccordionState,
    addRecentToken,
    recentTokens,
    selectedElement,
  } = useThemeTweakerStore();
  const [tokens, setTokens] = useState<TokenGroup[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Extract CSS custom properties from the document
  const scanTokens = () => {
    setIsScanning(true);
    
    try {
      const rootStyles = getComputedStyle(document.documentElement);
      const allTokens: Record<string, any> = {};
      
      // Get all CSS custom properties
      for (let i = 0; i < rootStyles.length; i++) {
        const property = rootStyles[i];
        if (property.startsWith('--')) {
          const value = rootStyles.getPropertyValue(property).trim();
          allTokens[property] = value;
        }
      }
      
      // Categorize tokens into accordion groups
      const coreSurfaceTokens = Object.entries(allTokens)
        .filter(([name]) => 
          name.includes('background') || 
          name.includes('surface') || 
          name.includes('card') ||
          name.includes('popover') ||
          name.includes('dialog')
        )
        .map(([name, value]) => ({
          name: name.replace('--', ''),
          value: value as string,
          type: 'color' as const,
          cssVar: name,
        }));
      
      const brandPaletteTokens = Object.entries(allTokens)
        .filter(([name]) => 
          name.includes('primary') || 
          name.includes('secondary') || 
          name.includes('brand') ||
          name.includes('accent')
        )
        .map(([name, value]) => ({
          name: name.replace('--', ''),
          value: value as string,
          type: 'color' as const,
          cssVar: name,
        }));
      
      const semanticTokens = Object.entries(allTokens)
        .filter(([name]) => 
          name.includes('success') || 
          name.includes('warning') || 
          name.includes('error') ||
          name.includes('info') ||
          name.includes('destructive') ||
          name.includes('muted')
        )
        .map(([name, value]) => ({
          name: name.replace('--', ''),
          value: value as string,
          type: 'color' as const,
          cssVar: name,
        }));
      
      const controlsChromeTokens = Object.entries(allTokens)
        .filter(([name]) => 
          name.includes('border') || 
          name.includes('input') || 
          name.includes('ring') ||
          name.includes('focus') ||
          name.includes('radius') ||
          name.includes('shadow') ||
          name.includes('spacing') ||
          name.includes('gap')
        )
        .map(([name, value]) => ({
          name: name.replace('--', ''),
          value: value as string,
          type: name.includes('radius') ? 'radius' as const : 
                name.includes('shadow') ? 'shadow' as const :
                name.includes('spacing') || name.includes('gap') ? 'spacing' as const : 'other' as const,
          cssVar: name,
        }));
      
      const customOtherTokens = Object.entries(allTokens)
        .filter(([name]) => 
          !coreSurfaceTokens.some(t => t.cssVar === name) &&
          !brandPaletteTokens.some(t => t.cssVar === name) &&
          !semanticTokens.some(t => t.cssVar === name) &&
          !controlsChromeTokens.some(t => t.cssVar === name)
        )
        .map(([name, value]) => ({
          name: name.replace('--', ''),
          value: value as string,
          type: name.includes('font') || name.includes('text') || name.includes('letter') || name.includes('line') ? 'font' as const : 'other' as const,
          cssVar: name,
        }));
      
      setTokens([
        { name: 'core-surfaces', icon: Palette, tokens: coreSurfaceTokens },
        { name: 'brand-palette', icon: Layers, tokens: brandPaletteTokens },
        { name: 'semantic', icon: RefreshCw, tokens: semanticTokens },
        { name: 'controls-chrome', icon: Spacing, tokens: controlsChromeTokens },
        { name: 'custom-other', icon: Type, tokens: customOtherTokens },
      ].filter(group => group.tokens.length > 0));
      
    } catch (error) {
      console.error('Error scanning tokens:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanTokens();
  }, []);

  const handleTokenChange = (cssVar: string, value: string) => {
    const existingEdit = tokenEdits.find(edit => edit.token === cssVar);
    
    if (existingEdit) {
      if (value === existingEdit.originalValue) {
        removeTokenEdit(cssVar);
      } else {
        addTokenEdit({
          token: cssVar,
          value,
          originalValue: existingEdit.originalValue,
        });
      }
    } else {
      const originalValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      if (value !== originalValue) {
        addTokenEdit({
          token: cssVar,
          value,
          originalValue,
        });
      }
    }
    // Add to recent tokens when modified
    addRecentToken(cssVar);
  };

  const getTokenValue = (cssVar: string, defaultValue: string) => {
    const edit = tokenEdits.find(edit => edit.token === cssVar);
    return edit ? edit.value : defaultValue;
  };

  // Simple fuzzy search function
  const fuzzyMatch = (text: string, search: string): boolean => {
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower.includes(searchLower)) return true;
    
    // Fuzzy match - check if all characters in search appear in order
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  };

  // Determine token type based on name and value
  const getTokenType = (token: Token): { type: string; color: string } => {
    const name = token.name.toLowerCase();
    const value = token.value.toLowerCase();
    
    if (name.includes('color') || name.includes('bg') || name.includes('text') || name.includes('border') || value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
      return { type: 'Color', color: 'bg-blue-100 text-blue-700' };
    }
    if (name.includes('space') || name.includes('gap') || name.includes('padding') || name.includes('margin') || value.includes('rem') || value.includes('px')) {
      return { type: 'Space', color: 'bg-green-100 text-green-700' };
    }
    if (name.includes('radius') || name.includes('rounded')) {
      return { type: 'Radius', color: 'bg-purple-100 text-purple-700' };
    }
    if (name.includes('shadow') || name.includes('elevation')) {
      return { type: 'Shadow', color: 'bg-gray-100 text-gray-700' };
    }
    if (name.includes('font') || name.includes('text') || name.includes('size') || name.includes('weight') || name.includes('line')) {
      return { type: 'Typography', color: 'bg-orange-100 text-orange-700' };
    }
    if (name.includes('duration') || name.includes('timing') || name.includes('ease')) {
      return { type: 'Animation', color: 'bg-pink-100 text-pink-700' };
    }
    return { type: 'Other', color: 'bg-gray-100 text-gray-600' };
  };

  // Parse light/dark values from CSS variables
  const parseLightDarkValues = (value: string): { light?: string; dark?: string } => {
    // Check if value contains light/dark mode variables
    if (value.includes('light-mode') || value.includes('dark-mode')) {
      // This is a simplified parser - in reality, you'd need more sophisticated parsing
      return { light: value, dark: value };
    }
    return { light: value };
  };

  // Extract tokens used by selected component for focus mode
  const getComponentTokens = (element: HTMLElement): string[] => {
    const computedStyle = window.getComputedStyle(element);
    const usedTokens: string[] = [];
    
    // Get all CSS custom properties from computed styles
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      if (property.startsWith('--')) {
        const value = computedStyle.getPropertyValue(property);
        // Check if this value references other CSS variables
        const varMatches = value.match(/var\((--[^,)]+)/g);
        if (varMatches) {
          varMatches.forEach(match => {
            const varName = match.replace('var(', '').replace('--', '');
            if (!usedTokens.includes(varName)) {
              usedTokens.push(varName);
            }
          });
        }
        // Also include the property itself
        const tokenName = property.replace('--', '');
        if (!usedTokens.includes(tokenName)) {
          usedTokens.push(tokenName);
        }
      }
    }
    
    return usedTokens;
  };

  const filteredTokens = useMemo(() => {
    let filtered = tokens;
    
    // Apply focus mode filter first
    if (focusMode && selectedElement) {
      const componentTokens = getComponentTokens(selectedElement.element);
      filtered = filtered.map(group => ({
        ...group,
        tokens: group.tokens.filter(token => 
          componentTokens.some(ct => 
            token.name.includes(ct) || 
            token.cssVar.includes(ct) ||
            ct.includes(token.name)
          )
        )
      })).filter(group => group.tokens.length > 0);
    }
    
    // Apply search filter with fuzzy matching
    if (tokenFilter.search) {
      filtered = filtered.map(group => ({
        ...group,
        tokens: group.tokens.filter(token => 
          fuzzyMatch(token.name, tokenFilter.search) ||
          fuzzyMatch(token.value, tokenFilter.search) ||
          fuzzyMatch(token.cssVar, tokenFilter.search)
        )
      })).filter(group => group.tokens.length > 0);
    }
    
    // Apply scope filter
    if (tokenFilter.scope !== 'all') {
      filtered = filtered.map(group => ({
        ...group,
        tokens: group.tokens.filter(token => {
          const hasEdit = tokenEdits.some(edit => edit.token === token.name);
          const isFavorite = favoriteTokens.includes(token.name);
          const isRecent = recentTokens.includes(token.name);
          
          switch (tokenFilter.scope) {
            case 'changed': return hasEdit;
            case 'favorites': return isFavorite;
            case 'recent': return isRecent;
            default: return true;
          }
        })
      })).filter(group => group.tokens.length > 0);
    }
    
    return filtered;
  }, [tokens, tokenFilter, tokenEdits, favoriteTokens, recentTokens, focusMode, selectedElement]);

  const groupDisplayNames = {
    'core-surfaces': 'Core Surfaces',
    'brand-palette': 'Brand Palette', 
    'semantic': 'Semantic',
    'controls-chrome': 'Controls & Chrome',
    'custom-other': 'Custom/Other'
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search tokens..."
          value={tokenFilter.search}
          onChange={(e) => setTokenFilter({ ...tokenFilter, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter Chips */}
      <div className="space-y-3">
        {/* Scope Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground">Scope:</span>
          {(['all', 'changed', 'recent', 'favorites'] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setTokenFilter({ ...tokenFilter, scope })}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                tokenFilter.scope === scope
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {scope === 'all' && <Filter className="w-3 h-3 mr-1 inline" />}
              {scope === 'favorites' && <Star className="w-3 h-3 mr-1 inline" />}
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Theme Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground">Theme:</span>
          {(['both', 'light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => setTokenFilter({ ...tokenFilter, theme })}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                tokenFilter.theme === theme
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              focusMode
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            title={focusMode ? 'Exit focus mode' : 'Focus on selected component tokens'}
            disabled={!selectedElement && !focusMode}
          >
            <Layers className="w-4 h-4" />
            {focusMode ? 'Show All Tokens' : 'Focus Mode'}
          </button>
        </div>
        {focusMode && (
          <div className="flex items-center p-2 bg-muted/50 rounded-md">
            <span className="text-xs font-medium text-muted-foreground">Showing component-specific tokens</span>
          </div>
        )}
      </div>

      {/* Accordion Groups */}
      <div className="space-y-2">
        {filteredTokens.map((group) => {
          const Icon = group.icon;
          const isOpen = accordionState[group.name] ?? false;
          const displayName = groupDisplayNames[group.name as keyof typeof groupDisplayNames] || group.name;
          
          return (
            <div key={group.name} className="border border-border rounded-md bg-card">
              {/* Accordion Header */}
              <button
                onClick={() => setAccordionState({ ...accordionState, [group.name]: !isOpen })}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{displayName}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {group.tokens.length}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {/* Accordion Content */}
              {isOpen && (
                <div className="border-t border-border">
                  <div className="p-3 space-y-2">
                    {group.tokens.map((token) => {
                      const tokenEdit = tokenEdits.find(edit => edit.token === token.name);
                      const currentValue = tokenEdit?.value || token.value;
                      const isFavorite = favoriteTokens.includes(token.name);
                      const tokenTypeInfo = getTokenType(token);
                      const lightDarkValues = parseLightDarkValues(token.value);
                      
                      return (
                        <div key={token.name} className="flex items-start gap-3 p-3 border border-border rounded-md bg-background">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-sm text-foreground truncate">
                                {token.name}
                              </div>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${tokenTypeInfo.color}`}>
                                {tokenTypeInfo.type}
                              </span>
                            </div>
                            
                            {/* Removed raw light/dark value readouts for cleaner UI */}
                            
                            {/* Scope options */}
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs text-muted-foreground mr-2">Apply to:</span>
                              <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                                Global
                              </button>
                              <button className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors">
                                Class
                              </button>
                              <button className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors">
                                Instance
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Favorite Toggle */}
                            <button
                              onClick={() => {
                                toggleFavoriteToken(token.name);
                                addRecentToken(token.name);
                              }}
                              className={`p-1 rounded transition-colors ${
                                isFavorite 
                                  ? 'text-yellow-500 hover:text-yellow-600' 
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            
                            {/* Token Control */}
                            <div className="flex-shrink-0">
                              {token.type === 'color' && (
                                <UniversalColorInput
                                  value={currentValue}
                                  onChange={(value) => handleTokenChange(token.name, value)}
                                />
                              )}
                              {(token.type === 'spacing' || token.type === 'radius') && (
                                <SliderControl
                                  value={parseFloat(currentValue) || 0}
                                  onChange={(value) => handleTokenChange(token.name, `${value}px`)}
                                  min={0}
                                  max={token.type === 'spacing' ? 100 : 50}
                                  step={1}
                                />
                              )}
                              {(token.type === 'shadow' || token.type === 'font' || token.type === 'other') && (
                                <TextControl
                                  value={currentValue}
                                  onChange={(value) => handleTokenChange(token.name, value)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};