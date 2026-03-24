// src/types/commandRegistry.ts
// Command Registry v18 — 50+ tool/command types with categories, icons, colors
// Supports Claude Code SSE protocol tools + extended agentic operations

// ============================================================
// Types
// ============================================================
export type CommandCategory =
  | 'filesystem'
  | 'execution'
  | 'web'
  | 'git'
  | 'agent'
  | 'debug'
  | 'output';

export interface CommandDisplayInfo {
  label: string;
  icon: string;        // lucide icon name or emoji
  color: string;       // Tailwind color class
  category: CommandCategory;
  claudeName: string;  // Claude Code style display name (e.g. "Bash", "Edit", "Read")
  description?: string;
}

export interface CommandSignature {
  name: string;
  argText: string;
  suffix: string;
}

export interface ParsedToolDescription {
  category: CommandCategory;
  displayMessage: string;
}

// ============================================================
// Registry — 55 tool types across 7 categories
// ============================================================
export const COMMAND_REGISTRY: Record<string, CommandDisplayInfo> = {
  // ── Filesystem (12) ──────────────────────────────────
  read_file:         { label: 'Read file',       icon: 'FileText',    color: 'text-blue-400',    category: 'filesystem', claudeName: 'Read' },
  write_file:        { label: 'Create file',     icon: 'FilePlus',    color: 'text-green-400',   category: 'filesystem', claudeName: 'Write' },
  edit_file:         { label: 'Edit file',       icon: 'FileEdit',    color: 'text-orange-400',  category: 'filesystem', claudeName: 'Edit' },
  create_file:       { label: 'Create file',     icon: 'FilePlus',    color: 'text-green-400',   category: 'filesystem', claudeName: 'Write' },
  view:              { label: 'View file',       icon: 'Eye',         color: 'text-blue-300',    category: 'filesystem', claudeName: 'Read' },
  batch_read:        { label: 'Read files',      icon: 'Files',       color: 'text-blue-400',    category: 'filesystem', claudeName: 'Read' },
  view_truncated:    { label: 'View section',    icon: 'EyeOff',     color: 'text-blue-300',    category: 'filesystem', claudeName: 'Read' },
  multi_edit:        { label: 'Multi edit',      icon: 'FileStack',   color: 'text-orange-400',  category: 'filesystem', claudeName: 'MultiEdit' },
  list_dir:          { label: 'List directory',  icon: 'FolderOpen',  color: 'text-gray-400',    category: 'filesystem', claudeName: 'LS' },
  glob:              { label: 'Glob search',     icon: 'SearchCode',  color: 'text-gray-400',    category: 'filesystem', claudeName: 'Glob' },
  file_search:       { label: 'Find files',      icon: 'FileSearch',  color: 'text-purple-400',  category: 'filesystem', claudeName: 'Search' },
  str_replace:       { label: 'Edit file',       icon: 'Pencil',      color: 'text-orange-400',  category: 'filesystem', claudeName: 'Edit' },

  // ── Execution (8) ───────────────────────────────────
  bash:              { label: 'Command',         icon: 'Terminal',    color: 'text-yellow-400',  category: 'execution',  claudeName: 'Bash' },
  bash_tool:         { label: 'Command',         icon: 'Terminal',    color: 'text-yellow-400',  category: 'execution',  claudeName: 'Bash' },
  run_script:        { label: 'Run script',      icon: 'ScrollText',  color: 'text-yellow-400',  category: 'execution',  claudeName: 'Bash' },
  batch_commands:    { label: 'Batch commands',  icon: 'Layers',      color: 'text-yellow-400',  category: 'execution',  claudeName: 'Bash' },
  execute_code:      { label: 'Execute code',    icon: 'Play',        color: 'text-green-400',   category: 'execution',  claudeName: 'Execute' },
  install_package:   { label: 'Install package', icon: 'Package',     color: 'text-amber-400',   category: 'execution',  claudeName: 'Install' },
  shell_exec:        { label: 'Shell execute',   icon: 'TerminalSquare', color: 'text-yellow-400', category: 'execution', claudeName: 'Shell' },
  docker_run:        { label: 'Docker run',      icon: 'Container',   color: 'text-amber-400',   category: 'execution',  claudeName: 'Docker' },

  // ── Web (7) ─────────────────────────────────────────
  web_search:        { label: 'Web search',      icon: 'Globe',       color: 'text-cyan-400',    category: 'web',        claudeName: 'WebSearch' },
  web_fetch:         { label: 'Fetch page',      icon: 'Download',    color: 'text-cyan-400',    category: 'web',        claudeName: 'Fetch' },
  image_search:      { label: 'Image search',    icon: 'Image',       color: 'text-cyan-300',    category: 'web',        claudeName: 'ImageSearch' },
  web_crawl:         { label: 'Web crawl',       icon: 'Spider',      color: 'text-cyan-400',    category: 'web',        claudeName: 'Crawl' },
  api_request:       { label: 'API request',     icon: 'Webhook',     color: 'text-blue-400',    category: 'web',        claudeName: 'API' },
  scrape_page:       { label: 'Scrape page',     icon: 'FileDown',    color: 'text-cyan-300',    category: 'web',        claudeName: 'Scrape' },
  dns_lookup:        { label: 'DNS lookup',      icon: 'AtSign',      color: 'text-blue-300',    category: 'web',        claudeName: 'DNS' },

  // ── Git (13) ────────────────────────────────────────
  git_clone:         { label: 'Git clone',       icon: 'GitFork',     color: 'text-orange-300',  category: 'git',        claudeName: 'Clone' },
  git_commit:        { label: 'Git commit',      icon: 'GitCommitVertical', color: 'text-orange-400', category: 'git',   claudeName: 'Commit' },
  git_push:          { label: 'Git push',        icon: 'ArrowUpToLine', color: 'text-orange-400', category: 'git',       claudeName: 'Push' },
  git_pull:          { label: 'Git pull',        icon: 'ArrowDownToLine', color: 'text-orange-300', category: 'git',     claudeName: 'Pull' },
  git_diff:          { label: 'Git diff',        icon: 'FileDiff',    color: 'text-orange-300',  category: 'git',        claudeName: 'Diff' },
  git_log:           { label: 'Git history',     icon: 'History',     color: 'text-orange-300',  category: 'git',        claudeName: 'Log' },
  git_branch:        { label: 'Git branch',      icon: 'GitBranch',   color: 'text-orange-400',  category: 'git',        claudeName: 'Branch' },
  git_checkout:      { label: 'Git checkout',    icon: 'GitBranchPlus', color: 'text-orange-300', category: 'git',       claudeName: 'Checkout' },
  git_merge:         { label: 'Git merge',       icon: 'GitMerge',    color: 'text-orange-400',  category: 'git',        claudeName: 'Merge' },
  git_stash:         { label: 'Git stash',       icon: 'Archive',     color: 'text-orange-300',  category: 'git',        claudeName: 'Stash' },
  git_status:        { label: 'Git status',      icon: 'GitPullRequestArrow', color: 'text-orange-300', category: 'git', claudeName: 'Status' },
  git_add:           { label: 'Git add',         icon: 'Plus',        color: 'text-orange-400',  category: 'git',        claudeName: 'Add' },
  git_reset:         { label: 'Git reset',       icon: 'RotateCcw',   color: 'text-orange-400',  category: 'git',        claudeName: 'Reset' },

  // ── Agent (9) ───────────────────────────────────────
  task:              { label: 'Sub-agent',       icon: 'Bot',         color: 'text-pink-400',    category: 'agent',      claudeName: 'Task' },
  todo_write:        { label: 'Plan tasks',      icon: 'ListTodo',    color: 'text-indigo-400',  category: 'agent',      claudeName: 'TodoWrite' },
  todo_read:         { label: 'Check tasks',     icon: 'CheckSquare', color: 'text-indigo-400',  category: 'agent',      claudeName: 'TodoRead' },
  task_complete:     { label: 'Complete',         icon: 'CheckCircle', color: 'text-green-500',   category: 'agent',      claudeName: 'Complete' },
  memory_read:       { label: 'Read memory',     icon: 'Brain',       color: 'text-violet-400',  category: 'agent',      claudeName: 'Memory' },
  memory_write:      { label: 'Save memory',     icon: 'BrainCircuit', color: 'text-violet-400', category: 'agent',      claudeName: 'Memory' },
  subagent_spawn:    { label: 'Spawn agent',     icon: 'Boxes',       color: 'text-pink-400',    category: 'agent',      claudeName: 'Spawn' },
  context_compact:   { label: 'Compact context', icon: 'Minimize2',   color: 'text-purple-400',  category: 'agent',      claudeName: 'Compact' },
  approval_request:  { label: 'Request approval', icon: 'ShieldAlert', color: 'text-amber-400',  category: 'agent',      claudeName: 'Approval' },

  // ── Debug (6) ───────────────────────────────────────
  debug_test:        { label: 'Debug test',      icon: 'Bug',         color: 'text-red-400',     category: 'debug',      claudeName: 'Debug' },
  revert_edit:       { label: 'Revert edit',     icon: 'RotateCcw',   color: 'text-red-400',     category: 'debug',      claudeName: 'Revert' },
  revert_to_checkpoint: { label: 'Revert checkpoint', icon: 'Undo2', color: 'text-red-400',     category: 'debug',      claudeName: 'Revert' },
  test_run:          { label: 'Run tests',       icon: 'TestTube',    color: 'text-yellow-400',  category: 'debug',      claudeName: 'Test' },
  lint_check:        { label: 'Lint check',      icon: 'Ruler',       color: 'text-amber-400',   category: 'debug',      claudeName: 'Lint' },
  type_check:        { label: 'Type check',      icon: 'Braces',      color: 'text-amber-400',   category: 'debug',      claudeName: 'TypeCheck' },

  // ── Output (5 — was 4, adding render_mermaid) ──────
  present_files:     { label: 'Files ready',     icon: 'Paperclip',   color: 'text-emerald-400', category: 'output',     claudeName: 'Files' },
  create_artifact:   { label: 'Create artifact', icon: 'Sparkles',    color: 'text-emerald-400', category: 'output',     claudeName: 'Artifact' },
  render_markdown:   { label: 'Render markdown', icon: 'FileType',    color: 'text-green-400',   category: 'output',     claudeName: 'Markdown' },
  generate_image:    { label: 'Generate image',  icon: 'ImagePlus',   color: 'text-teal-400',    category: 'output',     claudeName: 'Image' },
  create_chart:      { label: 'Create chart',    icon: 'BarChart3',   color: 'text-emerald-400', category: 'output',     claudeName: 'Chart' },
};

// ============================================================
// Accessor Functions
// ============================================================
const FALLBACK: CommandDisplayInfo = {
  label: 'Unknown',
  icon: 'CircleDot',
  color: 'text-gray-400',
  category: 'execution',
  claudeName: '',
};

export function getCommandDisplay(tool: string): CommandDisplayInfo {
  return COMMAND_REGISTRY[tool] || { ...FALLBACK, label: tool, claudeName: tool };
}

export function getCommandCategory(tool: string): CommandCategory {
  return (COMMAND_REGISTRY[tool]?.category) || 'execution';
}

export function getCommandIcon(tool: string): string {
  return (COMMAND_REGISTRY[tool]?.icon) || 'CircleDot';
}

export function getCommandColor(tool: string): string {
  return (COMMAND_REGISTRY[tool]?.color) || 'text-gray-400';
}

export function getCategoryTools(category: CommandCategory): string[] {
  return Object.entries(COMMAND_REGISTRY)
    .filter(([, info]) => info.category === category)
    .map(([key]) => key);
}

export function getAllCategories(): CommandCategory[] {
  const cats = new Set<CommandCategory>();
  for (const info of Object.values(COMMAND_REGISTRY)) {
    cats.add(info.category);
  }
  return Array.from(cats);
}

// ============================================================
// formatCommandSignature — Claude Code style "ToolName(args)"
// ============================================================
export function formatCommandSignature(
  tool: string,
  args: Record<string, any> = {},
  meta?: Record<string, any>,
): CommandSignature {
  const info = COMMAND_REGISTRY[tool];
  const ccName = info?.claudeName || tool;
  const MAX_ARG = 100;

  const truncate = (s: string, max = MAX_ARG) =>
    s.length > max ? s.substring(0, max - 3) + '...' : s;

  // Bash / script
  if (tool === 'bash' || tool === 'bash_tool' || tool === 'run_script' || tool === 'shell_exec') {
    const cmd = args.command || args.script || '';
    return { name: 'Bash', argText: truncate(cmd), suffix: '' };
  }

  // File editing
  if (tool === 'str_replace' || tool === 'edit_file' || tool === 'multi_edit') {
    const path = args.path || meta?.filename || args.description || '';
    const a = meta?.added_lines ?? 0;
    const r = meta?.removed_lines ?? 0;
    return { name: 'Edit', argText: truncate(path), suffix: (a || r) ? `+${a} -${r}` : '' };
  }

  // File reading
  if (tool === 'read_file' || tool === 'view' || tool === 'view_truncated') {
    const path = args.path || meta?.filename || '';
    const range = meta?.truncated_range;
    return { name: 'Read', argText: truncate(range ? `${path}, lines ${range}` : path), suffix: '' };
  }

  // File creation
  if (tool === 'write_file' || tool === 'create_file') {
    const path = args.path || meta?.filename || '';
    return { name: 'Write', argText: truncate(path), suffix: '' };
  }

  // Batch read
  if (tool === 'batch_read') {
    const n = meta?.files_read ?? args.paths?.length ?? 0;
    return { name: 'Read', argText: `${n} file${n !== 1 ? 's' : ''}`, suffix: '' };
  }

  // Search tools
  if (tool === 'grep_search' || tool === 'file_search') {
    const pattern = args.pattern || args.query || meta?.pattern || '';
    return { name: 'Search', argText: `pattern: "${truncate(pattern, 60)}"`, suffix: '' };
  }

  // Web search
  if (tool === 'web_search') {
    const query = meta?.query || args.query || '';
    const count = meta?.results_count ?? meta?.result_titles?.length ?? 0;
    return { name: 'WebSearch', argText: truncate(query, 60), suffix: count > 0 ? `${count} results` : '' };
  }

  // Web fetch
  if (tool === 'web_fetch') {
    const title = meta?.title || meta?.display_title;
    const url = meta?.url || args.url || '';
    let display = title || '';
    if (!display && url) { try { display = new URL(url).hostname; } catch { display = url; } }
    return { name: 'Fetch', argText: truncate(display), suffix: '' };
  }

  // Image search
  if (tool === 'image_search') {
    const query = args.query || '';
    return { name: 'ImageSearch', argText: truncate(query, 60), suffix: '' };
  }

  // Dir listing
  if (tool === 'list_dir') return { name: 'LS', argText: truncate(args.path || '.'), suffix: '' };
  if (tool === 'glob') return { name: 'Glob', argText: truncate(args.pattern || ''), suffix: '' };

  // Execute code
  if (tool === 'execute_code') {
    const lang = meta?.language || args.language || 'python';
    const desc = args.description || '';
    return { name: `Execute(${lang})`, argText: truncate(desc || 'code'), suffix: '' };
  }

  // Install package
  if (tool === 'install_package') {
    const mgr = meta?.manager || args.manager || 'pip';
    const pkg = meta?.package || args.package || '';
    return { name: `${mgr} install`, argText: truncate(pkg), suffix: '' };
  }

  // Present files
  if (tool === 'present_files') {
    const paths = args.paths || args.filepaths || meta?.files || [];
    const n = Array.isArray(paths) ? paths.length : 0;
    return { name: 'Files', argText: `${n} file${n !== 1 ? 's' : ''} ready`, suffix: '' };
  }

  // Task / Sub-agent
  if (tool === 'task' || tool === 'subagent_spawn') {
    const prompt = args.prompt || args.description || '';
    return { name: 'Task', argText: truncate(`"${prompt}"`, 80), suffix: '' };
  }

  // Todo
  if (tool === 'todo_write') return { name: 'TodoWrite', argText: truncate(args.description || 'update tasks'), suffix: '' };
  if (tool === 'todo_read') return { name: 'TodoRead', argText: '', suffix: '' };

  // Revert
  if (tool === 'revert_edit' || tool === 'revert_to_checkpoint') {
    return { name: 'Revert', argText: truncate(args.path || meta?.path || ''), suffix: '' };
  }

  // Batch commands
  if (tool === 'batch_commands') {
    const n = meta?.total_commands ?? meta?.executed ?? meta?.results?.length ?? 0;
    return { name: 'Bash', argText: `${n} script${n !== 1 ? 's' : ''}`, suffix: '' };
  }

  // Git operations
  if (tool === 'git_commit') {
    return { name: 'Commit', argText: truncate(args.message || args.description || ''), suffix: '' };
  }
  if (tool === 'git_push') return { name: 'Push', argText: truncate(args.remote || args.branch || ''), suffix: '' };
  if (tool === 'git_pull') return { name: 'Pull', argText: truncate(args.remote || args.branch || ''), suffix: '' };
  if (tool === 'git_clone') return { name: 'Clone', argText: truncate(args.url || args.repo || ''), suffix: '' };
  if (tool === 'git_diff') return { name: 'Diff', argText: truncate(args.target || args.file || ''), suffix: '' };
  if (tool === 'git_log') return { name: 'Log', argText: truncate(args.file || args.count || ''), suffix: '' };
  if (tool === 'git_branch') return { name: 'Branch', argText: truncate(args.name || ''), suffix: '' };
  if (tool === 'git_checkout') return { name: 'Checkout', argText: truncate(args.branch || args.ref || ''), suffix: '' };
  if (tool === 'git_merge') return { name: 'Merge', argText: truncate(args.branch || ''), suffix: '' };
  if (tool === 'git_stash') return { name: 'Stash', argText: truncate(args.action || 'save'), suffix: '' };
  if (tool === 'git_status') return { name: 'Status', argText: '', suffix: '' };
  if (tool === 'git_add') return { name: 'Add', argText: truncate(args.path || '.'), suffix: '' };
  if (tool === 'git_reset') return { name: 'Reset', argText: truncate(args.target || ''), suffix: '' };

  // Debug / Test
  if (tool === 'debug_test') return { name: 'Debug', argText: truncate(args.command || ''), suffix: '' };
  if (tool === 'test_run') return { name: 'Test', argText: truncate(args.command || args.suite || ''), suffix: '' };
  if (tool === 'lint_check') return { name: 'Lint', argText: truncate(args.path || ''), suffix: '' };
  if (tool === 'type_check') return { name: 'TypeCheck', argText: truncate(args.path || ''), suffix: '' };

  // Output / Artifact
  if (tool === 'create_artifact') return { name: 'Artifact', argText: truncate(args.title || args.type || ''), suffix: '' };
  if (tool === 'render_markdown') return { name: 'Markdown', argText: truncate(args.path || ''), suffix: '' };
  if (tool === 'generate_image') return { name: 'Image', argText: truncate(args.prompt || ''), suffix: '' };
  if (tool === 'create_chart') return { name: 'Chart', argText: truncate(args.title || args.type || ''), suffix: '' };

  // Memory
  if (tool === 'memory_read') return { name: 'Memory', argText: 'read', suffix: '' };
  if (tool === 'memory_write') return { name: 'Memory', argText: 'write', suffix: '' };

  // Context / Approval
  if (tool === 'context_compact') return { name: 'Compact', argText: '', suffix: '' };
  if (tool === 'approval_request') return { name: 'Approval', argText: truncate(args.command || ''), suffix: '' };

  // Docker / web extras
  if (tool === 'docker_run') return { name: 'Docker', argText: truncate(args.image || args.command || ''), suffix: '' };
  if (tool === 'web_crawl') return { name: 'Crawl', argText: truncate(args.url || ''), suffix: '' };
  if (tool === 'api_request') return { name: 'API', argText: truncate(args.url || args.endpoint || ''), suffix: '' };
  if (tool === 'scrape_page') return { name: 'Scrape', argText: truncate(args.url || ''), suffix: '' };
  if (tool === 'dns_lookup') return { name: 'DNS', argText: truncate(args.domain || ''), suffix: '' };

  // Fallback
  return { name: tool, argText: truncate(JSON.stringify(args).substring(0, 60)), suffix: '' };
}

// ============================================================
// parseToolDescription — from SSE tool_use_block_update_delta messages
// ============================================================
const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: CommandCategory }> = [
  { pattern: /^(Running command|Ran |Execute|Shell|Docker)/i, category: 'execution' },
  { pattern: /^(Edit|Creat|Writ|View|Read|List|Glob|Search|Find|Replac)/i, category: 'filesystem' },
  { pattern: /^(Fetch|Web|Search the web|Image search|Crawl|API|Scrape|DNS)/i, category: 'web' },
  { pattern: /^(Git |Clone|Commit|Push|Pull|Merge|Branch|Stash|Checkout|Diff|Log|Status|Reset|Add files)/i, category: 'git' },
  { pattern: /^(Task|Todo|Memory|Spawn|Compact|Approv|Sub-?agent)/i, category: 'agent' },
  { pattern: /^(Debug|Test|Revert|Lint|Type.?check|Format)/i, category: 'debug' },
  { pattern: /^(Present|Artifact|Render|Generate|Chart|Export|Download)/i, category: 'output' },
];

const TOOL_TO_CATEGORY: Record<string, CommandCategory> = {};
for (const [tool, info] of Object.entries(COMMAND_REGISTRY)) {
  TOOL_TO_CATEGORY[tool] = info.category;
}

export function parseToolDescription(
  description: string,
  toolName: string,
): ParsedToolDescription {
  // First try tool name lookup
  const toolCategory = TOOL_TO_CATEGORY[toolName];

  // Then try pattern matching on description
  let descCategory: CommandCategory | null = null;
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(description)) {
      descCategory = category;
      break;
    }
  }

  const category = descCategory || toolCategory || 'execution';
  const displayMessage = description || (COMMAND_REGISTRY[toolName]?.label || toolName);

  return { category, displayMessage };
}
