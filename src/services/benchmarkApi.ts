// src/services/benchmarkApi.ts - Benchmark API服务
// v4: 修复轮询隔离问题 - 防止旧任务的轮询干扰新任务状态
// 清理版：移除所有硬编码模拟，仅保留真实后端调用

import axios, { AxiosInstance } from 'axios';
import {
  BenchmarkTask,
  BenchmarkSession,
  BenchmarkRunRequest,
  BenchmarkType,
  ExecutionStep,
  RepoAnalysisResult,
  BenchmarkMetrics,
  DEFAULT_BENCHMARK_CONFIG
} from '@/types/benchmark';

/**
 * 运行日志记录器
 */
class BenchmarkLogger {
  private logs: Array<{
    timestamp: string;
    level: string;
    category: string;
    message: string;
    data?: any;
  }> = [];
  
  private sessionId: string = '';
  private taskId: string = '';
  private benchmarkType: string = '';
  private startTime: number = 0;
  
  init(sessionId: string, taskId: string, benchmarkType: string) {
    this.sessionId = sessionId;
    this.taskId = taskId;
    this.benchmarkType = benchmarkType;
    this.startTime = Date.now();
    this.logs = [];
    this.log('info', 'session', 'Session initialized', { sessionId, taskId, benchmarkType });
  }
  
  log(level: string, category: string, message: string, data?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };
    this.logs.push(entry);
    
    const prefix = `[${this.sessionId?.slice(-8) || 'init'}][${category}]`;
    if (level === 'error') {
      console.error(prefix, message, data);
    } else if (level === 'warn') {
      console.warn(prefix, message, data);
    } else {
      console.log(prefix, message, data);
    }
  }
  
  logStageMetric(stageId: string, metric: string, value: any) {
    this.log('metric', 'stage', `${stageId}.${metric}`, { stageId, metric, value });
  }
  
  logApiCall(method: string, endpoint: string, duration: number, status: number) {
    this.log('info', 'api', `${method} ${endpoint}`, { duration, status });
  }
  
  getLogs() {
    return this.logs;
  }
  
  export(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      taskId: this.taskId,
      benchmarkType: this.benchmarkType,
      startTime: this.startTime,
      endTime: Date.now(),
      totalDuration: Date.now() - this.startTime,
      logs: this.logs
    }, null, 2);
  }
  
  save() {
    const key = `benchmark_log_${this.sessionId}`;
    try {
      localStorage.setItem(key, this.export());
    } catch (e) {
      console.warn('Failed to save logs to localStorage:', e);
    }
  }
}

/**
 * 智能退避策略
 */
class BackoffStrategy {
  private baseDelay: number;
  private maxDelay: number;
  private currentDelay: number;
  private consecutiveErrors: number = 0;
  
  constructor(baseDelay: number = 5000, maxDelay: number = 60000) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.currentDelay = baseDelay;
  }
  
  getNextDelay(): number {
    return this.currentDelay;
  }
  
  reportSuccess() {
    this.consecutiveErrors = 0;
    this.currentDelay = this.baseDelay;
  }
  
  reportError(statusCode?: number) {
    this.consecutiveErrors++;
    
    if (statusCode === 429) {
      this.currentDelay = Math.min(
        this.baseDelay * Math.pow(2, this.consecutiveErrors),
        this.maxDelay
      );
    } else {
      this.currentDelay = Math.min(
        this.baseDelay + (this.consecutiveErrors * 2000),
        this.maxDelay
      );
    }
    
    return this.currentDelay;
  }
  
  reset() {
    this.consecutiveErrors = 0;
    this.currentDelay = this.baseDelay;
  }
}

/**
 * ==================== 关键修复：会话隔离的轮询控制器 ====================
 * 每个会话有独立的AbortController，防止新任务启动时旧任务的轮询继续运行
 */
class SessionPollController {
  private controllers: Map<string, AbortController> = new Map();
  
  // 为新会话创建控制器
  create(sessionId: string): AbortController {
    // 如果已存在，先取消
    this.abort(sessionId);
    
    const controller = new AbortController();
    this.controllers.set(sessionId, controller);
    console.log(`[PollController] Created controller for session: ${sessionId}`);
    return controller;
  }
  
  // 取消指定会话的轮询
  abort(sessionId: string) {
    const controller = this.controllers.get(sessionId);
    if (controller) {
      controller.abort();
      this.controllers.delete(sessionId);
      console.log(`[PollController] Aborted and removed controller for session: ${sessionId}`);
    }
  }
  
  // 取消所有会话的轮询
  abortAll() {
    console.log(`[PollController] Aborting all ${this.controllers.size} controllers`);
    this.controllers.forEach((controller, sessionId) => {
      controller.abort();
      console.log(`[PollController] Aborted session: ${sessionId}`);
    });
    this.controllers.clear();
  }
  
  // 检查会话是否已被取消
  isAborted(sessionId: string): boolean {
    const controller = this.controllers.get(sessionId);
    return !controller || controller.signal.aborted;
  }
  
  // 获取会话的AbortSignal
  getSignal(sessionId: string): AbortSignal | undefined {
    return this.controllers.get(sessionId)?.signal;
  }
}

/**
 * Benchmark API 服务类
 */
export class BenchmarkAPIService {
  private api: AxiosInstance;
  private baseURL: string;
  private logger: BenchmarkLogger = new BenchmarkLogger();
  private backoff: BackoffStrategy = new BackoffStrategy(5000, 30000);
  
  // ==================== 关键修复：使用会话隔离的轮询控制器 ====================
  private pollController: SessionPollController = new SessionPollController();
  // 当前活跃的会话ID（用于全局取消）
  private currentSessionId: string | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 300000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('chatbot_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * 获取可用的Benchmark任务列表
   */
  async getAvailableTasks(benchmarkType?: BenchmarkType): Promise<BenchmarkTask[]> {
    const response = await this.api.get('/api/v2/benchmark/tasks', {
      params: { type: benchmarkType }
    });
    return response.data.tasks || [];
  }

  /**
   * 获取Benchmark类型信息
   */
  async getBenchmarkInfo(type: BenchmarkType): Promise<{
    name: string;
    description: string;
    task_count: number;
    domains?: string[];
    difficulty_distribution?: Record<string, number>;
  }> {
    const response = await this.api.get(`/api/v2/benchmark/info/${type}`);
    return response.data;
  }

  /**
   * 开始Benchmark运行
   */
  startBenchmarkRun(
    request: BenchmarkRunRequest,
    callbacks: {
      onStepStart?: (step: ExecutionStep) => void;
      onStepProgress?: (step: ExecutionStep, progress: number) => void;
      onStepComplete?: (step: ExecutionStep) => void;
      onStepError?: (step: ExecutionStep, error: string) => void;
      onLog?: (log: { level: string; message: string; timestamp?: string; data?: any }) => void;
      onMetricsUpdate?: (metrics: BenchmarkMetrics) => void;
      onSessionComplete?: (session: BenchmarkSession) => void;
      onSessionError?: (error: string) => void;
    }
  ): { sessionId: string; cancel: () => void } {
    // 生成临时sessionId
    const tempSessionId = `bench_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ==================== 关键修复：启动新任务前，取消所有旧的轮询 ====================
    // 这确保了新任务不会被旧任务的超时回调影响
    this.pollController.abortAll();
    
    this.currentSessionId = tempSessionId;
    this.backoff.reset();
    
    // 异步启动
    this.startBenchmarkAsync(request, callbacks, tempSessionId);
    
    return {
      sessionId: tempSessionId,
      cancel: () => {
        // 取消当前会话
        if (this.currentSessionId) {
          this.pollController.abort(this.currentSessionId);
        }
      }
    };
  }

  /**
   * 异步启动Benchmark
   */
  private async startBenchmarkAsync(
    request: BenchmarkRunRequest,
    callbacks: {
      onStepStart?: (step: ExecutionStep) => void;
      onStepProgress?: (step: ExecutionStep, progress: number) => void;
      onStepComplete?: (step: ExecutionStep) => void;
      onStepError?: (step: ExecutionStep, error: string) => void;
      onLog?: (log: { level: string; message: string; timestamp?: string; data?: any }) => void;
      onMetricsUpdate?: (metrics: BenchmarkMetrics) => void;
      onSessionComplete?: (session: BenchmarkSession) => void;
      onSessionError?: (error: string) => void;
    },
    tempSessionId: string
  ) {
    const startTime = Date.now();
    
    try {
      callbacks.onLog?.({ level: 'info', message: '正在创建Benchmark会话...', timestamp: new Date().toISOString() });
      this.logger.log('info', 'session', 'Creating benchmark session', { request });
      
      const createResponse = await this.api.post('/api/v2/benchmark/run', {
        task_id: request.task_id,
        benchmark_type: request.benchmark_type,
        config: request.config || DEFAULT_BENCHMARK_CONFIG,
        repository_url: request.repository_url,
        custom_task: request.custom_task
      });
      
      const sessionId = createResponse.data.session_id;
      const createDuration = Date.now() - startTime;
      
      // ==================== 关键修复：更新当前会话ID ====================
      this.currentSessionId = sessionId;
      
      // 初始化日志记录器
      this.logger.init(sessionId, request.task_id, request.benchmark_type);
      this.logger.logApiCall('POST', '/api/v2/benchmark/run', createDuration, 200);
      this.logger.log('info', 'session', 'Session created', { 
        sessionId, 
        createDuration,
        task: createResponse.data.task 
      });
      
      callbacks.onLog?.({ 
        level: 'info', 
        message: `会话已创建: ${sessionId}`, 
        timestamp: new Date().toISOString(),
        data: { sessionId, duration: createDuration }
      });
      
      // 开始轮询（使用真实sessionId）
      this.pollSessionUpdates(sessionId, callbacks);
      
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || error?.message || '启动Benchmark失败';
      const errorStatus = error?.response?.status || 0;
      
      this.logger.log('error', 'session', 'Failed to create session', { 
        error: errorMsg, 
        status: errorStatus,
        duration: Date.now() - startTime 
      });
      this.logger.save();
      
      callbacks.onSessionError?.(errorMsg);
      callbacks.onLog?.({ level: 'error', message: errorMsg, timestamp: new Date().toISOString() });
    }
  }

  /**
   * 轮询获取会话更新
   */
  private async pollSessionUpdates(
    sessionId: string,
    callbacks: {
      onStepStart?: (step: ExecutionStep) => void;
      onStepProgress?: (step: ExecutionStep, progress: number) => void;
      onStepComplete?: (step: ExecutionStep) => void;
      onStepError?: (step: ExecutionStep, error: string) => void;
      onLog?: (log: { level: string; message: string; timestamp?: string; data?: any }) => void;
      onMetricsUpdate?: (metrics: BenchmarkMetrics) => void;
      onSessionComplete?: (session: BenchmarkSession) => void;
      onSessionError?: (error: string) => void;
    }
  ) {
    // ==================== 关键修复：为此会话创建独立的AbortController ====================
    const controller = this.pollController.create(sessionId);
    
    let lastStageStates: Record<string, string> = {};
    let lastLogCount = 0;
    let pollCount = 0;
    
    const maxPolls = 300;
    const basePollInterval = 5000;
    
    const poll = async () => {
      // ==================== 关键修复：检查此特定会话是否已被取消 ====================
      if (this.pollController.isAborted(sessionId)) {
        this.logger.log('info', 'poll', `Polling stopped for session ${sessionId} (aborted)`);
        this.logger.save();
        return;
      }
      
      // ==================== 关键修复：检查是否还是当前活跃会话 ====================
      // 如果当前活跃会话已经变成另一个，说明新任务已启动，停止此轮询
      if (this.currentSessionId !== sessionId) {
        this.logger.log('info', 'poll', `Polling stopped for session ${sessionId} (superseded by ${this.currentSessionId})`);
        this.logger.save();
        // 静默停止，不触发任何回调（因为新任务已经在运行）
        return;
      }
      
      pollCount++;
      if (pollCount > maxPolls) {
        this.logger.log('error', 'poll', 'Polling timeout', { pollCount, maxPolls, sessionId });
        this.logger.save();
        
        // 只有当前会话才触发错误回调
        if (this.currentSessionId === sessionId) {
          callbacks.onSessionError?.('轮询超时（超过25分钟）');
        }
        return;
      }
      
      const pollStartTime = Date.now();
      
      try {
        const response = await this.api.get(`/api/v2/benchmark/session/${sessionId}`);
        const session = response.data.session;
        const pollDuration = Date.now() - pollStartTime;
        
        this.backoff.reportSuccess();
        this.logger.logApiCall('GET', `/api/v2/benchmark/session/${sessionId}`, pollDuration, 200);
        
        // ==================== 再次检查：API调用期间可能已被取消 ====================
        if (this.pollController.isAborted(sessionId) || this.currentSessionId !== sessionId) {
          this.logger.log('info', 'poll', `Session ${sessionId} aborted during API call, ignoring response`);
          return;
        }
        
        if (!session) {
          setTimeout(poll, basePollInterval);
          return;
        }
        
        // 检查阶段状态变化
        const stages = session.stages || {};
        for (const [stageId, stage] of Object.entries(stages) as [string, any][]) {
          const prevStatus = lastStageStates[stageId];
          
          if (stage.status !== prevStatus) {
            lastStageStates[stageId] = stage.status;
            const step = this.convertStepFormat(stageId, stage);
            
            this.logger.logStageMetric(stageId, 'status', stage.status);
            if (stage.token_usage) {
              this.logger.logStageMetric(stageId, 'tokens', stage.token_usage);
            }
            if (stage.duration_ms) {
              this.logger.logStageMetric(stageId, 'duration_ms', stage.duration_ms);
            }
            
            if (stage.status === 'running' && prevStatus !== 'running') {
              this.logger.log('info', 'stage', `Stage started: ${stageId}`, { stageId });
              callbacks.onStepStart?.(step);
              callbacks.onLog?.({ level: 'info', message: `开始: ${this.getStageName(stageId)}`, timestamp: new Date().toISOString() });
            } else if (stage.status === 'completed') {
              this.logger.log('info', 'stage', `Stage completed: ${stageId}`, { 
                stageId, 
                duration_ms: stage.duration_ms,
                token_usage: stage.token_usage 
              });
              callbacks.onStepComplete?.(step);
              callbacks.onLog?.({ level: 'info', message: `完成: ${this.getStageName(stageId)}`, timestamp: new Date().toISOString() });
            } else if (stage.status === 'failed') {
              this.logger.log('error', 'stage', `Stage failed: ${stageId}`, { 
                stageId, 
                error: stage.error 
              });
              callbacks.onStepError?.(step, stage.error || 'Unknown error');
              callbacks.onLog?.({ level: 'error', message: `失败: ${this.getStageName(stageId)} - ${stage.error}`, timestamp: new Date().toISOString() });
            }
          }
        }
        
        // 更新指标
        if (session.metrics) {
          this.logger.log('metric', 'session', 'Metrics updated', session.metrics);
          callbacks.onMetricsUpdate?.(session.metrics);
        }
        
        // 新日志
        const logs = session.logs || [];
        if (logs.length > lastLogCount) {
          for (let i = lastLogCount; i < logs.length; i++) {
            callbacks.onLog?.(logs[i]);
          }
          lastLogCount = logs.length;
        }
        
        // 检查终止状态
        if (session.status === 'completed') {
          this.logger.log('info', 'session', 'Session completed', { 
            metrics: session.metrics,
            validation_result: session.validation_result,
            sessionId
          });
          this.logger.save();
          
          // ==================== 关键修复：完成后清理此会话的控制器 ====================
          this.pollController.abort(sessionId);
          
          callbacks.onLog?.({ level: 'info', message: '✓ Benchmark完成', timestamp: new Date().toISOString() });
          callbacks.onSessionComplete?.(this.convertSessionFormat(session));
          return;
          
        } else if (session.status === 'failed') {
          this.logger.log('error', 'session', 'Session failed', { error: session.error, sessionId });
          this.logger.save();
          
          this.pollController.abort(sessionId);
          
          callbacks.onLog?.({ level: 'error', message: '✗ Benchmark失败', timestamp: new Date().toISOString() });
          callbacks.onSessionError?.(session.error || 'Benchmark failed');
          return;
          
        } else if (session.status === 'cancelled') {
          this.logger.log('warn', 'session', 'Session cancelled', { sessionId });
          this.logger.save();
          
          this.pollController.abort(sessionId);
          
          callbacks.onLog?.({ level: 'warn', message: 'Benchmark已取消', timestamp: new Date().toISOString() });
          return;
        }
        
        // 继续轮询
        setTimeout(poll, basePollInterval);
        
      } catch (error: any) {
        // ==================== 错误处理前再次检查会话状态 ====================
        if (this.pollController.isAborted(sessionId) || this.currentSessionId !== sessionId) {
          this.logger.log('info', 'poll', `Session ${sessionId} aborted, ignoring error`);
          return;
        }
        
        const errorStatus = error?.response?.status || 0;
        this.logger.log('warn', 'poll', 'Poll error', { status: errorStatus, error: error?.message, sessionId });
        
        const nextDelay = this.backoff.reportError(errorStatus);
        
        if (errorStatus === 429) {
          callbacks.onLog?.({ 
            level: 'warn', 
            message: `请求限流，${Math.round(nextDelay / 1000)}秒后重试...`, 
            timestamp: new Date().toISOString() 
          });
        }
        
        setTimeout(poll, nextDelay);
      }
    };
    
    // 初始延迟后开始轮询
    setTimeout(poll, 2000);
  }

  /**
   * 转换阶段格式
   */
  private convertStepFormat(stageId: string, stage: any): ExecutionStep {
    return {
      id: stageId,
      name: this.getStageName(stageId),
      description: stage.output || '',
      status: stage.status,
      started_at: stage.started_at,
      completed_at: stage.completed_at,
      duration_ms: stage.duration_ms,
      token_usage: stage.token_usage || 0,
      output: stage.output,
      sub_steps: stage.sub_steps || []
    };
  }

  /**
   * 转换会话格式
   */
  private convertSessionFormat(session: any): BenchmarkSession {
    const steps: ExecutionStep[] = [];
    if (session.stages) {
      for (const [stageId, stage] of Object.entries(session.stages) as [string, any][]) {
        steps.push(this.convertStepFormat(stageId, stage));
      }
    }
    
    return {
      id: session.session_id,
      task: session.task,
      status: session.status,
      started_at: session.created_at,
      completed_at: session.completed_at,
      steps,
      current_step_index: steps.findIndex(s => s.status === 'running'),
      code_explorations: [],
      metrics: session.metrics || {},
      logs: session.logs || [],
      validation_result: session.validation_result
    };
  }

  /**
   * 获取阶段名称
   */
  private getStageName(stageId: string): string {
    const names: Record<string, string> = {
      repo_clone: '仓库克隆',
      tree_analysis: 'Tree结构分析',
      hierarchical_analysis: '层级结构分析',
      key_component_identification: '关键组件识别',
      context_building: '上下文构建',
      solution_generation: '解决方案生成',
      code_extraction: '代码提取',
      code_execution: '代码执行',
      validation: '结果验证'
    };
    return names[stageId] || stageId;
  }

  /**
   * 取消Benchmark运行
   */
  async cancelBenchmarkRun(sessionId: string): Promise<void> {
    // 取消指定会话的轮询
    this.pollController.abort(sessionId);
    
    // 如果是当前会话，清除引用
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
    
    try {
      await this.api.post(`/api/v2/benchmark/cancel/${sessionId}`);
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  }
  
  /**
   * ==================== 新增：停止所有轮询 ====================
   * 用于组件卸载或批量任务完成后清理
   */
  stopAllPolling(): void {
    console.log('[BenchmarkAPI] Stopping all polling');
    this.pollController.abortAll();
    this.currentSessionId = null;
  }

  /**
   * 获取会话状态
   */
  async getSessionStatus(sessionId: string): Promise<BenchmarkSession> {
    const response = await this.api.get(`/api/v2/benchmark/session/${sessionId}`);
    return this.convertSessionFormat(response.data.session);
  }

  /**
   * 获取历史Benchmark结果
   */
  async getBenchmarkHistory(params?: {
    benchmark_type?: BenchmarkType;
    limit?: number;
    offset?: number;
  }): Promise<{ sessions: BenchmarkSession[]; total: number }> {
    const response = await this.api.get('/api/v2/benchmark/history', { params });
    return {
      sessions: (response.data.sessions || []).map((s: any) => this.convertSessionFormat(s)),
      total: response.data.total || 0
    };
  }

  /**
   * 分析仓库
   */
  async analyzeRepository(repoUrl: string): Promise<RepoAnalysisResult> {
    const response = await this.api.post('/api/v2/benchmark/analyze-repo', {
      repo_url: repoUrl,
      force_refresh: false,
      max_depth: 4
    });
    return response.data;
  }

  /**
   * 获取当前会话的日志
   */
  getCurrentLogs(): string {
    return this.logger.export();
  }

  /**
   * 获取指定会话的日志（从localStorage）
   */
  getSessionLogs(sessionId: string): any | null {
    try {
      const key = `benchmark_log_${sessionId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to get session logs:', e);
      return null;
    }
  }

  /**
   * 获取所有保存的会话日志
   */
  getAllSavedLogs(): Array<{ sessionId: string; data: any }> {
    const logs: Array<{ sessionId: string; data: any }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('benchmark_log_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          logs.push({
            sessionId: key.replace('benchmark_log_', ''),
            data
          });
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
    
    return logs.sort((a, b) => (b.data.startTime || 0) - (a.data.startTime || 0));
  }

  /**
   * 导出所有日志为CSV格式
   */
  exportLogsAsCSV(): string {
    const allLogs = this.getAllSavedLogs();
    const rows: string[] = [
      'session_id,task_id,benchmark_type,timestamp,level,category,message'
    ];
    
    for (const { sessionId, data } of allLogs) {
      for (const log of data.logs || []) {
        const row = [
          sessionId,
          data.taskId || '',
          data.benchmarkType || '',
          log.timestamp,
          log.level,
          log.category,
          `"${(log.message || '').replace(/"/g, '""')}"`
        ].join(',');
        rows.push(row);
      }
    }
    
    return rows.join('\n');
  }

  /**
   * 清理旧日志
   */
  clearOldLogs(keepDays: number = 7): number {
    const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000);
    let cleared = 0;
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('benchmark_log_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (data.startTime && data.startTime < cutoffTime) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
    
    return cleared;
  }

  /**
   * 获取会话详细指标（从后端）
   */
  async getSessionMetrics(sessionId: string): Promise<any> {
    const response = await this.api.get(`/api/v2/benchmark/session/${sessionId}/metrics`);
    return response.data;
  }

  /**
   * 导出会话数据（从后端）
   */
  async exportSessionData(sessionId: string): Promise<any> {
    const response = await this.api.post(`/api/v2/benchmark/export/${sessionId}`);
    return response.data;
  }

  /**
   * 获取统计信息（从后端）
   */
  async getStats(): Promise<any> {
    const response = await this.api.get('/api/v2/benchmark/stats');
    return response.data;
  }
}

export const benchmarkApi = new BenchmarkAPIService();