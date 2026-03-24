/**
 * TDD v20 — Module 2: ArtifactPanelLogic
 *
 * Tests for the logic layer that manages artifact display, preview,
 * version navigation, and extraction from tool results.
 *
 * This module should:
 * - Create a panel state managing multiple artifacts
 * - Extract artifacts from tool_result blocks (create_file, present_files)
 * - Switch between artifact tabs
 * - Navigate artifact versions (prev/next)
 * - Provide render configuration per artifact type
 * - Validate artifact content before rendering
 * - Generate artifact preview summaries
 * - Support artifact deletion from panel
 * - Track artifact creation timeline
 * - Export artifact state for persistence
 */
import { describe, it, expect } from 'vitest';

import {
  createArtifactPanelState,
  extractAndAddArtifact,
  selectArtifact,
  navigateVersion,
  getActiveArtifact,
  getArtifactPreviewSummary,
  validateActiveArtifact,
  removeArtifact,
  getArtifactTimeline,
  exportArtifactPanelState,
  updateArtifactInPanel,
  type ArtifactPanelState,
  type ArtifactPreviewSummary,
  type ArtifactTimelineEntry,
} from '@/utils/artifactPanelLogic';

describe('ArtifactPanelLogic', () => {
  // ======= Test 1: createArtifactPanelState =======
  describe('createArtifactPanelState', () => {
    it('should create empty panel state', () => {
      const state = createArtifactPanelState();
      expect(state).toBeDefined();
      expect(state.artifacts).toEqual([]);
      expect(state.activeArtifactId).toBeNull();
      expect(state.panelVisible).toBe(false);
    });
  });

  // ======= Test 2: extractAndAddArtifact =======
  describe('extractAndAddArtifact', () => {
    it('should extract artifact from create_file tool result', () => {
      const state = createArtifactPanelState();
      const toolResult = {
        tool: 'create_file',
        result: '// React component\nimport React from "react";\nexport default function App() { return <div>Hello</div>; }',
        meta: { filename: 'App.tsx', filepath: '/home/claude/App.tsx' },
      };
      const next = extractAndAddArtifact(state, toolResult);
      expect(next.artifacts.length).toBe(1);
      expect(next.artifacts[0].title).toBe('App.tsx');
      expect(next.artifacts[0].type).toBe('react');
      expect(next.panelVisible).toBe(true);
      expect(next.activeArtifactId).toBe(next.artifacts[0].id);
    });

    it('should extract HTML artifact and detect type', () => {
      const state = createArtifactPanelState();
      const toolResult = {
        tool: 'create_file',
        result: '<html><body><h1>Hello</h1></body></html>',
        meta: { filename: 'index.html', filepath: '/home/claude/index.html' },
      };
      const next = extractAndAddArtifact(state, toolResult);
      expect(next.artifacts[0].type).toBe('html');
    });

    it('should extract SVG artifact and detect type', () => {
      const state = createArtifactPanelState();
      const toolResult = {
        tool: 'create_file',
        result: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>',
        meta: { filename: 'icon.svg' },
      };
      const next = extractAndAddArtifact(state, toolResult);
      expect(next.artifacts[0].type).toBe('svg');
    });

    it('should handle present_files tool result with filepath', () => {
      const state = createArtifactPanelState();
      const toolResult = {
        tool: 'present_files',
        result: '',
        meta: { filepath: '/mnt/user-data/outputs/report.md', filename: 'report.md' },
      };
      const next = extractAndAddArtifact(state, toolResult);
      expect(next.artifacts.length).toBe(1);
      expect(next.artifacts[0].title).toBe('report.md');
    });

    it('should not add duplicate artifacts with same filepath', () => {
      let state = createArtifactPanelState();
      const toolResult = {
        tool: 'create_file',
        result: 'content',
        meta: { filename: 'test.ts', filepath: '/home/claude/test.ts' },
      };
      state = extractAndAddArtifact(state, toolResult);
      state = extractAndAddArtifact(state, toolResult);
      // Should update the existing one, not add a new one
      expect(state.artifacts.length).toBe(1);
    });
  });

  // ======= Test 3: selectArtifact =======
  describe('selectArtifact', () => {
    it('should set activeArtifactId', () => {
      let state = createArtifactPanelState();
      const toolResult = {
        tool: 'create_file',
        result: 'content',
        meta: { filename: 'a.ts' },
      };
      state = extractAndAddArtifact(state, toolResult);
      const id = state.artifacts[0].id;
      state = selectArtifact(state, id);
      expect(state.activeArtifactId).toBe(id);
    });

    it('should return unchanged state for nonexistent id', () => {
      const state = createArtifactPanelState();
      const next = selectArtifact(state, 'nonexistent');
      expect(next.activeArtifactId).toBeNull();
    });
  });

  // ======= Test 4: navigateVersion =======
  describe('navigateVersion', () => {
    it('should navigate to previous version', () => {
      let state = createArtifactPanelState();
      const toolResult1 = {
        tool: 'create_file',
        result: 'v1 content',
        meta: { filename: 'file.ts', filepath: '/x/file.ts' },
      };
      const toolResult2 = {
        tool: 'create_file',
        result: 'v2 content',
        meta: { filename: 'file.ts', filepath: '/x/file.ts' },
      };
      state = extractAndAddArtifact(state, toolResult1);
      state = extractAndAddArtifact(state, toolResult2);
      const id = state.artifacts[0].id;
      
      // Should be on latest version
      expect(state.artifacts[0].content).toBe('v2 content');
      
      // Navigate back
      state = navigateVersion(state, id, 'prev');
      expect(state.artifacts[0].viewingVersion).toBe(0);
    });

    it('should not navigate past first version', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file',
        result: 'only version',
        meta: { filename: 'f.ts' },
      });
      const id = state.artifacts[0].id;
      state = navigateVersion(state, id, 'prev');
      expect(state.artifacts[0].viewingVersion).toBe(0);
    });
  });

  // ======= Test 5: getActiveArtifact =======
  describe('getActiveArtifact', () => {
    it('should return null for empty state', () => {
      const state = createArtifactPanelState();
      expect(getActiveArtifact(state)).toBeNull();
    });

    it('should return the currently selected artifact', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file',
        result: 'hello',
        meta: { filename: 'test.js' },
      });
      const artifact = getActiveArtifact(state);
      expect(artifact).not.toBeNull();
      expect(artifact!.title).toBe('test.js');
    });
  });

  // ======= Test 6: getArtifactPreviewSummary =======
  describe('getArtifactPreviewSummary', () => {
    it('should return summary with type, title, line count', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file',
        result: 'line1\nline2\nline3',
        meta: { filename: 'code.py' },
      });
      const summary = getArtifactPreviewSummary(state, state.artifacts[0].id);
      expect(summary).not.toBeNull();
      expect(summary!.title).toBe('code.py');
      expect(summary!.lineCount).toBe(3);
      expect(summary!.type).toBeDefined();
    });

    it('should return null for nonexistent artifact', () => {
      const state = createArtifactPanelState();
      expect(getArtifactPreviewSummary(state, 'nope')).toBeNull();
    });
  });

  // ======= Test 7: validateActiveArtifact =======
  describe('validateActiveArtifact', () => {
    it('should validate HTML artifact content', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file',
        result: '<html><body>Valid</body></html>',
        meta: { filename: 'page.html' },
      });
      const validation = validateActiveArtifact(state);
      expect(validation).not.toBeNull();
      expect(validation!.isValid).toBe(true);
    });

    it('should return null when no active artifact', () => {
      const state = createArtifactPanelState();
      expect(validateActiveArtifact(state)).toBeNull();
    });
  });

  // ======= Test 8: removeArtifact =======
  describe('removeArtifact', () => {
    it('should remove artifact and clear activeId if it was active', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file',
        result: 'x',
        meta: { filename: 'a.ts' },
      });
      const id = state.artifacts[0].id;
      state = removeArtifact(state, id);
      expect(state.artifacts.length).toBe(0);
      expect(state.activeArtifactId).toBeNull();
    });

    it('should keep other artifacts when removing one', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file', result: 'a', meta: { filename: 'a.ts' },
      });
      state = extractAndAddArtifact(state, {
        tool: 'create_file', result: 'b', meta: { filename: 'b.ts' },
      });
      const idToRemove = state.artifacts[0].id;
      state = removeArtifact(state, idToRemove);
      expect(state.artifacts.length).toBe(1);
      expect(state.artifacts[0].title).toBe('b.ts');
    });
  });

  // ======= Test 9: getArtifactTimeline =======
  describe('getArtifactTimeline', () => {
    it('should return empty timeline for empty state', () => {
      const state = createArtifactPanelState();
      expect(getArtifactTimeline(state)).toEqual([]);
    });

    it('should return entries in creation order', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file', result: 'first', meta: { filename: 'first.ts' },
      });
      state = extractAndAddArtifact(state, {
        tool: 'create_file', result: 'second', meta: { filename: 'second.ts' },
      });
      const timeline = getArtifactTimeline(state);
      expect(timeline.length).toBe(2);
      expect(timeline[0].title).toBe('first.ts');
      expect(timeline[1].title).toBe('second.ts');
    });
  });

  // ======= Test 10: exportArtifactPanelState =======
  describe('exportArtifactPanelState', () => {
    it('should export panel state as JSON', () => {
      let state = createArtifactPanelState();
      state = extractAndAddArtifact(state, {
        tool: 'create_file', result: 'content', meta: { filename: 'f.ts' },
      });
      const json = exportArtifactPanelState(state);
      const parsed = JSON.parse(json);
      expect(parsed.artifacts).toHaveLength(1);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should export empty state correctly', () => {
      const state = createArtifactPanelState();
      const json = exportArtifactPanelState(state);
      const parsed = JSON.parse(json);
      expect(parsed.artifacts).toHaveLength(0);
    });
  });
});
