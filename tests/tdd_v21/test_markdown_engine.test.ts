/**
 * TDD v21 Module 9: Markdown Renderer Engine
 * Tests for markdown processing, code block extraction, rehype integration
 * Target: src/utils/markdownEngine.ts
 */
import { describe, it, expect } from 'vitest';

import {
  extractCodeBlocks,
  CodeBlock,
  parseMarkdownMeta,
  MarkdownMeta,
  detectCodeLanguage,
  formatInlineCode,
  splitMarkdownSections,
  MarkdownSection,
  extractLinks,
  MarkdownLink,
  processThinkingBlocks,
  ThinkingBlock,
  estimateReadTime,
  countWords,
  sanitizeMarkdown,
} from '@/utils/markdownEngine';

describe('Markdown Engine', () => {
  // --- Code Block Extraction ---
  describe('extractCodeBlocks', () => {
    it('should extract fenced code blocks', () => {
      const md = '# Title\n\n```python\nprint("hi")\n```\n\nMore text';
      const blocks = extractCodeBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].language).toBe('python');
      expect(blocks[0].code).toBe('print("hi")');
    });

    it('should extract multiple code blocks', () => {
      const md = '```js\nconst a = 1;\n```\n\n```python\nx = 2\n```';
      const blocks = extractCodeBlocks(md);
      expect(blocks.length).toBe(2);
    });

    it('should handle code blocks without language', () => {
      const md = '```\nplain code\n```';
      const blocks = extractCodeBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].language).toBe('');
    });

    it('should return empty array for no code blocks', () => {
      expect(extractCodeBlocks('Just text')).toEqual([]);
    });

    it('should handle triple backtick with metadata', () => {
      const md = '```typescript title="app.ts"\nconst x: number = 1;\n```';
      const blocks = extractCodeBlocks(md);
      expect(blocks[0].language).toBe('typescript');
    });

    it('should preserve indentation in code', () => {
      const md = '```python\ndef foo():\n    return 42\n```';
      const blocks = extractCodeBlocks(md);
      expect(blocks[0].code).toContain('    return 42');
    });
  });

  // --- Code Language Detection ---
  describe('detectCodeLanguage', () => {
    it('should detect Python from def/import', () => {
      expect(detectCodeLanguage('import os\ndef main():\n    pass')).toBe('python');
    });

    it('should detect JavaScript from const/let/function', () => {
      expect(detectCodeLanguage('const x = 1;\nfunction foo() {}')).toBe('javascript');
    });

    it('should detect bash from common commands', () => {
      expect(detectCodeLanguage('#!/bin/bash\ncd /path && ls -la')).toBe('bash');
    });

    it('should detect JSON from structure', () => {
      expect(detectCodeLanguage('{\n  "key": "value"\n}')).toBe('json');
    });

    it('should return null for ambiguous code', () => {
      expect(detectCodeLanguage('x = 1')).toBeNull();
    });
  });

  // --- Markdown Meta ---
  describe('parseMarkdownMeta', () => {
    it('should count headings', () => {
      const md = '# H1\n## H2\n### H3\ntext';
      const meta = parseMarkdownMeta(md);
      expect(meta.headingCount).toBe(3);
    });

    it('should count code blocks', () => {
      const md = '```\ncode\n```\n\n```\nmore\n```';
      const meta = parseMarkdownMeta(md);
      expect(meta.codeBlockCount).toBe(2);
    });

    it('should count links', () => {
      const md = '[link1](http://a.com) and [link2](http://b.com)';
      const meta = parseMarkdownMeta(md);
      expect(meta.linkCount).toBe(2);
    });

    it('should estimate word count', () => {
      const md = 'This has five words here';
      const meta = parseMarkdownMeta(md);
      expect(meta.wordCount).toBe(5);
    });

    it('should detect if content has thinking blocks', () => {
      const md = '<thinking>\nStep 1...\n</thinking>\n\nResult';
      const meta = parseMarkdownMeta(md);
      expect(meta.hasThinking).toBe(true);
    });
  });

  // --- Inline Code ---
  describe('formatInlineCode', () => {
    it('should wrap text in backticks', () => {
      expect(formatInlineCode('npm install')).toBe('`npm install`');
    });

    it('should handle already backticked text', () => {
      expect(formatInlineCode('`already`')).toBe('`already`');
    });
  });

  // --- Section Splitting ---
  describe('splitMarkdownSections', () => {
    it('should split by headings', () => {
      const md = '# Intro\ntext1\n## Methods\ntext2\n## Results\ntext3';
      const sections = splitMarkdownSections(md);
      expect(sections.length).toBe(3);
    });

    it('should include heading level', () => {
      const md = '# H1\ntext\n## H2\ntext';
      const sections = splitMarkdownSections(md);
      expect(sections[0].level).toBe(1);
      expect(sections[1].level).toBe(2);
    });

    it('should handle no headings', () => {
      const sections = splitMarkdownSections('Just plain text');
      expect(sections.length).toBe(1);
      expect(sections[0].level).toBe(0);
    });
  });

  // --- Link Extraction ---
  describe('extractLinks', () => {
    it('should extract markdown links', () => {
      const md = 'Visit [Google](https://google.com) and [GitHub](https://github.com)';
      const links = extractLinks(md);
      expect(links.length).toBe(2);
      expect(links[0].text).toBe('Google');
      expect(links[0].url).toBe('https://google.com');
    });

    it('should extract bare URLs', () => {
      const md = 'Go to https://example.com for more';
      const links = extractLinks(md);
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty for no links', () => {
      expect(extractLinks('No links here')).toEqual([]);
    });
  });

  // --- Thinking Blocks ---
  describe('processThinkingBlocks', () => {
    it('should extract thinking content', () => {
      const md = '<thinking>\nLet me analyze...\n</thinking>\n\nHere is the result.';
      const result = processThinkingBlocks(md);
      expect(result.thinkingBlocks.length).toBe(1);
      expect(result.thinkingBlocks[0].content).toContain('analyze');
    });

    it('should return clean content without thinking tags', () => {
      const md = '<thinking>\nthink...\n</thinking>\n\nClean result.';
      const result = processThinkingBlocks(md);
      expect(result.cleanContent).not.toContain('<thinking>');
      expect(result.cleanContent).toContain('Clean result');
    });

    it('should handle multiple thinking blocks', () => {
      const md = '<thinking>A</thinking>\ntext\n<thinking>B</thinking>';
      const result = processThinkingBlocks(md);
      expect(result.thinkingBlocks.length).toBe(2);
    });

    it('should handle no thinking blocks', () => {
      const result = processThinkingBlocks('No thinking here');
      expect(result.thinkingBlocks).toEqual([]);
      expect(result.cleanContent).toBe('No thinking here');
    });
  });

  // --- Utilities ---
  describe('estimateReadTime', () => {
    it('should estimate ~1 min for 200 words', () => {
      const words = Array(200).fill('word').join(' ');
      const minutes = estimateReadTime(words);
      expect(minutes).toBeCloseTo(1, 0);
    });

    it('should return 0 for empty text', () => {
      expect(estimateReadTime('')).toBe(0);
    });
  });

  describe('countWords', () => {
    it('should count words accurately', () => {
      expect(countWords('one two three')).toBe(3);
    });

    it('should ignore multiple spaces', () => {
      expect(countWords('one   two   three')).toBe(3);
    });

    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });
  });

  describe('sanitizeMarkdown', () => {
    it('should remove script tags', () => {
      const result = sanitizeMarkdown('text <script>alert("xss")</script> more');
      expect(result).not.toContain('<script>');
    });

    it('should preserve code blocks', () => {
      const md = '```\n<script>ok</script>\n```';
      const result = sanitizeMarkdown(md);
      expect(result).toContain('```');
    });

    it('should preserve regular markdown', () => {
      const md = '# Title\n\n**bold** and *italic*';
      expect(sanitizeMarkdown(md)).toBe(md);
    });
  });
});
