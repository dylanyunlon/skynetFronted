/**
 * TDD v21 Module 1: CodeMirror Editor Integration
 * Tests for editor factory, language detection, theme management, extensions
 * Target: src/utils/codemirrorIntegration.ts
 */
import { describe, it, expect } from 'vitest';

// Module under test — does NOT exist yet, tests should fail
import {
  createEditorConfig,
  detectLanguageFromFilename,
  detectLanguageFromContent,
  getLanguageExtension,
  getThemeExtension,
  buildExtensionStack,
  SUPPORTED_LANGUAGES,
  SUPPORTED_THEMES,
  EditorConfig,
  createReadonlyConfig,
  mergeEditorConfigs,
} from '@/utils/codemirrorIntegration';

describe('CodeMirror Integration', () => {
  // --- Language Detection from Filename ---
  describe('detectLanguageFromFilename', () => {
    it('should detect Python from .py extension', () => {
      expect(detectLanguageFromFilename('main.py')).toBe('python');
    });

    it('should detect JavaScript from .js/.jsx/.mjs', () => {
      expect(detectLanguageFromFilename('app.jsx')).toBe('javascript');
      expect(detectLanguageFromFilename('utils.mjs')).toBe('javascript');
    });

    it('should detect TypeScript from .ts/.tsx', () => {
      expect(detectLanguageFromFilename('App.tsx')).toBe('typescript');
      expect(detectLanguageFromFilename('types.ts')).toBe('typescript');
    });

    it('should detect HTML from .html/.htm', () => {
      expect(detectLanguageFromFilename('index.html')).toBe('html');
    });

    it('should detect CSS from .css/.scss/.less', () => {
      expect(detectLanguageFromFilename('styles.css')).toBe('css');
      expect(detectLanguageFromFilename('theme.scss')).toBe('css');
    });

    it('should detect JSON from .json/.jsonc', () => {
      expect(detectLanguageFromFilename('package.json')).toBe('json');
    });

    it('should detect Markdown from .md/.mdx', () => {
      expect(detectLanguageFromFilename('README.md')).toBe('markdown');
    });

    it('should detect shell from .sh/.bash/.zsh', () => {
      expect(detectLanguageFromFilename('deploy.sh')).toBe('shell');
    });

    it('should return null for unknown extensions', () => {
      expect(detectLanguageFromFilename('binary.dat')).toBeNull();
    });

    it('should handle paths with directories', () => {
      expect(detectLanguageFromFilename('src/components/App.tsx')).toBe('typescript');
    });
  });

  // --- Language Detection from Content ---
  describe('detectLanguageFromContent', () => {
    it('should detect Python from shebang', () => {
      expect(detectLanguageFromContent('#!/usr/bin/env python3\nprint("hi")')).toBe('python');
    });

    it('should detect shell from shebang', () => {
      expect(detectLanguageFromContent('#!/bin/bash\necho "hi"')).toBe('shell');
    });

    it('should detect JSON from content structure', () => {
      expect(detectLanguageFromContent('{\n  "name": "test"\n}')).toBe('json');
    });

    it('should detect HTML from doctype or tags', () => {
      expect(detectLanguageFromContent('<!DOCTYPE html>\n<html>')).toBe('html');
    });

    it('should return null for ambiguous content', () => {
      expect(detectLanguageFromContent('hello world')).toBeNull();
    });
  });

  // --- Language Extension ---
  describe('getLanguageExtension', () => {
    it('should return a valid extension for python', () => {
      const ext = getLanguageExtension('python');
      expect(ext).toBeDefined();
      expect(ext).not.toBeNull();
    });

    it('should return a valid extension for javascript', () => {
      const ext = getLanguageExtension('javascript');
      expect(ext).toBeDefined();
    });

    it('should return a valid extension for typescript', () => {
      const ext = getLanguageExtension('typescript');
      expect(ext).toBeDefined();
    });

    it('should return null for unsupported language', () => {
      expect(getLanguageExtension('brainfuck')).toBeNull();
    });
  });

  // --- Theme Extension ---
  describe('getThemeExtension', () => {
    it('should return oneDark theme extension', () => {
      const ext = getThemeExtension('oneDark');
      expect(ext).toBeDefined();
    });

    it('should return default light theme', () => {
      const ext = getThemeExtension('light');
      expect(ext).toBeDefined();
    });

    it('should fallback to oneDark for unknown theme', () => {
      const ext = getThemeExtension('nonexistent');
      expect(ext).toBeDefined();
    });
  });

  // --- Editor Config Factory ---
  describe('createEditorConfig', () => {
    it('should create config with defaults', () => {
      const config = createEditorConfig({});
      expect(config.readOnly).toBe(false);
      expect(config.lineNumbers).toBe(true);
      expect(config.theme).toBe('oneDark');
      expect(config.tabSize).toBe(2);
    });

    it('should override defaults with provided values', () => {
      const config = createEditorConfig({ readOnly: true, tabSize: 4, theme: 'light' });
      expect(config.readOnly).toBe(true);
      expect(config.tabSize).toBe(4);
      expect(config.theme).toBe('light');
    });

    it('should include language when filename is provided', () => {
      const config = createEditorConfig({ filename: 'app.tsx' });
      expect(config.language).toBe('typescript');
    });
  });

  // --- Readonly Config ---
  describe('createReadonlyConfig', () => {
    it('should always set readOnly to true', () => {
      const config = createReadonlyConfig({ filename: 'test.py' });
      expect(config.readOnly).toBe(true);
    });

    it('should not allow override of readOnly', () => {
      const config = createReadonlyConfig({ readOnly: false } as any);
      expect(config.readOnly).toBe(true);
    });
  });

  // --- Extension Stack ---
  describe('buildExtensionStack', () => {
    it('should return an array of extensions', () => {
      const config = createEditorConfig({ filename: 'test.py' });
      const extensions = buildExtensionStack(config);
      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length).toBeGreaterThan(0);
    });

    it('should include language extension when language is set', () => {
      const config = createEditorConfig({ language: 'python' });
      const extensions = buildExtensionStack(config);
      // Should have at least theme + language + basic extensions
      expect(extensions.length).toBeGreaterThanOrEqual(3);
    });

    it('should include readonly extension when readOnly is true', () => {
      const config = createEditorConfig({ readOnly: true });
      const extensions = buildExtensionStack(config);
      expect(extensions.length).toBeGreaterThan(0);
    });
  });

  // --- Merge Configs ---
  describe('mergeEditorConfigs', () => {
    it('should merge two configs with second taking precedence', () => {
      const base = createEditorConfig({ theme: 'light', tabSize: 2 });
      const override = { theme: 'oneDark' as const, lineNumbers: false };
      const merged = mergeEditorConfigs(base, override);
      expect(merged.theme).toBe('oneDark');
      expect(merged.tabSize).toBe(2);
      expect(merged.lineNumbers).toBe(false);
    });
  });

  // --- Constants ---
  describe('SUPPORTED_LANGUAGES', () => {
    it('should contain at least 8 languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(8);
    });

    it('should include python, javascript, typescript', () => {
      expect(SUPPORTED_LANGUAGES).toContain('python');
      expect(SUPPORTED_LANGUAGES).toContain('javascript');
      expect(SUPPORTED_LANGUAGES).toContain('typescript');
    });
  });

  describe('SUPPORTED_THEMES', () => {
    it('should contain at least oneDark and light', () => {
      expect(SUPPORTED_THEMES).toContain('oneDark');
      expect(SUPPORTED_THEMES).toContain('light');
    });
  });
});
