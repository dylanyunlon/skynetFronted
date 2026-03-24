/**
 * TDD v19 — Module 2: FileOperationTracker
 * 
 * Tracks file operations (create, edit, delete, view, rename) across the
 * agent loop session. Provides summaries, conflict detection, and undo history.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  FileOperationType,
  FileOperation,
  FileOperationTracker,
  createFileOperationTracker,
  recordOperation,
  getFileHistory,
  getOperationSummary,
  detectConflicts,
  FileConflict,
  getModifiedFiles,
  getCreatedFiles,
  getDeletedFiles,
  buildFileTree,
  FileTreeNode,
  getOperationsByType,
  undoLastOperation,
} from '@/utils/fileOperationTracker';

describe('FileOperationTracker', () => {

  // ─── Test 1: recordOperation basics ───
  describe('recordOperation', () => {
    it('should record file operations with timestamps', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, {
        type: 'create',
        path: '/src/utils/newFile.ts',
        content: 'export const x = 1;',
      });
      expect(tracker.operations.length).toBe(1);
      expect(tracker.operations[0].type).toBe('create');
      expect(tracker.operations[0].path).toBe('/src/utils/newFile.ts');
      expect(tracker.operations[0].timestamp).toBeGreaterThan(0);
    });

    it('should record multiple operations preserving order', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/b.ts', diff: '+1 -0' });
      tracker = recordOperation(tracker, { type: 'delete', path: '/c.ts' });
      tracker = recordOperation(tracker, { type: 'view', path: '/d.ts' });
      tracker = recordOperation(tracker, { type: 'rename', path: '/e.ts', newPath: '/f.ts' });
      expect(tracker.operations.length).toBe(5);
      expect(tracker.operations.map(o => o.type)).toEqual(['create', 'edit', 'delete', 'view', 'rename']);
    });
  });

  // ─── Test 2: getFileHistory ───
  describe('getFileHistory', () => {
    it('should return all operations for a specific file', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/src/app.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/src/app.ts', diff: '+5 -2' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/src/other.ts', diff: '+1 -0' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/src/app.ts', diff: '+3 -1' });

      const history = getFileHistory(tracker, '/src/app.ts');
      expect(history.length).toBe(3);
      expect(history[0].type).toBe('create');
      expect(history[1].type).toBe('edit');
      expect(history[2].type).toBe('edit');
    });

    it('should return empty array for unknown file', () => {
      const tracker = createFileOperationTracker();
      expect(getFileHistory(tracker, '/unknown')).toEqual([]);
    });
  });

  // ─── Test 3: getOperationSummary ───
  describe('getOperationSummary', () => {
    it('should compute correct counts by operation type', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'create', path: '/b.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/c.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/c.ts' });
      tracker = recordOperation(tracker, { type: 'delete', path: '/d.ts' });
      tracker = recordOperation(tracker, { type: 'view', path: '/a.ts' });

      const summary = getOperationSummary(tracker);
      expect(summary.created).toBe(2);
      expect(summary.edited).toBe(3);
      expect(summary.deleted).toBe(1);
      expect(summary.viewed).toBe(1);
      expect(summary.totalOperations).toBe(7);
      expect(summary.uniqueFiles).toBe(4); // a, b, c, d
    });

    it('should produce Claude-style summary text', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/b.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/c.ts' });

      const summary = getOperationSummary(tracker);
      // Should produce something like "Created 1 file, edited 2 files"
      expect(summary.text).toContain('1');
      expect(summary.text).toContain('2');
      expect(summary.text.toLowerCase()).toContain('created');
      expect(summary.text.toLowerCase()).toContain('edited');
    });
  });

  // ─── Test 4: detectConflicts ───
  describe('detectConflicts', () => {
    it('should detect edit-after-delete conflict', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'delete', path: '/src/removed.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/src/removed.ts' });

      const conflicts = detectConflicts(tracker);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('edit_after_delete');
      expect(conflicts[0].path).toBe('/src/removed.ts');
    });

    it('should detect create-already-exists conflict', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/src/dup.ts' });
      tracker = recordOperation(tracker, { type: 'create', path: '/src/dup.ts' });

      const conflicts = detectConflicts(tracker);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('duplicate_create');
    });

    it('should return empty for clean operations', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'view', path: '/a.ts' });

      expect(detectConflicts(tracker)).toEqual([]);
    });
  });

  // ─── Test 5: getModifiedFiles / getCreatedFiles / getDeletedFiles ───
  describe('file categorization helpers', () => {
    it('should categorize files correctly', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/new1.ts' });
      tracker = recordOperation(tracker, { type: 'create', path: '/new2.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/existing.ts' });
      tracker = recordOperation(tracker, { type: 'delete', path: '/old.ts' });

      expect(getCreatedFiles(tracker)).toEqual(['/new1.ts', '/new2.ts']);
      expect(getModifiedFiles(tracker)).toEqual(['/existing.ts']);
      expect(getDeletedFiles(tracker)).toEqual(['/old.ts']);
    });

    it('should deduplicate files with multiple edits', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'edit', path: '/app.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/app.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/app.ts' });

      expect(getModifiedFiles(tracker)).toEqual(['/app.ts']); // only once
    });
  });

  // ─── Test 6: buildFileTree ───
  describe('buildFileTree', () => {
    it('should build a nested tree from flat file paths', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/src/utils/a.ts' });
      tracker = recordOperation(tracker, { type: 'create', path: '/src/utils/b.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/src/components/App.tsx' });
      tracker = recordOperation(tracker, { type: 'create', path: '/package.json' });

      const tree = buildFileTree(tracker);
      expect(tree.name).toBe('/');
      expect(tree.children.length).toBeGreaterThan(0);

      // Find 'src' directory
      const srcNode = tree.children.find(n => n.name === 'src');
      expect(srcNode).toBeTruthy();
      expect(srcNode!.type).toBe('directory');
      expect(srcNode!.children.length).toBe(2); // utils, components
    });

    it('should handle empty tracker', () => {
      const tracker = createFileOperationTracker();
      const tree = buildFileTree(tracker);
      expect(tree.name).toBe('/');
      expect(tree.children.length).toBe(0);
    });
  });

  // ─── Test 7: getOperationsByType ───
  describe('getOperationsByType', () => {
    it('should filter operations by type', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/b.ts' });
      tracker = recordOperation(tracker, { type: 'create', path: '/c.ts' });
      tracker = recordOperation(tracker, { type: 'delete', path: '/d.ts' });

      const creates = getOperationsByType(tracker, 'create');
      expect(creates.length).toBe(2);
      expect(creates.every(o => o.type === 'create')).toBe(true);

      const deletes = getOperationsByType(tracker, 'delete');
      expect(deletes.length).toBe(1);
    });
  });

  // ─── Test 8: undoLastOperation ───
  describe('undoLastOperation', () => {
    it('should remove and return the last operation', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'create', path: '/a.ts' });
      tracker = recordOperation(tracker, { type: 'edit', path: '/b.ts' });

      const { tracker: updated, undone } = undoLastOperation(tracker);
      expect(undone).toBeTruthy();
      expect(undone!.type).toBe('edit');
      expect(undone!.path).toBe('/b.ts');
      expect(updated.operations.length).toBe(1);
    });

    it('should return null undone for empty tracker', () => {
      const tracker = createFileOperationTracker();
      const { tracker: updated, undone } = undoLastOperation(tracker);
      expect(undone).toBeNull();
      expect(updated.operations.length).toBe(0);
    });
  });

  // ─── Test 9: diff stats in edit operations ───
  describe('edit operations with diff stats', () => {
    it('should store and retrieve diff stats (+added -removed)', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, {
        type: 'edit',
        path: '/src/utils/parser.ts',
        diff: '+15 -3',
        added: 15,
        removed: 3,
      });

      const op = tracker.operations[0];
      expect(op.added).toBe(15);
      expect(op.removed).toBe(3);
    });
  });

  // ─── Test 10: rename tracking ───
  describe('rename operations', () => {
    it('should track rename with old and new paths', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, {
        type: 'rename',
        path: '/src/old-name.ts',
        newPath: '/src/new-name.ts',
      });

      const op = tracker.operations[0];
      expect(op.type).toBe('rename');
      expect(op.path).toBe('/src/old-name.ts');
      expect(op.newPath).toBe('/src/new-name.ts');
    });

    it('should include renamed files in summary', () => {
      let tracker = createFileOperationTracker();
      tracker = recordOperation(tracker, { type: 'rename', path: '/a.ts', newPath: '/b.ts' });
      const summary = getOperationSummary(tracker);
      expect(summary.renamed).toBe(1);
    });
  });
});
