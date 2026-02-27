// src/components/Agentic/AgenticChat.tsx
// Agentic Loop v11 主界面 — Claude Code 风格 UI (全事件渲染 + Workspace集成)

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, Square, Terminal, FileText, Pencil, FilePlus, Files,
  FolderOpen, Search, FileSearch, Globe, Download, ChevronDown,
  ChevronRight, CheckCircle, XCircle, Clock, Zap, PenTool, FileEdit,
  Eye, RotateCcw, Bug, ListTodo, Brain, GitBranch, Code, AlertTriangle,
  Layers, Minimize2, Activity, Sparkles
} from 'lucide-react';
import { useAgenticLoop } from '@/hooks/useAgenticLoop';
import { AgenticBlock, TOOL_DISPLAY, DetailItem, ToolResultMeta } from '@/types/agentic';

// ============================================================
// Props
// ============================================================
interface AgenticChatProps {
  defaultModel?: string;
  defaultMaxTurns?: number;
  defaultWorkDir?: string;
}

// ============================================================
// 工具图标映射
// ============================================================
const iconMap: Record<string, React.ReactNode> = {
  bash: <Terminal className="w-4 h-4" />,
  read_file: <FileText className="w-4 h-4" />,
  batch_read: <Files className="w-4 h-4" />,
  write_file: <FilePlus className="w-4 h-4" />,
  edit_file: <Pencil className="w-4 h-4" />,
  multi_edit: <PenTool className="w-4 h-4" />,
  list_dir: <FolderOpen className="w-4 h-4" />,
  grep_search: <Search className="w-4 h-4" />,
  file_search: <FileSearch className="w-4 h-4" />,
  web_search: <Globe className="w-4 h-4" />,
  web_fetch: <Download className="w-4 h-4" />,
  task_complete: <CheckCircle className="w-4 h-4" />,
  view_truncated: <Eye className="w-4 h-4" />,
  batch_commands: <Terminal className="w-4 h-4" />,
  run_script: <Code className="w-4 h-4" />,
  revert_edit: <RotateCcw className="w-4 h-4" />,
  glob: <FileSearch className="w-4 h-4" />,
  todo_write: <ListTodo className="w-4 h-4" />,
  todo_read: <ListTodo className="w-4 h-4" />,
  task: <GitBranch className="w-4 h-4" />,
  memory_read: <Brain className="w-4 h-4" />,
  memory_write: <Brain className="w-4 h-4" />,
  debug_test: <Bug className="w-4 h-4" />,
  revert_to_checkpoint: <RotateCcw className="w-4 h-4" />,
};

const ToolIcon: React.FC<{ tool: string; className?: string }> = ({ tool, className }) => {
  return <span className={className}>{iconMap[tool] || <Zap className="w-4 h-4" />}</span>;
};

// ============================================================
// Web Search 结果列表 — Claude Code 风格三行卡片
// ============================================================
const WebSearchResults: React.FC<{ meta: ToolResultMeta }> = ({ meta }) => {
  if (!meta.result_titles?.length) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="text-xs text-gray-400 font-medium">{meta.results_count ?? meta.result_titles.length} results</div>
      {meta.result_titles.map((r, i) => (
        <div key={i} className="border border-gray-700/30 rounded-md px-2.5 py-2 hover:bg-gray-800/30 transition-colors">
          <a href={r.url} target="_blank" rel="noopener noreferrer"
             className="text-blue-400 hover:underline text-xs font-medium block truncate">
            {r.title || r.url}
          </a>
          <div className="text-[10px] text-green-500/70 mt-0.5 truncate">
            {r.domain || (() => { try { return new URL(r.url).hostname; } catch { return r.url; } })()}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Batch Commands 结果
// ============================================================
const BatchCommandsResults: React.FC<{ meta: ToolResultMeta }> = ({ meta }) => {
  if (!meta.results?.length) return null;
  return (
    <div className="mt-2 space-y-1">
      {meta.results.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {r.success
            ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
            : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
          <span className="text-gray-300">{r.description || `Command ${i + 1}`}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Diff 显示 (Claude Code 风格 +N -M)
// ============================================================
const DiffDisplay: React.FC<{ diff?: string; meta?: ToolResultMeta }> = ({ diff, meta }) => {
  const added = meta?.added_lines ?? 0;
  const removed = meta?.removed_lines ?? 0;
  if (!diff && !added && !removed) return null;
  return (
    <div className="mt-1.5">
      {(added > 0 || removed > 0) && (
        <span className="text-xs">
          <span className="text-green-400">+{added}</span>
          {' '}
          <span className="text-red-400">-{removed}</span>
        </span>
      )}
    </div>
  );
};

// ============================================================
// 工具块 (可折叠, Claude Code 风格)
// ============================================================
const ToolBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const tool = block.tool || '';
  const toolInfo = TOOL_DISPLAY[tool] || { label: tool, icon: '⚙️', color: 'text-gray-400' };
  const isLoading = block.toolResult === undefined;
  const meta = block.toolResultMeta;

  // ── TASK-01~04: Claude Code 风格动态标题生成 ──
  const buildDisplayTitle = (): { title: string; subtitle?: string } => {
    // TASK-01: batch_commands → "Ran N commands"
    if (tool === 'batch_commands') {
      const n = meta?.total_commands ?? meta?.executed ?? meta?.results?.length ?? 0;
      return { title: `Ran ${n} command${n !== 1 ? 's' : ''}` };
    }
    // TASK-02: batch_read → "Viewed N files"
    if (tool === 'batch_read') {
      const n = meta?.files_read ?? 0;
      return { title: `Viewed ${n} file${n !== 1 ? 's' : ''}` };
    }
    // TASK-03: web_search → "Searched the web" + query subtitle + "N results"
    if (tool === 'web_search') {
      const query = meta?.query || block.toolArgs?.query || '';
      const count = meta?.results_count ?? meta?.result_titles?.length ?? 0;
      const truncQuery = query.length > 60 ? query.substring(0, 57) + '...' : query;
      return {
        title: 'Searched the web',
        subtitle: truncQuery ? `${truncQuery}` : undefined,
      };
    }
    // TASK-04: web_fetch → "Fetched: [page title]"
    if (tool === 'web_fetch') {
      const pageTitle = meta?.title || meta?.display_title;
      if (pageTitle) return { title: `Fetched: ${pageTitle}` };
      const url = meta?.url || block.toolArgs?.url || '';
      if (url) {
        try { return { title: `Fetched: ${new URL(url).hostname}${new URL(url).pathname.substring(0, 40)}` }; } catch {}
      }
      return { title: 'Fetched page' };
    }
    // view_truncated → "View truncated section of [filename]"
    if (tool === 'view_truncated') {
      const fname = meta?.filename || block.toolArgs?.path?.split('/').pop() || '';
      return { title: fname ? `View truncated section of ${fname}` : 'View truncated section' };
    }
    // read_file → "View [filename]"
    if (tool === 'read_file') {
      const fname = meta?.filename || block.toolArgs?.path?.split('/').pop() || '';
      return { title: fname ? `View ${fname}` : (block.toolDescription || toolInfo.label) };
    }
    // Default: use description or tool label
    return { title: block.toolDescription || toolInfo.label };
  };

  const { title: displayTitle, subtitle: displaySubtitle } = buildDisplayTitle();

  // web_search 结果数量标记
  const searchResultCount = (tool === 'web_search' && !isLoading)
    ? (meta?.results_count ?? meta?.result_titles?.length ?? 0)
    : 0;

  const hasDiff = block.toolDiff || meta?.added_lines || meta?.removed_lines;
  const editStats = hasDiff ? (
    <span className="ml-2 text-xs">
      {meta?.filename && <span className="text-gray-400">{meta.filename}</span>}
      {(meta?.added_lines ?? 0) > 0 && <span className="text-green-400 ml-1">+{meta?.added_lines}</span>}
      {(meta?.removed_lines ?? 0) > 0 && <span className="text-red-400 ml-1">-{meta?.removed_lines}</span>}
    </span>
  ) : null;

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/30 my-1">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
        <ToolIcon tool={tool} className={toolInfo.color} />
        <span className="text-sm text-gray-200 font-medium truncate">{displayTitle}</span>
        {/* TASK-03: web_search 结果数量 badge */}
        {searchResultCount > 0 && (
          <span className="text-[11px] text-cyan-400/80 bg-cyan-900/20 px-1.5 py-0.5 rounded font-medium shrink-0">
            {searchResultCount} results
          </span>
        )}
        {editStats}
        {isLoading && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin ml-auto shrink-0" />}
        {!isLoading && block.toolSuccess === true && <CheckCircle className="w-3.5 h-3.5 text-green-400 ml-auto shrink-0" />}
        {!isLoading && block.toolSuccess === false && <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto shrink-0" />}
        {block.toolDurationMs != null && (
          <span className="text-[10px] text-gray-500 ml-1 shrink-0">{(block.toolDurationMs / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* TASK-03: web_search 查询词副标题 (折叠状态也可见) */}
      {tool === 'web_search' && displaySubtitle && !expanded && (
        <div className="px-3 pb-1.5 -mt-1 text-xs text-gray-500 truncate pl-10">
          {displaySubtitle}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-700/30 px-3 py-2 text-xs font-mono max-h-64 overflow-y-auto bg-gray-900/40">
          {/* TASK-06 (bonus): 描述文本 — 如果 toolDescription 与 displayTitle 不同则额外显示 */}
          {block.toolDescription && block.toolDescription !== displayTitle && (
            <div className="text-gray-400 mb-2 font-sans text-[11px] italic">{block.toolDescription}</div>
          )}
          {block.toolArgs && (
            <div className="mb-2">
              {tool === 'bash' && block.toolArgs.command && (
                <div className="text-yellow-300/80">$ {block.toolArgs.command}</div>
              )}
              {tool === 'run_script' && block.toolArgs.script && (
                <pre className="text-yellow-300/70 whitespace-pre-wrap">{block.toolArgs.script.substring(0, 500)}</pre>
              )}
              {tool === 'edit_file' && block.toolArgs.path && (
                <div className="text-gray-400">File: {block.toolArgs.path}</div>
              )}
              {tool === 'write_file' && block.toolArgs.path && (
                <div className="text-gray-400">File: {block.toolArgs.path}</div>
              )}
              {tool === 'web_search' && block.toolArgs.query && (
                <div className="text-cyan-300/80 font-medium">🔍 {block.toolArgs.query}</div>
              )}
              {/* TASK-04: web_fetch URL display */}
              {tool === 'web_fetch' && (block.toolArgs?.url || meta?.url) && (
                <div className="text-cyan-300/70 truncate">
                  {block.toolArgs?.url || meta?.url}
                </div>
              )}
              {/* TASK-07 (bonus): view_truncated 行号指示器 */}
              {tool === 'view_truncated' && (meta?.truncated_range || meta?.total_lines) && (
                <div className="text-blue-300/70 flex items-center gap-2">
                  {meta?.truncated_range && <span>Lines {meta.truncated_range}</span>}
                  {meta?.total_lines && <span className="text-gray-500">of {meta.total_lines} total</span>}
                </div>
              )}
            </div>
          )}
          {block.toolDiff && (
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
              {block.toolDiff.split('\n').map((line, i) => (
                <div key={i} className={
                  line.startsWith('+') && !line.startsWith('+++') ? 'text-green-400 bg-green-900/20' :
                  line.startsWith('-') && !line.startsWith('---') ? 'text-red-400 bg-red-900/20' :
                  line.startsWith('@@') ? 'text-blue-400' : 'text-gray-400'
                }>{line}</div>
              ))}
            </pre>
          )}
          {tool === 'web_search' && meta && (
            <WebSearchResults meta={meta} />
          )}
          {tool === 'batch_commands' && meta && (
            <BatchCommandsResults meta={meta} />
          )}
          {block.toolResult && !block.toolDiff && tool !== 'web_search' && tool !== 'batch_commands' && (
            <pre className="text-gray-400 whitespace-pre-wrap break-words">
              {block.toolResult.substring(0, 2000)}
              {(block.toolResult.length > 2000) && '\n...[truncated]'}
            </pre>
          )}
          {meta?.hint && (
            <div className="mt-1 text-blue-400 text-[10px] italic">{meta.hint}</div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Turn Summary 块 — TASK-05: Claude Code 风格格式对齐
// ============================================================
const TurnSummaryBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const items = block.detailItems || [];
  const summary = block.summary;

  // TASK-05: 生成 Claude Code 风格聚合标题
  // 格式: "Ran N commands, viewed M files, edited K files"
  const buildClaudeStyleTitle = (): string => {
    if (!summary) return block.display || 'Done';

    const parts: string[] = [];
    const cmds = summary.commands_run ?? 0;
    const viewed = summary.files_viewed ?? 0;
    const edited = summary.files_edited ?? 0;
    const created = summary.files_created ?? 0;
    const webSearches = summary.searches_web ?? 0;
    const codeSearches = summary.searches_code ?? 0;
    const fetched = summary.pages_fetched ?? 0;
    const reverts = summary.reverts ?? 0;
    const tests = summary.tests_run ?? 0;
    const subagents = summary.subagents_launched ?? 0;

    if (cmds > 0) parts.push(`Ran ${cmds} command${cmds !== 1 ? 's' : ''}`);
    if (viewed > 0) parts.push(`viewed ${viewed} file${viewed !== 1 ? 's' : ''}`);
    if (edited > 0) parts.push(`edited ${edited} file${edited !== 1 ? 's' : ''}`);
    if (created > 0) parts.push(`created ${created} file${created !== 1 ? 's' : ''}`);
    if (webSearches > 0) parts.push(`searched the web`);
    if (codeSearches > 0) parts.push(`searched code ${codeSearches} time${codeSearches !== 1 ? 's' : ''}`);
    if (fetched > 0) parts.push(`fetched ${fetched} page${fetched !== 1 ? 's' : ''}`);
    if (reverts > 0) parts.push(`reverted ${reverts} change${reverts !== 1 ? 's' : ''}`);
    if (tests > 0) parts.push(`ran ${tests} test${tests !== 1 ? 's' : ''}`);
    if (subagents > 0) parts.push(`launched ${subagents} sub-agent${subagents !== 1 ? 's' : ''}`);

    if (parts.length === 0) return block.display || 'Done';

    // 首字母大写第一部分，其余小写用逗号连接
    return parts.join(', ');
  };

  const claudeTitle = buildClaudeStyleTitle();

  return (
    <div className="my-2 border-l-2 border-gray-600/50 pl-3">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/30 rounded px-2 py-1 -ml-2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
        <span className="text-sm text-gray-300 font-medium">{claudeTitle}</span>
        {summary?.task_completed && (
          <span className="text-[10px] text-green-500 ml-1">Done</span>
        )}
      </div>
      {expanded && items.length > 0 && (
        <div className="mt-1.5 space-y-1 ml-5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <ToolIcon tool={item.tool} className="text-gray-500" />
              <span className="truncate">{item.title}</span>
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
  if (block.type === 'debug_start') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 my-1 bg-yellow-900/10 border border-yellow-800/30 rounded-lg text-xs">
        <Bug className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-yellow-300">Debug cycle {block.debugAttempt}/{block.debugMaxRetries}</span>
        <span className="text-gray-500 ml-1 font-mono truncate">{block.debugCommand}</span>
      </div>
    );
  }
  if (block.type === 'debug_result') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 my-1 rounded-lg text-xs border ${
        block.debugPassed ? 'bg-green-900/10 border-green-800/30' : 'bg-red-900/10 border-red-800/30'
      }`}>
        {block.debugPassed
          ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
          : <XCircle className="w-3.5 h-3.5 text-red-400" />}
        <span className={block.debugPassed ? 'text-green-300' : 'text-red-300'}>
          {block.debugPassed ? 'Tests passed' : 'Tests failed'}
        </span>
        {block.debugDiagnosis && (
          <span className="text-gray-500 ml-2 truncate">
            {block.debugDiagnosis.error_summary}
          </span>
        )}
      </div>
    );
  }
  if (block.type === 'test_result') {
    const pass = block.testPassed;
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 my-1 rounded-lg text-xs border ${
        pass ? 'bg-green-900/10 border-green-800/30' : 'bg-red-900/10 border-red-800/30'
      }`}>
        {pass ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
        <span className={pass ? 'text-green-300' : 'text-red-300'}>
          {block.testPassedCount}/{block.testTotal} tests passed
        </span>
        {block.testDurationS != null && (
          <span className="text-gray-500 ml-1">({block.testDurationS.toFixed(1)}s)</span>
        )}
      </div>
    );
  }
  return null;
};

// ============================================================
// Info blocks: diff_summary, revert, approval, chunk, context
// ============================================================
const InfoBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  if (block.type === 'diff_summary' && (block.diffFilesChanged ?? 0) > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 my-1 text-xs text-gray-400 bg-gray-800/20 rounded border border-gray-700/30">
        <Activity className="w-3 h-3" />
        <span>{block.diffFilesChanged} file{block.diffFilesChanged! > 1 ? 's' : ''} changed</span>
        {block.diffTotalAdded! > 0 && <span className="text-green-400">+{block.diffTotalAdded}</span>}
        {block.diffTotalRemoved! > 0 && <span className="text-red-400">-{block.diffTotalRemoved}</span>}
      </div>
    );
  }
  if (block.type === 'revert') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 my-1 text-xs bg-orange-900/10 border border-orange-800/30 rounded-lg">
        <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-orange-300">Reverted: {block.revertDescription || block.revertPath}</span>
      </div>
    );
  }
  if (block.type === 'approval_wait') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 my-1 text-xs bg-yellow-900/15 border border-yellow-700/40 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-300 font-medium">Approval needed</span>
        <span className="text-gray-400 font-mono truncate">{block.approvalCommand}</span>
        <span className="text-yellow-500/70 text-[10px]">Risk: {block.approvalRiskLevel}</span>
      </div>
    );
  }
  if (block.type === 'chunk_schedule') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 my-1 text-[11px] text-gray-500">
        <Layers className="w-3 h-3" />
        <span>Scheduling {block.chunkTotalCalls} calls in {block.chunkCount} chunks ({block.chunkParallelCalls} parallel)</span>
      </div>
    );
  }
  if (block.type === 'context_compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 my-1 text-[11px] text-gray-500">
        <Minimize2 className="w-3 h-3" />
        <span>Context compacted: {block.compactBeforeTokens?.toLocaleString()} → {block.compactAfterTokens?.toLocaleString()} tokens</span>
      </div>
    );
  }
  if (block.type === 'todo_update' && block.todoStatus) {
    const ts = block.todoStatus;
    return (
      <div className="flex items-center gap-2 px-3 py-1 my-1 text-xs text-indigo-400 bg-indigo-900/10 border border-indigo-800/20 rounded">
        <ListTodo className="w-3 h-3" />
        <span>{ts.progress_display || `${ts.completed}/${ts.total} completed`}</span>
      </div>
    );
  }
  return null;
};

// ============================================================
// 空状态引导 (首次进入)
// ============================================================
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 border border-cyan-500/20">
      <Terminal className="w-8 h-8 text-cyan-400" />
    </div>
    <h2 className="text-lg font-semibold text-gray-200 mb-2">Agentic Loop</h2>
    <p className="text-sm text-gray-500 max-w-md mb-6">
      描述你的任务,AI 将自主调用工具循环执行,直到完成。支持文件操作、命令执行、Web 搜索、调试回滚等全套能力。
    </p>
    <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 max-w-sm">
      {[
        { icon: <Terminal className="w-3.5 h-3.5 text-yellow-400" />, text: '执行命令和脚本' },
        { icon: <FileText className="w-3.5 h-3.5 text-blue-400" />, text: '读写编辑文件' },
        { icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />, text: '搜索互联网' },
        { icon: <Bug className="w-3.5 h-3.5 text-orange-400" />, text: '自动调试修复' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/30">
          {item.icon}
          <span>{item.text}</span>
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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [blocks]);

  // Auto-focus input
  useEffect(() => {
    if (status !== 'running' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  const handleSubmit = () => {
    const task = input.trim();
    if (!task || status === 'running') return;
    setInput('');
    runTask({
      task,
      model: defaultModel,
      max_turns: defaultMaxTurns,
      work_dir: defaultWorkDir || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleNewTask = () => {
    reset();
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isIdle = status === 'idle' && blocks.length === 0;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50 bg-gray-800/50 text-xs">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${
            status === 'running' ? 'bg-green-400 animate-pulse' :
            status === 'done' ? 'bg-blue-400' :
            status === 'error' ? 'bg-red-400' : 'bg-gray-500'
          }`} />
          <span className="text-gray-400">{model || defaultModel}</span>
          {status === 'running' && <span className="text-gray-500">Turn {turns}</span>}
          {status === 'running' && elapsed > 0 && (
            <span className="text-gray-600">{elapsed.toFixed(0)}s</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          {totalToolCalls > 0 && <span>{totalToolCalls} tools</span>}
          {totalCost > 0 && <span>${totalCost.toFixed(4)}</span>}
          {contextTokensEst > 0 && <span>{(contextTokensEst / 1000).toFixed(0)}K ctx</span>}
          {duration > 0 && <span>{duration.toFixed(1)}s</span>}
          {(status === 'done' || status === 'error') && blocks.length > 0 && (
            <button
              onClick={handleNewTask}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              title="新任务"
            >
              <Sparkles className="w-3 h-3" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {isIdle ? (
          <EmptyState />
        ) : (
          <>
            {blocks.map((block) => {
              switch (block.type) {
                case 'text':
                  return (
                    <div key={block.id} className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed py-1">
                      {block.content}
                    </div>
                  );
                case 'thinking':
                  return (
                    <div key={block.id} className="text-xs text-gray-500 italic border-l-2 border-gray-700 pl-3 py-1 my-1">
                      {block.content}
                    </div>
                  );
                case 'tool':
                  return <ToolBlock key={block.id} block={block} />;
                case 'turn_summary':
                  return <TurnSummaryBlock key={block.id} block={block} />;
                case 'file_change':
                  return (
                    <div key={block.id} className="flex items-center gap-2 text-xs text-gray-400 py-0.5 px-3">
                      <FileEdit className="w-3 h-3" />
                      <span className={block.fileAction === 'created' ? 'text-green-400' : 'text-orange-400'}>
                        {block.fileAction}
                      </span>
                      <span className="text-gray-300 font-mono">{block.fileName}</span>
                      {(block.linesAdded ?? 0) > 0 && <span className="text-green-400">+{block.linesAdded}</span>}
                      {(block.linesRemoved ?? 0) > 0 && <span className="text-red-400">-{block.linesRemoved}</span>}
                    </div>
                  );
                case 'error':
                  return (
                    <div key={block.id} className="bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3 my-2 text-sm text-red-300">
                      {block.content}
                    </div>
                  );
                case 'debug_start':
                case 'debug_result':
                case 'test_result':
                  return <DebugBlock key={block.id} block={block} />;
                case 'diff_summary':
                case 'revert':
                case 'approval_wait':
                case 'chunk_schedule':
                case 'context_compact':
                case 'todo_update':
                  return <InfoBlock key={block.id} block={block} />;
                case 'subagent':
                  return (
                    <div key={block.id} className="border border-pink-800/30 bg-pink-900/10 rounded-lg px-3 py-2 my-1 text-xs">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-pink-300 font-medium">{block.toolDescription}</span>
                        {block.toolSuccess === true && <CheckCircle className="w-3 h-3 text-green-400 ml-auto" />}
                        {block.toolSuccess === false && <XCircle className="w-3 h-3 text-red-400 ml-auto" />}
                      </div>
                      {block.content && <div className="text-gray-400 mt-1 truncate">{block.content}</div>}
                    </div>
                  );
                default:
                  return null;
              }
            })}

            {/* Loading indicator */}
            {status === 'running' && (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Working...</span>
              </div>
            )}

            {/* Done summary */}
            {status === 'done' && blocks.length > 0 && (
              <div className="border-t border-gray-700/50 mt-3 pt-3 text-xs text-gray-500 flex items-center gap-4">
                <span className="text-green-400 font-medium">Done</span>
                <span>{turns} turn{turns !== 1 ? 's' : ''}</span>
                <span>{totalToolCalls} tool call{totalToolCalls !== 1 ? 's' : ''}</span>
                <span>{duration.toFixed(1)}s</span>
                {totalCost > 0 && <span>${totalCost.toFixed(4)}</span>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-700/50 bg-gray-800/30 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isIdle ? "描述你的任务... (例: 创建一个 Python Flask API 项目)" : "继续描述或发送新任务..."}
            className="flex-1 bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200
                       placeholder-gray-500 resize-none min-h-[42px] max-h-[200px] focus:outline-none focus:border-cyan-500/50
                       transition-colors"
            rows={1}
            disabled={status === 'running'}
          />
          {status === 'running' ? (
            <button onClick={stop}
                    className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    title="停止 (Ctrl+C)">
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!input.trim()}
                    className="p-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500
                               text-white transition-colors"
                    title="发送 (Enter)">
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-600">
          <span>Enter 发送 · Shift+Enter 换行</span>
          {status === 'running' && <span className="text-cyan-600">AI 正在执行中...</span>}
        </div>
      </div>
    </div>
  );
};

export default AgenticChat;