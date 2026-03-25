/**
 * TDD v21 Module 10: Keyboard Shortcuts Manager
 * Tests for shortcut registration, combo detection, conflict resolution
 * Target: src/utils/keyboardShortcutManager.ts
 */
import { describe, it, expect } from 'vitest';

import {
  ShortcutDefinition,
  ShortcutRegistry,
  createShortcutRegistry,
  registerShortcut,
  unregisterShortcut,
  parseKeyCombo,
  KeyCombo,
  formatKeyCombo,
  matchKeyEvent,
  detectConflicts,
  ShortcutConflict,
  CLAUDE_SHORTCUTS,
  getShortcutsByCategory,
  ShortcutCategory,
  isModifierKey,
  normalizeKey,
  serializeShortcuts,
  deserializeShortcuts,
} from '@/utils/keyboardShortcutManager';

describe('Keyboard Shortcut Manager', () => {
  // --- Parse Key Combo ---
  describe('parseKeyCombo', () => {
    it('should parse Ctrl+S', () => {
      const combo = parseKeyCombo('Ctrl+S');
      expect(combo.ctrl).toBe(true);
      expect(combo.key).toBe('s');
      expect(combo.shift).toBe(false);
      expect(combo.alt).toBe(false);
    });

    it('should parse Cmd+Shift+P', () => {
      const combo = parseKeyCombo('Cmd+Shift+P');
      expect(combo.meta).toBe(true);
      expect(combo.shift).toBe(true);
      expect(combo.key).toBe('p');
    });

    it('should parse Alt+Enter', () => {
      const combo = parseKeyCombo('Alt+Enter');
      expect(combo.alt).toBe(true);
      expect(combo.key).toBe('enter');
    });

    it('should parse single key', () => {
      const combo = parseKeyCombo('Escape');
      expect(combo.key).toBe('escape');
      expect(combo.ctrl).toBe(false);
    });

    it('should be case-insensitive', () => {
      const combo = parseKeyCombo('ctrl+shift+a');
      expect(combo.ctrl).toBe(true);
      expect(combo.shift).toBe(true);
      expect(combo.key).toBe('a');
    });
  });

  // --- Format Key Combo ---
  describe('formatKeyCombo', () => {
    it('should format Ctrl+S correctly', () => {
      const combo: KeyCombo = { ctrl: true, shift: false, alt: false, meta: false, key: 's' };
      const formatted = formatKeyCombo(combo);
      expect(formatted).toContain('Ctrl');
      expect(formatted).toContain('S');
    });

    it('should use ⌘ for meta on mac format', () => {
      const combo: KeyCombo = { ctrl: false, shift: false, alt: false, meta: true, key: 'k' };
      const formatted = formatKeyCombo(combo, 'mac');
      expect(formatted).toContain('⌘');
    });

    it('should use Ctrl for meta on windows format', () => {
      const combo: KeyCombo = { ctrl: false, shift: false, alt: false, meta: true, key: 'k' };
      const formatted = formatKeyCombo(combo, 'windows');
      expect(formatted).toContain('Ctrl');
    });
  });

  // --- Registry ---
  describe('createShortcutRegistry', () => {
    it('should create empty registry', () => {
      const reg = createShortcutRegistry();
      expect(reg.shortcuts).toEqual([]);
    });
  });

  describe('registerShortcut', () => {
    it('should add shortcut to registry', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, {
        id: 'save',
        combo: 'Ctrl+S',
        label: 'Save',
        category: 'file',
        action: 'save',
      });
      expect(reg.shortcuts.length).toBe(1);
    });

    it('should not add duplicate ids', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'save', combo: 'Ctrl+S', label: 'Save', category: 'file', action: 'save' });
      reg = registerShortcut(reg, { id: 'save', combo: 'Ctrl+S', label: 'Save2', category: 'file', action: 'save' });
      expect(reg.shortcuts.length).toBe(1);
    });
  });

  describe('unregisterShortcut', () => {
    it('should remove shortcut by id', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'save', combo: 'Ctrl+S', label: 'Save', category: 'file', action: 'save' });
      reg = unregisterShortcut(reg, 'save');
      expect(reg.shortcuts.length).toBe(0);
    });
  });

  // --- Match Key Event ---
  describe('matchKeyEvent', () => {
    it('should match Ctrl+S event', () => {
      const combo = parseKeyCombo('Ctrl+S');
      const event = { key: 's', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false };
      expect(matchKeyEvent(combo, event as any)).toBe(true);
    });

    it('should not match when modifier is missing', () => {
      const combo = parseKeyCombo('Ctrl+S');
      const event = { key: 's', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false };
      expect(matchKeyEvent(combo, event as any)).toBe(false);
    });

    it('should not match when extra modifier is pressed', () => {
      const combo = parseKeyCombo('Ctrl+S');
      const event = { key: 's', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false };
      expect(matchKeyEvent(combo, event as any)).toBe(false);
    });
  });

  // --- Conflict Detection ---
  describe('detectConflicts', () => {
    it('should detect conflicting shortcuts', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'a', combo: 'Ctrl+S', label: 'A', category: 'file', action: 'a' });
      reg = registerShortcut(reg, { id: 'b', combo: 'Ctrl+S', label: 'B', category: 'edit', action: 'b' });
      const conflicts = detectConflicts(reg);
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('should not report non-conflicting shortcuts', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'a', combo: 'Ctrl+S', label: 'A', category: 'file', action: 'a' });
      reg = registerShortcut(reg, { id: 'b', combo: 'Ctrl+O', label: 'B', category: 'file', action: 'b' });
      const conflicts = detectConflicts(reg);
      expect(conflicts.length).toBe(0);
    });
  });

  // --- Claude Shortcuts ---
  describe('CLAUDE_SHORTCUTS', () => {
    it('should define at least 5 shortcuts', () => {
      expect(CLAUDE_SHORTCUTS.length).toBeGreaterThanOrEqual(5);
    });

    it('should include new chat shortcut', () => {
      const newChat = CLAUDE_SHORTCUTS.find((s: ShortcutDefinition) => s.action === 'new_chat');
      expect(newChat).toBeDefined();
    });

    it('should include submit shortcut', () => {
      const submit = CLAUDE_SHORTCUTS.find((s: ShortcutDefinition) => s.action === 'submit');
      expect(submit).toBeDefined();
    });
  });

  // --- Category Grouping ---
  describe('getShortcutsByCategory', () => {
    it('should group shortcuts by category', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'a', combo: 'Ctrl+S', label: 'Save', category: 'file', action: 'save' });
      reg = registerShortcut(reg, { id: 'b', combo: 'Ctrl+Z', label: 'Undo', category: 'edit', action: 'undo' });
      const groups = getShortcutsByCategory(reg);
      expect(groups['file']).toBeDefined();
      expect(groups['edit']).toBeDefined();
      expect(groups['file'].length).toBe(1);
    });
  });

  // --- Utilities ---
  describe('isModifierKey', () => {
    it('should identify modifier keys', () => {
      expect(isModifierKey('Control')).toBe(true);
      expect(isModifierKey('Shift')).toBe(true);
      expect(isModifierKey('Alt')).toBe(true);
      expect(isModifierKey('Meta')).toBe(true);
    });

    it('should reject non-modifier keys', () => {
      expect(isModifierKey('a')).toBe(false);
      expect(isModifierKey('Enter')).toBe(false);
    });
  });

  describe('normalizeKey', () => {
    it('should lowercase single characters', () => {
      expect(normalizeKey('A')).toBe('a');
    });

    it('should normalize Enter variants', () => {
      expect(normalizeKey('Enter')).toBe('enter');
      expect(normalizeKey('Return')).toBe('enter');
    });

    it('should normalize Escape variants', () => {
      expect(normalizeKey('Escape')).toBe('escape');
      expect(normalizeKey('Esc')).toBe('escape');
    });
  });

  // --- Serialization ---
  describe('serializeShortcuts', () => {
    it('should produce JSON string', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'save', combo: 'Ctrl+S', label: 'Save', category: 'file', action: 'save' });
      const json = serializeShortcuts(reg);
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('deserializeShortcuts', () => {
    it('should round-trip correctly', () => {
      let reg = createShortcutRegistry();
      reg = registerShortcut(reg, { id: 'save', combo: 'Ctrl+S', label: 'Save', category: 'file', action: 'save' });
      const json = serializeShortcuts(reg);
      const restored = deserializeShortcuts(json);
      expect(restored.shortcuts.length).toBe(1);
      expect(restored.shortcuts[0].id).toBe('save');
    });

    it('should return empty registry for invalid JSON', () => {
      const reg = deserializeShortcuts('invalid');
      expect(reg.shortcuts).toEqual([]);
    });
  });
});
