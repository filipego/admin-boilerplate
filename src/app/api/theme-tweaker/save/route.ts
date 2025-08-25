import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface TokenEdit {
  token: string;
  value: string;
  originalValue: string;
  scope?: 'light' | 'dark' | 'both';
}

interface RuntimeStyle {
  selector: string;
  property: string;
  value: string;
  type: 'token' | 'class' | 'instance';
}

export async function POST(request: Request) {
  try {
    const { tokenEdits = [], runtimeStyles = [] } = await request.json() as { tokenEdits: TokenEdit[]; runtimeStyles: RuntimeStyle[] };

    // Build token override blocks
    const lightTokens = tokenEdits.filter(e => e.scope !== 'dark');
    const darkTokens = tokenEdits.filter(e => e.scope === 'dark');

    let css = '/* BEGIN THEME TWEAKER OVERRIDES - DO NOT EDIT MANUALLY */\n';
    css += `/* Generated: ${new Date().toISOString()} */\n`;

    if (lightTokens.length > 0) {
      css += ':root {\n';
      lightTokens.forEach(e => {
        css += `  ${e.token}: ${e.value};\n`;
      });
      css += '}\n\n';
    }

    if (darkTokens.length > 0) {
      css += '.dark {\n';
      darkTokens.forEach(e => {
        css += `  ${e.token}: ${e.value};\n`;
      });
      css += '}\n\n';
    }

    // Class & instance overrides
    const styleOverrides = runtimeStyles.filter(s => s.type === 'class' || s.type === 'instance');
    if (styleOverrides.length > 0) {
      const grouped: Record<string, RuntimeStyle[]> = {};
      styleOverrides.forEach(s => {
        if (!grouped[s.selector]) grouped[s.selector] = [];
        grouped[s.selector].push(s);
      });
      Object.entries(grouped).forEach(([selector, styles]) => {
        css += `${selector} {\n`;
        styles.forEach(s => {
          css += `  ${s.property}: ${s.value} !important;\n`;
        });
        css += '}\n\n';
      });
    }

    css += '/* END THEME TWEAKER OVERRIDES */\n';

    const rootDir = process.cwd();
    const globalsPath = path.join(rootDir, 'src', 'app', 'globals.css');
    let content = await fs.readFile(globalsPath, 'utf8');

    const startMarker = '/* BEGIN THEME TWEAKER OVERRIDES - DO NOT EDIT MANUALLY */';
    const endMarker = '/* END THEME TWEAKER OVERRIDES */';

    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      // Replace existing block
      const before = content.slice(0, startIdx);
      const after = content.slice(endIdx + endMarker.length);
      content = before + css + after;
    } else {
      // Append new block
      if (!content.endsWith('\n')) content += '\n';
      content += '\n' + css;
    }

    await fs.writeFile(globalsPath, content, 'utf8');

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
