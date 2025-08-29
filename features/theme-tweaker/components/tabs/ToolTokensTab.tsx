'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { TokenScanner, CSSToken } from '../../utils/tokenScanner';
import { RepoScanner } from '../../utils/repoScanner';
import { toHEX } from '../../utils/colorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// removed internal tabs; always show grouped view
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Simplified: use direct HEX inputs instead of ColorPicker
import { SliderControl } from '../controls/SliderControl';
import { TextControl } from '../controls/TextControl';
import { getContrastColor } from '../controls/ColorPicker';
import { UniversalColorInput } from '../common/UniversalColorInput';
import SimpleShadowEditor from '../controls/SimpleShadowEditor';
import { 
  Search, 
  Palette, 
  Ruler, 
  Circle, 
  Zap, 
  Type, 
  MoreHorizontal,
  RefreshCw,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenGroup {
  category: CSSToken['category'];
  tokens: CSSToken[];
  icon: React.ReactNode;
  color: string;
}

let tokensLoadedOnce = false;

export function ToolTokensTab() {
  const { resolvedTheme } = useTheme();
  const { tokenEdits, updateTokenEdit, addTokenEdit, removeTokenEdit, addRuntimeStyle, removeRuntimeStyle } = useThemeTweakerStore();
  const [tokens, setTokens] = useState<CSSToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CSSToken['category'] | 'all'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const darkProbeRef = useRef<HTMLDivElement | null>(null);

  const tokenScanner = useMemo(() => TokenScanner.getInstance(), []);
  const repoScanner = useMemo(() => new RepoScanner(), []);
  const [userColorInputs, setUserColorInputs] = useState<Record<string, string>>({});

  // Minimal color conversion helpers (HEX/RGB/HSL -> OKLCH) with safe fallback
  const toOKLCH = (input: string): string | null => {
    try {
      const value = input.trim();
      // Create a probe to leverage the browser color parsing to rgb()
      const probe = document.createElement('div');
      probe.style.color = value;
      probe.style.display = 'none';
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color; // rgb(r g b) or rgb(r, g, b)
      document.body.removeChild(probe);
      const m = computed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (!m) return null;
      const r = parseInt(m[1], 10) / 255;
      const g = parseInt(m[2], 10) / 255;
      const b = parseInt(m[3], 10) / 255;
      const srgbToLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      const rl = srgbToLinear(r);
      const gl = srgbToLinear(g);
      const bl = srgbToLinear(b);
      const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
      const m1 = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
      const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
      const l_ = Math.cbrt(l);
      const m_ = Math.cbrt(m1);
      const s_ = Math.cbrt(s);
      const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
      const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
      const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
      const C = Math.sqrt(a * a + b2 * b2);
      let H = Math.atan2(b2, a) * (180 / Math.PI);
      if (H < 0) H += 360;
      const round = (n: number, d = 3) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
      const round1 = (n: number) => Math.round(n * 10) / 10;
      const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
      const out = `oklch(${round(clamp(L, 0, 1), 3)} ${round(clamp(C, 0, 1), 3)} ${round1(((H % 360) + 360) % 360)})`;
      console.log('[ThemeTweaker] HEX->OKLCH', { input, parsed: computed, oklch: out });
      return out;
    } catch {
      return null;
    }
  };

  const isValidColor = (color: string): boolean => {
    try {
      const probe = document.createElement('div');
      probe.style.color = '';
      probe.style.color = color;
      return probe.style.color !== '';
    } catch {
      return false;
    }
  };

  // Normalize any CSS color string to a stable computed rgb() string for equality checks
  const normalizeColorToRGB = (value: string): string | null => {
    try {
      const el = document.createElement('div');
      el.style.color = value;
      // If the browser rejects the color, it's not valid
      if (el.style.color === '') return null;
      document.body.appendChild(el);
      const computed = getComputedStyle(el).color; // e.g., "rgb(255, 255, 255)"
      document.body.removeChild(el);
      return computed.replace(/\s+/g, '').toLowerCase();
    } catch {
      return null;
    }
  };

  const areColorsEquivalent = (a: string, b: string): boolean => {
    if (!a || !b) return false;
    // Fast path: hex equality (case-insensitive) using high-precision conversions
    const hexA = toHEX(a);
    const hexB = toHEX(b);
    if (hexA && hexB && hexA.toUpperCase() === hexB.toUpperCase()) return true;
    // Fallback: computed rgb equality
    const na = normalizeColorToRGB(a);
    const nb = normalizeColorToRGB(b);
    return !!na && !!nb && na === nb;
  };

  // Ensure no lingering no-op edits for a token remain
  const cleanupNoOpEditsForToken = (tokenName: string) => {
    const edits = tokenEdits.filter(e => e.token === tokenName);
    edits.forEach(e => {
      if (areColorsEquivalent(e.value, e.originalValue)) {
        removeTokenEdit(e.token, e.scope);
      }
    });
  };



  const iconColorFor = (bg: string): string => {
    const hex = toHEX(bg) || '#000000';
    return getContrastColor(hex);
  };

  // Load tokens on mount
  useEffect(() => {
    loadTokens();
  }, []);

  // Helper: detect color-like values
  const looksLikeColor = (val: string) => {
    const v = (val || '').trim().toLowerCase();
    return (
      /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
      v.startsWith('rgb') || v.startsWith('hsl') || v.startsWith('oklch') ||
      /^(red|blue|green|yellow|purple|pink|gray|grey|black|white|orange|teal|cyan|lime|indigo)$/i.test(v)
    );
  };

  const computeAllowedTokensCount = (list: CSSToken[]) => {
    const styled = list.filter(t => isStyleToken(t.name));
    const siteOrNonColor = styled.filter(t => (t.category !== 'color') || isSiteToken(t.name));
    const map = new Map<string, CSSToken>();
    for (const t of siteOrNonColor) {
      const normalized: CSSToken = looksLikeColor(t.value) ? { ...t, category: 'color' } : t;
      if (!map.has(normalized.name)) map.set(normalized.name, normalized);
    }
    return Array.from(map.values()).length;
  };

  const loadTokens = async () => {
    setLoading(true);
    try {
      const scannedTokens = await tokenScanner.scanTokens();
      setTokens(scannedTokens);
      
      if (!tokensLoadedOnce) {
        const availableCount = computeAllowedTokensCount(scannedTokens);
        if (availableCount === 0) {
          toast.info('No CSS tokens found. Try adding some CSS custom properties.');
        } else {
          toast.success(`Found ${availableCount} CSS tokens`);
        }
        tokensLoadedOnce = true;
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast.error('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      const { tokens: newTokens } = await repoScanner.rescan();
      setTokens(newTokens);
      const availableCount = computeAllowedTokensCount(newTokens);
      toast.success(`Rescanned and found ${availableCount} tokens`);
    } catch (error) {
      console.error('Error rescanning:', error);
      toast.error('Failed to rescan tokens');
    } finally {
      setIsScanning(false);
    }
  };

  // Helper to exclude non-style tokens
  const isStyleToken = (name: string) => {
    const n = name.toLowerCase();
    // Exclude Tailwind runtime/internal vars and palette color variables
    if (n.startsWith('--tw-')) return false;
    if (n.startsWith('--color-')) return false;
    // Exclude tool UI local tokens (not part of site theme)
    if (n.startsWith('--light-')) return false;
    if (n.startsWith('--dark-')) return false;
    return !(
      n.includes('transition') ||
      n.includes('animation') ||
      n.includes('duration') ||
      n.includes('timing') ||
      n.includes('easing') ||
      n.includes('easings') ||
      n.includes('translate') ||
      n.includes('rotate') ||
      n.includes('scale') ||
      n.includes('skew') ||
      n.includes('transform') ||
      n.includes('perspective') ||
      n.includes('backdrop') ||
      n.includes('filter')
    );
  };

  // Helper to keep only site-sanctioned tokens from globals.css
  const isSiteToken = (name: string) => {
    const n = name.toLowerCase();
    // Exact tokens we intentionally expose (from globals.css)
    const allowedExact = new Set([
      '--background','--foreground',
      '--card','--card-foreground',
      '--popover','--popover-foreground',
      '--primary','--primary-foreground',
      '--secondary','--secondary-foreground',
      '--muted','--muted-foreground',
      '--accent','--accent-foreground',
      '--destructive',
      '--border','--input','--ring',
      // Sidebar root
      '--sidebar',
      // Semantic: success
      '--success','--success-foreground','--success-subtle','--success-subtle-foreground','--success-border','--success-ring',
      // Semantic: warning
      '--warning','--warning-foreground','--warning-subtle','--warning-subtle-foreground','--warning-border','--warning-ring',
      // Semantic: error
      '--error','--error-foreground','--error-subtle','--error-subtle-foreground','--error-border','--error-ring',
      // Semantic: info
      '--info','--info-foreground','--info-subtle','--info-subtle-foreground','--info-border','--info-ring'
    ]);
    // Prefixes safe to include (numbered or structured families)
    const allowedPrefixes = ['--chart-','--sidebar-','--brand-'];
    return allowedExact.has(n) || allowedPrefixes.some(p => n.startsWith(p));
  };

  // Base allowed tokens: site-sanctioned colors + all non-color categories; dedupe by name
  const allowedTokens = useMemo(() => {
    const looksLikeColor = (val: string) => {
      const v = val.trim().toLowerCase();
      return (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) || v.startsWith('rgb') || v.startsWith('hsl') || v.startsWith('oklch') || /^(red|blue|green|yellow|purple|pink|gray|grey|black|white|orange|teal|cyan|lime|indigo)$/i.test(v));
    };
    const styled = tokens.filter(t => isStyleToken(t.name));
    const siteOrNonColor = styled.filter(t => (t.category !== 'color') || isSiteToken(t.name));
    const map = new Map<string, CSSToken>();
    for (const t of siteOrNonColor) {
      const normalized: CSSToken = looksLikeColor(t.value) ? { ...t, category: 'color' } : t;
      if (!map.has(normalized.name)) map.set(normalized.name, normalized);
    }
    return Array.from(map.values());
  }, [tokens]);

  // Filter tokens based on search and selected category
  const filteredTokens = useMemo(() => {
    let filtered = allowedTokens;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(token => token.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(query) ||
        token.value.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allowedTokens, searchQuery, selectedCategory]);

  // Group tokens by category
  const tokenGroups: TokenGroup[] = useMemo(() => {
    const groups: TokenGroup[] = [
      {
        category: 'color',
        tokens: filteredTokens.filter(t => t.category === 'color'),
        icon: <Palette className="w-4 h-4" />,
        color: 'bg-red-100 text-red-800'
      },
      {
        category: 'spacing',
        tokens: filteredTokens.filter(t => t.category === 'spacing'),
        icon: <Ruler className="w-4 h-4" />,
        color: 'bg-blue-100 text-blue-800'
      },
      {
        category: 'radius',
        tokens: filteredTokens.filter(t => t.category === 'radius'),
        icon: <Circle className="w-4 h-4" />,
        color: 'bg-green-100 text-green-800'
      },
      {
        category: 'shadow',
        tokens: filteredTokens.filter(t => t.category === 'shadow'),
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-purple-100 text-purple-800'
      },
      {
        category: 'font',
        tokens: filteredTokens.filter(t => t.category === 'font'),
        icon: <Type className="w-4 h-4" />,
        color: 'bg-yellow-100 text-yellow-800'
      }
    ];
    return groups.filter(g => g.tokens.length > 0);
  }, [filteredTokens]);

  const handleTokenChange = (tokenName: string, newValue: string, originalValue: string, category: CSSToken['category']) => {
    updateTokenEdit(tokenName, {
      value: newValue,
      originalValue,
      category
    });
  };

  const lightDarkMap = useMemo(() => {
    try {
      const html = document.documentElement;
      const wasDark = html.classList.contains('dark');
      const map = new Map<string, { light: string; dark: string }>();

      // Pass 1: Light
      html.classList.remove('dark');
      void html.offsetHeight; // force reflow
      const lightStyles = getComputedStyle(html);
      tokens.forEach(t => {
        const light = lightStyles.getPropertyValue(t.name).trim();
        map.set(t.name, { light, dark: '' });
      });

      // Pass 2: Dark
      html.classList.add('dark');
      void html.offsetHeight; // force reflow
      const darkStyles = getComputedStyle(html);
      tokens.forEach(t => {
        const prev = map.get(t.name) || { light: '', dark: '' };
        const dark = darkStyles.getPropertyValue(t.name).trim();
        map.set(t.name, { light: prev.light, dark });
      });

      // Restore
      if (!wasDark) html.classList.remove('dark');
      else html.classList.add('dark');

      return map;
    } catch {
      return new Map<string, { light: string; dark: string }>();
    }
  }, [tokens, resolvedTheme]);

  const handleScopedTokenChange = (
    tokenName: string,
    scope: 'light' | 'dark',
    newValue: string,
    originalValue: string
  ) => {
    const selector = scope === 'dark' ? '.dark' : ':root';
    if (!isValidColor(newValue)) return;
    // Stage converted value (fallback to original input if conversion fails)
    const converted = toOKLCH(newValue) || newValue;

    // Determine stable baseline original (sticky to first change for this scope)
    const existingScoped = tokenEdits.find(e => e.token === tokenName && e.scope === scope);
    const baselineOriginal = existingScoped?.originalValue ?? originalValue;

    // No-op guard: if new value is equivalent to baseline original, remove existing edit
    if (
      areColorsEquivalent(newValue, baselineOriginal) ||
      areColorsEquivalent(converted, baselineOriginal)
    ) {
      removeTokenEdit(tokenName, scope);
      removeRuntimeStyle(selector, tokenName);
      cleanupNoOpEditsForToken(tokenName);
      return;
    }

    addTokenEdit({ token: tokenName, value: converted, originalValue: baselineOriginal, scope });
    console.log('[ThemeTweaker] addTokenEdit', { token: tokenName, scope, input: newValue, stored: converted });
    // Also push to runtimeStyles for immediate preview
    addRuntimeStyle({ selector, property: tokenName, value: newValue, type: 'token' });

    // Debounced cleanup to catch the end of a drag that returns to original
    window.clearTimeout((cleanupNoOpEditsForToken as any)._t);
    (cleanupNoOpEditsForToken as any)._t = window.setTimeout(() => {
      cleanupNoOpEditsForToken(tokenName);
    }, 150);
  };

  const renderTokenItem = (token: CSSToken) => {
    if (token.category === 'shadow') {
      const light = lightDarkMap.get(token.name)?.light || '';
      const dark = lightDarkMap.get(token.name)?.dark || '';
      const lightChanged = !!tokenEdits.find(e => e.token === token.name && e.scope !== 'dark');
      const darkChanged = !!tokenEdits.find(e => e.token === token.name && e.scope === 'dark');
      return (
        <Card key={token.name}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <code className="font-mono">{token.name}</code>
              {(lightChanged || darkChanged) && (<Badge variant="secondary" className="text-xs">Modified</Badge>)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Light</Badge>
              </div>
              <SimpleShadowEditor value={light} showOpacity onChange={(css) => handleScopedTokenChange(token.name, 'light', css, light)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Dark</Badge>
              </div>
              <SimpleShadowEditor value={dark} showOpacity onChange={(css) => handleScopedTokenChange(token.name, 'dark', css, dark)} />
            </div>
          </CardContent>
        </Card>
      );
    }

    const uniqueKey = `${token.name}`;
    const pair = lightDarkMap.get(token.name);
    const light = pair?.light ?? token.value;
    const dark = pair?.dark ?? token.value;
    const lightEdit = tokenEdits.find(e => e.token === token.name && e.scope !== 'dark');
    const darkEdit = tokenEdits.find(e => e.token === token.name && e.scope === 'dark');
    const lightValue = lightEdit?.value || light;
    const darkValue = darkEdit?.value || dark;
    const lightDisplay = userColorInputs[`${token.name}|light`] ?? (toHEX(lightValue) || lightValue);
    const darkDisplay = userColorInputs[`${token.name}|dark`] ?? (toHEX(darkValue) || darkValue);
    const lightChanged = !!lightEdit && !areColorsEquivalent(lightEdit.value, lightEdit.originalValue);
    const darkChanged = !!darkEdit && !areColorsEquivalent(darkEdit.value, darkEdit.originalValue);

    return (
      <Card key={uniqueKey} className="transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {token.name}
              </code>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Light</Badge>
                {lightChanged && <Badge variant="secondary" className="text-xs">Modified</Badge>}
              </div>
              <UniversalColorInput
                value={lightDisplay}
                onChange={(v) => {
                  setUserColorInputs(prev => ({ ...prev, [`${token.name}|light`]: v }));
                  handleScopedTokenChange(token.name, 'light', v, light);
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Dark</Badge>
                {darkChanged && <Badge variant="secondary" className="text-xs">Modified</Badge>}
              </div>
              <UniversalColorInput
                value={darkDisplay}
                onChange={(v) => {
                  setUserColorInputs(prev => ({ ...prev, [`${token.name}|dark`]: v }));
                  handleScopedTokenChange(token.name, 'dark', v, dark);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Scanning for CSS tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">CSS Tokens</h3>
          <p className="text-sm text-muted-foreground">
            {allowedTokens.length} token{allowedTokens.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRescan}
          disabled={isScanning}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
          Rescan
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 tt-search"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-10"
          >
            All
          </Button>
          {(['color', 'spacing', 'radius', 'shadow', 'font'] as const).map(category => {
            const count = allowedTokens.filter(t => t.category === category).length;
            if (count === 0) return null;
            
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-10"
              >
                {category} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tokens */}
      {filteredTokens.length === 0 ? (
        <div className="text-center py-8">
          <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tokens found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'No CSS custom properties detected in your stylesheets.'}
          </p>
        </div>
      ) : (
        <div className="w-full mt-4">
          <div className="space-y-6">
            {tokenGroups.map(group => (
              <div key={group.category}>
                <div className="flex items-center gap-2 mb-3">
                  {group.icon}
                  <h4 className="font-medium capitalize">{group.category}</h4>
                  <Badge className={group.color}>
                    {group.tokens.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {group.tokens.map(token => renderTokenItem(token))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
