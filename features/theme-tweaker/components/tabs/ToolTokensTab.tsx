'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { TokenScanner, CSSToken } from '../../utils/tokenScanner';
import { RepoScanner } from '../../utils/repoScanner';
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
import { 
  Search, 
  Palette, 
  Ruler, 
  Circle, 
  Zap, 
  Type, 
  MoreHorizontal,
  RefreshCw,
  Filter,
  Shadow
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
  const { tokenEdits, updateTokenEdit, addTokenEdit, addRuntimeStyle } = useThemeTweakerStore();
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
      return `oklch(${round(clamp(L, 0, 1), 3)} ${round(clamp(C, 0, 1), 3)} ${round1(((H % 360) + 360) % 360)})`;
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

  // Convert any CSS color string to HEX for display
  const toHEX = (input: string): string | null => {
    const value = input.trim();
    try {
      if (/^lab\(/i.test(value)) {
        // Parse CSS Lab: lab(L a b / [alpha]) ; L may be %
        const m = value.match(/lab\(([^)]+)\)/i);
        if (!m) return null;
        const parts = m[1].split(/[\s\/]+/).filter(Boolean);
        if (parts.length < 3) return null;
        let L = parseFloat(parts[0]);
        if (/%$/.test(parts[0])) L = parseFloat(parts[0]) ; // already % 0..100
        // L is specified as percentage in CSS, convert to 0..100
        if (parts[0].includes('%')) L = parseFloat(parts[0]);
        const a = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        // Lab -> XYZ -> sRGB
        const fy = (L + 16) / 116;
        const fx = fy + a / 500;
        const fz = fy - b / 200;
        const fInv = (t: number) => {
          const t3 = t * t * t;
          return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
        };
        const Xn = 95.047, Yn = 100, Zn = 108.883;
        const X = Xn * fInv(fx);
        const Y = Yn * fInv(fy);
        const Z = Zn * fInv(fz);
        // XYZ -> linear sRGB
        const x = X / 100, y = Y / 100, z = Z / 100;
        let rLin = 3.2406 * x - 1.5372 * y - 0.4986 * z;
        let gLin = -0.9689 * x + 1.8758 * y + 0.0415 * z;
        let bLin = 0.0557 * x - 0.2040 * y + 1.0570 * z;
        const compand = (c: number) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;
        const r = Math.round(Math.min(1, Math.max(0, compand(rLin))) * 255);
        const g = Math.round(Math.min(1, Math.max(0, compand(gLin))) * 255);
        const bV = Math.round(Math.min(1, Math.max(0, compand(bLin))) * 255);
        const to2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
        return `#${to2(r)}${to2(g)}${to2(bV)}`;
      }
      if (/^oklch\(/i.test(value)) {
        // Parse OKLCH: oklch(L C H / A?) where L in 0..1 or %, H in deg
        const m = value.match(/oklch\(([^)]+)\)/i);
        if (!m) return null;
        const parts = m[1].split(/[\s\/]+/).filter(Boolean);
        if (parts.length < 3) return null;
        let L = parseFloat(parts[0]);
        if (parts[0].includes('%')) L = parseFloat(parts[0]) / 100;
        const C = parseFloat(parts[1]);
        const Hdeg = parseFloat(parts[2]);
        const Hr = (Hdeg * Math.PI) / 180;
        const a = C * Math.cos(Hr);
        const b = C * Math.sin(Hr);
        // OKLab -> linear sRGB
        const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
        const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
        const l = l_ * l_ * l_;
        const m2 = m_ * m_ * m_;
        const s = s_ * s_ * s_;
        let rLin = +4.0767416621 * l - 3.3077115913 * m2 + 0.2309699292 * s;
        let gLin = -1.2684380046 * l + 2.6097574011 * m2 - 0.3413193965 * s;
        let bLin = -0.0041960863 * l - 0.7034186147 * m2 + 1.7076147010 * s;
        const compand = (c: number) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;
        const r = Math.round(Math.min(1, Math.max(0, compand(rLin))) * 255);
        const g = Math.round(Math.min(1, Math.max(0, compand(gLin))) * 255);
        const bV = Math.round(Math.min(1, Math.max(0, compand(bLin))) * 255);
        const to2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
        return `#${to2(r)}${to2(g)}${to2(bV)}`;
      }
      // Fallback: let the browser parse to rgb()
      const probe = document.createElement('div');
      probe.style.color = value;
      probe.style.display = 'none';
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color; // rgb(...)
      document.body.removeChild(probe);
      const m = computed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (!m) return null;
      const r = Number(m[1]).toString(16).padStart(2, '0');
      const g = Number(m[2]).toString(16).padStart(2, '0');
      const b = Number(m[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    } catch {
      return null;
    }
  };

  const iconColorFor = (bg: string): string => {
    const hex = toHEX(bg) || '#000000';
    return getContrastColor(hex);
  };

  // Load tokens on mount
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const scannedTokens = await tokenScanner.scanTokens();
      setTokens(scannedTokens);
      
      if (!tokensLoadedOnce) {
        if (scannedTokens.length === 0) {
          toast.info('No CSS tokens found. Try adding some CSS custom properties.');
        } else {
          toast.success(`Found ${scannedTokens.length} CSS tokens`);
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
      toast.success(`Rescanned and found ${newTokens.length} tokens`);
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
    // Exclude Tailwind runtime/internal vars and motion/transform utilities
    if (n.startsWith('--tw-')) return false;
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

  // Filter tokens based on search and category; exclude only non-style tokens; dedupe by name
  const filteredTokens = useMemo(() => {
    let filtered = tokens.filter(t => isStyleToken(t.name));

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

    // Deduplicate by token name so each variable appears once
    const map = new Map<string, CSSToken>();
    for (const t of filtered) {
      if (!map.has(t.name)) map.set(t.name, t);
    }
    return Array.from(map.values());
  }, [tokens, searchQuery, selectedCategory]);

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
      },
      {
        category: 'other',
        tokens: filteredTokens.filter(t => t.category === 'other'),
        icon: <MoreHorizontal className="w-4 h-4" />,
        color: 'bg-gray-100 text-gray-800'
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

      return map;
    } catch {
      return new Map<string, { light: string; dark: string }>();
    }
  }, [tokens]);

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
    addTokenEdit({ token: tokenName, value: converted, originalValue, scope });
    // Also push to runtimeStyles for immediate preview
    addRuntimeStyle({ selector, property: tokenName, value: newValue, type: 'token' });
  };

  const renderTokenItem = (token: CSSToken) => {
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
    const lightChanged = !!lightEdit && lightEdit.value !== lightEdit.originalValue;
    const darkChanged = !!darkEdit && darkEdit.value !== darkEdit.originalValue;

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
                <code className="bg-muted px-1 py-0.5 rounded">{light}</code>
                {lightChanged && <Badge variant="secondary" className="text-xs">Modified</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={lightDisplay}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUserColorInputs(prev => ({ ...prev, [`${token.name}|light`]: v }));
                    handleScopedTokenChange(token.name, 'light', v, light);
                  }}
                  placeholder="#RRGGBB"
                  className="font-mono text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 p-0 border-2"
                  style={{ backgroundColor: lightDisplay }}
                  title="Color swatch"
                >
                  <Palette className="w-4 h-4" style={{ color: iconColorFor(lightDisplay) }} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Dark</Badge>
                <code className="bg-muted px-1 py-0.5 rounded">{dark}</code>
                {darkChanged && <Badge variant="secondary" className="text-xs">Modified</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={darkDisplay}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUserColorInputs(prev => ({ ...prev, [`${token.name}|dark`]: v }));
                    handleScopedTokenChange(token.name, 'dark', v, dark);
                  }}
                  placeholder="#RRGGBB"
                  className="font-mono text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 p-0 border-2"
                  style={{ backgroundColor: darkDisplay }}
                  title="Color swatch"
                >
                  <Palette className="w-4 h-4" style={{ color: iconColorFor(darkDisplay) }} />
                </Button>
              </div>
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
            {tokens.length} token{tokens.length !== 1 ? 's' : ''} discovered
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
            className="pl-10 h-10"
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
          {(['color', 'spacing', 'radius', 'shadow', 'font', 'other'] as const).map(category => {
            const count = tokens.filter(t => t.category === category).length;
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