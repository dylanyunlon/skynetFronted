/**
 * TDD v19 — Module 3: ArtifactRenderer
 * 
 * Manages artifact creation, versioning, type detection, and rendering metadata.
 * Supports HTML, React, SVG, Mermaid, Markdown, Code, PDF artifacts.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  ArtifactType,
  ArtifactMeta,
  createArtifact,
  detectArtifactType,
  updateArtifactContent,
  getArtifactVersion,
  ArtifactStore,
  createArtifactStore,
  addArtifact,
  getArtifact,
  listArtifacts,
  deleteArtifact,
  getArtifactRenderConfig,
  ArtifactRenderConfig,
  extractArtifactFromToolResult,
  validateArtifactContent,
  ArtifactValidation,
} from '@/utils/artifactRenderer';

describe('ArtifactRenderer', () => {

  // ─── Test 1: detectArtifactType ───
  describe('detectArtifactType', () => {
    it('should detect HTML artifacts', () => {
      expect(detectArtifactType('<!DOCTYPE html><html><body>Hello</body></html>')).toBe('html');
      expect(detectArtifactType('<div class="app">content</div>')).toBe('html');
      expect(detectArtifactType('<style>body{}</style><div>test</div>')).toBe('html');
    });

    it('should detect React/JSX artifacts', () => {
      expect(detectArtifactType('import React from "react";\nexport default function App() { return <div/>; }')).toBe('react');
      expect(detectArtifactType('const Component = () => <div className="flex">test</div>')).toBe('react');
      expect(detectArtifactType('import { useState } from "react";\nfunction Counter() {}')).toBe('react');
    });

    it('should detect SVG artifacts', () => {
      expect(detectArtifactType('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle/></svg>')).toBe('svg');
      expect(detectArtifactType('<svg width="200" height="200"><rect/></svg>')).toBe('svg');
    });

    it('should detect Mermaid diagrams', () => {
      expect(detectArtifactType('graph TD\n  A-->B\n  B-->C')).toBe('mermaid');
      expect(detectArtifactType('sequenceDiagram\n  Alice->>Bob: Hello')).toBe('mermaid');
      expect(detectArtifactType('flowchart LR\n  Start --> End')).toBe('mermaid');
    });

    it('should detect Markdown', () => {
      expect(detectArtifactType('# Title\n\nSome **bold** text and a [link](url)')).toBe('markdown');
      expect(detectArtifactType('## Section\n\n- item 1\n- item 2')).toBe('markdown');
    });

    it('should detect code blocks (fallback)', () => {
      expect(detectArtifactType('function hello() {\n  console.log("hi");\n}')).toBe('code');
      expect(detectArtifactType('def main():\n    print("hello")\n')).toBe('code');
    });
  });

  // ─── Test 2: createArtifact ───
  describe('createArtifact', () => {
    it('should create artifact with auto-detected type', () => {
      const artifact = createArtifact({
        title: 'My Dashboard',
        content: '<div className="flex"><h1>Dashboard</h1></div>',
      });
      expect(artifact.id).toBeTruthy();
      expect(artifact.title).toBe('My Dashboard');
      expect(artifact.type).toBe('react'); // auto-detected from className
      expect(artifact.version).toBe(1);
      expect(artifact.createdAt).toBeGreaterThan(0);
    });

    it('should accept explicit type override', () => {
      const artifact = createArtifact({
        title: 'Raw HTML',
        content: '<div>hello</div>',
        type: 'html',
      });
      expect(artifact.type).toBe('html');
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 30; i++) {
        ids.add(createArtifact({ title: `a${i}`, content: 'x' }).id);
      }
      expect(ids.size).toBe(30);
    });
  });

  // ─── Test 3: updateArtifactContent and versioning ───
  describe('updateArtifactContent', () => {
    it('should increment version on content update', () => {
      const v1 = createArtifact({ title: 'Test', content: 'v1 content' });
      expect(v1.version).toBe(1);

      const v2 = updateArtifactContent(v1, 'v2 content');
      expect(v2.version).toBe(2);
      expect(v2.content).toBe('v2 content');
      expect(v2.id).toBe(v1.id); // same ID
      expect(v2.updatedAt).toBeGreaterThanOrEqual(v1.createdAt);
    });

    it('should re-detect type when content type changes', () => {
      const v1 = createArtifact({ title: 'Test', content: '# Markdown title' });
      expect(v1.type).toBe('markdown');

      const v2 = updateArtifactContent(v1, '<svg viewBox="0 0 100 100"><circle/></svg>');
      expect(v2.type).toBe('svg');
    });

    it('should preserve explicit type even on content change', () => {
      const v1 = createArtifact({ title: 'Test', content: 'abc', type: 'html' });
      const v2 = updateArtifactContent(v1, 'def', { preserveType: true });
      expect(v2.type).toBe('html');
    });
  });

  // ─── Test 4: ArtifactStore CRUD ───
  describe('ArtifactStore', () => {
    it('should add, get, list, and delete artifacts', () => {
      let store = createArtifactStore();
      const a1 = createArtifact({ title: 'First', content: '# Hello' });
      const a2 = createArtifact({ title: 'Second', content: '<div>world</div>' });

      store = addArtifact(store, a1);
      store = addArtifact(store, a2);

      expect(listArtifacts(store).length).toBe(2);
      expect(getArtifact(store, a1.id)).toBeTruthy();
      expect(getArtifact(store, a1.id)!.title).toBe('First');

      store = deleteArtifact(store, a1.id);
      expect(listArtifacts(store).length).toBe(1);
      expect(getArtifact(store, a1.id)).toBeNull();
    });

    it('should replace artifact on addArtifact with same ID', () => {
      let store = createArtifactStore();
      const a1 = createArtifact({ title: 'Original', content: 'v1' });
      store = addArtifact(store, a1);

      const a1v2 = updateArtifactContent(a1, 'v2');
      store = addArtifact(store, a1v2);
      expect(listArtifacts(store).length).toBe(1);
      expect(getArtifact(store, a1.id)!.content).toBe('v2');
    });
  });

  // ─── Test 5: getArtifactRenderConfig ───
  describe('getArtifactRenderConfig', () => {
    it('should return sandbox config for HTML artifacts', () => {
      const config = getArtifactRenderConfig('html');
      expect(config.sandbox).toBe(true);
      expect(config.allowScripts).toBe(true);
      expect(config.maxHeight).toBeGreaterThan(0);
    });

    it('should return React render config', () => {
      const config = getArtifactRenderConfig('react');
      expect(config.sandbox).toBe(true);
      expect(config.allowScripts).toBe(true);
      expect(config.framework).toBe('react');
    });

    it('should return SVG config with inline rendering', () => {
      const config = getArtifactRenderConfig('svg');
      expect(config.sandbox).toBe(false); // SVG can render inline
      expect(config.inline).toBe(true);
    });

    it('should return Mermaid config with library requirement', () => {
      const config = getArtifactRenderConfig('mermaid');
      expect(config.requiresLibrary).toBe(true);
      expect(config.library).toBe('mermaid');
    });

    it('should return Markdown config', () => {
      const config = getArtifactRenderConfig('markdown');
      expect(config.sandbox).toBe(false);
      expect(config.allowScripts).toBe(false);
    });
  });

  // ─── Test 6: extractArtifactFromToolResult ───
  describe('extractArtifactFromToolResult', () => {
    it('should extract artifact from create_file tool result', () => {
      const result = extractArtifactFromToolResult(
        'create_file',
        JSON.stringify({
          path: '/mnt/user-data/outputs/dashboard.html',
          content: '<html><body><h1>Dashboard</h1></body></html>',
        })
      );
      expect(result).toBeTruthy();
      expect(result!.title).toContain('dashboard');
      expect(result!.type).toBe('html');
    });

    it('should extract artifact from present_files tool result', () => {
      const result = extractArtifactFromToolResult(
        'present_files',
        JSON.stringify({
          filepaths: ['/mnt/user-data/outputs/chart.jsx'],
        })
      );
      expect(result).toBeTruthy();
    });

    it('should return null for non-artifact tool results', () => {
      const result = extractArtifactFromToolResult(
        'bash_tool',
        JSON.stringify({ returncode: 0, stdout: 'hello', stderr: '' })
      );
      expect(result).toBeNull();
    });
  });

  // ─── Test 7: validateArtifactContent ───
  describe('validateArtifactContent', () => {
    it('should validate HTML content', () => {
      const valid = validateArtifactContent('<div>hello</div>', 'html');
      expect(valid.isValid).toBe(true);

      const invalid = validateArtifactContent('', 'html');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);
    });

    it('should validate React content has export or component', () => {
      const valid = validateArtifactContent(
        'export default function App() { return <div/>; }',
        'react'
      );
      expect(valid.isValid).toBe(true);

      const invalid = validateArtifactContent('const x = 5;', 'react');
      expect(invalid.isValid).toBe(false);
    });

    it('should validate SVG has svg root element', () => {
      const valid = validateArtifactContent('<svg viewBox="0 0 100 100"><circle/></svg>', 'svg');
      expect(valid.isValid).toBe(true);

      const invalid = validateArtifactContent('<div>not svg</div>', 'svg');
      expect(invalid.isValid).toBe(false);
    });

    it('should validate Mermaid has valid diagram keyword', () => {
      const valid = validateArtifactContent('graph TD\n  A-->B', 'mermaid');
      expect(valid.isValid).toBe(true);

      const invalid = validateArtifactContent('just random text', 'mermaid');
      expect(invalid.isValid).toBe(false);
    });
  });

  // ─── Test 8: Artifact file extension mapping ───
  describe('artifact type from file extension', () => {
    it('should detect type from output file paths', () => {
      const htmlResult = extractArtifactFromToolResult('create_file',
        JSON.stringify({ path: '/out/report.html', content: '<h1>Report</h1>' })
      );
      expect(htmlResult?.type).toBe('html');

      const jsxResult = extractArtifactFromToolResult('create_file',
        JSON.stringify({ path: '/out/app.jsx', content: 'export default () => <div/>' })
      );
      expect(jsxResult?.type).toBe('react');

      const svgResult = extractArtifactFromToolResult('create_file',
        JSON.stringify({ path: '/out/logo.svg', content: '<svg><circle/></svg>' })
      );
      expect(svgResult?.type).toBe('svg');

      const mdResult = extractArtifactFromToolResult('create_file',
        JSON.stringify({ path: '/out/readme.md', content: '# Title' })
      );
      expect(mdResult?.type).toBe('markdown');
    });
  });

  // ─── Test 9: Artifact size limits ───
  describe('artifact content limits', () => {
    it('should warn for very large artifacts', () => {
      const largeContent = 'x'.repeat(600000); // 600KB
      const validation = validateArtifactContent(largeContent, 'html');
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.toLowerCase().includes('size') || w.toLowerCase().includes('large'))).toBe(true);
    });
  });

  // ─── Test 10: getArtifactVersion history ───
  describe('getArtifactVersion', () => {
    it('should retrieve specific version from store history', () => {
      let store = createArtifactStore();
      const a1 = createArtifact({ title: 'Evolving', content: 'v1' });
      store = addArtifact(store, a1);

      const a2 = updateArtifactContent(a1, 'v2');
      store = addArtifact(store, a2);

      const a3 = updateArtifactContent(a2, 'v3');
      store = addArtifact(store, a3);

      const latest = getArtifact(store, a1.id);
      expect(latest!.version).toBe(3);
      expect(latest!.content).toBe('v3');
    });
  });
});
