/**
 * Theme System — Claude Design Tokens, CSS variable management, theme switching
 * v21 Module 8
 */

export type ThemeMode = 'dark' | 'light';

export interface ThemeConfig {
  mode: ThemeMode;
  fontFamily: string;
  monoFontFamily: string;
  borderRadius: number;
}

export interface ThemeVariables {
  [key: string]: string;
}

export const CLAUDE_DESIGN_TOKENS = {
  colors: {
    background: '#1a1a2e',
    foreground: '#e5e5e5',
    primary: '#6c63ff',
    secondary: '#2d2d44',
    muted: '#999999',
    accent: '#8b5cf6',
    border: '#3d3d5c',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    surface: '#16162a',
    card: '#22223a',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    monoFamily: 'Menlo, Monaco, Consolas, monospace',
    sizes: { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '24px' },
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.4)',
    lg: '0 10px 15px rgba(0,0,0,0.5)',
  },
};

export function createThemeConfig(opts: Partial<ThemeConfig>): ThemeConfig {
  return {
    mode: opts.mode ?? 'dark',
    fontFamily: opts.fontFamily ?? CLAUDE_DESIGN_TOKENS.typography.fontFamily,
    monoFontFamily: opts.monoFontFamily ?? CLAUDE_DESIGN_TOKENS.typography.monoFamily,
    borderRadius: opts.borderRadius ?? 8,
  };
}

export function getTokenValue(path: string): string | null {
  const parts = path.split('.');
  let current: any = CLAUDE_DESIGN_TOKENS;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return null;
    current = current[p];
  }
  return typeof current === 'string' ? current : null;
}

const DARK_VARS: ThemeVariables = {
  '--background': '#1a1a2e',
  '--foreground': '#e5e5e5',
  '--primary': '#6c63ff',
  '--secondary': '#2d2d44',
  '--muted': '#999999',
  '--accent': '#8b5cf6',
  '--border': '#3d3d5c',
  '--card': '#22223a',
  '--success': '#22c55e',
  '--error': '#ef4444',
  '--warning': '#f59e0b',
  '--info': '#3b82f6',
};

const LIGHT_VARS: ThemeVariables = {
  '--background': '#ffffff',
  '--foreground': '#1a1a2e',
  '--primary': '#6c63ff',
  '--secondary': '#f3f4f6',
  '--muted': '#6b7280',
  '--accent': '#7c3aed',
  '--border': '#e5e7eb',
  '--card': '#f9fafb',
  '--success': '#16a34a',
  '--error': '#dc2626',
  '--warning': '#d97706',
  '--info': '#2563eb',
};

export function resolveThemeVariables(mode: ThemeMode): ThemeVariables {
  return mode === 'dark' ? { ...DARK_VARS } : { ...LIGHT_VARS };
}

export function serializeThemeToCSS(vars: ThemeVariables, wrapInRoot = false): string {
  const lines = Object.entries(vars).map(([k, v]) => `${k}: ${v};`);
  const body = lines.join('\n  ');
  if (wrapInRoot) {
    return `:root {\n  ${body}\n}`;
  }
  return body;
}

export function parseThemeFromCSS(css: string): ThemeVariables {
  const result: ThemeVariables = {};
  if (!css) return result;
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    result[match[1]] = match[2].trim();
  }
  return result;
}

export function mergeThemes(base: ThemeVariables, custom: Partial<ThemeVariables>): ThemeVariables {
  return { ...base, ...custom };
}

export function createClaudeDarkTheme(): ThemeVariables {
  return resolveThemeVariables('dark');
}

export function createClaudeLightTheme(): ThemeVariables {
  return resolveThemeVariables('light');
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '');
  if (m.length !== 6) return null;
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const lum = luminance(...rgb);
  return lum > 0.179 ? '#1a1a2e' : '#ffffff';
}

export function isAccessibleContrast(fg: string, bg: string): boolean {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return false;
  const l1 = luminance(...fgRgb);
  const l2 = luminance(...bgRgb);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio >= 4.5; // WCAG AA
}

const SEMANTIC_COLORS: Record<string, Record<ThemeMode, string>> = {
  success: { dark: '#22c55e', light: '#16a34a' },
  error: { dark: '#ef4444', light: '#dc2626' },
  warning: { dark: '#f59e0b', light: '#d97706' },
  info: { dark: '#3b82f6', light: '#2563eb' },
};

export function getSemanticColor(semantic: string, mode: ThemeMode): string | null {
  const entry = SEMANTIC_COLORS[semantic];
  if (!entry) return null;
  return entry[mode] ?? null;
}
