/**
 * CommandDisplayRegistry — v17
 * 
 * Registry of 50+ command display types for the Agentic Loop UI.
 * Each tool has: label, icon (lucide), color (tailwind), category, title formatter.
 * 
 * Based on real eventStream1-4.txt analysis + Claude Code capabilities.
 */

// ============================================================
// Types
// ============================================================
export type CommandCategory =
  | 'execution' | 'file_read' | 'file_edit' | 'file_create'
  | 'search' | 'web' | 'output' | 'planning' | 'subagent'
  | 'memory' | 'revert' | 'testing' | 'custom' | 'unknown';

export interface CommandDisplayInfo {
  label: string;
  icon: string;
  color: string;
  category: CommandCategory;
  formatTitle?: (args: Record<string, any>) => string;
  formatSubtitle?: (args: Record<string, any>, description?: string) => string;
}

// ============================================================
// Internal registry
// ============================================================
const registry = new Map<string, CommandDisplayInfo>();

// ============================================================
// Registration helper
// ============================================================
export function registerCommandDisplay(toolName: string, info: CommandDisplayInfo): void {
  registry.set(toolName, info);
}

// ============================================================
// Lookup
// ============================================================
const DEFAULT_INFO: CommandDisplayInfo = {
  label: 'Tool',
  icon: 'Zap',
  color: 'text-gray-400',
  category: 'unknown',
};

export function getCommandDisplayInfo(toolName: string): CommandDisplayInfo {
  return registry.get(toolName) || { ...DEFAULT_INFO };
}

export function getAllCommandDisplayTypes(): string[] {
  return Array.from(registry.keys());
}

export function getCommandCategory(toolName: string): CommandCategory {
  return (registry.get(toolName) || DEFAULT_INFO).category;
}

export function getCommandIcon(toolName: string): string {
  return (registry.get(toolName) || DEFAULT_INFO).icon;
}

export function getCommandColor(toolName: string): string {
  return (registry.get(toolName) || DEFAULT_INFO).color;
}

// ============================================================
// Title/Subtitle formatting
// ============================================================
function extractFilename(path: string): string {
  if (!path) return '…';
  return path.split('/').pop() || path;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export function formatCommandTitle(toolName: string, args: Record<string, any>): string {
  const info = registry.get(toolName);
  if (info?.formatTitle) return info.formatTitle(args);
  // Fallback: use extractToolCallSignature-style logic
  const displayName = info?.label || toolName;
  const firstArg = args.command || args.path || args.query || args.url || '…';
  return `${displayName}(${truncate(String(firstArg), 60)})`;
}

export function formatCommandSubtitle(
  toolName: string, 
  args: Record<string, any>, 
  description: string
): string {
  if (description) return description;
  const info = registry.get(toolName);
  if (info?.formatSubtitle) return info.formatSubtitle(args, description);
  // Fallback for bash
  if (args.command) return `$ ${truncate(args.command, 80)}`;
  return '';
}

// ============================================================
// Register all 52 command display types
// ============================================================

// --- Execution (10) ---
registerCommandDisplay('bash_tool', {
  label: 'Command', icon: 'Terminal', color: 'text-yellow-400', category: 'execution',
  formatTitle: (a) => `Bash(${truncate(a.command || '…', 80)})`,
  formatSubtitle: (a, d) => d || (a.command ? `$ ${a.command}` : ''),
});
registerCommandDisplay('bash', {
  label: 'Command', icon: 'Terminal', color: 'text-yellow-400', category: 'execution',
  formatTitle: (a) => `Bash(${truncate(a.command || '…', 80)})`,
});
registerCommandDisplay('run_script', {
  label: 'Script', icon: 'Terminal', color: 'text-yellow-400', category: 'execution',
  formatTitle: (a) => `Script(${truncate(a.script || a.command || '…', 60)})`,
});
registerCommandDisplay('batch_commands', {
  label: 'Batch Run', icon: 'Terminal', color: 'text-yellow-400', category: 'execution',
  formatTitle: (a) => {
    const count = a.commands?.length || a.total_commands || '…';
    return `Batch(${count} commands)`;
  },
});
registerCommandDisplay('debug_test', {
  label: 'Debug Test', icon: 'Bug', color: 'text-red-400', category: 'testing',
  formatTitle: (a) => `Debug(${truncate(a.command || '…', 60)})`,
});
registerCommandDisplay('execute_code', {
  label: 'Execute', icon: 'Play', color: 'text-green-400', category: 'execution',
  formatTitle: (a) => `Execute(${a.language || 'code'})`,
});
registerCommandDisplay('install_package', {
  label: 'Install', icon: 'Package', color: 'text-blue-400', category: 'execution',
  formatTitle: (a) => `Install(${a.package || '…'})`,
});
registerCommandDisplay('pip_install', {
  label: 'Pip Install', icon: 'Package', color: 'text-blue-400', category: 'execution',
  formatTitle: (a) => `Pip(${a.package || '…'})`,
});
registerCommandDisplay('npm_install', {
  label: 'NPM Install', icon: 'Package', color: 'text-green-400', category: 'execution',
  formatTitle: (a) => `NPM(${a.package || '…'})`,
});
registerCommandDisplay('apt_install', {
  label: 'APT Install', icon: 'Package', color: 'text-orange-400', category: 'execution',
  formatTitle: (a) => `APT(${a.package || '…'})`,
});

// --- File Read (8) ---
registerCommandDisplay('view', {
  label: 'View', icon: 'Eye', color: 'text-blue-300', category: 'file_read',
  formatTitle: (a) => `Read(${extractFilename(a.path || a.file_path || '')})`,
});
registerCommandDisplay('read_file', {
  label: 'Read', icon: 'Eye', color: 'text-blue-300', category: 'file_read',
  formatTitle: (a) => `Read(${extractFilename(a.path || a.file_path || '')})`,
});
registerCommandDisplay('batch_read', {
  label: 'Read Files', icon: 'Files', color: 'text-blue-400', category: 'file_read',
  formatTitle: (a) => {
    const count = a.files?.length || a.paths?.length || '…';
    return `Read(${count} files)`;
  },
});
registerCommandDisplay('view_truncated', {
  label: 'View Section', icon: 'Eye', color: 'text-blue-300', category: 'file_read',
  formatTitle: (a) => `Read(${extractFilename(a.path || '')}, lines ${a.start_line || '?'}-${a.end_line || '?'})`,
});
registerCommandDisplay('list_dir', {
  label: 'List Dir', icon: 'Folder', color: 'text-gray-400', category: 'file_read',
  formatTitle: (a) => `LS(${extractFilename(a.path || a.directory || '')})`,
});
registerCommandDisplay('glob', {
  label: 'Glob', icon: 'Search', color: 'text-gray-400', category: 'file_read',
  formatTitle: (a) => `Glob(${a.pattern || '…'})`,
});
registerCommandDisplay('cat_file', {
  label: 'Cat', icon: 'FileText', color: 'text-blue-300', category: 'file_read',
  formatTitle: (a) => `Cat(${extractFilename(a.path || '')})`,
});
registerCommandDisplay('head_file', {
  label: 'Head', icon: 'FileText', color: 'text-blue-300', category: 'file_read',
  formatTitle: (a) => `Head(${extractFilename(a.path || '')})`,
});

// --- File Edit (5) ---
registerCommandDisplay('str_replace', {
  label: 'Edit', icon: 'Pencil', color: 'text-orange-400', category: 'file_edit',
  formatTitle: (a) => `Edit(${extractFilename(a.path || a.file_path || '')})`,
});
registerCommandDisplay('edit_file', {
  label: 'Edit', icon: 'Pencil', color: 'text-orange-400', category: 'file_edit',
  formatTitle: (a) => `Edit(${extractFilename(a.path || a.file_path || '')})`,
});
registerCommandDisplay('multi_edit', {
  label: 'Multi Edit', icon: 'Pencil', color: 'text-orange-400', category: 'file_edit',
  formatTitle: (a) => `MultiEdit(${a.files?.length || '…'} files)`,
});
registerCommandDisplay('patch_file', {
  label: 'Patch', icon: 'Pencil', color: 'text-orange-400', category: 'file_edit',
  formatTitle: (a) => `Patch(${extractFilename(a.path || '')})`,
});
registerCommandDisplay('sed_replace', {
  label: 'Sed', icon: 'Pencil', color: 'text-orange-400', category: 'file_edit',
  formatTitle: (a) => `Sed(${a.pattern || '…'})`,
});

// --- File Create (4) ---
registerCommandDisplay('create_file', {
  label: 'Create', icon: 'FilePlus', color: 'text-green-400', category: 'file_create',
  formatTitle: (a) => `Write(${extractFilename(a.path || a.file_path || '')})`,
});
registerCommandDisplay('write_file', {
  label: 'Write', icon: 'FilePlus', color: 'text-green-400', category: 'file_create',
  formatTitle: (a) => `Write(${extractFilename(a.path || a.file_path || '')})`,
});
registerCommandDisplay('mkdir', {
  label: 'Mkdir', icon: 'FolderPlus', color: 'text-green-400', category: 'file_create',
  formatTitle: (a) => `Mkdir(${extractFilename(a.path || '')})`,
});
registerCommandDisplay('copy_file', {
  label: 'Copy', icon: 'Copy', color: 'text-green-400', category: 'file_create',
  formatTitle: (a) => `Copy(${extractFilename(a.source || a.path || '')})`,
});

// --- Search (4) ---
registerCommandDisplay('grep_search', {
  label: 'Search', icon: 'Search', color: 'text-purple-400', category: 'search',
  formatTitle: (a) => `Search(${a.pattern || a.query || '…'})`,
});
registerCommandDisplay('file_search', {
  label: 'Find', icon: 'Search', color: 'text-purple-400', category: 'search',
  formatTitle: (a) => `Find(${a.query || a.pattern || '…'})`,
});
registerCommandDisplay('regex_search', {
  label: 'Regex', icon: 'Search', color: 'text-purple-400', category: 'search',
  formatTitle: (a) => `Regex(${a.pattern || '…'})`,
});
registerCommandDisplay('find_files', {
  label: 'Find Files', icon: 'Search', color: 'text-purple-400', category: 'search',
  formatTitle: (a) => `FindFiles(${a.pattern || a.name || '…'})`,
});

// --- Web (3) ---
registerCommandDisplay('web_search', {
  label: 'Web Search', icon: 'Globe', color: 'text-cyan-400', category: 'web',
  formatTitle: (a) => `WebSearch("${a.query || '…'}")`,
});
registerCommandDisplay('web_fetch', {
  label: 'Fetch', icon: 'Download', color: 'text-cyan-400', category: 'web',
  formatTitle: (a) => {
    try { return `Fetch(${new URL(a.url).hostname})`; }
    catch { return `Fetch(${truncate(a.url || '…', 40)})`; }
  },
});
registerCommandDisplay('curl', {
  label: 'Curl', icon: 'Download', color: 'text-cyan-400', category: 'web',
  formatTitle: (a) => `Curl(${truncate(a.url || '…', 40)})`,
});

// --- Output (3) ---
registerCommandDisplay('present_files', {
  label: 'Present', icon: 'Paperclip', color: 'text-emerald-400', category: 'output',
  formatTitle: (a) => {
    const count = a.filepaths?.length || 1;
    return `Files(${count} file${count !== 1 ? 's' : ''})`;
  },
});
registerCommandDisplay('download_file', {
  label: 'Download', icon: 'Download', color: 'text-emerald-400', category: 'output',
  formatTitle: (a) => `Download(${extractFilename(a.path || '')})`,
});
registerCommandDisplay('export_result', {
  label: 'Export', icon: 'Share', color: 'text-emerald-400', category: 'output',
  formatTitle: (a) => `Export(${a.format || 'file'})`,
});

// --- Planning (4) ---
registerCommandDisplay('todo_write', {
  label: 'Plan', icon: 'ListTodo', color: 'text-indigo-400', category: 'planning',
  formatTitle: () => 'TodoWrite(…)',
});
registerCommandDisplay('todo_read', {
  label: 'Check', icon: 'ListChecks', color: 'text-indigo-400', category: 'planning',
  formatTitle: () => 'TodoRead(…)',
});
registerCommandDisplay('plan_create', {
  label: 'Plan', icon: 'Map', color: 'text-indigo-400', category: 'planning',
  formatTitle: (a) => `Plan(${a.name || '…'})`,
});
registerCommandDisplay('checkpoint_save', {
  label: 'Checkpoint', icon: 'Save', color: 'text-indigo-400', category: 'planning',
  formatTitle: (a) => `Checkpoint(${a.label || '…'})`,
});

// --- Subagent (3) ---
registerCommandDisplay('task', {
  label: 'Sub-agent', icon: 'GitBranch', color: 'text-pink-400', category: 'subagent',
  formatTitle: (a) => `Task(${truncate(a.prompt || '…', 50)})`,
});
registerCommandDisplay('task_complete', {
  label: 'Complete', icon: 'CheckCircle', color: 'text-green-500', category: 'subagent',
  formatTitle: () => 'Complete()',
});
registerCommandDisplay('subagent_spawn', {
  label: 'Spawn Agent', icon: 'GitBranch', color: 'text-pink-400', category: 'subagent',
  formatTitle: (a) => `Spawn(${a.type || 'general'})`,
});

// --- Memory (2) ---
registerCommandDisplay('memory_read', {
  label: 'Memory', icon: 'Brain', color: 'text-violet-400', category: 'memory',
  formatTitle: (a) => `MemRead(${a.key || '…'})`,
});
registerCommandDisplay('memory_write', {
  label: 'Memory', icon: 'Brain', color: 'text-violet-400', category: 'memory',
  formatTitle: (a) => `MemWrite(${a.key || '…'})`,
});

// --- Revert (3) ---
registerCommandDisplay('revert_edit', {
  label: 'Revert', icon: 'Undo', color: 'text-red-400', category: 'revert',
  formatTitle: (a) => `Revert(${extractFilename(a.path || '')})`,
});
registerCommandDisplay('revert_to_checkpoint', {
  label: 'Revert', icon: 'Undo', color: 'text-red-400', category: 'revert',
  formatTitle: (a) => `Revert(${a.checkpoint || '…'})`,
});
registerCommandDisplay('git_revert', {
  label: 'Git Revert', icon: 'Undo', color: 'text-red-400', category: 'revert',
  formatTitle: (a) => `GitRevert(${a.commit || '…'})`,
});

// --- Testing (3) ---
registerCommandDisplay('test_run', {
  label: 'Test', icon: 'TestTube', color: 'text-green-400', category: 'testing',
  formatTitle: (a) => `Test(${a.suite || '…'})`,
});
registerCommandDisplay('test_debug', {
  label: 'Debug Test', icon: 'Bug', color: 'text-red-400', category: 'testing',
  formatTitle: (a) => `DebugTest(${a.test || '…'})`,
});
registerCommandDisplay('coverage_check', {
  label: 'Coverage', icon: 'BarChart', color: 'text-green-400', category: 'testing',
  formatTitle: () => 'Coverage(…)',
});

// ============================================================
// Export the class-style interface for backwards compat
// ============================================================
export const CommandDisplayRegistry = {
  get: getCommandDisplayInfo,
  getAll: getAllCommandDisplayTypes,
  register: registerCommandDisplay,
  getCategory: getCommandCategory,
  getIcon: getCommandIcon,
  getColor: getCommandColor,
  formatTitle: formatCommandTitle,
  formatSubtitle: formatCommandSubtitle,
};
