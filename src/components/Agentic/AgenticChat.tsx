// src/components/Agentic/AgenticChat.tsx
// Agentic Loop 主界面组件
//
// 类似 Claude Code 的 UI：
// - 用户输入任务 → AI 自主调用工具
// - 每个工具调用可折叠展开
// - Turn 汇总: "Ran 3 commands, viewed 2 files"
// - 实时 streaming 文本

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, Square, Terminal, FileText, Pencil,
  FolderOpen, Search, Globe, Download, ChevronDown,
  ChevronRight, CheckCircle, XCircle, Clock, Zap
} from 'lucide-react';
import { useAgenticLoop } from '@/hooks/useAgenticLoop';
import { AgenticBlock, TOOL_DISPLAY } from '@/types/agentic';

// ============================================================
// 工具图标组件
// ============================================================
const ToolIcon: React.FC<{ tool: string; className?: string }> = ({ tool, className }) => {
  const iconMap: Record<string, React.ReactNode> = {
    bash: <Terminal className={className} />,
    read_file: <FileText className={className} />,
    write_file: <Pencil className={className} />,
    edit_file: <Pencil className={className} />,
    list_dir: <FolderOpen className={className} />,
    grep_search: <Search className={className} />,
    web_search: <Globe className={className} />,
    web_fetch: <Download className={className} />,
  };
  return <>{iconMap[tool] || <Zap className={className} />}</>;
};

// ============================================================
// 工具块渲染
// ============================================================
const ToolBlock: React.FC<{ block: AgenticBlock }> = ({ block }) => {
  const [expanded, setExpanded] = useState(false);
  const display = TOOL_DISPLAY[block.tool || ''] || { label: block.tool, icon: '🔧' };
  const isRunning = block.toolResult === undefined;

  // 生成工具标题
  const getTitle = () => {
    const tool = block.tool || '';
    const args = block.toolArgs || {};

    switch (tool) {
      case 'bash':
        return `$ ${(args.command || '').slice(0, 80)}${(args.command || '').length > 80 ? '...' : ''}`;
      case 'read_file':
        return `Read ${args.path || 'file'}`;
      case 'write_file':
        return `Create ${args.path || 'file'}`;
      case 'edit_file':
        return block.toolDiff || `Edit ${args.path || 'file'}`;
      case 'list_dir':
        return `List ${args.path || '.'}`;
      case 'grep_search':
        return `Search: ${args.pattern || ''}`;
      case 'web_search':
        return `Search: ${args.query || ''}`;
      case 'web_fetch':
        return `Fetch: ${(args.url || '').slice(0, 60)}`;
      default:
        return display.label;
    }
  };

  return (
    <div className="my-1 border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50">
      {/* 工具头部 - 可折叠 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        )}

        <ToolIcon tool={block.tool || ''} className="w-3.5 h-3.5 text-blue-400 shrink-0" />

        <span className="text-gray-300 truncate text-left flex-1 font-mono text-xs">
          {getTitle()}
        </span>

        {/* 状态指示器 */}
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin shrink-0" />
        ) : block.toolSuccess ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        )}
      </button>

      {/* 展开详情 */}
      {expanded && (
        <div className="border-t border-gray-700 bg-gray-900/50">
          {/* 参数 */}
          {block.toolArgs && (
            <div className="px-3 py-2 border-b border-gray-700/50">
              <div className="text-xs text-gray-500 mb-1">Input:</div>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {JSON.stringify(block.toolArgs, null, 2)}
              </pre>
            </div>
          )}
          {/* 结果 */}
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
// Turn 汇总渲染
// ============================================================
const TurnSummary: React.FC<{ block: AgenticBlock }> = ({ block }) => (
  <div className="flex items-center gap-2 py-1.5 px-3 my-1 text-xs text-gray-400 bg-gray-800/30 rounded border border-gray-700/50">
    <Clock className="w-3 h-3" />
    <span>Turn {block.turn}</span>
    <span className="text-gray-600">·</span>
    <span className="text-gray-300">{block.display}</span>
  </div>
);

// ============================================================
// 主组件
// ============================================================
export const AgenticChat: React.FC = () => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    blocks,
    status,
    error,
    turns,
    totalToolCalls,
    duration,
    model,
    runTask,
    stop,
    reset,
  } = useAgenticLoop();

  const isRunning = status === 'running';

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [blocks]);

  // 提交任务
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    const task = input.trim();
    setInput('');
    await runTask({ task });
  };

  // 快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium">Agentic Loop</span>
          {model && (
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
              {model}
            </span>
          )}
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
            <button
              onClick={reset}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700"
            >
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
            <p className="text-lg mb-2">Agentic Loop</p>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Describe a task. The AI will autonomously use tools — bash, file I/O,
              web search — looping until the job is done.
            </p>
          </div>
        )}

        {blocks.map((block) => {
          switch (block.type) {
            case 'text':
              return (
                <div key={block.id} className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
                    {block.content}
                  </div>
                </div>
              );

            case 'tool':
              return <ToolBlock key={block.id} block={block} />;

            case 'turn_summary':
              return <TurnSummary key={block.id} block={block} />;

            case 'error':
              return (
                <div
                  key={block.id}
                  className="flex items-start gap-2 p-3 my-1 bg-red-900/20 border border-red-800/50 rounded-lg text-sm text-red-300"
                >
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{block.content}</span>
                </div>
              );

            default:
              return null;
          }
        })}

        {/* 运行中 spinner */}
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
            placeholder={
              isRunning
                ? 'Task is running...'
                : 'Describe your task... (e.g. "Create a Flask REST API with SQLite")'
            }
            disabled={isRunning}
            rows={2}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />

          {isRunning ? (
            <button
              type="button"
              onClick={stop}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              title="Run"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AgenticChat;
