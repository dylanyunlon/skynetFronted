/**
 * TDD v21 Module 3: Terminal Emulator Manager
 * Tests for xterm.js integration wrapper, ANSI processing, terminal config
 * Target: src/utils/terminalManager.ts
 */
import { describe, it, expect } from 'vitest';

import {
  createTerminalConfig,
  TerminalConfig,
  parseAnsiToSegments,
  AnsiSegment,
  stripAnsiCodes,
  detectAnsiColorCode,
  TerminalTheme,
  TERMINAL_THEMES,
  getTerminalTheme,
  buildTerminalOptions,
  formatCommandPrompt,
  parseExitCode,
  TerminalSessionState,
  createTerminalSession,
  appendToSession,
} from '@/utils/terminalManager';

describe('Terminal Manager', () => {
  // --- Terminal Config ---
  describe('createTerminalConfig', () => {
    it('should create config with default values', () => {
      const config = createTerminalConfig({});
      expect(config.fontSize).toBe(13);
      expect(config.fontFamily).toContain('monospace');
      expect(config.cursorBlink).toBe(true);
      expect(config.theme).toBe('claude-dark');
    });

    it('should override defaults', () => {
      const config = createTerminalConfig({ fontSize: 16, cursorBlink: false });
      expect(config.fontSize).toBe(16);
      expect(config.cursorBlink).toBe(false);
    });

    it('should clamp fontSize to reasonable range', () => {
      const small = createTerminalConfig({ fontSize: 4 });
      expect(small.fontSize).toBeGreaterThanOrEqual(8);
      const big = createTerminalConfig({ fontSize: 100 });
      expect(big.fontSize).toBeLessThanOrEqual(32);
    });
  });

  // --- ANSI Parsing ---
  describe('parseAnsiToSegments', () => {
    it('should parse plain text as single segment', () => {
      const segments = parseAnsiToSegments('hello world');
      expect(segments.length).toBe(1);
      expect(segments[0].text).toBe('hello world');
      expect(segments[0].color).toBeNull();
    });

    it('should parse red ANSI code', () => {
      const segments = parseAnsiToSegments('\x1b[31mERROR\x1b[0m rest');
      const red = segments.find((s: AnsiSegment) => s.color === 'red');
      expect(red).toBeDefined();
      expect(red!.text).toBe('ERROR');
    });

    it('should parse green ANSI code', () => {
      const segments = parseAnsiToSegments('\x1b[32mPASSED\x1b[0m');
      const green = segments.find((s: AnsiSegment) => s.color === 'green');
      expect(green).toBeDefined();
    });

    it('should handle bold + color', () => {
      const segments = parseAnsiToSegments('\x1b[1;33mWARN\x1b[0m');
      const warn = segments.find((s: AnsiSegment) => s.text === 'WARN');
      expect(warn).toBeDefined();
      expect(warn!.bold).toBe(true);
    });

    it('should handle nested/multiple sequences', () => {
      const segments = parseAnsiToSegments('\x1b[31mred\x1b[32mgreen\x1b[0m');
      expect(segments.length).toBeGreaterThanOrEqual(2);
    });
  });

  // --- Strip ANSI ---
  describe('stripAnsiCodes', () => {
    it('should remove all ANSI escape codes', () => {
      expect(stripAnsiCodes('\x1b[31mhello\x1b[0m')).toBe('hello');
    });

    it('should pass through plain text unchanged', () => {
      expect(stripAnsiCodes('plain text')).toBe('plain text');
    });

    it('should handle complex escape sequences', () => {
      expect(stripAnsiCodes('\x1b[1;31;42mcolored\x1b[0m rest')).toBe('colored rest');
    });
  });

  // --- Color Detection ---
  describe('detectAnsiColorCode', () => {
    it('should detect standard foreground colors', () => {
      expect(detectAnsiColorCode(31)).toBe('red');
      expect(detectAnsiColorCode(32)).toBe('green');
      expect(detectAnsiColorCode(33)).toBe('yellow');
      expect(detectAnsiColorCode(34)).toBe('blue');
      expect(detectAnsiColorCode(36)).toBe('cyan');
    });

    it('should return null for non-color codes', () => {
      expect(detectAnsiColorCode(0)).toBeNull(); // reset
      expect(detectAnsiColorCode(1)).toBeNull(); // bold
    });
  });

  // --- Terminal Themes ---
  describe('TERMINAL_THEMES', () => {
    it('should contain claude-dark theme', () => {
      expect(TERMINAL_THEMES).toHaveProperty('claude-dark');
    });

    it('should contain at least 2 themes', () => {
      expect(Object.keys(TERMINAL_THEMES).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getTerminalTheme', () => {
    it('should return theme colors for claude-dark', () => {
      const theme = getTerminalTheme('claude-dark');
      expect(theme).toHaveProperty('background');
      expect(theme).toHaveProperty('foreground');
      expect(theme).toHaveProperty('cursor');
    });

    it('should fallback to claude-dark for unknown theme', () => {
      const theme = getTerminalTheme('nonexistent');
      expect(theme).toHaveProperty('background');
    });
  });

  // --- Terminal Options ---
  describe('buildTerminalOptions', () => {
    it('should produce xterm-compatible options object', () => {
      const config = createTerminalConfig({});
      const opts = buildTerminalOptions(config);
      expect(opts).toHaveProperty('fontSize');
      expect(opts).toHaveProperty('fontFamily');
      expect(opts).toHaveProperty('theme');
      expect(opts).toHaveProperty('cursorBlink');
    });
  });

  // --- Command Prompt ---
  describe('formatCommandPrompt', () => {
    it('should format with $ prefix for bash', () => {
      const prompt = formatCommandPrompt('ls -la', 'bash');
      expect(prompt).toContain('$');
      expect(prompt).toContain('ls -la');
    });

    it('should format with >>> prefix for python', () => {
      const prompt = formatCommandPrompt('print("hi")', 'python');
      expect(prompt).toContain('>>>');
    });

    it('should default to $ for unknown shell', () => {
      const prompt = formatCommandPrompt('cmd', 'unknown');
      expect(prompt).toContain('$');
    });
  });

  // --- Exit Code ---
  describe('parseExitCode', () => {
    it('should parse 0 as success', () => {
      const result = parseExitCode(0);
      expect(result.success).toBe(true);
      expect(result.label).toContain('0');
    });

    it('should parse non-zero as failure', () => {
      const result = parseExitCode(1);
      expect(result.success).toBe(false);
    });

    it('should recognize common exit codes', () => {
      const sigkill = parseExitCode(137);
      expect(sigkill.label).toContain('SIGKILL');
      const sigterm = parseExitCode(143);
      expect(sigterm.label).toContain('SIGTERM');
    });
  });

  // --- Terminal Session ---
  describe('createTerminalSession', () => {
    it('should create empty session', () => {
      const session = createTerminalSession('session-1');
      expect(session.id).toBe('session-1');
      expect(session.lines).toEqual([]);
      expect(session.status).toBe('idle');
    });
  });

  describe('appendToSession', () => {
    it('should add line to session', () => {
      const session = createTerminalSession('s1');
      const updated = appendToSession(session, '$ echo hi', 'command');
      expect(updated.lines.length).toBe(1);
      expect(updated.lines[0].text).toBe('$ echo hi');
    });

    it('should preserve existing lines', () => {
      let session = createTerminalSession('s1');
      session = appendToSession(session, 'line1', 'stdout');
      session = appendToSession(session, 'line2', 'stdout');
      expect(session.lines.length).toBe(2);
    });

    it('should mark stderr lines', () => {
      const session = createTerminalSession('s1');
      const updated = appendToSession(session, 'Error!', 'stderr');
      expect(updated.lines[0].stream).toBe('stderr');
    });
  });
});
