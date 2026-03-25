/**
 * Keyboard Shortcut Manager — registry, combo parsing, conflict detection, Claude presets
 * v21 Module 10
 */

export interface KeyCombo {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
}

export type ShortcutCategory = 'file' | 'edit' | 'view' | 'navigation' | 'chat' | 'agent' | 'general';

export interface ShortcutDefinition {
  id: string;
  combo: string;
  label: string;
  category: ShortcutCategory | string;
  action: string;
}

export interface ShortcutRegistry {
  shortcuts: ShortcutDefinition[];
}

export interface ShortcutConflict {
  ids: [string, string];
  combo: string;
}

// --- Parse Key Combo ---

export function parseKeyCombo(str: string): KeyCombo {
  const parts = str.split('+').map((p) => p.trim().toLowerCase());
  const combo: KeyCombo = { ctrl: false, shift: false, alt: false, meta: false, key: '' };

  for (const part of parts) {
    switch (part) {
      case 'ctrl':
      case 'control':
        combo.ctrl = true;
        break;
      case 'shift':
        combo.shift = true;
        break;
      case 'alt':
      case 'option':
        combo.alt = true;
        break;
      case 'cmd':
      case 'meta':
      case 'command':
        combo.meta = true;
        break;
      default:
        combo.key = normalizeKey(part);
    }
  }
  return combo;
}

// --- Format Key Combo ---

export function formatKeyCombo(combo: KeyCombo, platform: 'mac' | 'windows' = 'windows'): string {
  const parts: string[] = [];
  if (combo.ctrl) parts.push(platform === 'mac' ? '⌃' : 'Ctrl');
  if (combo.alt) parts.push(platform === 'mac' ? '⌥' : 'Alt');
  if (combo.shift) parts.push(platform === 'mac' ? '⇧' : 'Shift');
  if (combo.meta) parts.push(platform === 'mac' ? '⌘' : 'Ctrl');
  parts.push(combo.key.charAt(0).toUpperCase() + combo.key.slice(1));
  return parts.join(platform === 'mac' ? '' : '+');
}

// --- Registry ---

export function createShortcutRegistry(): ShortcutRegistry {
  return { shortcuts: [] };
}

export function registerShortcut(reg: ShortcutRegistry, def: ShortcutDefinition): ShortcutRegistry {
  if (reg.shortcuts.some((s) => s.id === def.id)) return reg;
  return { shortcuts: [...reg.shortcuts, def] };
}

export function unregisterShortcut(reg: ShortcutRegistry, id: string): ShortcutRegistry {
  return { shortcuts: reg.shortcuts.filter((s) => s.id !== id) };
}

// --- Match Key Event ---

export function matchKeyEvent(combo: KeyCombo, event: KeyboardEvent): boolean {
  return (
    combo.ctrl === event.ctrlKey &&
    combo.shift === event.shiftKey &&
    combo.alt === event.altKey &&
    combo.meta === event.metaKey &&
    combo.key === normalizeKey(event.key)
  );
}

// --- Conflict Detection ---

function comboToString(combo: KeyCombo): string {
  const parts: string[] = [];
  if (combo.ctrl) parts.push('ctrl');
  if (combo.alt) parts.push('alt');
  if (combo.shift) parts.push('shift');
  if (combo.meta) parts.push('meta');
  parts.push(combo.key);
  return parts.join('+');
}

export function detectConflicts(reg: ShortcutRegistry): ShortcutConflict[] {
  const conflicts: ShortcutConflict[] = [];
  const comboMap = new Map<string, string>();

  for (const shortcut of reg.shortcuts) {
    const parsed = parseKeyCombo(shortcut.combo);
    const key = comboToString(parsed);
    const existing = comboMap.get(key);
    if (existing) {
      conflicts.push({ ids: [existing, shortcut.id], combo: shortcut.combo });
    } else {
      comboMap.set(key, shortcut.id);
    }
  }
  return conflicts;
}

// --- Claude Shortcuts ---

export const CLAUDE_SHORTCUTS: ShortcutDefinition[] = [
  { id: 'new_chat', combo: 'Ctrl+Shift+N', label: 'New Chat', category: 'chat', action: 'new_chat' },
  { id: 'submit', combo: 'Enter', label: 'Submit Message', category: 'chat', action: 'submit' },
  { id: 'submit_newline', combo: 'Shift+Enter', label: 'New Line', category: 'chat', action: 'newline' },
  { id: 'focus_input', combo: 'Ctrl+/', label: 'Focus Input', category: 'navigation', action: 'focus_input' },
  { id: 'toggle_sidebar', combo: 'Ctrl+B', label: 'Toggle Sidebar', category: 'view', action: 'toggle_sidebar' },
  { id: 'copy_last', combo: 'Ctrl+Shift+C', label: 'Copy Last Response', category: 'chat', action: 'copy_last' },
  { id: 'stop_gen', combo: 'Escape', label: 'Stop Generation', category: 'agent', action: 'stop_generation' },
  { id: 'settings', combo: 'Ctrl+,', label: 'Settings', category: 'general', action: 'settings' },
];

// --- Category Grouping ---

export function getShortcutsByCategory(reg: ShortcutRegistry): Record<string, ShortcutDefinition[]> {
  const groups: Record<string, ShortcutDefinition[]> = {};
  for (const s of reg.shortcuts) {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
  }
  return groups;
}

// --- Utilities ---

export function isModifierKey(key: string): boolean {
  const modifiers = ['control', 'shift', 'alt', 'meta'];
  return modifiers.includes(key.toLowerCase());
}

export function normalizeKey(key: string): string {
  const lower = key.toLowerCase();
  switch (lower) {
    case 'return': return 'enter';
    case 'esc': return 'escape';
    case ' ': return 'space';
    default: return lower;
  }
}

// --- Serialization ---

export function serializeShortcuts(reg: ShortcutRegistry): string {
  return JSON.stringify(reg.shortcuts);
}

export function deserializeShortcuts(json: string): ShortcutRegistry {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return { shortcuts: parsed };
    }
    return { shortcuts: [] };
  } catch {
    return { shortcuts: [] };
  }
}
