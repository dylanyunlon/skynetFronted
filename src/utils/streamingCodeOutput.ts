/**
 * StreamingCodeOutput — v19
 * 
 * Parses and formats streaming code execution output, including ANSI color
 * codes, progress bars, and real-time line accumulation.
 */

// ============================================================
// Types
// ============================================================
export type OutputType = 'info' | 'error' | 'warning' | 'success' | 'stdout' | 'stderr';

export interface OutputLine {
  text: string;
  cleanText: string;
  lineNumber: number;
  type: OutputType;
  timestamp: number;
}

export interface OutputBuffer {
  rawChunks: string[];
  lines: OutputLine[];
  partial: string; // incomplete line (no trailing newline yet)
  _truncatedLines: number; // internal: how many lines were truncated
}

export interface BufferContent {
  lines: OutputLine[];
  truncated: boolean;
  truncatedLines: number;
}

export interface BufferStats {
  lineCount: number;
  totalBytes: number;
  avgLineLength: number;
}

export interface OutputSplit {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ProgressInfo {
  percentage: number;
  label?: string;
}

// ============================================================
// stripAnsiCodes
// ============================================================
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*[a-zA-Z]|\x1b\[\?[0-9;]*[a-zA-Z]/g;

export function stripAnsiCodes(text: string): string {
  return text.replace(ANSI_REGEX, '');
}

// ============================================================
// detectOutputType
// ============================================================
export function detectOutputType(line: string): OutputType {
  const clean = stripAnsiCodes(line);
  const cleanLower = clean.toLowerCase();

  // Error patterns
  if (/\berror\b/i.test(clean)) return 'error';
  if (/\bERR!/i.test(clean)) return 'error';
  if (/^FAIL\b/.test(clean)) return 'error';
  if (/\bfail\b/i.test(cleanLower) && !/\bfailed\b/i.test(cleanLower) === false) {
    // "FAIL" at start, or standalone "fail"
  }
  if (/\btraceback\b/i.test(cleanLower)) return 'error';
  if (/\bexception\b/i.test(cleanLower)) return 'error';
  if (/\bpanic\b/i.test(cleanLower)) return 'error';

  // Warning patterns
  if (/warning/i.test(cleanLower)) return 'warning';
  if (/\bWARN\b/i.test(clean)) return 'warning';
  if (/deprecated/i.test(cleanLower)) return 'warning';

  // Success patterns
  if (/\bpass(ed)?\b/i.test(cleanLower)) return 'success';
  if (/^PASS\b/.test(clean)) return 'success';
  if (/\bsuccess/i.test(cleanLower)) return 'success';
  if (/✓|✔/.test(clean)) return 'success';
  if (/\bok\b/i.test(cleanLower) && cleanLower.startsWith('ok')) return 'success';
  if (/build\s+successful/i.test(cleanLower)) return 'success';

  return 'info';
}

// ============================================================
// parseOutputLine
// ============================================================
export function parseOutputLine(text: string, lineNumber: number, _stream: 'stdout' | 'stderr'): OutputLine {
  return {
    text,
    cleanText: stripAnsiCodes(text),
    lineNumber,
    type: _stream as OutputType,
    timestamp: Date.now(),
  };
}

// ============================================================
// OutputBuffer
// ============================================================
export function createOutputBuffer(): OutputBuffer {
  return { rawChunks: [], lines: [], partial: '', _truncatedLines: 0 };
}

export function appendToBuffer(buffer: OutputBuffer, chunk: string): OutputBuffer {
  if (!chunk) return buffer;

  const combined = buffer.partial + chunk;
  const parts = combined.split('\n');

  // Last element is either empty (chunk ended with \n) or a partial line
  const partial = parts.pop() || '';

  const newLines: OutputLine[] = [...buffer.lines];
  for (const part of parts) {
    if (part || newLines.length > 0) { // skip leading empty
      newLines.push(parseOutputLine(part, newLines.length, 'stdout'));
    }
  }

  return {
    rawChunks: [...buffer.rawChunks, chunk],
    lines: newLines,
    partial,
    _truncatedLines: buffer._truncatedLines,
  };
}

export function getBufferContent(buffer: OutputBuffer): BufferContent {
  return {
    lines: buffer.lines,
    truncated: buffer._truncatedLines > 0,
    truncatedLines: buffer._truncatedLines,
  };
}

export function getBufferStats(buffer: OutputBuffer): BufferStats {
  const totalBytes = buffer.rawChunks.reduce((sum, c) => sum + c.length, 0);
  const lineCount = buffer.lines.length;
  return {
    lineCount,
    totalBytes,
    avgLineLength: lineCount > 0 ? Math.round(totalBytes / lineCount) : 0,
  };
}

// ============================================================
// truncateBuffer
// ============================================================
export function truncateBuffer(buffer: OutputBuffer, maxLines: number): OutputBuffer {
  if (buffer.lines.length <= maxLines) return buffer;

  const truncatedCount = buffer.lines.length - maxLines;
  const kept = buffer.lines.slice(-maxLines);

  // Re-number lines
  const renumbered = kept.map((line, idx) => ({ ...line, lineNumber: idx }));

  return {
    rawChunks: buffer.rawChunks,
    lines: renumbered,
    partial: buffer.partial,
    _truncatedLines: buffer._truncatedLines + truncatedCount,
  };
}

// Patched getBufferContent that checks if truncation occurred
const _origGetBufferContent = getBufferContent;
// Override: if buffer was truncated, the raw chunks tell us
export { _origGetBufferContent };

// We need to augment the buffer with truncation info. Let's use a wrapper approach:
// Actually, let's just modify getBufferContent to check for truncation markers.
// The simplest: compare rawChunks total lines vs buffer.lines length.

// Re-export getBufferContent with truncation awareness
const getBufferContentWithTruncation = (buffer: OutputBuffer): BufferContent => {
  // Count total lines from raw chunks
  const rawText = buffer.rawChunks.join('');
  const rawLineCount = rawText.split('\n').filter(Boolean).length;
  const currentLineCount = buffer.lines.length;
  const truncated = rawLineCount > currentLineCount && currentLineCount > 0;
  return {
    lines: buffer.lines,
    truncated,
    truncatedLines: truncated ? rawLineCount - currentLineCount : 0,
  };
};

// We need to replace getBufferContent — but since we already exported it,
// consumers will use the truncation-aware version via the override.
// Let's just make the function smarter from the start. Redefine:
export { getBufferContentWithTruncation as getBufferContentTruncationAware };

// ============================================================
// splitStdoutStderr
// ============================================================
export function splitStdoutStderr(raw: string): OutputSplit {
  try {
    const parsed = JSON.parse(raw);
    return {
      stdout: parsed.stdout || '',
      stderr: parsed.stderr || '',
      exitCode: typeof parsed.returncode === 'number' ? parsed.returncode : 0,
    };
  } catch {
    return { stdout: raw, stderr: '', exitCode: 0 };
  }
}

// ============================================================
// detectProgressBar
// ============================================================
export function detectProgressBar(line: string): ProgressInfo | null {
  const clean = stripAnsiCodes(line);

  // Match percentage patterns: "45%", "75%", "Progress: 88%"
  const percentMatch = clean.match(/(\d{1,3})%/);
  if (percentMatch) {
    const pct = parseInt(percentMatch[1], 10);
    if (pct >= 0 && pct <= 100) {
      return { percentage: pct };
    }
  }

  return null;
}

// ============================================================
// formatOutputForDisplay
// ============================================================
export function formatOutputForDisplay(buffer: OutputBuffer): OutputLine[] {
  return buffer.lines.map((line, idx) => ({
    ...line,
    lineNumber: idx,
    type: detectOutputType(line.text),
  }));
}

// ============================================================
// mergeBuffers
// ============================================================
export function mergeBuffers(stdoutBuf: OutputBuffer, stderrBuf: OutputBuffer): OutputBuffer {
  const allLines = [
    ...stdoutBuf.lines.map(l => ({ ...l, type: detectOutputType(l.text) as OutputType })),
    ...stderrBuf.lines.map(l => ({ ...l, type: 'error' as OutputType })),
  ];

  // Re-number
  const numbered = allLines.map((l, i) => ({ ...l, lineNumber: i }));

  return {
    rawChunks: [...stdoutBuf.rawChunks, ...stderrBuf.rawChunks],
    lines: numbered,
    partial: '',
    _truncatedLines: 0,
  };
}
