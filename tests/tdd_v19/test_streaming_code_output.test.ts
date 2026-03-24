/**
 * TDD v19 — Module 7: StreamingCodeOutput
 * 
 * Parses and formats streaming code execution output, including ANSI color
 * codes, progress bars, and real-time line accumulation.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  OutputLine,
  OutputType,
  parseOutputLine,
  stripAnsiCodes,
  detectOutputType,
  OutputBuffer,
  createOutputBuffer,
  appendToBuffer,
  getBufferContent,
  getBufferStats,
  truncateBuffer,
  splitStdoutStderr,
  OutputSplit,
  detectProgressBar,
  ProgressInfo,
  formatOutputForDisplay,
  mergeBuffers,
} from '@/utils/streamingCodeOutput';

describe('StreamingCodeOutput', () => {

  // ─── Test 1: stripAnsiCodes ───
  describe('stripAnsiCodes', () => {
    it('should strip common ANSI color codes', () => {
      expect(stripAnsiCodes('\x1b[32mSuccess\x1b[0m')).toBe('Success');
      expect(stripAnsiCodes('\x1b[1m\x1b[31mError\x1b[0m')).toBe('Error');
      expect(stripAnsiCodes('\x1b[36minfo\x1b[39m: message')).toBe('info: message');
    });

    it('should strip cursor movement and clear sequences', () => {
      expect(stripAnsiCodes('\x1b[2K\x1b[1Gprogress')).toBe('progress');
      expect(stripAnsiCodes('\x1b[?25l\x1b[?25h')).toBe('');
    });

    it('should handle text without ANSI codes', () => {
      expect(stripAnsiCodes('plain text')).toBe('plain text');
      expect(stripAnsiCodes('')).toBe('');
    });

    it('should handle complex nested ANSI sequences', () => {
      const input = '\x1b[1m\x1b[32m✓\x1b[39m\x1b[22m tests/test.ts (10 tests) \x1b[2m72ms\x1b[22m';
      const result = stripAnsiCodes(input);
      expect(result).toBe('✓ tests/test.ts (10 tests) 72ms');
    });
  });

  // ─── Test 2: parseOutputLine ───
  describe('parseOutputLine', () => {
    it('should parse stdout lines with line numbers', () => {
      const line = parseOutputLine('Hello world', 0, 'stdout');
      expect(line.text).toBe('Hello world');
      expect(line.lineNumber).toBe(0);
      expect(line.type).toBe('stdout');
      expect(line.timestamp).toBeGreaterThan(0);
    });

    it('should parse stderr lines', () => {
      const line = parseOutputLine('Error: file not found', 5, 'stderr');
      expect(line.type).toBe('stderr');
      expect(line.text).toContain('file not found');
    });

    it('should strip ANSI from parsed output', () => {
      const line = parseOutputLine('\x1b[32mOK\x1b[0m', 0, 'stdout');
      expect(line.cleanText).toBe('OK');
      expect(line.text).toContain('\x1b[32m'); // raw preserved
    });
  });

  // ─── Test 3: detectOutputType ───
  describe('detectOutputType', () => {
    it('should detect error output', () => {
      expect(detectOutputType('Error: Cannot find module')).toBe('error');
      expect(detectOutputType('FAIL tests/unit.test.ts')).toBe('error');
      expect(detectOutputType('npm ERR! missing script')).toBe('error');
      expect(detectOutputType('Traceback (most recent call last):')).toBe('error');
    });

    it('should detect warning output', () => {
      expect(detectOutputType('Warning: React.createClass is deprecated')).toBe('warning');
      expect(detectOutputType('DeprecationWarning: use Buffer.from()')).toBe('warning');
      expect(detectOutputType('npm WARN deprecated')).toBe('warning');
    });

    it('should detect success output', () => {
      expect(detectOutputType('✓ 10 tests passed')).toBe('success');
      expect(detectOutputType('PASS tests/unit.test.ts')).toBe('success');
      expect(detectOutputType('Build successful')).toBe('success');
      expect(detectOutputType('Successfully installed flask-2.0')).toBe('success');
    });

    it('should detect info/normal output', () => {
      expect(detectOutputType('Compiling TypeScript...')).toBe('info');
      expect(detectOutputType('plain output text')).toBe('info');
    });
  });

  // ─── Test 4: OutputBuffer — line accumulation ───
  describe('OutputBuffer', () => {
    it('should accumulate lines in order', () => {
      let buffer = createOutputBuffer();
      buffer = appendToBuffer(buffer, 'line 1\n');
      buffer = appendToBuffer(buffer, 'line 2\n');
      buffer = appendToBuffer(buffer, 'line 3\n');

      const content = getBufferContent(buffer);
      expect(content.lines.length).toBe(3);
      expect(content.lines[0].text).toBe('line 1');
      expect(content.lines[2].text).toBe('line 3');
    });

    it('should handle partial lines (no trailing newline)', () => {
      let buffer = createOutputBuffer();
      buffer = appendToBuffer(buffer, 'partial');
      buffer = appendToBuffer(buffer, ' line\n');
      buffer = appendToBuffer(buffer, 'next line\n');

      const content = getBufferContent(buffer);
      expect(content.lines.length).toBe(2);
      expect(content.lines[0].text).toBe('partial line');
    });

    it('should handle empty chunks', () => {
      let buffer = createOutputBuffer();
      buffer = appendToBuffer(buffer, '');
      buffer = appendToBuffer(buffer, 'hello\n');
      buffer = appendToBuffer(buffer, '');

      expect(getBufferContent(buffer).lines.length).toBe(1);
    });
  });

  // ─── Test 5: getBufferStats ───
  describe('getBufferStats', () => {
    it('should compute line counts and byte sizes', () => {
      let buffer = createOutputBuffer();
      buffer = appendToBuffer(buffer, 'short\n');
      buffer = appendToBuffer(buffer, 'a longer line of text\n');
      buffer = appendToBuffer(buffer, 'x'.repeat(1000) + '\n');

      const stats = getBufferStats(buffer);
      expect(stats.lineCount).toBe(3);
      expect(stats.totalBytes).toBeGreaterThan(1020);
      expect(stats.avgLineLength).toBeGreaterThan(0);
    });
  });

  // ─── Test 6: truncateBuffer ───
  describe('truncateBuffer', () => {
    it('should truncate buffer to max lines, keeping last N', () => {
      let buffer = createOutputBuffer();
      for (let i = 0; i < 100; i++) {
        buffer = appendToBuffer(buffer, `line ${i}\n`);
      }

      const truncated = truncateBuffer(buffer, 10);
      const content = getBufferContent(truncated);
      expect(content.lines.length).toBe(10);
      expect(content.lines[0].text).toBe('line 90'); // last 10
      expect(content.lines[9].text).toBe('line 99');
      expect(content.truncated).toBe(true);
      expect(content.truncatedLines).toBe(90);
    });

    it('should not truncate if within limit', () => {
      let buffer = createOutputBuffer();
      buffer = appendToBuffer(buffer, 'line 1\n');
      buffer = appendToBuffer(buffer, 'line 2\n');

      const truncated = truncateBuffer(buffer, 100);
      expect(getBufferContent(truncated).lines.length).toBe(2);
      expect(getBufferContent(truncated).truncated).toBe(false);
    });
  });

  // ─── Test 7: splitStdoutStderr ───
  describe('splitStdoutStderr', () => {
    it('should split JSON bash output into stdout and stderr', () => {
      const json = JSON.stringify({
        returncode: 1,
        stdout: 'normal output\nline 2',
        stderr: 'Error: something failed\ndetails here',
      });

      const split = splitStdoutStderr(json);
      expect(split.stdout).toBe('normal output\nline 2');
      expect(split.stderr).toBe('Error: something failed\ndetails here');
      expect(split.exitCode).toBe(1);
    });

    it('should handle plain text (no JSON)', () => {
      const split = splitStdoutStderr('just plain text output');
      expect(split.stdout).toBe('just plain text output');
      expect(split.stderr).toBe('');
      expect(split.exitCode).toBe(0);
    });
  });

  // ─── Test 8: detectProgressBar ───
  describe('detectProgressBar', () => {
    it('should detect npm/pip style progress bars', () => {
      const p1 = detectProgressBar('Downloading: 45% |████████░░░░░| 45/100');
      expect(p1).toBeTruthy();
      expect(p1!.percentage).toBeGreaterThanOrEqual(40);
      expect(p1!.percentage).toBeLessThanOrEqual(50);

      const p2 = detectProgressBar('  75% ━━━━━━━━━━━━━━━━━━━━━━━━━━ 750.0/1000.0 kB');
      expect(p2).toBeTruthy();
      expect(p2!.percentage).toBeGreaterThanOrEqual(70);
    });

    it('should detect percentage-only progress', () => {
      const p = detectProgressBar('Progress: 88%');
      expect(p).toBeTruthy();
      expect(p!.percentage).toBe(88);
    });

    it('should return null for non-progress lines', () => {
      expect(detectProgressBar('normal output line')).toBeNull();
      expect(detectProgressBar('Error: something failed')).toBeNull();
    });
  });

  // ─── Test 9: formatOutputForDisplay ───
  describe('formatOutputForDisplay', () => {
    it('should format output with line numbers and type annotations', () => {
      let buffer = createOutputBuffer();
      buffer = appendToBuffer(buffer, 'OK: test passed\n');
      buffer = appendToBuffer(buffer, 'Error: assertion failed\n');
      buffer = appendToBuffer(buffer, 'Warning: deprecated API\n');

      const formatted = formatOutputForDisplay(buffer);
      expect(formatted.length).toBe(3);
      expect(formatted[0].type).toBe('success');
      expect(formatted[1].type).toBe('error');
      expect(formatted[2].type).toBe('warning');
      expect(formatted[0].lineNumber).toBe(0);
      expect(formatted[2].lineNumber).toBe(2);
    });
  });

  // ─── Test 10: mergeBuffers ───
  describe('mergeBuffers', () => {
    it('should merge stdout and stderr buffers into combined view', () => {
      let stdoutBuf = createOutputBuffer();
      stdoutBuf = appendToBuffer(stdoutBuf, 'stdout line 1\n');
      stdoutBuf = appendToBuffer(stdoutBuf, 'stdout line 2\n');

      let stderrBuf = createOutputBuffer();
      stderrBuf = appendToBuffer(stderrBuf, 'stderr line 1\n');

      const merged = mergeBuffers(stdoutBuf, stderrBuf);
      const content = getBufferContent(merged);
      expect(content.lines.length).toBe(3);
    });
  });
});
