// src/components/Agentic/AgenticChat.tsx
// Agentic Loop v3 主界面 — Claude Code 风格 UI

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, Square, Terminal, FileText, Pencil, FilePlus, Files,
  FolderOpen, Search, FileSearch, Globe, Download, ChevronDown,
  ChevronRight, CheckCircle, XCircle, Clock, Zap, PenTool, FileEdit
} from 'lucide-react';
import { useAgenticLoop } from '@/hooks/useAgenticLoop';
import { AgenticBlock, TOOL_DISPLAY, DetailItem, ToolResultMeta } from '@/types/agentic';

// ============================================================
// 工具图标
// ============================================================
const ToolIcon: React.FC<{ tool: string; className?: string }> = ({ tool, className }) => {
  const map: Record<string, React.ReactNode> = {
    bash: <Terminal className={className} />,
    read_file: <FileText className={className} />,
    batch_read: <Files className={className} />,
    write_file: <FilePlus className={className} />,
    edit_file: <Pencil className={className} />,
    multi_edit: <PenTool className={className} />,
    list_dir: <FolderOpen className={className} />,
    grep_search: <Search className={className} />,
    file_search: <FileSearch className={className} />,
    web_search: <Globe className={className} />,
    web_fetch: <Download className={className} />,
    task_complete: <CheckCircle className={className} />,
  };
  return <>{map[tool] || <Zap className={className} />}</>;
};

// ============================================================
// Web Search 结果列表
// ============================================================
const WebSearchResults: React.FC<{ meta: ToolResultMeta }> = ({ meta }) => {
  if (!meta.result_titles?.length) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="text-xs text-gray-400 mb-1">{meta.results_count} results</div>
      {meta.result_titles.map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="text-blue-400 shrink-0">•</span>
          <div className="min-w-0">
            <a href={r.url} target="_blank" rel="noopener noreferrer"
               className="text-blue-400 hover:underline truncate block">
              {r.title || r.url}
            </a>
            {r.domain && <span className="text-gray-500">{r.domain}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// 工具块
// ============================================================
const ToolBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const display = TOOL_DISPLAY[block.tool || ''] || { label: block.tool, icon: '🔧' };
  const isRunning = block.toolResult === undefined;
  const meta = block.toolResultMeta;

  const getTitle = () => {
    // v3: 优先使用 AI 提供的 description
    if (block.toolDescription) return block.toolDescription;
    
    const tool = block.tool || '';
    const args = block.toolArgs || {};
    switch (tool) {
      case 'bash':
        return args.description || `$ ${(args.command || '').slice(0, 80)}`;
      case 'read_file':
        return args.description || `Read ${args.path || 'file'}`;
      case 'batch_read':
        return args.description || `Read ${(args.paths || []).length} files`;
      case 'write_file':
        return args.description || `Create ${args.path || 'file'}`;
      case 'edit_file':
        // 显示 diff 如 "perf_takehome.py +3 -4"
        return block.toolDiff || args.description || `Edit ${args.path || 'file'}`;
      case 'multi_edit':
        return block.toolDiff || args.description || `Multi-edit ${args.path || 'file'}`;
      case 'list_dir':
        return `List ${args.path || '.'}`;
      case 'grep_search':
        return `Search: ${args.pattern || ''}`;
      case 'file_search':
        return `Find: ${args.pattern || ''}`;
      case 'web_search':
        return `${args.query || ''}`; 
      case 'web_fetch': {
        // v3: 显示页面标题
        const title = meta?.title || '';
        return title || `Fetch: ${(args.url || '').slice(0, 60)}`;
      }
      case 'task_complete':
        return meta?.summary || 'Task completed';
      default:
        return display.label;
    }
  };

  // v3: 顶部副标题（web_search 显示结果数，read_file 截断提示等）
  const getSubtitle = () => {
    if (!meta) return null;
    if (block.tool === 'web_search' && meta.results_count !== undefined) {
      return `${meta.results_count} results`;
    }
    if (block.tool === 'web_fetch' && meta.url) {
      return meta.url.length > 50 ? meta.url.slice(0, 50) + '...' : meta.url;
    }
    if (block.tool === 'file_search' && meta.matches !== undefined) {
      return `${meta.matches} files found`;
    }
    if (block.tool === 'read_file' && meta.truncated) {
      return meta.hint || `Truncated (${meta.total_lines} lines)`;
    }
    if (block.tool === 'bash' && meta.exit_code !== undefined && meta.exit_code !== 0) {
      return `exit code ${meta.exit_code}`;
    }
    return null;
  };

  const subtitle = getSubtitle();

  return (
    <div className="my-1 border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50 transition-colors"
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        }
        <ToolIcon tool={block.tool || ''} className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <span className="text-gray-300 truncate font-mono text-xs block">{getTitle()}</span>
          {subtitle && (
            <span className="text-gray-500 text-xs block truncate">{subtitle}</span>
          )}
        </div>
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin shrink-0" />
        ) : block.toolSuccess ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-700 bg-gray-900/50">
          {/* v3: web_search 展示结果列表 */}
          {block.tool === 'web_search' && meta?.result_titles && (
            <div className="px-3 py-2 border-b border-gray-700/50">
              <WebSearchResults meta={meta} />
            </div>
          )}
          {block.toolArgs && (
            <div className="px-3 py-2 border-b border-gray-700/50">
              <div className="text-xs text-gray-500 mb-1">Input:</div>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {JSON.stringify(block.toolArgs, null, 2)}
              </pre>
            </div>
          )}
          {block.toolResult && (
            <div className="px-3 py-2">
              <div className="text-xs text-gray-500 mb-1">Output:</div>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                {block.toolResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Turn 汇总 — v3: 可折叠 detail_items
// ============================================================
const TurnSummary: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const items = block.detailItems || [];
  const hasItems = items.length > 1; // 只有多个子项时才可折叠

  return (
    <div className="my-1">
      <button
        onClick={() => hasItems && setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 py-1.5 px-3 text-xs bg-gray-800/30 rounded border border-gray-700/50 ${hasItems ? 'hover:bg-gray-700/30 cursor-pointer' : 'cursor-default'}`}
      >
        {hasItems && (expanded
          ? <ChevronDown className="w-3 h-3 text-gray-500" />
          : <ChevronRight className="w-3 h-3 text-gray-500" />
        )}
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="text-gray-400">Turn {block.turn}</span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-300">{block.display}</span>
      </button>

      {/* v3: 折叠子项 — 每个工具调用的描述 */}
      {expanded && hasItems && (
        <div className="ml-6 mt-1 space-y-0.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400 py-0.5 px-2">
              <ToolIcon tool={item.tool} className="w-3 h-3 text-gray-500" />
              <span className="text-gray-300 truncate">{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 主组件
// ============================================================
export const AgenticChat: React.FC = () => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    blocks, status, error, turns, totalToolCalls, duration, model,
    runTask, stop, reset,
  } = useAgenticLoop();

  const isRunning = status === 'running';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [blocks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    const task = input.trim();
    setInput('');
    await runTask({ task });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium">Agentic Loop</span>
          {model && <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">{model}</span>}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {status === 'running' && (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Turn {turns} · {totalToolCalls} tools
            </span>
          )}
          {status === 'done' && (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-3 h-3" />
              {turns} turns · {totalToolCalls} tools · {duration.toFixed(1)}s
            </span>
          )}
          {status !== 'idle' && (
            <button onClick={reset} className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700">
              New Task
            </button>
          )}
        </div>
      </div>

      {/* 消息区域 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {blocks.length === 0 && status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Zap className="w-12 h-12 mb-4 text-gray-600" />
            <p className="text-lg mb-2">Agentic Loop v3</p>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Describe a task. The AI will autonomously use tools — bash, file I/O,
              web search, file search — looping until the job is done.
            </p>
          </div>
        )}

        {blocks.map((block) => {
          switch (block.type) {
            case 'text':
              return (
                <div key={block.id} className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">{block.content}</div>
                </div>
              );
            case 'tool':
              return <ToolBlock key={block.id} block={block} />;
            case 'turn_summary':
              return <TurnSummary key={block.id} block={block} />;
            case 'file_change':
              // v3: 文件变更事件 — 小标签显示
              return (
                <div key={block.id} className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-gray-500">
                  <FileEdit className="w-3 h-3" />
                  <span>{block.fileAction} {block.fileName}</span>
                  {(block.linesAdded || block.linesRemoved) ? (
                    <span className="text-gray-600">
                      {block.linesAdded ? <span className="text-green-500">+{block.linesAdded}</span> : null}
                      {block.linesRemoved ? <span className="text-red-400"> -{block.linesRemoved}</span> : null}
                    </span>
                  ) : null}
                </div>
              );
            case 'error':
              return (
                <div key={block.id} className="flex items-start gap-2 p-3 my-1 bg-red-900/20 border border-red-800/50 rounded-lg text-sm text-red-300">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{block.content}</span>
                </div>
              );
            default:
              return null;
          }
        })}

        {isRunning && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-700 bg-gray-800/50 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning ? 'Task is running...' : 'Describe your task...'}
            disabled={isRunning}
            rows={2}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          {isRunning ? (
            <button type="button" onClick={stop} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg" title="Stop">
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg" title="Run">
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AgenticChat;