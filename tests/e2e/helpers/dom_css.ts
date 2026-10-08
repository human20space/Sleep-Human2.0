// DOM, HTML, CSS and responsive layout validation helpers for E2E tests

import fs from 'node:fs';
import path from 'node:path';

export interface MetaTagInfo {
  name?: string;
  content?: string;
  rel?: string;
  href?: string;
}

export function parseHtmlMetaAndLinks(htmlContent: string): { metas: MetaTagInfo[]; links: MetaTagInfo[] } {
  const metas: MetaTagInfo[] = [];
  const links: MetaTagInfo[] = [];

  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match;
  while ((match = metaRegex.exec(htmlContent)) !== null) {
    const attrs = match[1];
    const nameMatch = /name=["']([^"']+)["']/i.exec(attrs);
    const contentMatch = /content=["']([^"']+)["']/i.exec(attrs);
    metas.push({
      name: nameMatch ? nameMatch[1] : undefined,
      content: contentMatch ? contentMatch[1] : undefined,
    });
  }

  const linkRegex = /<link\s+([^>]+)>/gi;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const attrs = match[1];
    const relMatch = /rel=["']([^"']+)["']/i.exec(attrs);
    const hrefMatch = /href=["']([^"']+)["']/i.exec(attrs);
    links.push({
      rel: relMatch ? relMatch[1] : undefined,
      href: hrefMatch ? hrefMatch[1] : undefined,
    });
  }

  return { metas, links };
}

export function checkCssRules(cssContent: string) {
  return {
    hasOverflowXHidden: /overflow-x\s*:\s*hidden/i.test(cssContent),
    hasSafeAreaVars: /--sat\s*:\s*env\(safe-area-inset-top/i.test(cssContent) || /env\(safe-area-inset-top\)/i.test(cssContent),
    hasSafeAreaBottom: /--sab\s*:\s*env\(safe-area-inset-bottom/i.test(cssContent) || /env\(safe-area-inset-bottom\)/i.test(cssContent),
    hasInput16pxGuard: /input[^\{]*\{[^}]*font-size\s*:\s*16px/i.test(cssContent) || /font-size\s*:\s*16px\s*!important/i.test(cssContent),
  };
}

export function validateTouchTargetSize(width: number, height: number, minSize = 44): boolean {
  return width >= minSize && height >= minSize;
}

export function inspectDistAssets(distPath: string) {
  if (!fs.existsSync(distPath)) {
    return { exists: false, files: [], indexHtmlExists: false, hasJs: false, hasCss: false };
  }

  const files = fs.readdirSync(distPath, { recursive: true }) as string[];
  const indexHtmlExists = fs.existsSync(path.join(distPath, 'index.html'));
  const hasJs = files.some(f => f.endsWith('.js'));
  const hasCss = files.some(f => f.endsWith('.css'));
  const hasServerFiles = files.some(f => f.endsWith('.node') || f === 'server.js' || f === 'server.cjs');

  return {
    exists: true,
    files,
    indexHtmlExists,
    hasJs,
    hasCss,
    hasServerFiles,
  };
}
