/**
 * CodeMirror Integration — Editor factory, language detection, theme management
 * Uses: @codemirror/state, @codemirror/view, @codemirror/lang-*, @codemirror/theme-one-dark
 */
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap } from '@codemirror/commands';

// --- Types ---
export interface EditorConfig {
  readOnly: boolean;
  lineNumbers: boolean;
  theme: string;
  tabSize: number;
  language: string | null;
  filename: string | null;
  wordWrap: boolean;
}

// --- Constants ---
export const SUPPORTED_LANGUAGES = [
  'python', 'javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'shell', 'yaml', 'sql',
] as const;

export const SUPPORTED_THEMES = ['oneDark', 'light'] as const;

// --- Filename → Language ---
const EXT_MAP: Record<string, string> = {
  '.py': 'python', '.pyw': 'python',
  '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.ts': 'typescript', '.tsx': 'typescript', '.mts': 'typescript',
  '.html': 'html', '.htm': 'html',
  '.css': 'css', '.scss': 'css', '.less': 'css', '.sass': 'css',
  '.json': 'json', '.jsonc': 'json', '.json5': 'json',
  '.md': 'markdown', '.mdx': 'markdown',
  '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
  '.yml': 'yaml', '.yaml': 'yaml',
  '.sql': 'sql',
};

export function detectLanguageFromFilename(filename: string): string | null {
  const basename = filename.split('/').pop() || filename;
  const dotIdx = basename.lastIndexOf('.');
  if (dotIdx === -1) return null;
  const ext = basename.slice(dotIdx).toLowerCase();
  return EXT_MAP[ext] ?? null;
}

// --- Content → Language ---
export function detectLanguageFromContent(content: string): string | null {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.startsWith('#!/') && firstLine.includes('python')) return 'python';
  if (firstLine.startsWith('#!/') && (firstLine.includes('bash') || firstLine.includes('sh'))) return 'shell';
  if (firstLine.startsWith('<!DOCTYPE') || firstLine.startsWith('<html')) return 'html';
  const trimmed = content.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try { JSON.parse(trimmed); return 'json'; } catch { /* not json */ }
  }
  return null;
}

// --- Language Extension ---
export function getLanguageExtension(language: string): Extension | null {
  switch (language) {
    case 'python': return python();
    case 'javascript': return javascript();
    case 'typescript': return javascript({ typescript: true, jsx: true });
    case 'html': return html();
    case 'css': return css();
    case 'json': return json();
    default: return null;
  }
}

// --- Theme Extension ---
export function getThemeExtension(theme: string): Extension {
  switch (theme) {
    case 'light': return EditorView.theme({});
    case 'oneDark':
    default:
      return oneDark;
  }
}

// --- Config Factory ---
export function createEditorConfig(opts: Partial<EditorConfig>): EditorConfig {
  const language = opts.language ?? (opts.filename ? detectLanguageFromFilename(opts.filename) : null);
  return {
    readOnly: opts.readOnly ?? false,
    lineNumbers: opts.lineNumbers ?? true,
    theme: opts.theme ?? 'oneDark',
    tabSize: opts.tabSize ?? 2,
    language,
    filename: opts.filename ?? null,
    wordWrap: opts.wordWrap ?? false,
  };
}

export function createReadonlyConfig(opts: Partial<EditorConfig> = {}): EditorConfig {
  return { ...createEditorConfig(opts), readOnly: true };
}

// --- Extension Stack ---
export function buildExtensionStack(config: EditorConfig): Extension[] {
  const extensions: Extension[] = [];
  
  // Theme
  extensions.push(getThemeExtension(config.theme));
  
  // Line numbers
  if (config.lineNumbers) {
    extensions.push(lineNumbers());
  }
  
  // Language
  if (config.language) {
    const langExt = getLanguageExtension(config.language);
    if (langExt) extensions.push(langExt);
  }
  
  // Read only
  if (config.readOnly) {
    extensions.push(EditorState.readOnly.of(true));
  }
  
  // Basic keymap
  extensions.push(keymap.of(defaultKeymap));
  
  // Active line highlight
  extensions.push(highlightActiveLine());
  
  // Tab size
  extensions.push(EditorState.tabSize.of(config.tabSize));
  
  return extensions;
}

// --- Merge Configs ---
export function mergeEditorConfigs(base: EditorConfig, override: Partial<EditorConfig>): EditorConfig {
  return { ...base, ...override };
}
