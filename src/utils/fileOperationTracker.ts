/**
 * FileOperationTracker — v19
 * 
 * Tracks file operations (create, edit, delete, view, rename) across the
 * agent loop session. Provides summaries, conflict detection, and undo history.
 */

// ============================================================
// Types
// ============================================================
export type FileOperationType = 'create' | 'edit' | 'delete' | 'view' | 'rename';

export interface FileOperation {
  type: FileOperationType;
  path: string;
  timestamp: number;
  content?: string;
  diff?: string;
  added?: number;
  removed?: number;
  newPath?: string;
}

export interface FileOperationTracker {
  operations: FileOperation[];
}

export interface OperationSummary {
  created: number;
  edited: number;
  deleted: number;
  viewed: number;
  renamed: number;
  totalOperations: number;
  uniqueFiles: number;
  text: string;
}

export interface FileConflict {
  type: 'edit_after_delete' | 'duplicate_create' | 'delete_after_delete';
  path: string;
  description: string;
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  children: FileTreeNode[];
  operations?: FileOperation[];
}

// ============================================================
// createFileOperationTracker
// ============================================================
export function createFileOperationTracker(): FileOperationTracker {
  return { operations: [] };
}

// ============================================================
// recordOperation
// ============================================================
export function recordOperation(
  tracker: FileOperationTracker,
  op: Omit<FileOperation, 'timestamp'> & { timestamp?: number }
): FileOperationTracker {
  const operation: FileOperation = {
    ...op,
    timestamp: op.timestamp ?? Date.now(),
  };
  return { operations: [...tracker.operations, operation] };
}

// ============================================================
// getFileHistory
// ============================================================
export function getFileHistory(tracker: FileOperationTracker, path: string): FileOperation[] {
  return tracker.operations.filter(o => o.path === path);
}

// ============================================================
// getOperationSummary
// ============================================================
export function getOperationSummary(tracker: FileOperationTracker): OperationSummary {
  let created = 0, edited = 0, deleted = 0, viewed = 0, renamed = 0;
  const uniquePaths = new Set<string>();

  for (const op of tracker.operations) {
    uniquePaths.add(op.path);
    if (op.newPath) uniquePaths.add(op.newPath);
    switch (op.type) {
      case 'create': created++; break;
      case 'edit': edited++; break;
      case 'delete': deleted++; break;
      case 'view': viewed++; break;
      case 'rename': renamed++; break;
    }
  }

  const parts: string[] = [];
  if (created > 0) parts.push(`Created ${created} file${created > 1 ? 's' : ''}`);
  if (edited > 0) parts.push(`edited ${edited} file${edited > 1 ? 's' : ''}`);
  if (deleted > 0) parts.push(`deleted ${deleted} file${deleted > 1 ? 's' : ''}`);
  if (viewed > 0) parts.push(`viewed ${viewed} file${viewed > 1 ? 's' : ''}`);
  if (renamed > 0) parts.push(`renamed ${renamed} file${renamed > 1 ? 's' : ''}`);

  return {
    created, edited, deleted, viewed, renamed,
    totalOperations: tracker.operations.length,
    uniqueFiles: uniquePaths.size,
    text: parts.join(', ') || 'No operations',
  };
}

// ============================================================
// detectConflicts
// ============================================================
export function detectConflicts(tracker: FileOperationTracker): FileConflict[] {
  const conflicts: FileConflict[] = [];
  const deletedFiles = new Set<string>();
  const createdFiles = new Set<string>();

  for (const op of tracker.operations) {
    if (op.type === 'delete') {
      deletedFiles.add(op.path);
    } else if (op.type === 'edit' && deletedFiles.has(op.path)) {
      conflicts.push({
        type: 'edit_after_delete',
        path: op.path,
        description: `File ${op.path} was edited after being deleted`,
      });
    } else if (op.type === 'create') {
      if (createdFiles.has(op.path)) {
        conflicts.push({
          type: 'duplicate_create',
          path: op.path,
          description: `File ${op.path} was created more than once`,
        });
      }
      createdFiles.add(op.path);
    }
  }

  return conflicts;
}

// ============================================================
// File categorization helpers
// ============================================================
export function getModifiedFiles(tracker: FileOperationTracker): string[] {
  const files = new Set<string>();
  for (const op of tracker.operations) {
    if (op.type === 'edit') files.add(op.path);
  }
  return Array.from(files);
}

export function getCreatedFiles(tracker: FileOperationTracker): string[] {
  const files: string[] = [];
  const seen = new Set<string>();
  for (const op of tracker.operations) {
    if (op.type === 'create' && !seen.has(op.path)) {
      files.push(op.path);
      seen.add(op.path);
    }
  }
  return files;
}

export function getDeletedFiles(tracker: FileOperationTracker): string[] {
  const files: string[] = [];
  const seen = new Set<string>();
  for (const op of tracker.operations) {
    if (op.type === 'delete' && !seen.has(op.path)) {
      files.push(op.path);
      seen.add(op.path);
    }
  }
  return files;
}

// ============================================================
// buildFileTree
// ============================================================
export function buildFileTree(tracker: FileOperationTracker): FileTreeNode {
  const root: FileTreeNode = { name: '/', type: 'directory', children: [] };
  const allPaths = new Set<string>();

  for (const op of tracker.operations) {
    allPaths.add(op.path);
    if (op.newPath) allPaths.add(op.newPath);
  }

  for (const fullPath of allPaths) {
    const parts = fullPath.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      let child = current.children.find(c => c.name === name);

      if (!child) {
        child = {
          name,
          type: isFile ? 'file' : 'directory',
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  return root;
}

// ============================================================
// getOperationsByType
// ============================================================
export function getOperationsByType(tracker: FileOperationTracker, type: FileOperationType): FileOperation[] {
  return tracker.operations.filter(o => o.type === type);
}

// ============================================================
// undoLastOperation
// ============================================================
export function undoLastOperation(tracker: FileOperationTracker): { tracker: FileOperationTracker; undone: FileOperation | null } {
  if (tracker.operations.length === 0) {
    return { tracker, undone: null };
  }
  const undone = tracker.operations[tracker.operations.length - 1];
  return {
    tracker: { operations: tracker.operations.slice(0, -1) },
    undone,
  };
}
