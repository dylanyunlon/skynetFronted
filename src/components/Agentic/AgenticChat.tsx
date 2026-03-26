// src/components/Agentic/AgenticChat.tsx
// Agentic Loop v13 — Claude Code Web 风格 UI (完全对标 claude.com/product/claude-code)
// 核心改造:
// 1. ⏺ 标记前缀 — Claude Code 独特的操作指示符
// 2. Tool blocks 完全匹配 Claude Code: Search(pattern: "..."), Read(...), Bash(...)...
// 3. 折叠/展开: 默认折叠 tool 详情，单击展开
// 4. Turn-level 分组: "Ran N commands, viewed M files, edited K files"
// 5. Web search 三行卡片布局 (title + domain + snippet)
// 6. Diff 内联 +N -M 统计
// 7. 暗色终端主题, 与 Claude Code 网页产品一致

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send, Loader2, Square, Terminal, FileText, Pencil, FilePlus, Files,
  FolderOpen, Search, FileSearch, Globe, Download, ChevronDown,
  ChevronRight, CheckCircle, XCircle, Clock, Zap, PenTool, FileEdit,
  Eye, RotateCcw, Bug, ListTodo, Brain, GitBranch, Code, AlertTriangle,
  Layers, Minimize2, Activity, Sparkles, ShieldCheck, ShieldX,
  CircleDot, CheckSquare, Circle, ArrowRight, Copy, Check,
  ExternalLink, Play, Hash, File, Folder
} from 'lucide-react';
import { useAgenticLoop } from '@/hooks/useAgenticLoop';
import { AgenticBlock, TOOL_DISPLAY, DetailItem, ToolResultMeta, TodoItem, TodoStatus } from '@/types/agentic';
import { COMMAND_REGISTRY, getCommandDisplay, formatCommandSignature } from '@/types/commandRegistry';
import { DiffViewer } from './DiffViewer';

// ============================================================
// Props
// ============================================================
interface AgenticChatProps {
  defaultModel?: string;
  defaultMaxTurns?: number;
  defaultWorkDir?: string;
}

// ============================================================
// Claude Code 风格: ⏺ 指示符
// ============================================================
const BulletIndicator: React.FC<{ color?: string; pulse?: boolean }> = ({ 
  color = 'text-blue-400', pulse = false 
}) => (
  <span className={`inline-block w-2 h-2 rounded-full ${color} ${pulse ? 'animate-pulse' : ''} shrink-0 mt-1.5`}
    style={{ boxShadow: pulse ? '0 0 6px currentColor' : undefined }}
  />
);

// ============================================================
// Claude Code 风格工具名称映射 — delegates to commandRegistry
// ============================================================
const getClaudeName = (tool: string): string => {
  const info = COMMAND_REGISTRY[tool];
  return info?.claudeName || CLAUDE_TOOL_NAMES_LEGACY[tool] || tool;
};

// Legacy fallback (kept for backwards compat with v13 blocks)
const CLAUDE_TOOL_NAMES_LEGACY: Record<string, string> = {
  bash: 'Bash',
  read_file: 'Read',
  batch_read: 'Read',
  write_file: 'Write',
  edit_file: 'Edit',
  multi_edit: 'MultiEdit',
  list_dir: 'LS',
  glob: 'Glob',
  grep_search: 'Search',
  file_search: 'Search',
  web_search: 'WebSearch',
  web_fetch: 'Fetch',
  view_truncated: 'Read',
  batch_commands: 'Bash',
  run_script: 'Bash',
  revert_edit: 'Revert',
  todo_write: 'TodoWrite',
  todo_read: 'TodoRead',
  task: 'Task',
  memory_read: 'Memory',
  memory_write: 'Memory',
  task_complete: 'Complete',
  debug_test: 'Bash',
  revert_to_checkpoint: 'Revert',
  str_replace: 'Edit',
  create_file: 'Write',
  view: 'Read',
  bash_tool: 'Bash',
};

// ============================================================
// TASK-09: Todo 列表
// ============================================================
const TodoListDisplay: React.FC<{ todoStatus: TodoStatus }> = ({ todoStatus }) => {
  const [expanded, setExpanded] = useState(true);
  const todos = todoStatus.todos || [];
  const progressPct = todoStatus.total > 0 ? Math.round((todoStatus.completed / todoStatus.total) * 100) : 0;

  const statusIcon = (item: TodoItem) => {
    switch (item.status) {
      case 'completed': return <CheckSquare className="w-3.5 h-3.5 text-green-400 shrink-0" />;
      case 'in_progress': return <CircleDot className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />;
      default: return <Circle className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />;
    }
  };

  const priorityBadge = (p?: string) => {
    if (!p || p === 'medium') return null;
    if (p === 'high') return <span className="text-[9px] bg-red-900/30 text-red-400 px-1 rounded">HIGH</span>;
    return <span className="text-[9px] bg-accent text-muted-foreground px-1 rounded">LOW</span>;
  };

  return (
    <div className="my-2 ml-4">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setExpanded(!expanded)}>
        <BulletIndicator color="text-indigo-400" />
        <span className="text-sm text-foreground/80">TodoWrite — {todoStatus.completed}/{todoStatus.total} tasks complete</span>
        <div className="flex-1 mx-2 h-1 bg-accent rounded-full overflow-hidden max-w-[120px]">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground/70">{progressPct}%</span>
      </div>
      {expanded && todos.length > 0 && (
        <div className="ml-6 mt-1.5 space-y-1 border-l border-border/50 pl-3">
          {todos.map((t) => (
            <div key={t.id} className="flex items-start gap-2 text-xs">
              {statusIcon(t)}
              <span className={t.status === 'completed' ? 'text-muted-foreground/70 line-through' : 'text-foreground/80'}>{t.content}</span>
              {priorityBadge(t.priority)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// TASK-10: Approval 交互块
// ============================================================
const ApprovalBlock: React.FC<{
  block: AgenticBlock;
  onApprove?: (command: string) => void;
  onDeny?: (command: string) => void;
}> = ({ block, onApprove, onDeny }) => {
  const [decided, setDecided] = useState<'approved' | 'denied' | null>(null);
  const cmd = block.approvalCommand || '';
  const risk = block.approvalRiskLevel || 'medium';
  const riskColor = risk === 'high' ? 'border-red-800/40 bg-red-900/10' :
    risk === 'low' ? 'border-yellow-800/30 bg-yellow-900/10' :
    'border-orange-800/30 bg-orange-900/10';

  return (
    <div className={`my-2 ml-4 px-3 py-2.5 rounded-lg border ${riskColor} text-xs`}>
      <div className="flex items-center gap-2 mb-2 text-orange-300">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="font-medium">Permission required — {risk} risk</span>
      </div>
      <div className="font-mono text-[11px] bg-foreground/5 px-2 py-1.5 rounded mb-2 text-foreground/80 break-all">{cmd}</div>
      {decided ? (
        <span className={decided === 'approved' ? 'text-green-400' : 'text-red-400'}>
          {decided === 'approved' ? '✓ Approved' : '✗ Denied'}
        </span>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => { setDecided('approved'); onApprove?.(cmd); }}
            className="px-3 py-1 bg-green-600/80 hover:bg-green-600 text-white rounded transition-colors">Allow</button>
          <button onClick={() => { setDecided('denied'); onDeny?.(cmd); }}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors">Deny</button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Web 搜索结果 — 三行卡片
// ============================================================
const WebSearchResults: React.FC<{ meta: ToolResultMeta }> = ({ meta }) => {
  const results = meta.result_titles || [];
  if (!results.length) return null;
  return (
    <div className="space-y-1.5 mt-1">
      {results.map((r, i) => (
        <div key={i} className="flex items-start gap-2 py-0.5 group">
          <div className="w-4 h-4 rounded bg-accent flex items-center justify-center text-[8px] text-muted-foreground shrink-0 mt-0.5">
            {r.domain?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-blue-400 truncate group-hover:underline cursor-pointer">{r.title}</div>
            <div className="text-[10px] text-muted-foreground/70 truncate">{r.domain || r.url}</div>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
        </div>
      ))}
    </div>
  );
};

// ============================================================
// 批量命令结果
// ============================================================
const BatchCommandsResults: React.FC<{ meta: ToolResultMeta }> = ({ meta }) => {
  const results = meta.results || [];
  if (!results.length) return null;
  return (
    <div className="space-y-1 mt-1">
      {results.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          {r.success ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0" /> : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
          <span className="text-foreground/80 truncate">{r.description || `Command ${i + 1}`}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// 核心: 工具块 — ⏺ ToolName(args)…
// ============================================================
const ToolBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const tool = block.tool || '';
  const isLoading = block.isStreaming || (block.toolResult === undefined && block.toolSuccess === undefined);
  const meta = block.toolResultMeta;

  const buildClaudeCallSignature = (): { name: string; argText: string; suffix: string } => {
    const ccName = getClaudeName(tool);

    if (tool === 'bash' || tool === 'run_script') {
      const cmd = block.toolArgs?.command || block.toolArgs?.script || '';
      const preview = cmd.length > 80 ? cmd.substring(0, 77) + '...' : cmd;
      return { name: ccName, argText: preview, suffix: '' };
    }
    if (tool === 'read_file' || tool === 'view_truncated') {
      const path = block.toolArgs?.path || meta?.filename || '';
      const range = meta?.truncated_range;
      return { name: ccName, argText: range ? `${path}, lines ${range}` : path, suffix: '' };
    }
    if (tool === 'batch_read') {
      const n = meta?.files_read ?? block.toolArgs?.paths?.length ?? 0;
      return { name: ccName, argText: `${n} file${n !== 1 ? 's' : ''}`, suffix: '' };
    }
    if (tool === 'edit_file' || tool === 'multi_edit') {
      const path = block.toolArgs?.path || meta?.filename || '';
      const a = meta?.added_lines ?? 0;
      const r = meta?.removed_lines ?? 0;
      return { name: ccName, argText: path, suffix: (a || r) ? `+${a} -${r}` : '' };
    }
    if (tool === 'write_file') {
      return { name: 'Create', argText: block.toolArgs?.path || meta?.filename || '', suffix: '' };
    }
    if (tool === 'grep_search') {
      const pattern = block.toolArgs?.pattern || block.toolArgs?.query || meta?.pattern || '';
      return { name: ccName, argText: `pattern: "${pattern}"`, suffix: '' };
    }
    if (tool === 'web_search') {
      const query = meta?.query || block.toolArgs?.query || '';
      const count = meta?.results_count ?? meta?.result_titles?.length ?? 0;
      return { name: ccName, argText: query, suffix: count > 0 ? `${count} results` : '' };
    }
    if (tool === 'web_fetch') {
      const title = meta?.title || meta?.display_title;
      const url = meta?.url || block.toolArgs?.url || '';
      let display = title || '';
      if (!display && url) { try { display = new URL(url).hostname; } catch { display = url; } }
      return { name: ccName, argText: display, suffix: '' };
    }
    if (tool === 'list_dir') return { name: ccName, argText: block.toolArgs?.path || '.', suffix: '' };
    if (tool === 'glob') return { name: ccName, argText: block.toolArgs?.pattern || '', suffix: '' };
    if (tool === 'task') {
      const prompt = block.toolArgs?.prompt || block.toolDescription || '';
      return { name: ccName, argText: `"${prompt.length > 60 ? prompt.substring(0, 57) + '...' : prompt}"`, suffix: '' };
    }
    if (tool === 'todo_write') return { name: 'TodoWrite', argText: block.toolDescription || 'update tasks', suffix: '' };
    if (tool === 'revert_edit' || tool === 'revert_to_checkpoint')
      return { name: 'Revert', argText: block.toolArgs?.path || meta?.path || '', suffix: '' };
    if (tool === 'batch_commands') {
      const n = meta?.total_commands ?? meta?.executed ?? meta?.results?.length ?? 0;
      return { name: ccName, argText: `${n} script${n !== 1 ? 's' : ''}`, suffix: '' };
    }
    if (tool === 'execute_code') {
      const lang = meta?.language || block.toolArgs?.language || 'python';
      const desc = block.toolDescription || block.toolArgs?.description || '';
      return { name: `Execute(${lang})`, argText: desc || 'code', suffix: '' };
    }
    if (tool === 'install_package') {
      const mgr = meta?.manager || block.toolArgs?.manager || 'pip';
      const pkg = meta?.package || block.toolArgs?.package || '';
      return { name: `${mgr} install`, argText: pkg, suffix: '' };
    }
    if (tool === 'present_files') {
      const n = meta?.files?.length ?? block.toolArgs?.paths?.length ?? 0;
      return { name: 'Files', argText: `${n} file${n !== 1 ? 's' : ''} ready`, suffix: '' };
    }
    if (tool === 'str_replace') {
      const path = block.toolArgs?.path || meta?.filename || '';
      const desc = block.toolArgs?.description || block.toolDescription || '';
      return { name: 'Edit', argText: path || desc, suffix: '' };
    }
    if (tool === 'create_file' || tool === 'write_file') {
      const path = block.toolArgs?.path || meta?.filename || '';
      return { name: 'Write', argText: path, suffix: '' };
    }
    if (tool === 'view') {
      const path = block.toolArgs?.path || '';
      return { name: 'Read', argText: path, suffix: '' };
    }
    if (tool === 'bash_tool') {
      const cmd = block.toolArgs?.command || '';
      const preview = cmd.length > 80 ? cmd.substring(0, 77) + '...' : cmd;
      return { name: 'Bash', argText: preview, suffix: '' };
    }
    return { name: ccName, argText: block.toolDescription || '', suffix: '' };
  };

  // v14: If streaming and we have partial JSON, show live typing effect
  const getStreamingArgText = (): string | null => {
    if (!block.isStreaming || !block.streamingJson) return null;
    try {
      // Show the last meaningful part being typed
      const raw = block.streamingJson;
      if (raw.length > 80) return raw.substring(raw.length - 77) + '...';
      return raw;
    } catch { return null; }
  };

  const { name: ccName, argText, suffix: statsSuffix } = buildClaudeCallSignature();
  const streamingArg = getStreamingArgText();
  const displayArg = streamingArg || argText;
  const bulletColor = isLoading ? 'text-blue-400' : block.toolSuccess === false ? 'text-red-400' : 'text-blue-400';

  return (
    <div className="my-0.5 ml-4">
      <div className="flex items-start gap-2 cursor-pointer group hover:bg-accent/30 rounded px-1 -mx-1 py-0.5 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <BulletIndicator color={bulletColor} pulse={isLoading} />
        <div className="flex-1 min-w-0 text-sm">
          <span className="text-foreground font-medium">{ccName}</span>
          {displayArg && <span className={`text-muted-foreground ${streamingArg ? 'animate-pulse' : ''}`}>({displayArg.length > 100 ? displayArg.substring(0, 97) + '...' : displayArg})</span>}
          {isLoading && !streamingArg && <span className="text-muted-foreground/70">…</span>}
          {statsSuffix && (
            <span className="ml-2 text-xs">
              {statsSuffix.includes('+') && <span className="text-green-400">{statsSuffix.split(' ')[0]} </span>}
              {statsSuffix.includes('-') && <span className="text-red-400">{statsSuffix.split(' ')[1]}</span>}
            </span>
          )}
          {tool === 'web_search' && !isLoading && (meta?.results_count ?? meta?.result_titles?.length ?? 0) > 0 && !statsSuffix && (
            <span className="ml-2 text-[10px] text-muted-foreground/70">{meta?.results_count ?? meta?.result_titles?.length} results</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
          {!isLoading && block.toolSuccess === false && <XCircle className="w-3.5 h-3.5 text-red-400" />}
          {block.toolDurationMs != null && <span className="text-[10px] text-muted-foreground/50">{(block.toolDurationMs / 1000).toFixed(1)}s</span>}
          {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground/50" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />}
        </div>
      </div>

      {expanded && (
        <div className="ml-4 mt-1 border-l border-border/40 pl-3 text-xs font-mono max-h-80 overflow-y-auto">
          {block.toolDescription && block.toolDescription !== ccName && (
            <div className="text-muted-foreground/70 mb-1.5 font-sans text-[11px] italic">{block.toolDescription}</div>
          )}
          {(tool === 'bash' || tool === 'run_script') && (block.toolArgs?.command || block.toolArgs?.script) && (
            <div className="bg-foreground/5 rounded px-2 py-1.5 mb-1.5">
              <pre className="text-yellow-300/80 whitespace-pre-wrap text-[11px]">$ {(block.toolArgs.command || block.toolArgs.script || '').substring(0, 1000)}</pre>
            </div>
          )}
          {block.toolDiff && <DiffViewer diff={block.toolDiff} filename={meta?.filename} addedLines={meta?.added_lines} removedLines={meta?.removed_lines} />}
          {tool === 'web_search' && meta && <WebSearchResults meta={meta} />}
          {tool === 'web_fetch' && (block.toolArgs?.url || meta?.url) && (
            <div className="text-primary/70 text-[11px] truncate mb-1.5">{block.toolArgs?.url || meta?.url}</div>
          )}
          {tool === 'batch_commands' && meta && <BatchCommandsResults meta={meta} />}
          {tool === 'view_truncated' && (meta?.truncated_range || meta?.total_lines) && (
            <div className="text-muted-foreground/70 text-[11px] mb-1.5">
              {meta?.truncated_range && <span>Lines {meta.truncated_range}</span>}
              {meta?.total_lines && <span> of {meta.total_lines} total</span>}
            </div>
          )}
          {/* Phase 7: execute_code — show code + output */}
          {tool === 'execute_code' && block.toolArgs?.code && (
            <div className="bg-foreground/5 rounded px-2 py-1.5 mb-1.5">
              <div className="text-[10px] text-muted-foreground/70 mb-1">{meta?.language || block.toolArgs?.language || 'python'}</div>
              <pre className="text-green-300/80 whitespace-pre-wrap text-[11px]">{(block.toolArgs.code || '').substring(0, 2000)}</pre>
            </div>
          )}
          {/* Phase 7: install_package — show command + result */}
          {tool === 'install_package' && (
            <div className="bg-foreground/5 rounded px-2 py-1.5 mb-1.5">
              <pre className="text-yellow-300/80 text-[11px]">$ {meta?.manager || 'pip'} install {meta?.package || block.toolArgs?.package}</pre>
            </div>
          )}
          {/* Phase 7: present_files — download links */}
          {tool === 'present_files' && meta?.files && meta.files.length > 0 && (
            <div className="space-y-1 mb-1.5">
              {meta.files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  {f.error ? (
                    <span className="text-red-400">✗ {f.path || f.filename}: {f.error}</span>
                  ) : (
                    <>
                      <span className="text-emerald-400">📎 {f.filename}</span>
                      <span className="text-muted-foreground/50">{f.size ? `(${(f.size / 1024).toFixed(1)}KB)` : ''}</span>
                      {f.download_path && (
                        <a href={f.download_path} className="text-blue-400 hover:underline" download>Download</a>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {block.toolResult && !block.toolDiff && tool !== 'web_search' && tool !== 'batch_commands' && (
            <pre className="text-muted-foreground/80 whitespace-pre-wrap break-words text-[11px] max-h-40 overflow-y-auto">
              {block.toolResult.substring(0, 3000)}
              {block.toolResult.length > 3000 && '\n…[truncated]'}
            </pre>
          )}
          {meta?.hint && <div className="mt-1 text-blue-400/60 text-[10px] italic">{meta.hint}</div>}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Turn Summary
// ============================================================
const TurnSummaryBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const items = block.detailItems || [];
  const summary = block.summary;

  const buildClaudeStyleTitle = (): string => {
    if (!summary) return block.display || 'Done';
    const parts: string[] = [];
    const { commands_run: cmds = 0, files_viewed: viewed = 0, files_edited: edited = 0,
      files_created: created = 0, searches_web: webSearches = 0, searches_code: codeSearches = 0,
      pages_fetched: fetched = 0, reverts = 0, tests_run: tests = 0, subagents_launched: subagents = 0 } = summary;

    if (cmds > 0) parts.push(`Ran ${cmds} command${cmds !== 1 ? 's' : ''}`);
    if (viewed > 0) parts.push(`viewed ${viewed === 1 ? 'a' : viewed} file${viewed !== 1 ? 's' : ''}`);
    if (edited > 0) parts.push(`edited ${edited === 1 ? 'a' : edited} file${edited !== 1 ? 's' : ''}`);
    if (created > 0) parts.push(`created ${created === 1 ? 'a' : created} file${created !== 1 ? 's' : ''}`);
    if (webSearches > 0) parts.push('searched the web');
    if (codeSearches > 0) parts.push(`searched code ${codeSearches} time${codeSearches !== 1 ? 's' : ''}`);
    if (fetched > 0) parts.push(`fetched ${fetched} page${fetched !== 1 ? 's' : ''}`);
    if (reverts! > 0) parts.push(`reverted ${reverts} change${reverts! !== 1 ? 's' : ''}`);
    if (tests! > 0) parts.push(`ran ${tests} test${tests! !== 1 ? 's' : ''}`);
    if (subagents! > 0) parts.push(`launched ${subagents} sub-agent${subagents! !== 1 ? 's' : ''}`);
    return parts.length === 0 ? (block.display || 'Done') : parts.join(', ');
  };

  return (
    <div className="my-2 ml-4">
      <div className="flex items-start gap-2 cursor-pointer group hover:bg-accent/30 rounded px-1 -mx-1 py-0.5"
        onClick={() => setExpanded(!expanded)}>
        <BulletIndicator color="text-green-400" />
        <span className="text-sm text-foreground/80">{buildClaudeStyleTitle()}</span>
        {summary?.task_completed && <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />}
        {items.length > 0 && (expanded
          ? <ChevronDown className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          : <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 shrink-0" />)}
      </div>
      {expanded && items.length > 0 && (
        <div className="mt-1 ml-6 space-y-0.5 border-l border-border/40 pl-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <span className="text-muted-foreground/50">{getClaudeName(item.tool)}</span>
              <span className="text-muted-foreground truncate">{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Debug/Test blocks
// ============================================================
const DebugBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [showLog, setShowLog] = useState(false);

  if (block.type === 'debug_start') {
    return (
      <div className="my-1 ml-4 flex items-start gap-2">
        <BulletIndicator color="text-yellow-400" pulse />
        <span className="text-sm text-yellow-300">Debug cycle {block.debugAttempt}/{block.debugMaxRetries}</span>
        <span className="text-xs text-muted-foreground/70 font-mono truncate">{block.debugCommand}</span>
      </div>
    );
  }
  if (block.type === 'debug_result') {
    return (
      <div className="my-1 ml-4">
        <div className="flex items-start gap-2">
          <BulletIndicator color={block.debugPassed ? 'text-green-400' : 'text-red-400'} />
          <span className={`text-sm ${block.debugPassed ? 'text-green-300' : 'text-red-300'}`}>
            {block.debugPassed ? 'Tests passed' : 'Tests failed'}
          </span>
          {block.debugDiagnosis && <span className="text-xs text-muted-foreground/70 truncate">{block.debugDiagnosis.error_summary}</span>}
          {block.content && (
            <button onClick={() => setShowLog(!showLog)} className="ml-auto text-muted-foreground/70 hover:text-foreground/80 text-[10px] underline">
              {showLog ? 'hide' : 'log'}
            </button>
          )}
        </div>
        {showLog && block.content && (
          <pre className="mt-1 ml-6 text-[10px] text-muted-foreground/70 bg-foreground/5 rounded px-2 py-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap">{block.content}</pre>
        )}
      </div>
    );
  }
  if (block.type === 'test_result') {
    const pass = block.testPassed;
    return (
      <div className="my-1 ml-4">
        <div className="flex items-start gap-2">
          <BulletIndicator color={pass ? 'text-green-400' : 'text-red-400'} />
          <span className={`text-sm ${pass ? 'text-green-300' : 'text-red-300'}`}>
            Ran {block.testTotal} tests. {block.testPassedCount} passed.
          </span>
          {block.testDurationS != null && <span className="text-[10px] text-muted-foreground/70">[{block.testDurationS.toFixed(2)}s]</span>}
          {block.content && (
            <button onClick={() => setShowLog(!showLog)} className="ml-auto text-muted-foreground/70 hover:text-foreground/80 text-[10px] underline">
              {showLog ? 'hide' : 'output'}
            </button>
          )}
        </div>
        {showLog && block.content && (
          <pre className="mt-1 ml-6 text-[10px] text-muted-foreground/70 bg-foreground/5 rounded px-2 py-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap">{block.content}</pre>
        )}
      </div>
    );
  }
  return null;
};

// ============================================================
// Info blocks
// ============================================================
const InfoBlock: React.FC<{
  block: AgenticBlock;
  onApprove?: (command: string) => void;
  onDeny?: (command: string) => void;
}> = ({ block, onApprove, onDeny }) => {
  if (block.type === 'diff_summary' && (block.diffFilesChanged ?? 0) > 0) {
    return (
      <div className="my-1 ml-4 flex items-start gap-2 text-xs text-muted-foreground/70">
        <BulletIndicator color="text-muted-foreground/70" />
        <span>{block.diffFilesChanged} file{block.diffFilesChanged! > 1 ? 's' : ''} changed</span>
        {block.diffTotalAdded! > 0 && <span className="text-green-400">+{block.diffTotalAdded}</span>}
        {block.diffTotalRemoved! > 0 && <span className="text-red-400">-{block.diffTotalRemoved}</span>}
      </div>
    );
  }
  if (block.type === 'revert') {
    return (
      <div className="my-1 ml-4 flex items-start gap-2">
        <BulletIndicator color="text-orange-400" />
        <span className="text-sm text-orange-300">Reverted: {block.revertDescription || block.revertPath}</span>
      </div>
    );
  }
  if (block.type === 'approval_wait') return <ApprovalBlock block={block} onApprove={onApprove} onDeny={onDeny} />;
  if (block.type === 'chunk_schedule') {
    return (
      <div className="my-1 ml-4 flex items-start gap-2 text-[11px] text-muted-foreground/50">
        <BulletIndicator color="text-muted-foreground/50" />
        <span>Scheduling {block.chunkTotalCalls} calls in {block.chunkCount} chunks ({block.chunkParallelCalls} parallel)</span>
      </div>
    );
  }
  if (block.type === 'context_compact') {
    return (
      <div className="my-1 ml-4 flex items-start gap-2 text-[11px] text-muted-foreground/50">
        <BulletIndicator color="text-purple-400" />
        <span>Context compacted: {block.compactBeforeTokens?.toLocaleString()} → {block.compactAfterTokens?.toLocaleString()} tokens</span>
      </div>
    );
  }
  if (block.type === 'todo_update' && block.todoStatus) return <TodoListDisplay todoStatus={block.todoStatus} />;
  return null;
};

// ============================================================
// Thinking Block — collapsible with summary (v14)
// ============================================================
const ThinkingBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const summary = block.thinkingSummary;
  const content = block.content || '';
  const isActive = block.isStreaming;

  return (
    <div className="my-1 ml-4">
      <div className="flex items-start gap-2 cursor-pointer group" onClick={() => setExpanded(!expanded)}>
        <BulletIndicator color="text-muted-foreground/50" pulse={isActive} />
        <div className="flex-1 min-w-0 text-xs">
          {isActive && !summary && (
            <span className="text-muted-foreground/70 italic">Thinking…</span>
          )}
          {summary && !expanded && (
            <span className="text-muted-foreground/70 italic">{summary}</span>
          )}
          {!isActive && !summary && !expanded && (
            <span className="text-muted-foreground/70 italic">Thought for a moment</span>
          )}
          {expanded && (
            <div className="text-muted-foreground/70 italic leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {content}
            </div>
          )}
        </div>
        {content.length > 0 && (
          expanded
            ? <ChevronDown className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 shrink-0" />
        )}
      </div>
    </div>
  );
};

// ============================================================
// 空状态
// ============================================================
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="mb-6">
      <div className="text-2xl font-light text-foreground mb-1">What can I help you with?</div>
      <div className="text-sm text-muted-foreground/70">AI 自主编程 — 文件操作 · 命令执行 · Web 搜索 · 调试回滚</div>
    </div>
    <div className="flex flex-wrap justify-center gap-2 max-w-md">
      {['Fix the failing tests', 'Refactor this module', 'Explain this codebase', 'Create a REST API', 'Debug the build error', 'Search for best practices'].map((hint) => (
        <div key={hint} className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 border border-border/30 rounded-full hover:bg-accent/50 hover:text-foreground/80 cursor-pointer transition-colors">
          {hint}
        </div>
      ))}
    </div>
  </div>
);

// ============================================================
// 主组件
// ============================================================
export const AgenticChat: React.FC<AgenticChatProps> = ({
  defaultModel = 'claude-opus-4-6',
  defaultMaxTurns = 30,
  defaultWorkDir = '',
}) => {
  const { blocks, status, error, turns, totalToolCalls, duration, model, workDir,
          totalInputTokens, totalOutputTokens, totalCost, contextTokensEst,
          elapsed, runTask, stop, reset } = useAgenticLoop();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [blocks]);
  useEffect(() => { status !== 'running' && inputRef.current?.focus(); }, [status]);

  const handleSubmit = () => {
    const task = input.trim();
    if (!task || status === 'running') return;
    setInput('');
    runTask({ task, model: defaultModel, max_turns: defaultMaxTurns, work_dir: defaultWorkDir || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleNewTask = () => { reset(); setInput(''); setTimeout(() => inputRef.current?.focus(), 100); };
  const handleApprove = useCallback((command: string) => { console.log('[AgenticChat] Approved:', command); }, []);
  const handleDeny = useCallback((command: string) => { console.log('[AgenticChat] Denied:', command); }, []);

  const isIdle = status === 'idle' && blocks.length === 0;

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* 状态栏 */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              status === 'running' ? 'bg-green-400 animate-pulse' :
              status === 'done' ? 'bg-blue-400' :
              status === 'error' ? 'bg-red-400' : 'bg-accent'
            }`} />
            <span className="text-muted-foreground font-medium">{model || defaultModel}</span>
          </div>
          {workDir && <span className="text-muted-foreground/50 font-mono text-[10px] truncate max-w-[200px]">{workDir}</span>}
        </div>
        <div className="flex items-center gap-3 text-muted-foreground/70">
          {status === 'running' && elapsed > 0 && <span className="text-muted-foreground">{elapsed.toFixed(0)}s</span>}
          {totalToolCalls > 0 && <span>{totalToolCalls} tool calls</span>}
          {totalCost > 0 && <span>${totalCost.toFixed(4)}</span>}
          {contextTokensEst > 0 && <span>{(contextTokensEst / 1000).toFixed(0)}K ctx</span>}
          {(status === 'done' || status === 'error') && blocks.length > 0 && (
            <button onClick={handleNewTask} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3" /><span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {isIdle ? <EmptyState /> : (
            <div className="space-y-0.5">
              {blocks.map((block) => {
                switch (block.type) {
                  case 'text':
                    return (
                      <div key={block.id} className="my-2 ml-4">
                        <div className="flex items-start gap-2">
                          <BulletIndicator color="text-blue-400" />
                          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed flex-1">{block.content}</div>
                        </div>
                      </div>
                    );
                  case 'thinking':
                    return (
                      <ThinkingBlock key={block.id} block={block} />
                    );
                  case 'tool':
                    return <ToolBlock key={block.id} block={block} />;
                  case 'turn_summary':
                    return <TurnSummaryBlock key={block.id} block={block} />;
                  case 'file_change':
                    return (
                      <div key={block.id} className="my-0.5 ml-4 flex items-start gap-2 text-xs">
                        <BulletIndicator color={block.fileAction === 'created' ? 'text-green-400' : 'text-orange-400'} />
                        <span className={block.fileAction === 'created' ? 'text-green-400' : 'text-orange-400'}>
                          {block.fileAction === 'created' ? 'Create' : 'Update'}
                        </span>
                        <span className="text-foreground/80 font-mono">{block.fileName}</span>
                        {(block.linesAdded ?? 0) > 0 && <span className="text-green-400">+{block.linesAdded}</span>}
                        {(block.linesRemoved ?? 0) > 0 && <span className="text-red-400">-{block.linesRemoved}</span>}
                      </div>
                    );
                  case 'error':
                    return (
                      <div key={block.id} className="my-2 ml-4 flex items-start gap-2">
                        <BulletIndicator color="text-red-400" />
                        <div className="text-sm text-red-300">{block.content}</div>
                      </div>
                    );
                  case 'debug_start': case 'debug_result': case 'test_result':
                    return <DebugBlock key={block.id} block={block} />;
                  case 'diff_summary': case 'revert': case 'approval_wait':
                  case 'chunk_schedule': case 'context_compact': case 'todo_update':
                    return <InfoBlock key={block.id} block={block} onApprove={handleApprove} onDeny={handleDeny} />;
                  case 'subagent':
                    return (
                      <div key={block.id} className="my-1 ml-4">
                        <div className="flex items-start gap-2">
                          <BulletIndicator color="text-pink-400" />
                          <span className="text-sm text-pink-300 font-medium">Task({block.toolDescription || 'sub-agent'})</span>
                          {block.toolSuccess === true && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                          {block.toolSuccess === false && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        {block.content && <div className="text-xs text-muted-foreground/70 ml-6 mt-0.5 truncate">{block.content}</div>}
                      </div>
                    );
                  default:
                    return null;
                }
              })}

              {status === 'running' && (
                <div className="my-2 ml-4 flex items-start gap-2">
                  <BulletIndicator color="text-blue-400" pulse />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              )}

              {status === 'done' && blocks.length > 0 && (
                <div className="mt-4 ml-4 pt-3 border-t border-border/50 text-xs text-muted-foreground/50 flex items-center gap-3">
                  <span className="text-green-400/70">✓ Done</span>
                  <span>{turns} turn{turns !== 1 ? 's' : ''}</span>
                  <span>{totalToolCalls} tool call{totalToolCalls !== 1 ? 's' : ''}</span>
                  <span>{duration.toFixed(1)}s</span>
                  {totalCost > 0 && <span>${totalCost.toFixed(4)}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 输入区 */}
      <div className="border-t border-border bg-muted px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isIdle ? "Type your task… (e.g., fix the auth bug, create a REST API)" : "Follow up…"}
              className="flex-1 bg-card border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground
                         placeholder-muted-foreground/50 resize-none min-h-[44px] max-h-[200px] focus:outline-none focus:border-primary/50 transition-colors"
              rows={1}
              disabled={status === 'running'}
            />
            {status === 'running' ? (
              <button onClick={stop} className="p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-colors shrink-0" title="Stop (Esc)">
                <Square className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-primary/80 hover:bg-primary disabled:bg-muted disabled:text-muted-foreground/50 text-white transition-colors shrink-0" title="Send (Enter)">
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/50 px-1">
            <span>Enter to send · Shift+Enter for newline</span>
            {status === 'running' && <span className="text-primary">Processing…</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticChat;