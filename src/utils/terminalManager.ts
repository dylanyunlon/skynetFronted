/**
 * Terminal Manager — xterm.js integration wrapper, ANSI processing, terminal config
 * Uses: @xterm/xterm patterns (config only — actual Terminal instantiation is in React components)
 */

// --- Types ---
export interface TerminalConfig {
  fontSize: number;
  fontFamily: string;
  cursorBlink: boolean;
  theme: string;
  scrollback: number;
  cols: number;
  rows: number;
}

export interface AnsiSegment {
  text: string;
  color: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface TerminalThemeColors {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
}

export interface TerminalLineEntry {
  text: string;
  stream: 'command' | 'stdout' | 'stderr' | 'system';
  timestamp: Date;
}

export interface TerminalSessionState {
  id: string;
  lines: TerminalLineEntry[];
  status: 'idle' | 'running' | 'completed' | 'error';
}

// --- Terminal Themes ---
export const TERMINAL_THEMES: Record<string, TerminalThemeColors> = {
  'claude-dark': {
    background: '#1a1a2e',
    foreground: '#e0e0e0',
    cursor: '#528bff',
    cursorAccent: '#1a1a2e',
    selection: 'rgba(82, 139, 255, 0.3)',
    black: '#282c34', red: '#e06c75', green: '#98c379', yellow: '#e5c07b',
    blue: '#61afef', magenta: '#c678dd', cyan: '#56b6c2', white: '#abb2bf',
  },
  'monokai': {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    cursorAccent: '#272822',
    selection: 'rgba(73, 72, 62, 0.5)',
    black: '#272822', red: '#f92672', green: '#a6e22e', yellow: '#f4bf75',
    blue: '#66d9ef', magenta: '#ae81ff', cyan: '#a1efe4', white: '#f8f8f2',
  },
};

export function getTerminalTheme(name: string): TerminalThemeColors {
  return TERMINAL_THEMES[name] ?? TERMINAL_THEMES['claude-dark'];
}

// --- Config ---
export function createTerminalConfig(opts: Partial<TerminalConfig>): TerminalConfig {
  let fontSize = opts.fontSize ?? 13;
  fontSize = Math.max(8, Math.min(32, fontSize));
  return {
    fontSize,
    fontFamily: opts.fontFamily ?? "'Menlo', 'Monaco', 'Consolas', monospace",
    cursorBlink: opts.cursorBlink ?? true,
    theme: opts.theme ?? 'claude-dark',
    scrollback: opts.scrollback ?? 5000,
    cols: opts.cols ?? 120,
    rows: opts.rows ?? 30,
  };
}

export function buildTerminalOptions(config: TerminalConfig): Record<string, any> {
  const themeColors = getTerminalTheme(config.theme);
  return {
    fontSize: config.fontSize,
    fontFamily: config.fontFamily,
    cursorBlink: config.cursorBlink,
    theme: themeColors,
    scrollback: config.scrollback,
    cols: config.cols,
    rows: config.rows,
  };
}

// --- ANSI Parsing ---
const ANSI_REGEX = /\x1b\[([0-9;]*)m/g;

const COLOR_MAP: Record<number, string> = {
  30: 'black', 31: 'red', 32: 'green', 33: 'yellow',
  34: 'blue', 35: 'magenta', 36: 'cyan', 37: 'white',
  90: 'brightBlack', 91: 'brightRed', 92: 'brightGreen', 93: 'brightYellow',
  94: 'brightBlue', 95: 'brightMagenta', 96: 'brightCyan', 97: 'brightWhite',
};

export function detectAnsiColorCode(code: number): string | null {
  return COLOR_MAP[code] ?? null;
}

export function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

export function parseAnsiToSegments(text: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  let lastIndex = 0;
  let currentColor: string | null = null;
  let currentBold = false;
  let currentItalic = false;
  let currentUnderline = false;

  const regex = /\x1b\[([0-9;]*)m/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before this escape
    if (match.index > lastIndex) {
      const t = text.slice(lastIndex, match.index);
      if (t) segments.push({ text: t, color: currentColor, bold: currentBold, italic: currentItalic, underline: currentUnderline });
    }
    
    const codes = match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0) { currentColor = null; currentBold = false; currentItalic = false; currentUnderline = false; }
      else if (code === 1) currentBold = true;
      else if (code === 3) currentItalic = true;
      else if (code === 4) currentUnderline = true;
      else if (COLOR_MAP[code]) currentColor = COLOR_MAP[code];
    }
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    const t = text.slice(lastIndex);
    if (t) segments.push({ text: t, color: currentColor, bold: currentBold, italic: currentItalic, underline: currentUnderline });
  }

  if (segments.length === 0) {
    segments.push({ text, color: null, bold: false, italic: false, underline: false });
  }
  return segments;
}

// --- Command Prompt ---
export function formatCommandPrompt(command: string, shell: string): string {
  switch (shell) {
    case 'python': return `>>> ${command}`;
    case 'node': return `> ${command}`;
    default: return `$ ${command}`;
  }
}

// --- Exit Code ---
const SIGNAL_NAMES: Record<number, string> = {
  130: 'SIGINT', 137: 'SIGKILL', 139: 'SIGSEGV', 143: 'SIGTERM',
};

export function parseExitCode(code: number): { success: boolean; label: string } {
  if (code === 0) return { success: true, label: 'exit 0' };
  const signal = SIGNAL_NAMES[code];
  if (signal) return { success: false, label: `exit ${code} (${signal})` };
  return { success: false, label: `exit ${code}` };
}

// --- Session ---
export function createTerminalSession(id: string): TerminalSessionState {
  return { id, lines: [], status: 'idle' };
}

export function appendToSession(session: TerminalSessionState, text: string, stream: TerminalLineEntry['stream']): TerminalSessionState {
  return {
    ...session,
    lines: [...session.lines, { text, stream, timestamp: new Date() }],
  };
}
