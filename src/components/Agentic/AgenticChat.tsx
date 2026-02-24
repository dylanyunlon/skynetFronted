// src/components/Agentic/AgenticChat.tsx
// Agentic Loop v10 主界面 — Claude Code 风格 UI (全事件渲染)

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, Square, Terminal, FileText, Pencil, FilePlus, Files,
  FolderOpen, Search, FileSearch, Globe, Download, ChevronDown,
  ChevronRight, CheckCircle, XCircle, Clock, Zap, PenTool, FileEdit,
  Eye, RotateCcw, Bug, ListTodo, Brain, GitBranch, Code, AlertTriangle,
  Layers, Minimize2, Activity
} from 'lucide-react';
import { useAgenticLoop } from '@/hooks/useAgenticLoop';
import { AgenticBlock, TOOL_DISPLAY, DetailItem, ToolResultMeta } from '@/types/agentic';

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
// Web Search 结果列表
// ============================================================
const WebSearchResults: React.FC<{ meta: ToolResultMeta }> = ({ meta }) => {
  if (!meta.result_titles?.length) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="text-xs text-gray-400 font-medium">{meta.results_count} results</div>
      {meta.result_titles.map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="text-blue-400 shrink-0 mt-0.5">•</span>
          <div className="min-w-0">
            <a href={r.url} target="_blank" rel="noopener noreferrer"
               className="text-blue-400 hover:underline truncate block font-medium">
              {r.title || r.url}
            </a>
            {r.domain && <span className="text-gray-500 text-[10px]">{r.domain}</span>}
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
  const description = block.toolDescription || toolInfo.label;

  // Determine if this is a file edit with diff info
  const hasDiff = block.toolDiff || block.toolResultMeta?.added_lines || block.toolResultMeta?.removed_lines;
  const editStats = hasDiff ? (
    <span className="ml-2 text-xs">
      {block.toolResultMeta?.filename && <span className="text-gray-400">{block.toolResultMeta.filename}</span>}
      {(block.toolResultMeta?.added_lines ?? 0) > 0 && <span className="text-green-400 ml-1">+{block.toolResultMeta?.added_lines}</span>}
      {(block.toolResultMeta?.removed_lines ?? 0) > 0 && <span className="text-red-400 ml-1">-{block.toolResultMeta?.removed_lines}</span>}
    </span>
  ) : null;

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/30 my-1">
      {/* Header — clickable */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
        <ToolIcon tool={tool} className={toolInfo.color} />
        <span className="text-sm text-gray-200 font-medium truncate">{description}</span>
        {editStats}
        {isLoading && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin ml-auto shrink-0" />}
        {!isLoading && block.toolSuccess === true && <CheckCircle className="w-3.5 h-3.5 text-green-400 ml-auto shrink-0" />}
        {!isLoading && block.toolSuccess === false && <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto shrink-0" />}
        {block.toolDurationMs != null && (
          <span className="text-[10px] text-gray-500 ml-1 shrink-0">{(block.toolDurationMs / 1000).toFixed(1)}s</span>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-700/30 px-3 py-2 text-xs font-mono max-h-64 overflow-y-auto bg-gray-900/40">
          {/* Tool arguments */}
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
                <div className="text-cyan-300/80">Query: {block.toolArgs.query}</div>
              )}
            </div>
          )}
          {/* Diff display */}
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
          {/* Web search results */}
          {tool === 'web_search' && block.toolResultMeta && (
            <WebSearchResults meta={block.toolResultMeta} />
          )}
          {/* Batch commands results */}
          {tool === 'batch_commands' && block.toolResultMeta && (
            <BatchCommandsResults meta={block.toolResultMeta} />
          )}
          {/* Tool result text */}
          {block.toolResult && !block.toolDiff && tool !== 'web_search' && tool !== 'batch_commands' && (
            <pre className="text-gray-400 whitespace-pre-wrap break-words">
              {block.toolResult.substring(0, 2000)}
              {(block.toolResult.length > 2000) && '\n...[truncated]'}
            </pre>
          )}
          {/* Truncated hint */}
          {block.toolResultMeta?.hint && (
            <div className="mt-1 text-blue-400 text-[10px] italic">{block.toolResultMeta.hint}</div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Turn Summary 块 (Claude Code 核心: "Ran 7 commands, edited a file")
// ============================================================
const TurnSummaryBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const items = block.detailItems || [];

  return (
    <div className="my-2 border-l-2 border-gray-600/50 pl-3">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/30 rounded px-2 py-1 -ml-2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        <span className="text-sm text-gray-300 font-medium">{block.display || 'Done'}</span>
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
// v10: Debug/Test blocks
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
// v10: Diff Summary, Revert, Approval, Chunk, Context Compact
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
// 主组件
// ============================================================
export const AgenticChat: React.FC = () => {
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

  const handleSubmit = () => {
    const task = input.trim();
    if (!task || status === 'running') return;
    setInput('');
    runTask({ task, model: 'claude-opus-4-6', max_turns: 30 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

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
          <span className="text-gray-400">{model || 'Ready'}</span>
          {status === 'running' && <span className="text-gray-500">Turn {turns}</span>}
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          {totalToolCalls > 0 && <span>{totalToolCalls} tools</span>}
          {totalCost > 0 && <span>${totalCost.toFixed(4)}</span>}
          {contextTokensEst > 0 && <span>{(contextTokensEst / 1000).toFixed(0)}K ctx</span>}
          {duration > 0 && <span>{duration.toFixed(1)}s</span>}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
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
      </div>

      {/* Input area */}
      <div className="border-t border-gray-700/50 bg-gray-800/30 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="flex-1 bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200
                       placeholder-gray-500 resize-none min-h-[42px] max-h-[200px] focus:outline-none focus:border-blue-500/50"
            rows={1}
            disabled={status === 'running'}
          />
          {status === 'running' ? (
            <button onClick={stop}
                    className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors">
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!input.trim()}
                    className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500
                               text-white transition-colors">
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgenticChat;