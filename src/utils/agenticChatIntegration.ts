/**
 * AgenticChatIntegration — v20
 *
 * Integration layer connecting CommandDisplayRegistry, CapabilityToggleManager,
 * and panel states into the AgenticChat component rendering logic.
 */
import {
  getCommandDisplayInfo,
  type CommandDisplayInfo,
} from './commandDisplayRegistry';

// ============================================================
// Types
// ============================================================

export interface DisplayConfig {
  icon: string;
  label: string;
  category: string;
  color: string;
  claudeName: string;
}

export interface BlockStats {
  totalDuration: number;
  categoryBreakdown: Record<string, number>;
  successCount: number;
  failureCount: number;
  toolCount: number;
}

export interface DoneSummary {
  turns: number;
  toolCalls: number;
  totalDuration: number;
  cost: number;
  formattedDuration: string;
  formattedCost: string;
}

export interface PanelRoute {
  panel: 'execution' | 'artifact' | 'settings' | 'none';
  reason: string;
}

export interface PanelVisibilityState {
  executionPanel: boolean;
  artifactPanel: boolean;
  settingsPanel: boolean;
}

export interface ContextMenuItem {
  label: string;
  action: string;
  icon?: string;
}

type AnyBlock = Record<string, any>;

// ============================================================
// Tool → Category mapping
// ============================================================

const EXECUTION_TOOLS = new Set([
  'bash', 'bash_tool', 'run_script', 'batch_commands', 'execute_code',
  'install_package', 'shell_exec', 'docker_run', 'pip_install', 'npm_install', 'apt_install',
]);

const FILESYSTEM_TOOLS = new Set([
  'view', 'read_file', 'batch_read', 'view_truncated', 'list_dir',
  'glob', 'cat_file', 'head_file', 'str_replace', 'edit_file',
  'multi_edit', 'patch_file', 'sed_replace', 'create_file', 'write_file',
  'mkdir', 'copy_file', 'file_search', 'grep_search', 'regex_search', 'find_files',
]);

const WEB_TOOLS = new Set([
  'web_search', 'web_fetch', 'image_search', 'web_crawl', 'api_request', 'curl',
]);

const ARTIFACT_TOOLS = new Set([
  'create_file', 'present_files', 'create_artifact', 'render_markdown',
]);

function getCategory(tool: string): string {
  if (EXECUTION_TOOLS.has(tool)) return 'execution';
  if (FILESYSTEM_TOOLS.has(tool)) return 'filesystem';
  if (WEB_TOOLS.has(tool)) return 'web';
  return 'unknown';
}

// ============================================================
// Display config
// ============================================================

const CLAUDE_NAMES: Record<string, string> = {
  bash_tool: 'Bash', bash: 'Bash', run_script: 'Script',
  str_replace: 'Edit', edit_file: 'Edit', multi_edit: 'MultiEdit',
  view: 'Read', read_file: 'Read', batch_read: 'ReadFiles',
  view_truncated: 'ReadSection', list_dir: 'LS',
  create_file: 'Write', write_file: 'Write',
  web_search: 'WebSearch', web_fetch: 'Fetch',
  grep_search: 'Search', file_search: 'Search', regex_search: 'Search',
  present_files: 'Present', glob: 'Glob',
  todo_write: 'TodoWrite', todo_read: 'TodoRead',
  task: 'Task', task_complete: 'TaskComplete',
  debug_test: 'Test', test_run: 'Test',
  revert_edit: 'Revert', revert_to_checkpoint: 'Revert',
  git_commit: 'GitCommit', git_push: 'GitPush',
};

export function mapBlockToDisplayConfig(block: AnyBlock): DisplayConfig {
  const tool = block.tool || '';
  const category = getCategory(tool);
  let display: CommandDisplayInfo | undefined;
  try {
    display = getCommandDisplayInfo(tool);
  } catch {
    // unknown tool
  }

  return {
    icon: display?.icon || '⚡',
    label: display?.label || tool,
    category,
    color: display?.color || 'gray',
    claudeName: CLAUDE_NAMES[tool] || tool,
  };
}

// ============================================================
// Capability filtering
// ============================================================

const CAPABILITY_TOOL_MAP: Record<string, Set<string>> = {
  code_execution: EXECUTION_TOOLS,
  web_search: WEB_TOOLS,
  artifacts: ARTIFACT_TOOLS,
};

export function filterBlocksByCapabilities(
  blocks: AnyBlock[],
  capabilities: Record<string, boolean>,
): AnyBlock[] {
  return blocks.filter(block => {
    if (block.type !== 'tool') return true; // always show non-tool blocks
    const tool = block.tool || '';
    for (const [capId, tools] of Object.entries(CAPABILITY_TOOL_MAP)) {
      if (tools.has(tool) && capabilities[capId] === false) return false;
    }
    return true;
  });
}

// ============================================================
// Tool signatures (Claude Code style)
// ============================================================

const MAX_SIGNATURE_LENGTH = 120;

export function formatToolSignature(
  tool: string,
  input: string,
  meta?: Record<string, any>,
): string {
  const name = CLAUDE_NAMES[tool] || tool;
  const filename = meta?.filename || '';

  // Edit tools: Edit(filepath)
  if (['str_replace', 'edit_file', 'multi_edit', 'patch_file'].includes(tool)) {
    return `${name}(${filename || 'unknown'})`;
  }

  // Read tools: Read(filepath)
  if (['view', 'read_file', 'view_truncated', 'batch_read', 'cat_file'].includes(tool)) {
    return `${name}(${filename || 'unknown'})`;
  }

  // Bash tools: Bash(command)…
  if (EXECUTION_TOOLS.has(tool)) {
    let cmd = input || '';
    if (cmd.length > MAX_SIGNATURE_LENGTH - name.length - 5) {
      cmd = cmd.substring(0, MAX_SIGNATURE_LENGTH - name.length - 5) + '…';
    }
    return `${name}(${cmd})…`;
  }

  // Default
  if (input && input.length > 0) {
    const truncated = input.length > MAX_SIGNATURE_LENGTH - name.length - 5
      ? input.substring(0, MAX_SIGNATURE_LENGTH - name.length - 5) + '…'
      : input;
    return `${name}(${truncated})`;
  }
  return `${name}()`;
}

// ============================================================
// Turn summary
// ============================================================

export function generateTurnSummary(blocks: AnyBlock[]): string {
  if (blocks.length === 0) return '';

  const toolBlocks = blocks.filter(b => b.type === 'tool');
  if (toolBlocks.length === 0) return '';

  const cmdCount = toolBlocks.filter(b => EXECUTION_TOOLS.has(b.tool)).length;
  const editCount = toolBlocks.filter(b =>
    ['str_replace', 'edit_file', 'multi_edit', 'patch_file', 'sed_replace'].includes(b.tool)
  ).length;
  const viewCount = toolBlocks.filter(b =>
    ['view', 'read_file', 'batch_read', 'view_truncated', 'list_dir', 'cat_file'].includes(b.tool)
  ).length;
  const createCount = toolBlocks.filter(b =>
    ['create_file', 'write_file'].includes(b.tool)
  ).length;

  const parts: string[] = [];
  if (cmdCount > 0) parts.push(`Ran ${cmdCount} command${cmdCount > 1 ? 's' : ''}`);
  if (viewCount > 0) parts.push(`viewed ${viewCount > 1 ? `${viewCount} files` : 'a file'}`);
  if (editCount > 0) parts.push(`edited ${editCount > 1 ? `${editCount} files` : 'a file'}`);
  if (createCount > 0) parts.push(`created ${createCount > 1 ? `${createCount} files` : 'a file'}`);

  return parts.join(', ');
}

// ============================================================
// Block statistics
// ============================================================

export function computeBlockStats(blocks: AnyBlock[]): BlockStats {
  const toolBlocks = blocks.filter(b => b.type === 'tool');
  const totalDuration = toolBlocks.reduce((sum, b) => sum + (b.toolDuration || 0), 0);

  const categoryBreakdown: Record<string, number> = {};
  for (const b of toolBlocks) {
    const cat = getCategory(b.tool);
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  }

  const successCount = toolBlocks.filter(b => b.toolExitCode === 0 || b.toolExitCode === undefined).length;
  const failureCount = toolBlocks.filter(b => b.toolExitCode !== undefined && b.toolExitCode !== 0).length;

  return {
    totalDuration,
    categoryBreakdown,
    successCount,
    failureCount,
    toolCount: toolBlocks.length,
  };
}

// ============================================================
// Done summary
// ============================================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(0);
  return `${m}m ${s}s`;
}

export function buildDoneSummary(
  blocks: AnyBlock[],
  turns: number,
  cost: number,
): DoneSummary {
  const toolBlocks = blocks.filter(b => b.type === 'tool');
  const totalDuration = toolBlocks.reduce((sum, b) => sum + (b.toolDuration || 0), 0);

  return {
    turns,
    toolCalls: toolBlocks.length,
    totalDuration,
    cost,
    formattedDuration: formatDuration(totalDuration),
    formattedCost: `$${cost.toFixed(4)}`,
  };
}

// ============================================================
// Panel routing
// ============================================================

export function routeToolResultToPanel(
  tool: string,
  meta: Record<string, any>,
): PanelRoute {
  if (ARTIFACT_TOOLS.has(tool)) {
    return { panel: 'artifact', reason: `${tool} creates/presents artifacts` };
  }
  if (EXECUTION_TOOLS.has(tool)) {
    return { panel: 'execution', reason: `${tool} is an execution tool` };
  }
  return { panel: 'none', reason: `${tool} has no dedicated panel` };
}

// ============================================================
// Panel visibility
// ============================================================

export function managePanelVisibility(
  action: 'init' | 'toggle' | 'close_all',
  panelKey?: keyof PanelVisibilityState,
  current?: PanelVisibilityState,
): PanelVisibilityState {
  if (action === 'init' || !current) {
    return { executionPanel: false, artifactPanel: false, settingsPanel: false };
  }
  if (action === 'close_all') {
    return { executionPanel: false, artifactPanel: false, settingsPanel: false };
  }
  if (action === 'toggle' && panelKey) {
    const newVal = !current[panelKey];
    // Exclusive mode: close others when opening
    return {
      executionPanel: panelKey === 'executionPanel' ? newVal : false,
      artifactPanel: panelKey === 'artifactPanel' ? newVal : false,
      settingsPanel: panelKey === 'settingsPanel' ? newVal : false,
    };
  }
  return current;
}

// ============================================================
// Context menu
// ============================================================

export function buildToolContextMenuItems(block: AnyBlock): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];
  const tool = block.tool || '';

  // Always have copy
  items.push({ label: 'Copy command', action: 'copy', icon: '📋' });

  // Execution tools get re-run
  if (EXECUTION_TOOLS.has(tool)) {
    items.push({ label: 'Re-run command', action: 'rerun', icon: '▶️' });
  }

  // Edit tools get view-diff
  if (['str_replace', 'edit_file', 'multi_edit', 'patch_file'].includes(tool)) {
    items.push({ label: 'View diff', action: 'view_diff', icon: '📊' });
  }

  // File tools get open-file
  if (FILESYSTEM_TOOLS.has(tool)) {
    items.push({ label: 'Open file', action: 'open_file', icon: '📄' });
  }

  return items;
}

// ============================================================
// Accessibility
// ============================================================

export function generateBlockA11yLabel(block: AnyBlock): string {
  if (block.type === 'text') {
    const preview = (block.content || '').substring(0, 50);
    return `text response: ${preview}`;
  }

  if (block.type === 'tool') {
    const tool = block.tool || 'unknown';
    const exitCode = block.toolExitCode;
    const status = exitCode === undefined ? '' : exitCode === 0 ? ', success' : ', failed';
    const category = getCategory(tool);

    if (EXECUTION_TOOLS.has(tool)) {
      return `Executed command ${tool}${status}`;
    }
    return `Tool ${tool} (${category})${status}`;
  }

  return `block of type ${block.type || 'unknown'}`;
}
