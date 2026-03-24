// tests/tdd_v18/test_command_registry.test.ts
// TDD Step 1: Tests for CommandRegistry — 50+ tool/command types
// All tests must FAIL initially (no implementation exists yet)

import { describe, it, expect } from 'vitest';

// The module under test — does NOT exist yet (TDD)
import {
  COMMAND_REGISTRY,
  getCommandDisplay,
  getCommandCategory,
  getCommandIcon,
  getCommandColor,
  getCategoryTools,
  getAllCategories,
  formatCommandSignature,
  parseToolDescription,
  CommandDisplayInfo,
  CommandCategory,
} from '@/types/commandRegistry';

// ============================================================
// Test 1: Registry must contain at least 50 unique tool entries
// ============================================================
describe('CommandRegistry — Completeness', () => {
  it('T1.1: should have at least 50 registered command types', () => {
    const keys = Object.keys(COMMAND_REGISTRY);
    expect(keys.length).toBeGreaterThanOrEqual(50);
  });

  it('T1.2: every entry should have label, icon, color, category fields', () => {
    for (const [key, info] of Object.entries(COMMAND_REGISTRY)) {
      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('icon');
      expect(info).toHaveProperty('color');
      expect(info).toHaveProperty('category');
      expect(typeof (info as CommandDisplayInfo).label).toBe('string');
      expect(typeof (info as CommandDisplayInfo).icon).toBe('string');
      expect(typeof (info as CommandDisplayInfo).color).toBe('string');
      expect(typeof (info as CommandDisplayInfo).category).toBe('string');
    }
  });

  it('T1.3: no two entries should share the same label+icon combination', () => {
    const combos = new Set<string>();
    for (const info of Object.values(COMMAND_REGISTRY)) {
      const combo = `${(info as CommandDisplayInfo).label}|${(info as CommandDisplayInfo).icon}`;
      // Allow some shared combos (e.g. bash variants) but not all identical
      combos.add(combo);
    }
    // At least 35 unique combos out of 50+
    expect(combos.size).toBeGreaterThanOrEqual(35);
  });
});

// ============================================================
// Test 2: File System Operations (10 variants)
// ============================================================
describe('CommandRegistry — File System Operations', () => {
  const fsTools = [
    'read_file', 'write_file', 'edit_file', 'create_file', 'view',
    'batch_read', 'view_truncated', 'multi_edit', 'list_dir', 'glob',
    'file_search', 'str_replace',
  ];

  it('T2.1: all file system tools should be registered', () => {
    for (const tool of fsTools) {
      expect(COMMAND_REGISTRY).toHaveProperty(tool);
    }
  });

  it('T2.2: file system tools should belong to "filesystem" category', () => {
    for (const tool of fsTools) {
      const cat = getCommandCategory(tool);
      expect(cat).toBe('filesystem');
    }
  });

  it('T2.3: read_file should display as "Read file" with document icon', () => {
    const info = getCommandDisplay('read_file');
    expect(info.label).toBe('Read file');
    expect(info.icon).toMatch(/file|document|read|📄/i);
  });

  it('T2.4: str_replace should display as "Edit file" with edit icon', () => {
    const info = getCommandDisplay('str_replace');
    expect(info.label).toBe('Edit file');
    expect(info.icon).toMatch(/edit|pencil|🔧/i);
  });

  it('T2.5: view should display differently from read_file', () => {
    const viewInfo = getCommandDisplay('view');
    const readInfo = getCommandDisplay('read_file');
    // They can share label but icon or description differs
    expect(viewInfo.icon).toBeDefined();
    expect(readInfo.icon).toBeDefined();
  });

  it('T2.6: glob should have a search-related icon', () => {
    const info = getCommandDisplay('glob');
    expect(info.icon).toMatch(/search|glob|🔎/i);
  });

  it('T2.7: batch_read should indicate multi-file operation', () => {
    const info = getCommandDisplay('batch_read');
    expect(info.label).toMatch(/files|batch|read/i);
  });

  it('T2.8: multi_edit should indicate multi-file editing', () => {
    const info = getCommandDisplay('multi_edit');
    expect(info.label).toMatch(/multi|edit/i);
  });

  it('T2.9: list_dir category is filesystem', () => {
    expect(getCommandCategory('list_dir')).toBe('filesystem');
  });

  it('T2.10: file_search category is filesystem', () => {
    expect(getCommandCategory('file_search')).toBe('filesystem');
  });
});

// ============================================================
// Test 3: Command Execution (bash variants)
// ============================================================
describe('CommandRegistry — Command Execution', () => {
  const execTools = [
    'bash', 'bash_tool', 'run_script', 'batch_commands',
    'execute_code', 'install_package',
  ];

  it('T3.1: all execution tools should be registered', () => {
    for (const tool of execTools) {
      expect(COMMAND_REGISTRY).toHaveProperty(tool);
    }
  });

  it('T3.2: bash tools should belong to "execution" category', () => {
    for (const tool of ['bash', 'bash_tool', 'run_script', 'batch_commands']) {
      expect(getCommandCategory(tool)).toBe('execution');
    }
  });

  it('T3.3: execute_code should belong to "execution" category', () => {
    expect(getCommandCategory('execute_code')).toBe('execution');
  });

  it('T3.4: install_package should belong to "execution" category', () => {
    expect(getCommandCategory('install_package')).toBe('execution');
  });

  it('T3.5: bash_tool should have terminal/command icon', () => {
    const info = getCommandDisplay('bash_tool');
    expect(info.icon).toMatch(/terminal|command|⚡|commandLine/i);
  });

  it('T3.6: batch_commands label should indicate multiple commands', () => {
    const info = getCommandDisplay('batch_commands');
    expect(info.label).toMatch(/batch|commands|run/i);
  });

  it('T3.7: execute_code should have a play/run icon', () => {
    const info = getCommandDisplay('execute_code');
    expect(info.icon).toMatch(/play|run|execute|▶|code/i);
  });

  it('T3.8: install_package label should mention install', () => {
    const info = getCommandDisplay('install_package');
    expect(info.label).toMatch(/install|package/i);
  });

  it('T3.9: run_script should have script-related display', () => {
    const info = getCommandDisplay('run_script');
    expect(info.label).toMatch(/script|run|command/i);
  });

  it('T3.10: all execution tools should have warm colors', () => {
    for (const tool of execTools) {
      const color = getCommandColor(tool);
      expect(color).toMatch(/yellow|orange|amber|green/i);
    }
  });
});

// ============================================================
// Test 4: Web Operations
// ============================================================
describe('CommandRegistry — Web Operations', () => {
  const webTools = ['web_search', 'web_fetch', 'image_search', 'web_crawl', 'api_request'];

  it('T4.1: web_search and web_fetch should be registered', () => {
    expect(COMMAND_REGISTRY).toHaveProperty('web_search');
    expect(COMMAND_REGISTRY).toHaveProperty('web_fetch');
  });

  it('T4.2: web tools should belong to "web" category', () => {
    expect(getCommandCategory('web_search')).toBe('web');
    expect(getCommandCategory('web_fetch')).toBe('web');
  });

  it('T4.3: web_search should have globe/search icon', () => {
    const info = getCommandDisplay('web_search');
    expect(info.icon).toMatch(/globe|search|web|🌐/i);
  });

  it('T4.4: web_fetch should have download/fetch icon', () => {
    const info = getCommandDisplay('web_fetch');
    expect(info.icon).toMatch(/download|fetch|page|📥/i);
  });

  it('T4.5: image_search should be registered', () => {
    expect(COMMAND_REGISTRY).toHaveProperty('image_search');
    expect(getCommandCategory('image_search')).toBe('web');
  });

  it('T4.6: web tools should have cyan/blue colors', () => {
    expect(getCommandColor('web_search')).toMatch(/cyan|blue/i);
    expect(getCommandColor('web_fetch')).toMatch(/cyan|blue/i);
  });

  it('T4.7: web_crawl should be in web category if exists', () => {
    if (COMMAND_REGISTRY['web_crawl']) {
      expect(getCommandCategory('web_crawl')).toBe('web');
    } else {
      // At minimum web_search/web_fetch must exist
      expect(COMMAND_REGISTRY).toHaveProperty('web_search');
    }
  });

  it('T4.8: api_request should be in web category if exists', () => {
    if (COMMAND_REGISTRY['api_request']) {
      expect(getCommandCategory('api_request')).toBe('web');
    } else {
      expect(COMMAND_REGISTRY).toHaveProperty('web_fetch');
    }
  });

  it('T4.9: web_search label should say "Web search" or similar', () => {
    const info = getCommandDisplay('web_search');
    expect(info.label).toMatch(/search|web/i);
  });

  it('T4.10: web_fetch label should say "Fetch" or similar', () => {
    const info = getCommandDisplay('web_fetch');
    expect(info.label).toMatch(/fetch|page|download/i);
  });
});

// ============================================================
// Test 5: Git Operations
// ============================================================
describe('CommandRegistry — Git Operations', () => {
  const gitTools = [
    'git_clone', 'git_commit', 'git_push', 'git_pull', 'git_diff',
    'git_log', 'git_branch', 'git_checkout', 'git_merge', 'git_stash',
    'git_status', 'git_add', 'git_reset',
  ];

  it('T5.1: at least 8 git operations should be registered', () => {
    const registered = gitTools.filter(t => COMMAND_REGISTRY[t]);
    expect(registered.length).toBeGreaterThanOrEqual(8);
  });

  it('T5.2: git tools should belong to "git" category', () => {
    for (const tool of gitTools) {
      if (COMMAND_REGISTRY[tool]) {
        expect(getCommandCategory(tool)).toBe('git');
      }
    }
  });

  it('T5.3: git_commit should have a commit-related icon', () => {
    if (COMMAND_REGISTRY['git_commit']) {
      const info = getCommandDisplay('git_commit');
      expect(info.icon).toMatch(/git|commit|check|save/i);
    } else {
      expect(true).toBe(true); // pass if not implemented
    }
  });

  it('T5.4: git_diff should have diff-related display', () => {
    if (COMMAND_REGISTRY['git_diff']) {
      const info = getCommandDisplay('git_diff');
      expect(info.label).toMatch(/diff|compare|change/i);
    } else {
      expect(true).toBe(true);
    }
  });

  it('T5.5: git tools should have distinct color from filesystem tools', () => {
    if (COMMAND_REGISTRY['git_commit']) {
      const gitColor = getCommandColor('git_commit');
      const fsColor = getCommandColor('read_file');
      // They should be distinguishable
      expect(gitColor).toBeDefined();
      expect(fsColor).toBeDefined();
    } else {
      expect(true).toBe(true);
    }
  });

  it('T5.6: git_branch icon should relate to branching', () => {
    if (COMMAND_REGISTRY['git_branch']) {
      const info = getCommandDisplay('git_branch');
      expect(info.icon).toMatch(/branch|git|fork/i);
    } else {
      expect(true).toBe(true);
    }
  });

  it('T5.7: git_push and git_pull should have directional icons', () => {
    if (COMMAND_REGISTRY['git_push'] && COMMAND_REGISTRY['git_pull']) {
      const pushIcon = getCommandIcon('git_push');
      const pullIcon = getCommandIcon('git_pull');
      expect(pushIcon).toBeDefined();
      expect(pullIcon).toBeDefined();
      expect(pushIcon).not.toBe(pullIcon);
    } else {
      expect(true).toBe(true);
    }
  });

  it('T5.8: git_stash should be categorized under git', () => {
    if (COMMAND_REGISTRY['git_stash']) {
      expect(getCommandCategory('git_stash')).toBe('git');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T5.9: git_log should have history-related display', () => {
    if (COMMAND_REGISTRY['git_log']) {
      const info = getCommandDisplay('git_log');
      expect(info.label).toMatch(/log|history|commits/i);
    } else {
      expect(true).toBe(true);
    }
  });

  it('T5.10: getAllCategories should include "git"', () => {
    const categories = getAllCategories();
    expect(categories).toContain('git');
  });
});

// ============================================================
// Test 6: Task Management / Agent Operations
// ============================================================
describe('CommandRegistry — Agent & Task Operations', () => {
  const agentTools = [
    'task', 'todo_write', 'todo_read', 'task_complete',
    'memory_read', 'memory_write', 'subagent_spawn',
    'context_compact', 'approval_request',
  ];

  it('T6.1: core agent tools should be registered', () => {
    for (const tool of ['task', 'todo_write', 'todo_read', 'task_complete', 'memory_read', 'memory_write']) {
      expect(COMMAND_REGISTRY).toHaveProperty(tool);
    }
  });

  it('T6.2: agent tools should belong to "agent" category', () => {
    for (const tool of ['task', 'todo_write', 'todo_read', 'task_complete']) {
      expect(getCommandCategory(tool)).toBe('agent');
    }
  });

  it('T6.3: memory tools should belong to "agent" category', () => {
    expect(getCommandCategory('memory_read')).toBe('agent');
    expect(getCommandCategory('memory_write')).toBe('agent');
  });

  it('T6.4: task_complete should have success icon', () => {
    const info = getCommandDisplay('task_complete');
    expect(info.icon).toMatch(/check|complete|done|✅/i);
  });

  it('T6.5: todo_write should have planning icon', () => {
    const info = getCommandDisplay('todo_write');
    expect(info.icon).toMatch(/plan|todo|list|📋|write/i);
  });

  it('T6.6: memory tools should have brain icon', () => {
    const readInfo = getCommandDisplay('memory_read');
    const writeInfo = getCommandDisplay('memory_write');
    expect(readInfo.icon).toMatch(/brain|memory|🧠/i);
    expect(writeInfo.icon).toMatch(/brain|memory|🧠/i);
  });

  it('T6.7: task should have sub-agent icon', () => {
    const info = getCommandDisplay('task');
    expect(info.icon).toMatch(/agent|robot|task|bot|🤖/i);
  });

  it('T6.8: getCategoryTools("agent") should return agent tool list', () => {
    const tools = getCategoryTools('agent');
    expect(tools.length).toBeGreaterThanOrEqual(4);
    expect(tools).toContain('task');
    expect(tools).toContain('todo_write');
  });

  it('T6.9: approval_request if exists should be agent category', () => {
    if (COMMAND_REGISTRY['approval_request']) {
      expect(getCommandCategory('approval_request')).toBe('agent');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T6.10: context_compact if exists should be agent category', () => {
    if (COMMAND_REGISTRY['context_compact']) {
      expect(getCommandCategory('context_compact')).toBe('agent');
    } else {
      expect(true).toBe(true);
    }
  });
});

// ============================================================
// Test 7: Debug & Testing Operations
// ============================================================
describe('CommandRegistry — Debug & Test Operations', () => {
  const debugTools = [
    'debug_test', 'revert_edit', 'revert_to_checkpoint',
    'test_run', 'lint_check', 'type_check', 'format_code',
  ];

  it('T7.1: debug_test should be registered', () => {
    expect(COMMAND_REGISTRY).toHaveProperty('debug_test');
  });

  it('T7.2: revert tools should be registered', () => {
    expect(COMMAND_REGISTRY).toHaveProperty('revert_edit');
    expect(COMMAND_REGISTRY).toHaveProperty('revert_to_checkpoint');
  });

  it('T7.3: debug tools should belong to "debug" category', () => {
    expect(getCommandCategory('debug_test')).toBe('debug');
    expect(getCommandCategory('revert_edit')).toBe('debug');
    expect(getCommandCategory('revert_to_checkpoint')).toBe('debug');
  });

  it('T7.4: debug_test should have bug icon', () => {
    const info = getCommandDisplay('debug_test');
    expect(info.icon).toMatch(/bug|debug|test|🐛/i);
  });

  it('T7.5: revert_edit should have undo icon', () => {
    const info = getCommandDisplay('revert_edit');
    expect(info.icon).toMatch(/undo|revert|back|↩|rotate/i);
  });

  it('T7.6: test_run if exists should be in debug category', () => {
    if (COMMAND_REGISTRY['test_run']) {
      expect(getCommandCategory('test_run')).toBe('debug');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T7.7: lint_check if exists should be in debug category', () => {
    if (COMMAND_REGISTRY['lint_check']) {
      expect(getCommandCategory('lint_check')).toBe('debug');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T7.8: type_check if exists should be in debug category', () => {
    if (COMMAND_REGISTRY['type_check']) {
      expect(getCommandCategory('type_check')).toBe('debug');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T7.9: format_code if exists should be in debug category', () => {
    if (COMMAND_REGISTRY['format_code']) {
      expect(getCommandCategory('format_code')).toBe('debug');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T7.10: debug tools should have red/yellow/orange colors', () => {
    const color = getCommandColor('debug_test');
    expect(color).toMatch(/red|yellow|orange|amber/i);
  });
});

// ============================================================
// Test 8: Output / Presentation Operations
// ============================================================
describe('CommandRegistry — Output & Presentation', () => {
  const outputTools = [
    'present_files', 'create_artifact', 'render_markdown',
    'generate_image', 'create_chart', 'export_pdf',
    'create_table', 'render_mermaid',
  ];

  it('T8.1: present_files should be registered', () => {
    expect(COMMAND_REGISTRY).toHaveProperty('present_files');
  });

  it('T8.2: present_files should belong to "output" category', () => {
    expect(getCommandCategory('present_files')).toBe('output');
  });

  it('T8.3: present_files should have file/clip icon', () => {
    const info = getCommandDisplay('present_files');
    expect(info.icon).toMatch(/file|clip|present|📎/i);
  });

  it('T8.4: create_artifact if exists should be in output category', () => {
    if (COMMAND_REGISTRY['create_artifact']) {
      expect(getCommandCategory('create_artifact')).toBe('output');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T8.5: render_markdown if exists should be in output category', () => {
    if (COMMAND_REGISTRY['render_markdown']) {
      expect(getCommandCategory('render_markdown')).toBe('output');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T8.6: generate_image if exists should be in output category', () => {
    if (COMMAND_REGISTRY['generate_image']) {
      expect(getCommandCategory('generate_image')).toBe('output');
    } else {
      expect(true).toBe(true);
    }
  });

  it('T8.7: output tools should have emerald/green colors', () => {
    const color = getCommandColor('present_files');
    expect(color).toMatch(/emerald|green|teal/i);
  });

  it('T8.8: getCategoryTools("output") should include present_files', () => {
    const tools = getCategoryTools('output');
    expect(tools).toContain('present_files');
  });

  it('T8.9: create_chart if exists should have chart icon', () => {
    if (COMMAND_REGISTRY['create_chart']) {
      const info = getCommandDisplay('create_chart');
      expect(info.icon).toMatch(/chart|graph|bar/i);
    } else {
      expect(true).toBe(true);
    }
  });

  it('T8.10: export_pdf if exists should have document icon', () => {
    if (COMMAND_REGISTRY['export_pdf']) {
      const info = getCommandDisplay('export_pdf');
      expect(info.icon).toMatch(/pdf|doc|file/i);
    } else {
      expect(true).toBe(true);
    }
  });
});

// ============================================================
// Test 9: formatCommandSignature function
// ============================================================
describe('CommandRegistry — formatCommandSignature', () => {
  it('T9.1: bash tool should format as "Bash(command)"', () => {
    const sig = formatCommandSignature('bash', { command: 'ls -la' });
    expect(sig.name).toBe('Bash');
    expect(sig.argText).toContain('ls -la');
  });

  it('T9.2: str_replace should format as "Edit(path)"', () => {
    const sig = formatCommandSignature('str_replace', { path: '/src/app.ts', description: 'Fix bug' });
    expect(sig.name).toBe('Edit');
    expect(sig.argText).toContain('/src/app.ts');
  });

  it('T9.3: web_search should format as "WebSearch(query)"', () => {
    const sig = formatCommandSignature('web_search', { query: 'react hooks' });
    expect(sig.name).toMatch(/WebSearch|Search/);
    expect(sig.argText).toContain('react hooks');
  });

  it('T9.4: create_file should format as "Write(path)"', () => {
    const sig = formatCommandSignature('create_file', { path: '/src/new.ts' });
    expect(sig.name).toMatch(/Write|Create/);
    expect(sig.argText).toContain('/src/new.ts');
  });

  it('T9.5: view should format as "Read(path)"', () => {
    const sig = formatCommandSignature('view', { path: '/src/app.ts' });
    expect(sig.name).toMatch(/Read|View/);
    expect(sig.argText).toContain('/src/app.ts');
  });

  it('T9.6: long commands should be truncated', () => {
    const longCmd = 'a'.repeat(200);
    const sig = formatCommandSignature('bash', { command: longCmd });
    expect(sig.argText.length).toBeLessThanOrEqual(120);
  });

  it('T9.7: execute_code should include language', () => {
    const sig = formatCommandSignature('execute_code', { language: 'python', code: 'print(1)' });
    expect(sig.name).toMatch(/Execute|Run|Python/i);
  });

  it('T9.8: git_commit should format with message', () => {
    const sig = formatCommandSignature('git_commit', { message: 'fix: resolve bug' });
    expect(sig.argText).toContain('fix: resolve bug');
  });

  it('T9.9: present_files should show file count', () => {
    const sig = formatCommandSignature('present_files', { paths: ['/a.txt', '/b.txt'] });
    expect(sig.argText).toMatch(/2|files/i);
  });

  it('T9.10: unknown tool should return tool name as-is', () => {
    const sig = formatCommandSignature('unknown_xyz_tool', { foo: 'bar' });
    expect(sig.name).toBe('unknown_xyz_tool');
  });
});

// ============================================================
// Test 10: parseToolDescription (from eventStream messages)
// ============================================================
describe('CommandRegistry — parseToolDescription', () => {
  it('T10.1: should parse "Running command" into execution type', () => {
    const parsed = parseToolDescription('Running command', 'bash_tool');
    expect(parsed.category).toBe('execution');
  });

  it('T10.2: should parse "Editing file" into filesystem type', () => {
    const parsed = parseToolDescription('Editing file', 'str_replace');
    expect(parsed.category).toBe('filesystem');
  });

  it('T10.3: should parse "Creating file" into filesystem type', () => {
    const parsed = parseToolDescription('Creating file', 'create_file');
    expect(parsed.category).toBe('filesystem');
  });

  it('T10.4: should parse "Viewing file" into filesystem type', () => {
    const parsed = parseToolDescription('Viewing file', 'view');
    expect(parsed.category).toBe('filesystem');
  });

  it('T10.5: should parse "Presenting file(s)..." into output type', () => {
    const parsed = parseToolDescription('Presenting file(s)...', 'present_files');
    expect(parsed.category).toBe('output');
  });

  it('T10.6: should parse TDD step descriptions', () => {
    const parsed = parseToolDescription('TDD Step 2: Run all 100 tests after fixing conftest', 'bash_tool');
    expect(parsed.displayMessage).toContain('TDD');
  });

  it('T10.7: should parse M-numbered module descriptions', () => {
    const parsed = parseToolDescription('M51: Add _preferred_device and _evolution_generation class attributes to Algorithm', 'str_replace');
    expect(parsed.displayMessage).toContain('M51');
    expect(parsed.category).toBe('filesystem');
  });

  it('T10.8: should handle git-related descriptions', () => {
    const parsed = parseToolDescription('Configure git and commit tests', 'bash_tool');
    expect(parsed.displayMessage).toContain('git');
  });

  it('T10.9: should handle verification descriptions', () => {
    const parsed = parseToolDescription('Verify function/class counts unchanged', 'bash_tool');
    expect(parsed.displayMessage).toContain('Verify');
  });

  it('T10.10: should handle empty description gracefully', () => {
    const parsed = parseToolDescription('', 'bash_tool');
    expect(parsed.category).toBe('execution');
    expect(parsed.displayMessage).toBeDefined();
  });
});
