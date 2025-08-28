/**
 * Utility functions for color conversion and manipulation
 */

export const toHEX = (input: string): string | null => {
  const value = input.trim();
  try {
    // Stable OKLCH -> HEX conversion (high precision, round at the very end)
    const oklchToHex = (L: number, C: number, H: number): string => {
      const a = C * Math.cos((H * Math.PI) / 180);
      const b = C * Math.sin((H * Math.PI) / 180);

      let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      let s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      l_ = l_ ** 3;
      m_ = m_ ** 3;
      s_ = s_ ** 3;

      let r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
      let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
      let b_ = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

      const lin2srgb = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

      r = lin2srgb(r);
      g = lin2srgb(g);
      b_ = lin2srgb(b_);

      r = Math.min(1, Math.max(0, r));
      g = Math.min(1, Math.max(0, g));
      b_ = Math.min(1, Math.max(0, b_));

      const hex = [r, g, b_]
        .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      return `#${hex}`;
    };

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
      const m = value.match(/oklch\(([^)]+)\)/i);
      if (!m) return null;
      const parts = m[1].split(/[\s\/]+/).filter(Boolean);
      if (parts.length < 3) return null;
      let L = parseFloat(parts[0]);
      if (parts[0].includes('%')) L = parseFloat(parts[0]) / 100;
      const C = parseFloat(parts[1]);
      const Hdeg = parseFloat(parts[2]);
      const hex = oklchToHex(L, C, Hdeg);
      return hex;
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

/**
 * Format a CSS value for display - converts colors to hex, handles opacity with rgba
 */
export const formatCSSValue = (property: string, value: string): string => {
  // Debug logging for border colors
  if (property.includes('border') && property.includes('color')) {
    console.log(`[formatCSSValue] Border color: ${property} = ${value}`);
  }

  // Handle color properties
  if (property.includes('color') || property.includes('Color')) {
    // If it has opacity (rgba, hsla, etc.), keep the format
    if (value.includes('rgba') || value.includes('hsla')) {
      if (property.includes('border') && property.includes('color')) {
        console.log(`[formatCSSValue] Keeping rgba: ${value}`);
      }
      return value;
    }

    // Handle colors with opacity syntax: lab(100 0 0 / 0.1), oklch(0.6 0.2 25 / 0.8), etc.
    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 2) {
        const baseColor = parts[0].trim();
        const alpha = parts[1].trim();

        // Try to convert base color to RGB first
        const tempDiv = document.createElement('div');
        tempDiv.style.color = baseColor;
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        const computedColor = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);

        // Extract RGB values and combine with alpha
        const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const r = rgbMatch[1];
          const g = rgbMatch[2];
          const b = rgbMatch[3];
          const alphaValue = alpha.includes('%') ? parseFloat(alpha) / 100 : parseFloat(alpha);
          const result = `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
          if (property.includes('border') && property.includes('color')) {
            console.log(`[formatCSSValue] Converted opacity syntax to rgba: ${value} -> ${result}`);
          }
          return result;
        }
      }
    }

    // For borders specifically, check if they might have inherited opacity
    // This is a heuristic - if it's a border color and looks like it might have opacity
    if (property.includes('border') && property.includes('color')) {
      // Check if this color might be semi-transparent by comparing with related colors
      // This is a best-effort approach since we don't have the original opacity info
      const tempDiv = document.createElement('div');
      tempDiv.style.color = value;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      const computed = getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);

      // If computed style shows rgba, preserve it
      if (computed.includes('rgba')) {
        console.log(`[formatCSSValue] Computed style shows rgba: ${computed}`);
        return computed;
      }

      // Check if the original value might have been rgba but got converted
      // by looking at the element's actual computed style
      try {
        // Try to find the actual element and get its computed border color
        const elements = document.querySelectorAll('*');
        for (const element of elements) {
          const computedBorderColor = getComputedStyle(element).borderColor;
          const computedBorderTopColor = getComputedStyle(element).borderTopColor;
          const computedBorderRightColor = getComputedStyle(element).borderRightColor;
          const computedBorderBottomColor = getComputedStyle(element).borderBottomColor;
          const computedBorderLeftColor = getComputedStyle(element).borderLeftColor;

          // Check if any border color contains rgba
          if (computedBorderColor.includes('rgba') ||
              computedBorderTopColor.includes('rgba') ||
              computedBorderRightColor.includes('rgba') ||
              computedBorderBottomColor.includes('rgba') ||
              computedBorderLeftColor.includes('rgba')) {

            if (computedBorderColor.includes('rgba')) {
              console.log(`[formatCSSValue] Found rgba in computed border-color: ${computedBorderColor}`);
              return computedBorderColor;
            }
            if (computedBorderTopColor.includes('rgba')) {
              console.log(`[formatCSSValue] Found rgba in computed border-top-color: ${computedBorderTopColor}`);
              return computedBorderTopColor;
            }
            if (computedBorderRightColor.includes('rgba')) {
              console.log(`[formatCSSValue] Found rgba in computed border-right-color: ${computedBorderRightColor}`);
              return computedBorderRightColor;
            }
            if (computedBorderBottomColor.includes('rgba')) {
              console.log(`[formatCSSValue] Found rgba in computed border-bottom-color: ${computedBorderBottomColor}`);
              return computedBorderBottomColor;
            }
            if (computedBorderLeftColor.includes('rgba')) {
              console.log(`[formatCSSValue] Found rgba in computed border-left-color: ${computedBorderLeftColor}`);
              return computedBorderLeftColor;
            }
          }
        }
      } catch (error) {
        console.log(`[formatCSSValue] Error checking computed styles: ${error}`);
      }
    }

    // If it's already a hex value, return as is
    if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
      if (property.includes('border') && property.includes('color')) {
        console.log(`[formatCSSValue] Keeping hex: ${value}`);
      }
      return value;
    }

    // Try to convert to hex for solid colors
    const hexValue = toHEX(value);
    if (hexValue) {
      if (property.includes('border') && property.includes('color')) {
        console.log(`[formatCSSValue] Converted to hex: ${value} -> ${hexValue}`);
      }
      return hexValue;
    }
  }

  // Return original value for non-color properties
  return value;
};
