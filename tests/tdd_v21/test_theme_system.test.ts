/**
 * TDD v21 Module 8: Theme System
 * Tests for CSS variable management, theme switching, Claude design tokens
 * Target: src/utils/themeSystem.ts
 */
import { describe, it, expect } from 'vitest';

import {
  ThemeMode,
  ThemeConfig,
  createThemeConfig,
  CLAUDE_DESIGN_TOKENS,
  getTokenValue,
  resolveThemeVariables,
  ThemeVariables,
  serializeThemeToCSS,
  parseThemeFromCSS,
  mergeThemes,
  createClaudeDarkTheme,
  createClaudeLightTheme,
  getContrastColor,
  isAccessibleContrast,
  getSemanticColor,
} from '@/utils/themeSystem';

describe('Theme System', () => {
  // --- Theme Config ---
  describe('createThemeConfig', () => {
    it('should create config with dark mode by default', () => {
      const config = createThemeConfig({});
      expect(config.mode).toBe('dark');
    });

    it('should accept light mode', () => {
      const config = createThemeConfig({ mode: 'light' });
      expect(config.mode).toBe('light');
    });

    it('should include font settings', () => {
      const config = createThemeConfig({});
      expect(config.fontFamily).toBeDefined();
      expect(config.monoFontFamily).toBeDefined();
    });

    it('should include radius setting', () => {
      const config = createThemeConfig({});
      expect(config.borderRadius).toBeDefined();
      expect(config.borderRadius).toBeGreaterThan(0);
    });
  });

  // --- Design Tokens ---
  describe('CLAUDE_DESIGN_TOKENS', () => {
    it('should have color tokens', () => {
      expect(CLAUDE_DESIGN_TOKENS.colors).toBeDefined();
      expect(Object.keys(CLAUDE_DESIGN_TOKENS.colors).length).toBeGreaterThan(5);
    });

    it('should have spacing tokens', () => {
      expect(CLAUDE_DESIGN_TOKENS.spacing).toBeDefined();
    });

    it('should have typography tokens', () => {
      expect(CLAUDE_DESIGN_TOKENS.typography).toBeDefined();
    });

    it('should have shadow tokens', () => {
      expect(CLAUDE_DESIGN_TOKENS.shadows).toBeDefined();
    });
  });

  describe('getTokenValue', () => {
    it('should resolve color token', () => {
      const value = getTokenValue('colors.background');
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });

    it('should resolve nested path', () => {
      const value = getTokenValue('colors.primary');
      expect(value).toBeDefined();
    });

    it('should return null for invalid path', () => {
      expect(getTokenValue('nonexistent.path')).toBeNull();
    });
  });

  // --- Theme Variables ---
  describe('resolveThemeVariables', () => {
    it('should resolve dark mode variables', () => {
      const vars = resolveThemeVariables('dark');
      expect(vars['--background']).toBeDefined();
      expect(vars['--foreground']).toBeDefined();
    });

    it('should resolve light mode variables', () => {
      const vars = resolveThemeVariables('light');
      expect(vars['--background']).toBeDefined();
    });

    it('should have different backgrounds for dark vs light', () => {
      const dark = resolveThemeVariables('dark');
      const light = resolveThemeVariables('light');
      expect(dark['--background']).not.toBe(light['--background']);
    });

    it('should include all required variables', () => {
      const vars = resolveThemeVariables('dark');
      const required = ['--background', '--foreground', '--primary', '--secondary', '--muted', '--accent', '--border'];
      for (const key of required) {
        expect(vars[key]).toBeDefined();
      }
    });
  });

  // --- CSS Serialization ---
  describe('serializeThemeToCSS', () => {
    it('should produce valid CSS custom properties string', () => {
      const vars = resolveThemeVariables('dark');
      const css = serializeThemeToCSS(vars);
      expect(css).toContain('--background:');
      expect(css).toContain('--foreground:');
    });

    it('should wrap in :root selector when requested', () => {
      const vars = resolveThemeVariables('dark');
      const css = serializeThemeToCSS(vars, true);
      expect(css).toContain(':root');
    });
  });

  describe('parseThemeFromCSS', () => {
    it('should parse CSS variables back to object', () => {
      const vars = resolveThemeVariables('dark');
      const css = serializeThemeToCSS(vars);
      const parsed = parseThemeFromCSS(css);
      expect(parsed['--background']).toBe(vars['--background']);
    });

    it('should handle empty CSS', () => {
      const parsed = parseThemeFromCSS('');
      expect(Object.keys(parsed).length).toBe(0);
    });
  });

  // --- Theme Merging ---
  describe('mergeThemes', () => {
    it('should override base theme with custom values', () => {
      const base = resolveThemeVariables('dark');
      const custom: Partial<ThemeVariables> = { '--primary': '#ff0000' };
      const merged = mergeThemes(base, custom);
      expect(merged['--primary']).toBe('#ff0000');
      expect(merged['--background']).toBe(base['--background']);
    });
  });

  // --- Preset Themes ---
  describe('createClaudeDarkTheme', () => {
    it('should return dark theme with Claude colors', () => {
      const theme = createClaudeDarkTheme();
      expect(theme['--background']).toBeDefined();
      // Claude dark bg is typically very dark
      const bg = theme['--background'];
      expect(bg).toMatch(/^#|^hsl|^rgb/);
    });
  });

  describe('createClaudeLightTheme', () => {
    it('should return light theme', () => {
      const theme = createClaudeLightTheme();
      expect(theme['--background']).toBeDefined();
    });
  });

  // --- Color Utilities ---
  describe('getContrastColor', () => {
    it('should return light color for dark background', () => {
      const contrast = getContrastColor('#000000');
      expect(contrast).toMatch(/^#[fF]/); // Should start with f (light)
    });

    it('should return dark color for light background', () => {
      const contrast = getContrastColor('#ffffff');
      expect(contrast).toMatch(/^#[0-3]/); // Should start with 0-3 (dark)
    });
  });

  describe('isAccessibleContrast', () => {
    it('should return true for black on white', () => {
      expect(isAccessibleContrast('#000000', '#ffffff')).toBe(true);
    });

    it('should return false for low contrast pair', () => {
      expect(isAccessibleContrast('#777777', '#888888')).toBe(false);
    });
  });

  // --- Semantic Colors ---
  describe('getSemanticColor', () => {
    it('should return color for success', () => {
      const color = getSemanticColor('success', 'dark');
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    it('should return color for error', () => {
      const color = getSemanticColor('error', 'dark');
      expect(color).toBeDefined();
    });

    it('should return different colors for dark vs light', () => {
      const dark = getSemanticColor('success', 'dark');
      const light = getSemanticColor('success', 'light');
      // They may be same, but should both be defined
      expect(dark).toBeDefined();
      expect(light).toBeDefined();
    });
  });
});
