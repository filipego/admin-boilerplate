'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeTweakerStore } from '../../store/useThemeTweakerStore';
import { TokenScanner, CSSToken } from '../../utils/tokenScanner';
import { RepoScanner } from '../../utils/repoScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// removed internal tabs; always show grouped view
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '../controls/ColorPicker';
import { SliderControl } from '../controls/SliderControl';
import { TextControl } from '../controls/TextControl';
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
  const { tokenEdits, updateTokenEdit } = useThemeTweakerStore();
  const [tokens, setTokens] = useState<CSSToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CSSToken['category'] | 'all'>('all');
  const [isScanning, setIsScanning] = useState(false);

  const tokenScanner = useMemo(() => TokenScanner.getInstance(), []);
  const repoScanner = useMemo(() => new RepoScanner(), []);

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

  // Filter tokens based on search and category
  const filteredTokens = useMemo(() => {
    let filtered = tokens;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(token => token.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(query) ||
        token.value.toLowerCase().includes(query)
      );
    }

    return filtered;
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

    return groups.filter(group => group.tokens.length > 0);
  }, [filteredTokens]);

  const handleTokenChange = (tokenName: string, newValue: string, originalValue: string, category: CSSToken['category']) => {
    updateTokenEdit(tokenName, {
      value: newValue,
      originalValue,
      category
    });
  };

  const renderTokenControl = (token: CSSToken) => {
    const currentEdit = tokenEdits[token.name];
    const currentValue = currentEdit?.value || token.value;
    const hasChanged = currentEdit && currentEdit.value !== currentEdit.originalValue;

    switch (token.category) {
      case 'color':
        return (
          <ColorPicker
            value={currentValue}
            originalValue={token.value}
            onChange={(value) => handleTokenChange(token.name, value, token.value, token.category)}
            hasChanged={hasChanged}
          />
        );

      case 'spacing':
      case 'radius':
        // Extract numeric value and unit
        const match = currentValue.match(/^([\d.]+)(.*)$/);
        const numericValue = match ? parseFloat(match[1]) : 0;
        const unit = match ? match[2] : 'px';
        
        return (
          <SliderControl
            value={numericValue}
            originalValue={parseFloat(token.value)}
            onChange={(value) => handleTokenChange(token.name, `${value}${unit}`, token.value, token.category)}
            min={0}
            max={token.category === 'spacing' ? 100 : 50}
            step={token.category === 'spacing' ? 1 : 0.5}
            unit={unit}
            hasChanged={hasChanged}
          />
        );

      default:
        return (
          <TextControl
            value={currentValue}
            originalValue={token.value}
            onChange={(value) => handleTokenChange(token.name, value, token.value, token.category)}
            hasChanged={hasChanged}
          />
        );
    }
  };

  const renderTokenItem = (token: CSSToken) => {
    const currentEdit = tokenEdits[token.name];
    const hasChanged = currentEdit && currentEdit.value !== currentEdit.originalValue;

    // Use a composite key to avoid duplicate React keys when the same token name
    // exists in multiple stylesheets (e.g., light/dark overrides)
    const uniqueKey = `${token.name}-${token.file}-${token.value}`;

    return (
      <Card key={uniqueKey} className={`transition-all ${hasChanged ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {token.name}
              </code>
              {hasChanged && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            {/* Removed token.file badge as it shows unhelpful Next.js compressed CSS filenames */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Original: <code className="bg-muted px-1 py-0.5 rounded">{token.value}</code>
            </div>
            {renderTokenControl(token)}
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