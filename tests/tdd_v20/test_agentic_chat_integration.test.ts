/**
 * TDD v20 — Module 4: AgenticChatIntegration
 *
 * Tests for the integration layer that connects the command display registry,
 * capability manager, and panel states into the AgenticChat component.
 *
 * This module should:
 * - Map tool blocks to rich display configs using CommandDisplayRegistry
 * - Filter visible tool blocks based on capability toggles
 * - Format tool signatures for collapsed display (Claude Code style)
 * - Generate turn summary text from block arrays
 * - Compute block-level statistics (timing, exit codes, categories)
 * - Build the "Done" summary bar data
 * - Route tool results to the correct panel (code, artifact, etc.)
 * - Manage panel visibility state (which panel is open)
 * - Build context menu items for tool blocks
 * - Generate accessibility labels for tool blocks
 */
import { describe, it, expect } from 'vitest';

import {
  mapBlockToDisplayConfig,
  filterBlocksByCapabilities,
  formatToolSignature,
  generateTurnSummary,
  computeBlockStats,
  buildDoneSummary,
  routeToolResultToPanel,
  managePanelVisibility,
  buildToolContextMenuItems,
  generateBlockA11yLabel,
  type DisplayConfig,
  type BlockStats,
  type DoneSummary,
  type PanelRoute,
  type PanelVisibilityState,
  type ContextMenuItem,
} from '@/utils/agenticChatIntegration';

// Minimal mock block types for testing
const mockToolBlock = (tool: string, opts: Record<string, any> = {}) => ({
  type: 'tool' as const,
  tool,
  toolDescription: opts.description || `Run ${tool}`,
  toolResult: opts.result || 'ok',
  toolDuration: opts.duration || 1.5,
  toolExitCode: opts.exitCode ?? 0,
  toolInput: opts.input || '',
  meta: opts.meta || {},
  ...opts,
});

const mockTextBlock = (text: string) => ({
  type: 'text' as const,
  content: text,
});

describe('AgenticChatIntegration', () => {
  // ======= Test 1: mapBlockToDisplayConfig =======
  describe('mapBlockToDisplayConfig', () => {
    it('should return display config for bash_tool', () => {
      const block = mockToolBlock('bash_tool', { input: 'npm test' });
      const config = mapBlockToDisplayConfig(block);
      expect(config).toBeDefined();
      expect(config.icon).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.category).toBe('execution');
    });

    it('should return display config for str_replace', () => {
      const block = mockToolBlock('str_replace', { input: 'old → new' });
      const config = mapBlockToDisplayConfig(block);
      expect(config.category).toBe('filesystem');
    });

    it('should return fallback config for unknown tools', () => {
      const block = mockToolBlock('custom_unknown_tool_xyz');
      const config = mapBlockToDisplayConfig(block);
      expect(config).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.category).toBe('unknown');
    });
  });

  // ======= Test 2: filterBlocksByCapabilities =======
  describe('filterBlocksByCapabilities', () => {
    it('should show all blocks when all capabilities are enabled', () => {
      const blocks = [
        mockToolBlock('bash_tool'),
        mockToolBlock('web_search'),
        mockToolBlock('create_file'),
      ];
      const capabilities = { code_execution: true, web_search: true, artifacts: true };
      const filtered = filterBlocksByCapabilities(blocks, capabilities);
      expect(filtered.length).toBe(3);
    });

    it('should hide execution blocks when code_execution is disabled', () => {
      const blocks = [
        mockToolBlock('bash_tool'),
        mockToolBlock('web_search'),
        mockToolBlock('create_file'),
      ];
      const capabilities = { code_execution: false, web_search: true, artifacts: true };
      const filtered = filterBlocksByCapabilities(blocks, capabilities);
      expect(filtered.some(b => b.tool === 'bash_tool')).toBe(false);
    });

    it('should always show text blocks regardless of capabilities', () => {
      const blocks = [
        mockTextBlock('hello'),
        mockToolBlock('bash_tool'),
      ];
      const capabilities = { code_execution: false };
      const filtered = filterBlocksByCapabilities(blocks, capabilities);
      expect(filtered.some(b => b.type === 'text')).toBe(true);
    });
  });

  // ======= Test 3: formatToolSignature =======
  describe('formatToolSignature', () => {
    it('should format bash_tool as Bash(command)…', () => {
      const sig = formatToolSignature('bash_tool', 'cd /app && npm test');
      expect(sig).toContain('Bash');
      expect(sig).toContain('cd /app && npm test');
    });

    it('should format str_replace as Edit(filepath)', () => {
      const sig = formatToolSignature('str_replace', '', { filename: 'src/app.tsx' });
      expect(sig).toContain('Edit');
      expect(sig).toContain('src/app.tsx');
    });

    it('should format view as Read(filepath)', () => {
      const sig = formatToolSignature('view', '', { filename: 'README.md' });
      expect(sig).toContain('Read');
      expect(sig).toContain('README.md');
    });

    it('should truncate long commands', () => {
      const longCmd = 'a'.repeat(200);
      const sig = formatToolSignature('bash_tool', longCmd);
      expect(sig.length).toBeLessThan(200);
      expect(sig).toContain('…');
    });
  });

  // ======= Test 4: generateTurnSummary =======
  describe('generateTurnSummary', () => {
    it('should generate "Ran N commands" for multiple bash blocks', () => {
      const blocks = [
        mockToolBlock('bash_tool'),
        mockToolBlock('bash_tool'),
        mockToolBlock('bash_tool'),
      ];
      const summary = generateTurnSummary(blocks);
      expect(summary).toContain('Ran 3 commands');
    });

    it('should include "edited a file" for edit blocks', () => {
      const blocks = [
        mockToolBlock('bash_tool'),
        mockToolBlock('str_replace'),
      ];
      const summary = generateTurnSummary(blocks);
      expect(summary).toContain('edited');
    });

    it('should include "viewed" for read blocks', () => {
      const blocks = [
        mockToolBlock('view'),
        mockToolBlock('view'),
      ];
      const summary = generateTurnSummary(blocks);
      expect(summary).toContain('viewed');
    });

    it('should return empty string for empty blocks', () => {
      const summary = generateTurnSummary([]);
      expect(summary).toBe('');
    });
  });

  // ======= Test 5: computeBlockStats =======
  describe('computeBlockStats', () => {
    it('should compute total duration across blocks', () => {
      const blocks = [
        mockToolBlock('bash_tool', { duration: 1.5 }),
        mockToolBlock('bash_tool', { duration: 2.5 }),
      ];
      const stats = computeBlockStats(blocks);
      expect(stats.totalDuration).toBeCloseTo(4.0);
    });

    it('should count tool categories', () => {
      const blocks = [
        mockToolBlock('bash_tool'),
        mockToolBlock('str_replace'),
        mockToolBlock('view'),
      ];
      const stats = computeBlockStats(blocks);
      expect(stats.categoryBreakdown.execution).toBe(1);
      expect(stats.categoryBreakdown.filesystem).toBe(2);
    });

    it('should count failures (non-zero exit codes)', () => {
      const blocks = [
        mockToolBlock('bash_tool', { exitCode: 0 }),
        mockToolBlock('bash_tool', { exitCode: 1 }),
        mockToolBlock('bash_tool', { exitCode: 127 }),
      ];
      const stats = computeBlockStats(blocks);
      expect(stats.failureCount).toBe(2);
      expect(stats.successCount).toBe(1);
    });
  });

  // ======= Test 6: buildDoneSummary =======
  describe('buildDoneSummary', () => {
    it('should build summary with turns, tool calls, duration, cost', () => {
      const blocks = [
        mockToolBlock('bash_tool', { duration: 1.0 }),
        mockToolBlock('str_replace', { duration: 0.5 }),
      ];
      const summary = buildDoneSummary(blocks, 3, 0.05);
      expect(summary.turns).toBe(3);
      expect(summary.toolCalls).toBe(2);
      expect(summary.totalDuration).toBeCloseTo(1.5);
      expect(summary.cost).toBeCloseTo(0.05);
    });

    it('should format duration as human-readable string', () => {
      const blocks = [mockToolBlock('bash_tool', { duration: 65.5 })];
      const summary = buildDoneSummary(blocks, 1, 0);
      expect(summary.formattedDuration).toContain('1m');
    });

    it('should handle zero blocks', () => {
      const summary = buildDoneSummary([], 0, 0);
      expect(summary.turns).toBe(0);
      expect(summary.toolCalls).toBe(0);
    });
  });

  // ======= Test 7: routeToolResultToPanel =======
  describe('routeToolResultToPanel', () => {
    it('should route create_file to artifact panel', () => {
      const route = routeToolResultToPanel('create_file', { filename: 'app.tsx' });
      expect(route.panel).toBe('artifact');
    });

    it('should route present_files to artifact panel', () => {
      const route = routeToolResultToPanel('present_files', {});
      expect(route.panel).toBe('artifact');
    });

    it('should route bash_tool to execution panel', () => {
      const route = routeToolResultToPanel('bash_tool', {});
      expect(route.panel).toBe('execution');
    });

    it('should route unknown tools to default (none)', () => {
      const route = routeToolResultToPanel('random_tool', {});
      expect(route.panel).toBe('none');
    });
  });

  // ======= Test 8: managePanelVisibility =======
  describe('managePanelVisibility', () => {
    it('should initialize with all panels hidden', () => {
      const state = managePanelVisibility('init');
      expect(state.executionPanel).toBe(false);
      expect(state.artifactPanel).toBe(false);
      expect(state.settingsPanel).toBe(false);
    });

    it('should toggle a specific panel', () => {
      let state = managePanelVisibility('init');
      state = managePanelVisibility('toggle', 'executionPanel', state);
      expect(state.executionPanel).toBe(true);
    });

    it('should close other panels when opening one (exclusive mode)', () => {
      let state = managePanelVisibility('init');
      state = managePanelVisibility('toggle', 'executionPanel', state);
      state = managePanelVisibility('toggle', 'artifactPanel', state);
      expect(state.artifactPanel).toBe(true);
      expect(state.executionPanel).toBe(false); // closed by exclusive mode
    });
  });

  // ======= Test 9: buildToolContextMenuItems =======
  describe('buildToolContextMenuItems', () => {
    it('should return context menu items for a bash tool block', () => {
      const block = mockToolBlock('bash_tool', { input: 'npm test' });
      const items = buildToolContextMenuItems(block);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some(i => i.label.toLowerCase().includes('copy'))).toBe(true);
    });

    it('should include re-run option for execution tools', () => {
      const block = mockToolBlock('bash_tool', { input: 'npm test' });
      const items = buildToolContextMenuItems(block);
      expect(items.some(i => i.action === 'rerun')).toBe(true);
    });

    it('should include view-diff option for edit tools', () => {
      const block = mockToolBlock('str_replace', { input: 'old → new' });
      const items = buildToolContextMenuItems(block);
      expect(items.some(i => i.action === 'view_diff')).toBe(true);
    });
  });

  // ======= Test 10: generateBlockA11yLabel =======
  describe('generateBlockA11yLabel', () => {
    it('should generate accessible label for bash tool', () => {
      const block = mockToolBlock('bash_tool', { input: 'npm test', exitCode: 0 });
      const label = generateBlockA11yLabel(block);
      expect(label).toContain('command');
      expect(label).toContain('success');
    });

    it('should indicate failure in label for non-zero exit', () => {
      const block = mockToolBlock('bash_tool', { input: 'npm test', exitCode: 1 });
      const label = generateBlockA11yLabel(block);
      expect(label).toContain('failed');
    });

    it('should generate label for text blocks', () => {
      const block = mockTextBlock('Hello world');
      const label = generateBlockA11yLabel(block);
      expect(label).toContain('text');
    });
  });
});
