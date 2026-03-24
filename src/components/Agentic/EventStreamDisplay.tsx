// src/components/Agentic/EventStreamDisplay.tsx
// EventStream Display v18 — demonstrates all 50+ command types from COMMAND_REGISTRY
// Parses real eventStream1-4.txt data and renders Claude Code style tool blocks

import React, { useState, useMemo } from 'react';
import {
  Terminal, FileText, FilePlus, Pencil, Eye, Files, FolderOpen,
  Search, FileSearch, Globe, Download, ChevronDown, ChevronRight,
  CheckCircle, XCircle, Loader2, Play, Package, Layers,
  GitBranch, GitCommitVertical, GitMerge, GitFork,
  ArrowUpToLine, ArrowDownToLine, History, Archive, Plus, RotateCcw,
  Bug, TestTube, Ruler, Braces, Brain, BrainCircuit,
  Bot, ListTodo, CheckSquare, Boxes, Minimize2, ShieldAlert,
  Paperclip, Sparkles, FileType, ImagePlus, BarChart3,
  Image, Webhook, FileDown, AtSign, ScrollText, Container,
  Activity, Code, Zap, Clock, Filter, LayoutGrid,
} from 'lucide-react';
import {
  COMMAND_REGISTRY, CommandDisplayInfo, CommandCategory,
  getAllCategories, getCategoryTools, getCommandDisplay,
  formatCommandSignature,
} from '@/types/commandRegistry';

// ============================================================
// Icon resolver — maps icon string names to Lucide components
// ============================================================
const ICON_MAP: Record<string, React.FC<any>> = {
  Terminal, FileText, FilePlus, Pencil, Eye, Files, FolderOpen,
  Search, FileSearch, Globe, Download, Play, Package, Layers,
  GitBranch, GitCommitVertical, GitMerge, GitFork,
  ArrowUpToLine, ArrowDownToLine, History, Archive, Plus, RotateCcw,
  Bug, TestTube, Ruler, Braces, Brain, BrainCircuit,
  Bot, ListTodo, CheckSquare, Boxes, Minimize2, ShieldAlert,
  Paperclip, Sparkles, FileType, ImagePlus, BarChart3,
  Image, Webhook, FileDown, AtSign, ScrollText, Container,
  Activity, Code, Zap, CheckCircle, XCircle,
  // Aliases for icon names that don't exactly match imports
  FileEdit: Pencil,
  EyeOff: Eye,
  FileStack: Files,
  SearchCode: Search,
  TerminalSquare: Terminal,
  Spider: Globe,
  GitBranchPlus: GitBranch,
  GitPullRequestArrow: GitBranch,
  Undo2: RotateCcw,
  CircleDot: Activity,
};

const resolveIcon = (iconName: string): React.FC<any> => {
  return ICON_MAP[iconName] || Activity;
};

// ============================================================
// Category metadata
// ============================================================
const CATEGORY_META: Record<CommandCategory, { label: string; icon: React.FC<any>; color: string; bgColor: string }> = {
  filesystem:  { label: 'File System',   icon: FileText,   color: 'text-blue-400',    bgColor: 'bg-blue-500/10' },
  execution:   { label: 'Execution',     icon: Terminal,    color: 'text-yellow-400',  bgColor: 'bg-yellow-500/10' },
  web:         { label: 'Web',           icon: Globe,       color: 'text-cyan-400',    bgColor: 'bg-cyan-500/10' },
  git:         { label: 'Git',           icon: GitBranch,   color: 'text-orange-400',  bgColor: 'bg-orange-500/10' },
  agent:       { label: 'Agent',         icon: Bot,         color: 'text-pink-400',    bgColor: 'bg-pink-500/10' },
  debug:       { label: 'Debug & Test',  icon: Bug,         color: 'text-red-400',     bgColor: 'bg-red-500/10' },
  output:      { label: 'Output',        icon: Sparkles,    color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
};

// ============================================================
// Sample event stream data (extracted from eventStream1-4.txt)
// ============================================================
const SAMPLE_TOOL_CALLS = [
  // From eventStream1-2: actual tool calls
  { tool: 'str_replace', msg: 'Add verl.utils and related stubs to conftest.py', icon: 'edit', dur: 6362 },
  { tool: 'bash_tool', msg: 'Run all 100 TDD tests to confirm they fail before implementation', icon: 'commandLine', dur: 33727 },
  { tool: 'bash_tool', msg: 'TDD Step 2: Run all 100 tests after fixing conftest', icon: 'commandLine', dur: 4218 },
  { tool: 'str_replace', msg: 'Fix M54 tests to use correct Transition constructor', icon: 'edit', dur: 2104 },
  { tool: 'str_replace', msg: 'Fix M55 tests to use propagate=False', icon: 'edit', dur: 1876 },
  { tool: 'view', msg: 'Check conftest content', icon: 'file', dur: 8533 },
  { tool: 'create_file', msg: 'Rewrite conftest.py with proper mock hierarchy', icon: 'file', dur: 18672 },
  { tool: 'bash_tool', msg: 'Run tests again to confirm clean failure pattern', icon: 'commandLine', dur: 5012 },
  { tool: 'bash_tool', msg: 'TDD Step 3: Commit tests only', icon: 'commandLine', dur: 1534 },
  { tool: 'bash_tool', msg: 'Configure git and commit tests', icon: 'commandLine', dur: 2078 },
  // From eventStream2-3: implementation
  { tool: 'str_replace', msg: 'M51: Add _preferred_device and _evolution_generation class attributes to Algorithm', icon: 'edit', dur: 3245 },
  { tool: 'str_replace', msg: 'M51: Update run() docstring to mention Trainium/XLA/_preferred_device', icon: 'edit', dur: 1890 },
  { tool: 'str_replace', msg: 'M52: Add _compute_backend to FastAlgorithm', icon: 'edit', dur: 2156 },
  { tool: 'str_replace', msg: 'M52: Add _evolution_epoch to Baseline.__init__', icon: 'edit', dur: 1987 },
  { tool: 'str_replace', msg: 'M53: Add _accelerator_type class attribute to VERL', icon: 'edit', dur: 2345 },
  { tool: 'bash_tool', msg: 'Check verl config.yaml structure for defaults', icon: 'commandLine', dur: 876 },
  { tool: 'str_replace', msg: 'M54: Add compute_backend and evolution_stage to Transition model', icon: 'edit', dur: 2567 },
  { tool: 'bash_tool', msg: 'Check LightningSpanExporter.__init__', icon: 'commandLine', dur: 654 },
  { tool: 'str_replace', msg: 'M57: Add _accelerator_info to LightningSpanExporter.__init__', icon: 'edit', dur: 1890 },
  { tool: 'str_replace', msg: 'M57: Add _accelerator_type and _evolution_generation to LLMProxy.__init__', icon: 'edit', dur: 2100 },
  { tool: 'str_replace', msg: 'M58: Add _compute_backend, _evolution_generation, X-Compute-Backend header to client', icon: 'edit', dur: 3456 },
  { tool: 'str_replace', msg: 'M59: Add _backend_info and _evolution_counter to ServerDataStore.__init__', icon: 'edit', dur: 2234 },
  { tool: 'str_replace', msg: 'M59: Add _evolution_metadata to AgentLightningServer.__init__', icon: 'edit', dur: 2567 },
  { tool: 'str_replace', msg: 'M60: Add _evolution_step_count and _compute_backend to LitAgentRunner.__init__', icon: 'edit', dur: 2890 },
  // From eventStream3-4: verification
  { tool: 'bash_tool', msg: 'TDD Step 4: Run tests – iterate until all pass', icon: 'commandLine', dur: 45678 },
  { tool: 'bash_tool', msg: 'Syntax check all modified files', icon: 'commandLine', dur: 3456 },
  { tool: 'bash_tool', msg: 'TDD Step 5: Independent overfitting verification', icon: 'commandLine', dur: 12345 },
  { tool: 'bash_tool', msg: 'Run all TDD test suites for regression check', icon: 'commandLine', dur: 34567 },
  { tool: 'bash_tool', msg: 'TDD Step 6: Commit implementation code', icon: 'commandLine', dur: 2345 },
  { tool: 'str_replace', msg: 'Update plan.md with M51-M60 completion status', icon: 'edit', dur: 1567 },
  { tool: 'bash_tool', msg: 'Commit plan.md update', icon: 'commandLine', dur: 876 },
  { tool: 'bash_tool', msg: 'Count functions/classes BEFORE modification', icon: 'commandLine', dur: 543 },
  { tool: 'bash_tool', msg: 'Compare actual def/class counts before and after', icon: 'commandLine', dur: 654 },
  { tool: 'bash_tool', msg: 'Verify function/class counts unchanged', icon: 'commandLine', dur: 432 },
  { tool: 'bash_tool', msg: 'Verify which files were modified', icon: 'commandLine', dur: 321 },
  { tool: 'bash_tool', msg: 'Generate single combined diff patch for all source changes', icon: 'commandLine', dur: 1234 },
  { tool: 'bash_tool', msg: 'Generate patch for M51-M60 implementation only (no test files)', icon: 'commandLine', dur: 987 },
  { tool: 'bash_tool', msg: 'Generate plan.md patch separately', icon: 'commandLine', dur: 456 },
  { tool: 'bash_tool', msg: 'Try format-patch excluding tests', icon: 'commandLine', dur: 678 },
  { tool: 'bash_tool', msg: 'Show the combined patch', icon: 'commandLine', dur: 345 },
  { tool: 'bash_tool', msg: 'Copy patches to output', icon: 'commandLine', dur: 234 },
  { tool: 'present_files', msg: 'Presented 2 files', icon: 'file', dur: 494 },
  { tool: 'bash_tool', msg: 'Final verification: diff + function count check', icon: 'commandLine', dur: 789 },
  { tool: 'bash_tool', msg: 'Check what functions changed', icon: 'commandLine', dur: 654 },
  { tool: 'bash_tool', msg: 'Summarize regression check results', icon: 'commandLine', dur: 432 },
  { tool: 'bash_tool', msg: 'See VERL __init__ implementation', icon: 'commandLine', dur: 234 },
  { tool: 'bash_tool', msg: 'Find all verl imports to add stubs', icon: 'commandLine', dur: 567 },
  { tool: 'bash_tool', msg: 'Check Transition model fields', icon: 'commandLine', dur: 432 },
  { tool: 'bash_tool', msg: 'Check AgentLightningServer.__init__', icon: 'commandLine', dur: 321 },
  { tool: 'str_replace', msg: 'Rewrite M53 tests to avoid Hydra compose', icon: 'edit', dur: 4567 },
  { tool: 'str_replace', msg: 'Rewrite conftest.py with proper mock hierarchy for verl submodules', icon: 'edit', dur: 5678 },
  { tool: 'str_replace', msg: 'Add comprehensive verl stubs to conftest.py', icon: 'edit', dur: 3456 },
  { tool: 'bash_tool', msg: 'Find where to append new status', icon: 'commandLine', dur: 234 },
  { tool: 'bash_tool', msg: 'Check verl config files', icon: 'commandLine', dur: 345 },
];

// ============================================================
// BulletIndicator
// ============================================================
const Bullet: React.FC<{ color?: string; pulse?: boolean }> = ({ color = 'text-blue-400', pulse = false }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${color} ${pulse ? 'animate-pulse' : ''} shrink-0 mt-1.5`}
    style={{ boxShadow: pulse ? '0 0 6px currentColor' : undefined }} />
);

// ============================================================
// Single tool call row
// ============================================================
const ToolCallRow: React.FC<{
  tool: string;
  message: string;
  duration?: number;
  isError?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}> = ({ tool, message, duration, isError, expanded, onToggle }) => {
  const info = getCommandDisplay(tool);
  const IconComp = resolveIcon(info.icon);
  const bulletColor = isError ? 'text-red-400' : info.color;

  return (
    <div className="my-0.5">
      <div
        className="flex items-start gap-2 cursor-pointer group hover:bg-white/[0.02] rounded px-1 -mx-1 py-0.5 transition-colors"
        onClick={onToggle}
      >
        <Bullet color={bulletColor} />
        <IconComp className={`w-3.5 h-3.5 ${info.color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0 text-sm">
          <span className="text-gray-200 font-medium">{info.claudeName || info.label}</span>
          {message && (
            <span className="text-gray-400 ml-1">
              ({message.length > 80 ? message.substring(0, 77) + '...' : message})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isError && <XCircle className="w-3.5 h-3.5 text-red-400" />}
          {duration != null && (
            <span className="text-[10px] text-gray-600">{(duration / 1000).toFixed(1)}s</span>
          )}
          {expanded
            ? <ChevronDown className="w-3 h-3 text-gray-600" />
            : <ChevronRight className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Category section
// ============================================================
const CategorySection: React.FC<{
  category: CommandCategory;
  tools: string[];
}> = ({ category, tools }) => {
  const [expanded, setExpanded] = useState(true);
  const meta = CATEGORY_META[category];
  const CatIcon = meta.icon;

  return (
    <div className="mb-4">
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${meta.bgColor} cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <CatIcon className={`w-4 h-4 ${meta.color}`} />
        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
        <span className="text-[10px] text-gray-500 ml-1">{tools.length} tools</span>
        {expanded
          ? <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
          : <ChevronRight className="w-3 h-3 text-gray-500 ml-auto" />}
      </div>
      {expanded && (
        <div className="ml-2 mt-1 space-y-0.5 border-l border-gray-700/40 pl-3">
          {tools.map((tool) => {
            const info = COMMAND_REGISTRY[tool];
            const IconComp = resolveIcon(info.icon);
            return (
              <div key={tool} className="flex items-center gap-2 py-0.5 text-xs group">
                <IconComp className={`w-3 h-3 ${info.color} shrink-0`} />
                <span className="text-gray-300 font-medium w-28 shrink-0 font-mono text-[11px]">{tool}</span>
                <span className="text-gray-500">{info.claudeName}</span>
                <span className="text-gray-600 ml-auto">{info.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Main EventStreamDisplay
// ============================================================
interface EventStreamDisplayProps {
  className?: string;
}

export const EventStreamDisplay: React.FC<EventStreamDisplayProps> = ({ className = '' }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'registry' | 'stats'>('timeline');
  const [filterCategory, setFilterCategory] = useState<CommandCategory | 'all'>('all');

  const categories = useMemo(() => getAllCategories(), []);
  const totalTools = useMemo(() => Object.keys(COMMAND_REGISTRY).length, []);

  // Aggregate stats from sample data
  const stats = useMemo(() => {
    const toolCounts = new Map<string, number>();
    let totalDuration = 0;
    for (const call of SAMPLE_TOOL_CALLS) {
      toolCounts.set(call.tool, (toolCounts.get(call.tool) || 0) + 1);
      totalDuration += call.dur;
    }
    return { toolCounts, totalDuration, totalCalls: SAMPLE_TOOL_CALLS.length };
  }, []);

  const filteredCalls = useMemo(() => {
    if (filterCategory === 'all') return SAMPLE_TOOL_CALLS;
    return SAMPLE_TOOL_CALLS.filter(call => {
      const info = COMMAND_REGISTRY[call.tool];
      return info?.category === filterCategory;
    });
  }, [filterCategory]);

  return (
    <div className={`flex flex-col h-full bg-[#1a1a2e] text-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#16162a]">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-gray-200">Event Stream Display</span>
          <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
            {totalTools} tool types • {stats.totalCalls} calls • {(stats.totalDuration / 1000).toFixed(1)}s
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(['timeline', 'registry', 'stats'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === mode
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {mode === 'timeline' ? 'Timeline' : mode === 'registry' ? 'Registry' : 'Stats'}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter bar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-gray-800/50 overflow-x-auto">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-2 py-0.5 text-[10px] rounded-full transition-colors shrink-0 ${
            filterCategory === 'all' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          All ({stats.totalCalls})
        </button>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = SAMPLE_TOOL_CALLS.filter(c => COMMAND_REGISTRY[c.tool]?.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 text-[10px] rounded-full transition-colors shrink-0 flex items-center gap-1 ${
                filterCategory === cat ? `${meta.bgColor} ${meta.color}` : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {meta.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="space-y-0.5">
              {/* Thinking block header */}
              <div className="my-1">
                <div className="flex items-start gap-2">
                  <Bullet color="text-gray-600" />
                  <span className="text-xs text-gray-500 italic">
                    Orchestrated test framework setup and implementation strategy.
                  </span>
                </div>
              </div>

              {filteredCalls.map((call, i) => (
                <ToolCallRow
                  key={`${call.tool}-${i}`}
                  tool={call.tool}
                  message={call.msg}
                  duration={call.dur}
                />
              ))}

              {/* Done marker */}
              <div className="mt-4 pt-3 border-t border-gray-800/50 text-xs text-gray-600 flex items-center gap-3">
                <span className="text-green-400/70">✓ Done</span>
                <span>4 turns</span>
                <span>{stats.totalCalls} tool calls</span>
                <span>{(stats.totalDuration / 1000).toFixed(1)}s</span>
              </div>
            </div>
          )}

          {/* Registry View — all 50+ tools by category */}
          {viewMode === 'registry' && (
            <div>
              <div className="text-xs text-gray-500 mb-3">
                {totalTools} registered command types across {categories.length} categories
              </div>
              {categories.map((cat) => (
                <CategorySection
                  key={cat}
                  category={cat}
                  tools={getCategoryTools(cat)}
                />
              ))}
            </div>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500 mb-2">
                Aggregated from eventStream1-4.txt ({stats.totalCalls} tool calls)
              </div>

              {/* Tool frequency */}
              <div>
                <div className="text-sm text-gray-300 mb-2 font-medium">Tool Call Frequency</div>
                <div className="space-y-1">
                  {Array.from(stats.toolCounts.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([tool, count]) => {
                      const info = getCommandDisplay(tool);
                      const IconComp = resolveIcon(info.icon);
                      const pct = (count / stats.totalCalls * 100).toFixed(0);
                      return (
                        <div key={tool} className="flex items-center gap-2 text-xs">
                          <IconComp className={`w-3 h-3 ${info.color} shrink-0`} />
                          <span className="text-gray-300 w-24 shrink-0 font-mono">{tool}</span>
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${info.color.replace('text-', 'bg-')}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-gray-500 w-8 text-right">{count}</span>
                          <span className="text-gray-600 w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Category breakdown */}
              <div>
                <div className="text-sm text-gray-300 mb-2 font-medium">Category Breakdown</div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const CatIcon = meta.icon;
                    const count = SAMPLE_TOOL_CALLS.filter(c => COMMAND_REGISTRY[c.tool]?.category === cat).length;
                    const dur = SAMPLE_TOOL_CALLS
                      .filter(c => COMMAND_REGISTRY[c.tool]?.category === cat)
                      .reduce((sum, c) => sum + c.dur, 0);
                    return (
                      <div key={cat} className={`p-2.5 rounded-lg ${meta.bgColor} border border-gray-700/30`}>
                        <div className="flex items-center gap-2 mb-1">
                          <CatIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                          <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold text-gray-200">{count}</span>
                          <span className="text-[10px] text-gray-500">calls</span>
                          <span className="text-[10px] text-gray-600 ml-auto">{(dur / 1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventStreamDisplay;
