import { RuntimeStyle } from '../store/useThemeTweakerStore';

const RUNTIME_STYLE_ID = 'tt-runtime';

/**
 * Applies runtime styles to a single <style> tag for non-destructive preview
 * Handles token edits, class overrides, and instance-only changes
 */
export const applyRuntimeStyles = (styles: RuntimeStyle[]): void => {
  try {
    // Debug incoming styles
    // eslint-disable-next-line no-console
    console.log('[ThemeTweaker][runtime] applying styles', styles);
  } catch {}
  let styleElement = document.getElementById(RUNTIME_STYLE_ID) as HTMLStyleElement;
  
  // Create style element if it doesn't exist
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = RUNTIME_STYLE_ID;
    styleElement.setAttribute('data-theme-tweaker', 'runtime');
    document.head.appendChild(styleElement);
  }
  
  // Group styles by type
  const tokenStyles = styles.filter(s => s.type === 'token');
  const classStyles = styles.filter(s => s.type === 'class');
  const instanceStyles = styles.filter(s => s.type === 'instance');
  
  // Build CSS content
  let cssContent = '';
  
  // Token overrides (CSS variables)
  if (tokenStyles.length > 0) {
    const lightTokens = tokenStyles.filter(s => !s.selector.includes('.dark'));
    const darkTokens = tokenStyles.filter(s => s.selector.includes('.dark'));
    
    if (lightTokens.length > 0) {
      cssContent += ':root, html:root, body:root {\n';
      lightTokens.forEach(style => {
        cssContent += `  ${style.property}: ${style.value} !important;\n`;
      });
      cssContent += '}\n\n';
    }
    
    if (darkTokens.length > 0) {
      cssContent += 'html.dark, body.dark, .dark {\n';
      darkTokens.forEach(style => {
        cssContent += `  ${style.property}: ${style.value} !important;\n`;
      });
      cssContent += '}\n\n';
    }
  }
  
  // Class overrides
  if (classStyles.length > 0) {
    const groupedBySelector = classStyles.reduce((acc, style) => {
      if (!acc[style.selector]) {
        acc[style.selector] = [];
      }
      acc[style.selector].push(style);
      return acc;
    }, {} as Record<string, RuntimeStyle[]>);
    
    Object.entries(groupedBySelector).forEach(([selector, selectorStyles]) => {
      cssContent += `${selector} {\n`;
      selectorStyles.forEach(style => {
        cssContent += `  ${style.property}: ${style.value} !important;\n`;
      });
      cssContent += '}\n\n';
    });
  }
  
  // Instance overrides (specific element targeting)
  if (instanceStyles.length > 0) {
    const groupedBySelector = instanceStyles.reduce((acc, style) => {
      if (!acc[style.selector]) {
        acc[style.selector] = [];
      }
      acc[style.selector].push(style);
      return acc;
    }, {} as Record<string, RuntimeStyle[]>);
    
    Object.entries(groupedBySelector).forEach(([selector, selectorStyles]) => {
      cssContent += `${selector} {\n`;
      selectorStyles.forEach(style => {
        cssContent += `  ${style.property}: ${style.value} !important;\n`;
      });
      cssContent += '}\n\n';
    });
  }
  
  // Apply the CSS content
  try {
    // eslint-disable-next-line no-console
    console.log('[ThemeTweaker][runtime] css', cssContent);
  } catch {}
  styleElement.textContent = cssContent;
};

/**
 * Removes the runtime style element
 */
export const clearRuntimeStyles = (): void => {
  const styleElement = document.getElementById(RUNTIME_STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
};

/**
 * Gets the current runtime CSS content
 */
export const getRuntimeCSS = (): string => {
  const styleElement = document.getElementById(RUNTIME_STYLE_ID) as HTMLStyleElement;
  return styleElement?.textContent || '';
};

/**
 * Applies a single runtime style immediately
 */
export const applyRuntimeStyle = (style: RuntimeStyle): void => {
  let styleElement = document.getElementById(RUNTIME_STYLE_ID) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = RUNTIME_STYLE_ID;
    styleElement.setAttribute('data-theme-tweaker', 'runtime');
    document.head.appendChild(styleElement);
  }
  
  const currentCSS = styleElement.textContent || '';
  
  // Simple append for immediate feedback
  if (style.type === 'token') {
    const selector = style.selector.includes('.dark') ? 'html.dark, body.dark, .dark' : ':root, html:root, body:root';
    const tokenRule = `${selector} { ${style.property}: ${style.value} !important; }`;
    styleElement.textContent = currentCSS + '\n' + tokenRule;
  } else {
    const rule = `${style.selector} { ${style.property}: ${style.value} !important; }`;
    styleElement.textContent = currentCSS + '\n' + rule;
  }
};

/**
 * Removes a specific runtime style
 */
export const removeRuntimeStyle = (selector: string, property: string): void => {
  const styleElement = document.getElementById(RUNTIME_STYLE_ID) as HTMLStyleElement;
  if (!styleElement) return;
  
  const currentCSS = styleElement.textContent || '';
  const lines = currentCSS.split('\n');
  
  // Simple removal - rebuild without the matching rule
  const filteredLines = lines.filter(line => {
    const isMatchingRule = line.includes(selector) && line.includes(property);
    return !isMatchingRule;
  });
  
  styleElement.textContent = filteredLines.join('\n');
};