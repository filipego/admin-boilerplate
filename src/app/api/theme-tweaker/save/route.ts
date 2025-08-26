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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { tokenEdits = [], runtimeStyles = [] } = await request.json() as { tokenEdits: TokenEdit[]; runtimeStyles: RuntimeStyle[] };
    console.log('[ThemeTweaker/save] payload', {
      tokenEditsCount: tokenEdits.length,
      runtimeStylesCount: runtimeStyles.length,
      sample: tokenEdits.slice(0, 5)
    });

    // Build token override blocks
    const lightTokens = tokenEdits.filter(e => e.scope !== 'dark');
    const darkTokens = tokenEdits.filter(e => e.scope === 'dark');

    // Class & instance overrides (still appended below)
    const styleOverrides = runtimeStyles.filter(s => s.type === 'class' || s.type === 'instance');

    const rootDir = process.cwd();
    const globalsPath = path.join(rootDir, 'src', 'app', 'globals.css');
    console.log('[ThemeTweaker/save] target file', globalsPath);
    let content = await fs.readFile(globalsPath, 'utf8');

    // 1) Replace existing values directly inside the main :root and .dark blocks
    const replaceInBlock = (src: string, selectorRegex: RegExp, updates: TokenEdit[]): { updated: string, changed: boolean } => {
      const match = selectorRegex.exec(src);
      if (!match) return { updated: src, changed: false };
      const blockStart = match.index;
      // Find corresponding closing brace starting from match.index
      let depth = 0; let end = -1;
      for (let i = blockStart; i < src.length; i++) {
        const ch = src[i];
        if (ch === '{') depth++;
        if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end === -1) return { updated: src, changed: false };
      const before = src.slice(0, blockStart);
      const block = src.slice(blockStart, end + 1);
      const after = src.slice(end + 1);
      let newBlock = block;
      let changed = false;
      for (const u of updates) {
        // Try to replace existing token line
        const escaped = u.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const lineRe = new RegExp(`(\\n\\s*)(${escaped})(\\s*:\\s*)([^;]+)(;)`, 'm');
        if (lineRe.test(newBlock)) {
          newBlock = newBlock.replace(lineRe, (_m, pre, name, colon, _old, semi) => `${pre}${name}${colon}${u.value}${semi}`);
          changed = true;
        } else {
          // Insert before closing brace
          newBlock = newBlock.replace(/\n\s*}\s*$/, `\n  ${u.token}: ${u.value};\n}`);
          changed = true;
        }
      }
      return { updated: before + newBlock + after, changed };
    };

    // Replace in :root or ::root
    let didChange = false;
    if (lightTokens.length > 0) {
      const res1 = replaceInBlock(content, /(^|[\s{]):(:+)?root\s*\{/m, lightTokens);
      content = res1.updated; didChange = didChange || res1.changed;
    }
    if (darkTokens.length > 0) {
      const res2 = replaceInBlock(content, /(^|[\s{])\.dark\s*\{/m, darkTokens);
      content = res2.updated; didChange = didChange || res2.changed;
    }

    // 2) Remove any previous overrides block we might have appended earlier
    const startMarker = '/* BEGIN THEME TWEAKER OVERRIDES - DO NOT EDIT MANUALLY */';
    const endMarker = '/* END THEME TWEAKER OVERRIDES */';
    const sIdx = content.indexOf(startMarker);
    const eIdx = content.indexOf(endMarker);
    if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
      const before = content.slice(0, sIdx);
      const after = content.slice(eIdx + endMarker.length);
      content = before + after;
      didChange = true;
    }

    // 3) Always append a fresh overrides block for explicit precedence
    {
      let css = startMarker + '\n';
      css += `/* Generated: ${new Date().toISOString()} */\n`;
      if (lightTokens.length > 0) {
        css += ':root, html:root, body:root {\n';
        lightTokens.forEach(e => { css += `  ${e.token}: ${e.value} !important;\n`; });
        css += '}\n\n';
      }
      if (darkTokens.length > 0) {
        css += 'html.dark, body.dark, .dark {\n';
        darkTokens.forEach(e => { css += `  ${e.token}: ${e.value} !important;\n`; });
        css += '}\n\n';
      }
      if (styleOverrides.length > 0) {
        const grouped: Record<string, RuntimeStyle[]> = {};
        styleOverrides.forEach(s => { if (!grouped[s.selector]) grouped[s.selector] = []; grouped[s.selector].push(s); });
        Object.entries(grouped).forEach(([selector, styles]) => {
          css += `${selector} {\n`;
          styles.forEach(s => { css += `  ${s.property}: ${s.value} !important;\n`; });
          css += '}\n\n';
        });
      }
      css += endMarker + '\n';
      if (!content.endsWith('\n')) content += '\n';
      content += '\n' + css;
    }

    await fs.writeFile(globalsPath, content, 'utf8');
    console.log('[ThemeTweaker/save] wrote file successfully');

    return NextResponse.json({ ok: true, wrotePath: globalsPath, lightCount: lightTokens.length, darkCount: darkTokens.length });
  } catch (error: any) {
    console.error('[ThemeTweaker/save] error', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
