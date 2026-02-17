// src/components/Benchmark/RepoMasterBenchmarkInterface.tsx
// baloonet的非端到端Benchmark测试界面
// v2: 修复429错误 - 使用串行执行+单一轮询管理器
// 支持: GitTaskBench, SWE-bench Verified, MLE-bench

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Play, Pause, Square, RotateCcw, Settings, ChevronRight,
  CheckCircle, XCircle, Loader2, Clock, Cpu, DollarSign,
  GitBranch, FolderTree, Code2, Terminal, BarChart3, Zap,
  AlertTriangle, Sparkles, ArrowLeft, Layers, Database,
  ListChecks, Activity, TrendingUp, Award, Target, Beaker,
  FlaskConical, Package
} from 'lucide-react';
import { benchmarkApi } from '@/services/benchmarkApi';
import { BenchmarkTask, ExecutionStep, BenchmarkMetrics, BenchmarkType } from '@/types/benchmark';

// ==================== 类型定义 ====================

interface BenchmarkResult {
  task_id: string;
  task_name: string;
  benchmark_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  ecr: number;
  tpr: number;
  alpha_score: number;
  duration_ms: number;
  token_usage: number;
  steps: ExecutionStep[];
  error?: string;
  session_id?: string;  // 添加session_id追踪
}

interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  type: BenchmarkType;
  task_count: number;
  domains: string[];
  color: string;
  paper_url?: string;
  disabled?: boolean;
  disabledReason?: string;
}

// ==================== 常量 ====================

const BENCHMARK_SUITES: BenchmarkSuite[] = [
  {
    id: 'gittaskbench',
    name: 'GitTaskBench',
    description: '54个仓库级真实世界任务，覆盖图像、语音、文档等7个领域',
    type: 'gittaskbench',
    task_count: 54,
    domains: ['Image', 'Speech', 'Document', 'Web', 'Security', 'Bio', 'Video'],
    color: 'from-emerald-500 to-teal-600',
    paper_url: 'https://arxiv.org/abs/2508.18993'
  },
  {
    id: 'swe_bench_verified',
    name: 'SWE-bench Verified',
    description: '500个人工验证的GitHub issue修复任务（暂未启用）',
    type: 'swe_bench_verified',
    task_count: 500,
    domains: ['Django', 'SymPy', 'Sklearn', 'Matplotlib', 'Pytest'],
    color: 'from-violet-500 to-purple-600',
    paper_url: 'https://openai.com/index/introducing-swe-bench-verified/',
    disabled: true,
    disabledReason: '需要120GB+磁盘空间'
  },
  {
    id: 'mle_bench',
    name: 'MLE-bench',
    description: '75个Kaggle机器学习竞赛任务',
    type: 'mle_bench',
    task_count: 75,
    domains: ['Classification', 'Regression', 'NLP', 'CV', 'TimeSeries'],
    color: 'from-amber-500 to-orange-600',
    paper_url: 'https://github.com/openai/mle-bench'
  }
];

const STAGE_CONFIGS: Record<string, { name: string; color: string }> = {
  repo_clone: { name: '仓库克隆', color: 'text-blue-500' },
  tree_analysis: { name: 'Tree结构分析', color: 'text-green-500' },
  hierarchical_analysis: { name: '层级结构分析', color: 'text-purple-500' },
  key_component_identification: { name: '关键组件识别', color: 'text-orange-500' },
  context_building: { name: '上下文构建', color: 'text-cyan-500' },
  solution_generation: { name: '解决方案生成', color: 'text-pink-500' },
  code_extraction: { name: '代码提取', color: 'text-indigo-500' },
  code_execution: { name: '代码执行', color: 'text-emerald-500' },
  validation: { name: '结果验证', color: 'text-teal-500' }
};

// ==================== 轮询管理器 ====================
// 关键修复：统一管理所有会话的轮询，避免请求风暴

class SessionPollingManager {
  private activeSessions: Map<string, {
    status: string;
    lastPollTime: number;
    onUpdate: (session: any) => void;
    onComplete: (session: any) => void;
    onError: (error: string) => void;
  }> = new Map();
  
  private pollTimer: NodeJS.Timeout | null = null;
  private isPolling = false;
  private baseInterval = 3000;      // 基础轮询间隔 3秒
  private requestDelay = 300;       // 每个请求之间的间隔 300ms
  private maxConcurrent = 3;        // 最大并发请求数
  
  constructor(private api: typeof benchmarkApi) {}
  
  // 添加会话到轮询队列
  addSession(
    sessionId: string,
    callbacks: {
      onUpdate: (session: any) => void;
      onComplete: (session: any) => void;
      onError: (error: string) => void;
    }
  ) {
    this.activeSessions.set(sessionId, {
      status: 'running',
      lastPollTime: 0,
      ...callbacks
    });
    
    // 启动轮询（如果尚未启动）
    this.startPolling();
  }
  
  // 移除会话
  removeSession(sessionId: string) {
    this.activeSessions.delete(sessionId);
    
    // 如果没有活跃会话，停止轮询
    if (this.activeSessions.size === 0) {
      this.stopPolling();
    }
  }
  
  // 启动统一轮询
  private startPolling() {
    if (this.pollTimer) return;
    
    const poll = async () => {
      if (this.isPolling || this.activeSessions.size === 0) {
        this.pollTimer = setTimeout(poll, this.baseInterval);
        return;
      }
      
      this.isPolling = true;
      
      // 获取需要轮询的会话列表
      const sessionsToCheck = Array.from(this.activeSessions.entries())
        .filter(([_, info]) => info.status === 'running')
        .slice(0, this.maxConcurrent);  // 限制并发数
      
      for (const [sessionId, info] of sessionsToCheck) {
        try {
          const response = await this.api.getSessionStatus(sessionId);
          info.lastPollTime = Date.now();
          
          // 触发更新回调
          info.onUpdate(response);
          
          // 检查是否完成
          if (response.status === 'completed') {
            info.status = 'completed';
            info.onComplete(response);
            this.activeSessions.delete(sessionId);
          } else if (response.status === 'failed' || response.status === 'cancelled') {
            info.status = response.status;
            info.onError(response.error || 'Session failed');
            this.activeSessions.delete(sessionId);
          }
          
          // 请求间隔
          await new Promise(r => setTimeout(r, this.requestDelay));
          
        } catch (error: any) {
          const status = error?.response?.status;
          
          if (status === 429) {
            // 429错误：暂停更长时间
            console.warn(`[PollingManager] 429 for session ${sessionId}, backing off`);
            await new Promise(r => setTimeout(r, 5000));
          } else if (status === 404) {
            // 会话不存在
            info.onError('Session not found');
            this.activeSessions.delete(sessionId);
          }
        }
      }
      
      this.isPolling = false;
      
      // 根据活跃会话数调整轮询间隔
      const activeCount = this.activeSessions.size;
      const adjustedInterval = this.baseInterval + Math.min(activeCount * 500, 5000);
      
      this.pollTimer = setTimeout(poll, adjustedInterval);
    };
    
    this.pollTimer = setTimeout(poll, 1000);
  }
  
  // 停止轮询
  private stopPolling() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
  }
  
  // 清理所有
  cleanup() {
    this.stopPolling();
    this.activeSessions.clear();
  }
  
  // 获取活跃会话数
  getActiveCount(): number {
    return this.activeSessions.size;
  }
}

// ==================== 子组件 ====================

const BenchmarkSuiteCard: React.FC<{
  suite: BenchmarkSuite;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}> = ({ suite, selected, onSelect, disabled }) => {
  const isDisabled = disabled || suite.disabled;
  
  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full
        ${selected ? 'border-transparent shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${suite.color} 
        ${selected ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} />
      
      <div className={`relative ${selected ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-xl ${selected ? 'bg-white/20' : 'bg-gray-100'}`}>
            {suite.type === 'gittaskbench' && <GitBranch className="w-5 h-5" />}
            {suite.type === 'swe_bench_verified' && <Code2 className="w-5 h-5" />}
            {suite.type === 'mle_bench' && <Beaker className="w-5 h-5" />}
          </div>
          {selected && <CheckCircle className="w-5 h-5 text-white" />}
          {suite.disabled && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              暂未启用
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-1">{suite.name}</h3>
        <p className={`text-sm mb-3 line-clamp-2 ${selected ? 'text-white/80' : 'text-gray-600'}`}>
          {suite.description}
        </p>
        
        {suite.disabledReason && (
          <p className={`text-xs mb-2 ${selected ? 'text-white/60' : 'text-gray-400'}`}>
            {suite.disabledReason}
          </p>
        )}
        
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-2 py-0.5 rounded-full ${
            selected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
          }`}>
            {suite.task_count} 任务
          </span>
          <span className={selected ? 'text-white/70' : 'text-gray-500'}>
            {suite.domains.slice(0, 3).join(' · ')}
          </span>
        </div>
      </div>
    </button>
  );
};

const StepVisualization: React.FC<{
  step: ExecutionStep;
  isActive: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
}> = ({ step, isActive, isLast, expanded, onToggle }) => {
  const config = STAGE_CONFIGS[step.id] || { name: step.name, color: 'text-gray-500' };
  
  const getStatusStyles = () => {
    switch (step.status) {
      case 'completed':
        return { border: 'border-emerald-400', bg: 'bg-emerald-50', icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> };
      case 'running':
        return { border: 'border-indigo-400', bg: 'bg-indigo-50', icon: <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> };
      case 'failed':
        return { border: 'border-rose-400', bg: 'bg-rose-50', icon: <XCircle className="w-5 h-5 text-rose-500" /> };
      default:
        return { border: 'border-gray-200', bg: 'bg-gray-50', icon: <div className="w-5 h-5 rounded-full border-2 border-gray-300" /> };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative">
      {!isLast && (
        <div className={`absolute left-6 top-14 w-0.5 h-full -translate-x-1/2 
          ${step.status === 'completed' ? 'bg-emerald-300' : 'bg-gray-200'}`} />
      )}

      <div className={`relative p-4 rounded-xl border-2 transition-all duration-200 
        ${styles.border} ${styles.bg} ${isActive ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-gray-900 ${config.color}`}>{config.name}</h4>
            {step.status === 'running' && (
              <p className="text-sm text-indigo-600 mt-0.5">正在处理...</p>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {step.duration_ms !== undefined && step.duration_ms > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                {(step.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
            {step.token_usage !== undefined && step.token_usage > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg">
                <Cpu className="w-3.5 h-3.5" />
                {step.token_usage.toLocaleString()}
              </span>
            )}
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {expanded && (step.output || step.sub_steps?.length || step.error) && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {step.sub_steps && step.sub_steps.length > 0 && (
              <div className="space-y-2">
                {step.sub_steps.map((subStep, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm pl-2">
                    {subStep.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-medium text-gray-700">{subStep.name}</span>
                      {subStep.detail && <p className="text-gray-500 text-xs mt-0.5">{subStep.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step.output && (
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {step.output}
                </pre>
              </div>
            )}

            {step.error && (
              <div className="p-3 bg-rose-100 rounded-xl text-sm text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{step.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MetricsDashboard: React.FC<{
  metrics: {
    ecr: number;
    tpr: number;
    alphaScore: number;
    totalTokens: number;
    totalDuration: number;
    totalCost: number;
    completedTasks: number;
    totalTasks: number;
    activeSessions: number;  // 新增：活跃会话数
  };
  isRunning: boolean;
}> = ({ metrics, isRunning }) => (
  <div className="space-y-4">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <span className="font-semibold">RepoMaster 核心指标</span>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1 text-xs text-cyan-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            实时更新 ({metrics.activeSessions}个活跃)
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{(metrics.ecr * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-400 mt-1">ECR (执行完成率)</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-400">{(metrics.tpr * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-400 mt-1">TPR (任务通过率)</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400">{metrics.alphaScore.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">α-score</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>任务进度</span>
          <span>{metrics.completedTasks} / {metrics.totalTasks}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${(metrics.completedTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
          <Cpu className="w-4 h-4" />Token使用
        </div>
        <div className="text-xl font-bold text-gray-900">
          {metrics.totalTokens >= 1000 ? `${(metrics.totalTokens / 1000).toFixed(1)}k` : metrics.totalTokens}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
          <Clock className="w-4 h-4" />总耗时
        </div>
        <div className="text-xl font-bold text-gray-900">
          {metrics.totalDuration >= 60000
            ? `${Math.floor(metrics.totalDuration / 60000)}m ${Math.floor((metrics.totalDuration % 60000) / 1000)}s`
            : `${(metrics.totalDuration / 1000).toFixed(1)}s`}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
          <DollarSign className="w-4 h-4" />估计成本
        </div>
        <div className="text-xl font-bold text-gray-900">${metrics.totalCost.toFixed(4)}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
          <Award className="w-4 h-4" />通过任务
        </div>
        <div className="text-xl font-bold text-emerald-600">
          {Math.round(metrics.tpr * metrics.completedTasks)} / {metrics.completedTasks}
        </div>
      </div>
    </div>
  </div>
);

const TaskResultList: React.FC<{
  results: BenchmarkResult[];
  onSelectTask: (taskId: string) => void;
  selectedTaskId?: string;
}> = ({ results, onSelectTask, selectedTaskId }) => (
  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
    {results.map((result) => (
      <button
        key={result.task_id}
        onClick={() => onSelectTask(result.task_id)}
        className={`w-full p-3 rounded-xl text-left transition-all duration-200
          ${selectedTaskId === result.task_id 
            ? 'bg-indigo-50 border-2 border-indigo-400' 
            : 'bg-white border border-gray-200 hover:border-gray-300'}`}
      >
        <div className="flex items-center gap-3">
          {result.status === 'completed' ? (
            result.tpr > 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            )
          ) : result.status === 'running' ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
          ) : result.status === 'failed' ? (
            <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate text-sm">{result.task_name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{result.benchmark_type}</div>
          </div>
          
          {result.status === 'completed' && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${
                result.tpr > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                TPR: {(result.tpr * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </button>
    ))}
  </div>
);

const ConfigPanel: React.FC<{
  config: { tasksPerBench: number; model: string; timeout: number; parallelExecution: boolean };
  onConfigChange: (config: any) => void;
}> = ({ config, onConfigChange }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
      <Settings className="w-4 h-4" />运行配置
    </h3>
    
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600 mb-1 block">每个Bench测试任务数</label>
        <select
          value={config.tasksPerBench}
          onChange={(e) => onConfigChange({ ...config, tasksPerBench: Number(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value={3}>3 个任务 (快速测试)</option>
          <option value={5}>5 个任务 (推荐)</option>
          <option value={10}>10 个任务</option>
          <option value={20}>20 个任务 (完整)</option>
        </select>
      </div>
      
      <div>
        <label className="text-sm text-gray-600 mb-1 block">模型</label>
        <select
          value={config.model}
          onChange={(e) => onConfigChange({ ...config, model: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="claude-opus-4-5-20251101">Claude Sonnet 4</option>
          <option value="claude-opus-4-5-20251101">Claude Opus 4</option>
          <option value="claude-opus-4-5-20251101">GPT-4o</option>
          <option value="claude-opus-4-5-20251101">DeepSeek V3</option>


        </select>
      </div>
      
      <div>
        <label className="text-sm text-gray-600 mb-1 block">超时时间 (秒)</label>
        <input
          type="number"
          value={config.timeout}
          onChange={(e) => onConfigChange({ ...config, timeout: Number(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
          min={60}
          max={3600}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="parallelExecution"
          checked={config.parallelExecution}
          onChange={(e) => onConfigChange({ ...config, parallelExecution: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="parallelExecution" className="text-sm text-gray-600">
          串行执行（推荐，避免API限流）
        </label>
      </div>
    </div>
  </div>
);

// ==================== 主组件 ====================

interface RepoMasterBenchmarkInterfaceProps {
  onBack?: () => void;
  onComplete?: (results: BenchmarkResult[]) => void;
}

export const RepoMasterBenchmarkInterface: React.FC<RepoMasterBenchmarkInterfaceProps> = ({
  onBack,
  onComplete
}) => {
  const [selectedSuites, setSelectedSuites] = useState<string[]>(['gittaskbench']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'completed' | 'paused'>('idle');
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [currentTask, setCurrentTask] = useState<BenchmarkResult | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'execution' | 'logs' | 'results'>('execution');
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: string; message: string }>>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [activeSessions, setActiveSessions] = useState(0);
  
  const pollingManagerRef = useRef<SessionPollingManager | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [config, setConfig] = useState({
    tasksPerBench: 5,
    model: 'claude-sonnet-4-20250514',
    timeout: 600,
    parallelExecution: false  // 默认串行执行
  });

  // 初始化轮询管理器
  useEffect(() => {
    pollingManagerRef.current = new SessionPollingManager(benchmarkApi);
    
    return () => {
      pollingManagerRef.current?.cleanup();
    };
  }, []);

  const aggregatedMetrics = useMemo(() => {
    const completedResults = results.filter(r => r.status === 'completed');
    const total = results.length;
    const completed = completedResults.length;
    
    return {
      ecr: completed > 0 ? completedResults.filter(r => r.ecr > 0).length / completed : 0,
      tpr: completed > 0 ? completedResults.filter(r => r.tpr > 0).length / completed : 0,
      alphaScore: completedResults.reduce((sum, r) => sum + r.alpha_score, 0),
      totalTokens: completedResults.reduce((sum, r) => sum + r.token_usage, 0),
      totalDuration: completedResults.reduce((sum, r) => sum + r.duration_ms, 0),
      totalCost: completedResults.reduce((sum, r) => sum + r.token_usage * 0.00001, 0),
      completedTasks: completed,
      totalTasks: total,
      activeSessions
    };
  }, [results, activeSessions]);

  const toggleSuiteSelection = (suiteId: string) => {
    const suite = BENCHMARK_SUITES.find(s => s.id === suiteId);
    if (suite?.disabled) return;
    
    setSelectedSuites(prev => 
      prev.includes(suiteId) ? prev.filter(id => id !== suiteId) : [...prev, suiteId]
    );
  };

  const addLog = useCallback((level: string, message: string) => {
    setLogs(prev => [...prev.slice(-199), { timestamp: new Date().toISOString(), level, message }]);
  }, []);

  // ==================== 关键修复：串行执行 ====================
  const startRun = useCallback(async () => {
    if (selectedSuites.length === 0) {
      addLog('error', '请至少选择一个Benchmark套件');
      return;
    }

    setStatus('running');
    setResults([]);
    setLogs([]);
    abortControllerRef.current = new AbortController();
    
    addLog('info', `开始运行 ${selectedSuites.length} 个Benchmark套件 (串行模式)...`);

    // 收集所有任务
    const allTasks: Array<{ task: BenchmarkTask; suite: BenchmarkSuite }> = [];
    
    for (const suiteId of selectedSuites) {
      const suite = BENCHMARK_SUITES.find(s => s.id === suiteId);
      if (!suite || suite.disabled) continue;

      addLog('info', `加载 ${suite.name} 任务...`);

      try {
        const tasksResponse = await benchmarkApi.getAvailableTasks(suite.type);
        const tasks = tasksResponse.slice(0, config.tasksPerBench);
        addLog('info', `已加载 ${tasks.length} 个 ${suite.name} 任务`);
        
        for (const task of tasks) {
          allTasks.push({ task, suite });
        }
      } catch (error: any) {
        addLog('error', `加载 ${suite.name} 失败: ${error.message}`);
      }
    }

    // 初始化所有结果为pending
    const initialResults: BenchmarkResult[] = allTasks.map(({ task, suite }) => ({
      task_id: task.id,
      task_name: task.name,
      benchmark_type: suite.type,
      status: 'pending',
      ecr: 0, tpr: 0, alpha_score: 0, duration_ms: 0, token_usage: 0, steps: []
    }));
    setResults(initialResults);

    // 串行执行每个任务
    for (let i = 0; i < allTasks.length; i++) {
      // 检查是否被取消
      if (abortControllerRef.current?.signal.aborted) {
        addLog('warn', '运行已被取消');
        break;
      }

      const { task, suite } = allTasks[i];
      
      // 更新当前任务状态为running
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'running' } : r
      ));
      setSelectedTaskId(task.id);
      addLog('info', `[${i + 1}/${allTasks.length}] 开始执行: ${task.name}`);

      try {
        // 等待任务完成（使用Promise包装）
        await new Promise<void>((resolve, reject) => {
          const { sessionId } = benchmarkApi.startBenchmarkRun(
            {
              task_id: task.id,
              benchmark_type: suite.type,
              config: { model: config.model, timeout: config.timeout, max_iterations: 10 }
            },
            {
              onStepStart: (step) => {
                setResults(prev => prev.map((r, idx) => 
                  idx === i ? { ...r, steps: [...r.steps, step] } : r
                ));
                setExpandedSteps(prev => new Set([...prev, step.id]));
                addLog('info', `  开始步骤: ${step.name}`);
              },
              onStepComplete: (step) => {
                setResults(prev => prev.map((r, idx) => 
                  idx === i ? { ...r, steps: r.steps.map(s => s.id === step.id ? step : s) } : r
                ));
                addLog('info', `  完成步骤: ${step.name}`);
              },
              onStepError: (step, error) => {
                setResults(prev => prev.map((r, idx) => 
                  idx === i ? { ...r, steps: r.steps.map(s => s.id === step.id ? { ...step, status: 'failed' as const, error } : s) } : r
                ));
                addLog('error', `  步骤失败: ${step.name} - ${error}`);
              },
              onMetricsUpdate: (metrics) => {
                setResults(prev => prev.map((r, idx) => 
                  idx === i ? { ...r, token_usage: metrics.total_tokens, duration_ms: metrics.total_duration_ms } : r
                ));
              },
              onSessionComplete: (session) => {
                const finalResult: BenchmarkResult = {
                  task_id: task.id,
                  task_name: task.name,
                  benchmark_type: suite.type,
                  status: 'completed',
                  ecr: session.metrics?.execution_completion_rate || 0,
                  tpr: session.metrics?.task_pass_rate || 0,
                  alpha_score: session.metrics?.alpha_score || 0,
                  duration_ms: session.metrics?.total_duration_ms || 0,
                  token_usage: session.metrics?.total_tokens || 0,
                  steps: session.steps || []
                };
                setResults(prev => prev.map((r, idx) => idx === i ? finalResult : r));
                addLog('info', `✓ 任务完成: ${task.name} (TPR: ${(finalResult.tpr * 100).toFixed(0)}%)`);
                resolve();
              },
              onSessionError: (error) => {
                setResults(prev => prev.map((r, idx) => 
                  idx === i ? { ...r, status: 'failed', error } : r
                ));
                addLog('error', `✗ 任务失败: ${task.name} - ${error}`);
                resolve(); // 继续下一个任务，而不是reject
              },
              onLog: (log) => addLog(log.level, `  ${log.message}`)
            }
          );
          
          setActiveSessions(prev => prev + 1);
          
          // 设置超时
          const timeout = setTimeout(() => {
            addLog('warn', `任务超时: ${task.name}`);
            setResults(prev => prev.map((r, idx) => 
              idx === i ? { ...r, status: 'failed', error: 'Timeout' } : r
            ));
            resolve();
          }, config.timeout * 1000);
          
          // 清理超时
          const cleanup = () => {
            clearTimeout(timeout);
            setActiveSessions(prev => Math.max(0, prev - 1));
          };
          
          // 注册清理
          abortControllerRef.current?.signal.addEventListener('abort', () => {
            cleanup();
            reject(new Error('Aborted'));
          });
        });

        // 任务间等待，避免API压力
        if (i < allTasks.length - 1) {
          addLog('info', '等待2秒后继续下一个任务...');
          await new Promise(r => setTimeout(r, 2000));
        }

      } catch (error: any) {
        if (error.message === 'Aborted') break;
        addLog('error', `执行错误: ${error.message}`);
      }
    }

    setStatus('completed');
    setActiveSessions(0);
    addLog('info', '✓ 所有Benchmark运行完成');
    onComplete?.(results);
  }, [selectedSuites, config, addLog, onComplete]);

  const resetRun = useCallback(() => {
    abortControllerRef.current?.abort();
    pollingManagerRef.current?.cleanup();
    setStatus('idle');
    setResults([]);
    setCurrentTask(null);
    setSelectedTaskId(null);
    setLogs([]);
    setExpandedSteps(new Set());
    setActiveSessions(0);
  }, []);

  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.has(stepId) ? next.delete(stepId) : next.add(stepId);
      return next;
    });
  };

  const displaySteps = selectedTaskId 
    ? results.find(r => r.task_id === selectedTaskId)?.steps || []
    : currentTask?.steps || [];

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const canStart = status === 'idle' && selectedSuites.length > 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Benchmark Runner</h1>
              <p className="text-sm text-gray-500">RepoMaster Style · 串行执行模式</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canStart && (
              <button
                onClick={startRun}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 
                  text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg"
              >
                <Play className="w-4 h-4" />开始运行
              </button>
            )}
            {isRunning && (
              <button
                onClick={resetRun}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
              >
                <Square className="w-4 h-4" />停止
              </button>
            )}
            {isCompleted && (
              <button
                onClick={resetRun}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
              >
                <RotateCcw className="w-4 h-4" />重新开始
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <div className="flex-1 overflow-hidden flex">
        {/* 左侧面板 */}
        <div className="w-96 border-r border-gray-200 bg-white/50 backdrop-blur-sm overflow-y-auto p-5 space-y-5">
          {status === 'idle' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />选择 Benchmark 套件
                </h3>
                <div className="space-y-3">
                  {BENCHMARK_SUITES.map(suite => (
                    <BenchmarkSuiteCard
                      key={suite.id}
                      suite={suite}
                      selected={selectedSuites.includes(suite.id)}
                      onSelect={() => toggleSuiteSelection(suite.id)}
                    />
                  ))}
                </div>
              </div>
              <ConfigPanel config={config} onConfigChange={setConfig} />
            </>
          )}

          {(isRunning || isCompleted) && (
            <>
              <MetricsDashboard metrics={aggregatedMetrics} isRunning={isRunning} />
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />任务结果 ({results.filter(r => r.status === 'completed').length}/{results.length})
                </h3>
                <TaskResultList 
                  results={results}
                  onSelectTask={setSelectedTaskId}
                  selectedTaskId={selectedTaskId || undefined}
                />
              </div>
            </>
          )}
        </div>

        {/* 右侧面板 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { id: 'execution', label: '执行步骤', icon: Zap },
              { id: 'logs', label: '运行日志', icon: Terminal },
              { id: 'results', label: '结果分析', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'execution' && (
            <div className="space-y-4">
              {displaySteps.length === 0 && !isRunning ? (
                <div className="text-center py-16 text-gray-500">
                  <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">选择Benchmark套件并点击"开始运行"</p>
                  <p className="text-sm mt-2">支持 GitTaskBench, MLE-bench</p>
                  <p className="text-xs mt-4 text-gray-400">SWE-bench 暂未启用（需要大磁盘空间）</p>
                </div>
              ) : (
                displaySteps.map((step, index) => (
                  <StepVisualization
                    key={step.id}
                    step={step}
                    isActive={step.status === 'running'}
                    isLast={index === displaySteps.length - 1}
                    expanded={expandedSteps.has(step.id)}
                    onToggle={() => toggleStepExpand(step.id)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-gray-900 rounded-2xl p-5 h-[calc(100vh-280px)] overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-600 text-center py-12">暂无日志</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex gap-3 py-1 hover:bg-gray-800/50 px-2 rounded">
                    <span className="text-gray-500 flex-shrink-0 w-20">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`flex-shrink-0 w-14 ${
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'warn' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              {results.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>运行完成后将显示结果分析</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />汇总统计
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-indigo-600">{(aggregatedMetrics.ecr * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500 mt-1">ECR</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-emerald-600">{(aggregatedMetrics.tpr * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500 mt-1">TPR</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-amber-600">{aggregatedMetrics.alphaScore.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mt-1">α-score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-purple-600">{aggregatedMetrics.completedTasks}/{aggregatedMetrics.totalTasks}</div>
                      <div className="text-sm text-gray-500 mt-1">完成任务</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoMasterBenchmarkInterface;