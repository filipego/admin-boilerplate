import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SelectedElement {
  element: HTMLElement;
  componentName: string;
  variant?: string;
  size?: string;
  dataUi: string;
}

export interface RuntimeStyle {
  selector: string;
  property: string;
  value: string;
  type: 'token' | 'class' | 'instance';
}

export interface TokenEdit {
  token: string;
  value: string;
  originalValue: string;
  scope?: 'light' | 'dark' | 'both';
}

export interface TokenFilter {
  scope: 'all' | 'changed' | 'recent' | 'favorites';
  theme: 'light' | 'dark' | 'both';
  search: string;
}

export interface AccordionState {
  [groupName: string]: boolean;
}

export interface ComponentEdit {
  componentName: string;
  variant?: string;
  size?: string;
  property: string;
  value: string;
  type: 'class' | 'instance';
}

export interface ThemeMap {
  tokenFiles: string[];
  componentFiles: string[];
  overrideFiles: string[];
  lastScan: number;
}

interface ThemeTweakerState {
  // UI State
  isToolOpen: boolean;
  activeTab: 'tokens' | 'components' | 'layout' | 'diff';
  isInspectorMode: boolean;
  highlightedComponent?: string | null;
  
  // Selection State
  selectedElement: SelectedElement | null;
  hoveredElement: HTMLElement | null;
  
  // Edit State
  tokenEdits: TokenEdit[];
  componentEdits: ComponentEdit[];
  runtimeStyles: RuntimeStyle[];
  layoutEdits: Record<string, {
    property: string;
    value: string;
    originalValue: string;
    breakpoint?: 'desktop' | 'tablet' | 'mobile';
    category?: string;
  }>;
  
  // Repository State
  themeMap: ThemeMap | null;
  isScanning: boolean;
  
  // New Features State
  favoriteTokens: string[];
  tokenFilter: TokenFilter;
  focusMode: boolean;
  accordionState: AccordionState;
  recentTokens: string[];
  
  // Actions
  setToolOpen: (open: boolean) => void;
  setActiveTab: (tab: 'tokens' | 'components' | 'layout' | 'diff') => void;
  setInspectorMode: (enabled: boolean) => void;
  setHighlightedComponent?: (id: string | null) => void;
  
  setSelectedElement: (element: SelectedElement | null) => void;
  setHoveredElement: (element: HTMLElement | null) => void;
  
  addTokenEdit: (edit: TokenEdit) => void;
  updateTokenEdit: (token: string, value: string) => void;
  removeTokenEdit: (token: string) => void;
  
  addComponentEdit: (edit: ComponentEdit) => void;
  updateComponentEdit: (id: string, value: string) => void;
  removeComponentEdit: (id: string) => void;
  
  addRuntimeStyle: (style: RuntimeStyle) => void;
  updateRuntimeStyle: (selector: string, property: string, value: string) => void;
  removeRuntimeStyle: (selector: string, property: string) => void;
  clearRuntimeStyles: () => void;
  
  // Layout edits
  updateLayoutEdit: (id: string, edit: {
    property: string;
    value: string;
    originalValue: string;
    breakpoint?: 'desktop' | 'tablet' | 'mobile';
    category?: string;
  }) => void;
  
  setThemeMap: (map: ThemeMap) => void;
  setIsScanning: (scanning: boolean) => void;
  
  // New Feature Actions
  toggleFavoriteToken: (token: string) => void;
  setTokenFilter: (filter: Partial<TokenFilter>) => void;
  setFocusMode: (enabled: boolean) => void;
  setAccordionState: (groupName: string, expanded: boolean) => void;
  addRecentToken: (token: string) => void;
  
  resetAll: () => void;
}

export const useThemeTweakerStore = create<ThemeTweakerState>()(devtools(
  (set, get) => ({
    // Initial State
    isToolOpen: false,
    activeTab: 'tokens',
    isInspectorMode: false,
    highlightedComponent: null,
    
    selectedElement: null,
    hoveredElement: null,
    
    tokenEdits: [],
    componentEdits: [],
    runtimeStyles: [],
    layoutEdits: {},
    
    themeMap: null,
    isScanning: false,
    
    // New Features Initial State
    favoriteTokens: [],
    tokenFilter: {
      scope: 'changed',
      theme: 'both',
      search: '',
    },
    focusMode: false,
    accordionState: {
      'core-surfaces': true,
      'brand-palette': false,
      'semantic': false,
      'controls-chrome': false,
      'custom-other': false,
    },
    recentTokens: [],
    
    // Actions
    setToolOpen: (open) => set({ isToolOpen: open }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setInspectorMode: (enabled) => set({ isInspectorMode: enabled }),
    setHighlightedComponent: (id) => set({ highlightedComponent: id }),
    
    setSelectedElement: (element) => set({ selectedElement: element }),
    setHoveredElement: (element) => set({ hoveredElement: element }),
    
    addTokenEdit: (edit) => set((state) => {
      const existing = state.tokenEdits.find(e => e.token === edit.token);
      if (existing) {
        return {
          tokenEdits: state.tokenEdits.map(e => 
            e.token === edit.token ? edit : e
          )
        };
      }
      return { tokenEdits: [...state.tokenEdits, edit] };
    }),
    
    updateTokenEdit: (token, value) => set((state) => ({
      tokenEdits: state.tokenEdits.map(edit => 
        edit.token === token ? { ...edit, value } : edit
      )
    })),
    
    removeTokenEdit: (token) => set((state) => ({
      tokenEdits: state.tokenEdits.filter(edit => edit.token !== token)
    })),
    
    addComponentEdit: (edit) => set((state) => {
      const id = `${edit.componentName}-${edit.variant || 'default'}-${edit.size || 'default'}-${edit.property}`;
      const existing = state.componentEdits.find(e => 
        `${e.componentName}-${e.variant || 'default'}-${e.size || 'default'}-${e.property}` === id
      );
      
      if (existing) {
        return {
          componentEdits: state.componentEdits.map(e => 
            `${e.componentName}-${e.variant || 'default'}-${e.size || 'default'}-${e.property}` === id ? edit : e
          )
        };
      }
      return { componentEdits: [...state.componentEdits, edit] };
    }),
    
    updateComponentEdit: (id, value) => set((state) => ({
      componentEdits: state.componentEdits.map(edit => {
        const editId = `${edit.componentName}-${edit.variant || 'default'}-${edit.size || 'default'}-${edit.property}`;
        return editId === id ? { ...edit, value } : edit;
      })
    })),
    
    removeComponentEdit: (id) => set((state) => ({
      componentEdits: state.componentEdits.filter(edit => {
        const editId = `${edit.componentName}-${edit.variant || 'default'}-${edit.size || 'default'}-${edit.property}`;
        return editId !== id;
      })
    })),
    
    addRuntimeStyle: (style) => set((state) => {
      const existing = state.runtimeStyles.find(s => 
        s.selector === style.selector && s.property === style.property
      );
      
      if (existing) {
        return {
          runtimeStyles: state.runtimeStyles.map(s => 
            s.selector === style.selector && s.property === style.property ? style : s
          )
        };
      }
      return { runtimeStyles: [...state.runtimeStyles, style] };
    }),
    
    updateRuntimeStyle: (selector, property, value) => set((state) => ({
      runtimeStyles: state.runtimeStyles.map(style => 
        style.selector === selector && style.property === property 
          ? { ...style, value } 
          : style
      )
    })),
    
    removeRuntimeStyle: (selector, property) => set((state) => ({
      runtimeStyles: state.runtimeStyles.filter(style => 
        !(style.selector === selector && style.property === property)
      )
    })),
    
    clearRuntimeStyles: () => set({ runtimeStyles: [] }),

    updateLayoutEdit: (id, edit) => set((state) => ({
      layoutEdits: { ...state.layoutEdits, [id]: edit }
    })),
    
    setThemeMap: (map) => set({ themeMap: map }),
    setIsScanning: (scanning) => set({ isScanning: scanning }),
    
    // New Feature Actions Implementation
    toggleFavoriteToken: (token) => set((state) => {
      const isFavorite = state.favoriteTokens.includes(token);
      return {
        favoriteTokens: isFavorite
          ? state.favoriteTokens.filter(t => t !== token)
          : [...state.favoriteTokens, token]
      };
    }),
    
    setTokenFilter: (filter) => set((state) => ({
      tokenFilter: { ...state.tokenFilter, ...filter }
    })),
    
    setFocusMode: (enabled) => set({ focusMode: enabled }),
    
    setAccordionState: (groupName, expanded) => set((state) => {
      // If expanding a group, close all others (accordion behavior)
      if (expanded) {
        const newAccordionState: AccordionState = {};
        Object.keys(state.accordionState).forEach(key => {
          newAccordionState[key] = key === groupName;
        });
        return { accordionState: newAccordionState };
      }
      // If collapsing, just update that group
      return {
        accordionState: { ...state.accordionState, [groupName]: expanded }
      };
    }),
    
    addRecentToken: (token) => set((state) => {
      const filtered = state.recentTokens.filter(t => t !== token);
      return {
        recentTokens: [token, ...filtered].slice(0, 10) // Keep last 10
      };
    }),
    
    resetAll: () => set({
      isToolOpen: false,
      activeTab: 'tokens',
      isInspectorMode: false,
      highlightedComponent: null,
      selectedElement: null,
      hoveredElement: null,
      tokenEdits: [],
      componentEdits: [],
      runtimeStyles: [],
      layoutEdits: {},
      themeMap: null,
      isScanning: false,
      favoriteTokens: [],
      tokenFilter: {
        scope: 'all',
        theme: 'both',
        search: '',
      },
      focusMode: false,
      accordionState: {
        'core-surfaces': true,
        'brand-palette': false,
        'semantic': false,
        'controls-chrome': false,
        'custom-other': false,
      },
      recentTokens: [],
    }),
  }),
  { name: 'theme-tweaker-store' }
));