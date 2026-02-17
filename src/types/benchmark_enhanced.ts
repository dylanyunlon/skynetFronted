// src/types/benchmark_enhanced.ts
// 增强版Benchmark类型定义
// 支持: GitTaskBench, SWE-bench Verified, MLE-bench
// 兼容现有 benchmark.ts

// 重导出现有类型
export * from './benchmark';

// ==================== 扩展类型 ====================

// GitTaskBench 特有类型
export interface GitTaskBenchTask {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  domain: GitTaskBenchDomain;
  modality: GitTaskBenchModality;
  repository_url: string;
  success_criteria: {
    type: string;
    metric: string;
    threshold: number;
    higher_is_better?: boolean;
  };
  market_value_usd: number;
  input_data?: Record<string, any>;
  expected_output_format?: string;
}

export type GitTaskBenchDomain = 
  | 'image_processing'
  | 'speech_processing'
  | 'document_processing'
  | 'web_scraping'
  | 'security'
  | 'biomedical'
  | 'video_processing';

export type GitTaskBenchModality = 
  | 'image'
  | 'audio'
  | 'text'
  | 'document'
  | 'video'
  | 'time_series'
  | 'multimodal';

// SWE-bench Verified 特有类型
export interface SWEBenchTask {
  id: string;  // 格式: {repo}__{issue_number} 如 django__django-11099
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';  // 基于修复时间估计
  repository: SWEBenchRepository;
  base_commit: string;
  problem_statement: string;
  hints_text?: string;
  test_patch: string;
  fail_to_pass: string[];  // 必须通过的测试
  pass_to_pass: string[];  // 必须保持通过的测试
  created_at: string;
  patch_size_lines?: number;
}

export type SWEBenchRepository = 
  | 'django/django'
  | 'sympy/sympy'
  | 'scikit-learn/scikit-learn'
  | 'matplotlib/matplotlib'
  | 'pytest-dev/pytest'
  | 'pallets/flask'
  | 'sphinx-doc/sphinx'
  | 'astropy/astropy'
  | 'pydata/xarray'
  | 'psf/requests'
  | 'pylint-dev/pylint'
  | 'mwaskom/seaborn';

// MLE-bench 特有类型
export interface MLEBenchTask {
  id: string;
  name: string;
  description: string;
  difficulty: 'Low' | 'Medium' | 'High';
  competition_id: string;
  competition_url: string;
  metric: MLEBenchMetric;
  dataset_size_mb: number;
  time_limit_hours?: number;
  evaluation_type: 'classification' | 'regression' | 'ranking' | 'other';
  data_modality: 'tabular' | 'image' | 'text' | 'audio' | 'multimodal';
}

export type MLEBenchMetric = 
  | 'accuracy'
  | 'f1'
  | 'auc'
  | 'rmse'
  | 'mae'
  | 'rmsle'
  | 'map@k'
  | 'ndcg'
  | 'quadratic_weighted_kappa'
  | 'custom';

// ==================== 评估结果类型 ====================

// GitTaskBench 评估结果
export interface GitTaskBenchEvaluationResult {
  task_id: string;
  execution_completed: boolean;  // ECR相关
  task_passed: boolean;          // TPR相关
  alpha_score: number;           // 经济效益评分
  
  metrics: {
    metric_name: string;
    actual_value: number;
    threshold: number;
    passed: boolean;
  }[];
  
  output_files: string[];
  error_category?: 'env_setup' | 'dependency' | 'runtime' | 'validation' | 'timeout';
  error_message?: string;
}

// SWE-bench 评估结果
export interface SWEBenchEvaluationResult {
  task_id: string;
  resolved: boolean;
  
  fail_to_pass_results: {
    test_name: string;
    status: 'passed' | 'failed' | 'error' | 'skipped';
    error_message?: string;
  }[];
  
  pass_to_pass_results: {
    test_name: string;
    status: 'passed' | 'failed' | 'error' | 'skipped';
    error_message?: string;
  }[];
  
  generated_patch: string;
  patch_diff_from_oracle?: string;
}

// MLE-bench 评估结果
export interface MLEBenchEvaluationResult {
  task_id: string;
  submission_valid: boolean;
  
  score: number;
  percentile: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
  
  metric_name: string;
  metric_value: number;
  
  submission_file: string;
  training_time_seconds?: number;
  inference_time_seconds?: number;
}

// ==================== 批量测试类型 ====================

export interface BenchmarkBatchConfig {
  benchmark_types: ('gittaskbench' | 'swe_bench_verified' | 'mle_bench')[];
  tasks_per_benchmark: number;
  model: string;
  timeout_per_task: number;
  parallel_execution: boolean;
  save_trajectories: boolean;
  save_logs: boolean;
}

export interface BenchmarkBatchResult {
  config: BenchmarkBatchConfig;
  started_at: string;
  completed_at: string;
  
  summary: {
    total_tasks: number;
    completed_tasks: number;
    passed_tasks: number;
    failed_tasks: number;
    
    overall_ecr: number;
    overall_tpr: number;
    overall_alpha_score: number;
    
    total_tokens: number;
    total_cost_usd: number;
    total_duration_ms: number;
  };
  
  by_benchmark: {
    [key: string]: {
      task_count: number;
      ecr: number;
      tpr: number;
      alpha_score: number;
      avg_duration_ms: number;
      avg_tokens: number;
    };
  };
  
  error_distribution: {
    [category: string]: number;
  };
  
  individual_results: (
    | GitTaskBenchEvaluationResult
    | SWEBenchEvaluationResult
    | MLEBenchEvaluationResult
  )[];
}

// ==================== RepoMaster 风格指标 ====================

export interface RepoMasterMetrics {
  // 核心指标
  ecr: number;  // Execution Completion Rate
  tpr: number;  // Task Pass Rate
  alpha_score: number;  // 经济效益评分
  
  // 详细指标
  token_efficiency: number;  // TPR / tokens * 1000
  time_efficiency: number;   // TPR / time_seconds
  cost_efficiency: number;   // TPR / cost_usd
  
  // 按阶段分布
  stage_breakdown: {
    stage_id: string;
    success_rate: number;
    avg_duration_ms: number;
    avg_tokens: number;
  }[];
  
  // 错误分析
  failure_analysis: {
    category: string;
    count: number;
    percentage: number;
    common_errors: string[];
  }[];
}

// ==================== 比较类型 ====================

export interface BenchmarkComparison {
  baseline: {
    name: string;
    model: string;
    metrics: RepoMasterMetrics;
  };
  
  current: {
    name: string;
    model: string;
    metrics: RepoMasterMetrics;
  };
  
  improvements: {
    ecr_delta: number;
    tpr_delta: number;
    alpha_delta: number;
    token_reduction_percentage: number;
    time_reduction_percentage: number;
  };
}

// ==================== 实时更新类型 ====================

export interface BenchmarkStreamEvent {
  type: 
    | 'task_start'
    | 'stage_start'
    | 'stage_progress'
    | 'stage_complete'
    | 'stage_error'
    | 'task_complete'
    | 'task_error'
    | 'metrics_update'
    | 'batch_complete';
  
  timestamp: string;
  task_id?: string;
  stage_id?: string;
  
  data: {
    progress?: number;
    output?: string;
    error?: string;
    metrics?: Partial<RepoMasterMetrics>;
    result?: any;
  };
}

// ==================== 导出函数类型 ====================

export type BenchmarkLoaderFn = (
  type: 'gittaskbench' | 'swe_bench_verified' | 'mle_bench',
  options?: {
    limit?: number;
    difficulty?: string;
    domain?: string;
  }
) => Promise<(GitTaskBenchTask | SWEBenchTask | MLEBenchTask)[]>;

export type BenchmarkEvaluatorFn = (
  type: 'gittaskbench' | 'swe_bench_verified' | 'mle_bench',
  task_id: string,
  result: any,
  config: any
) => Promise<GitTaskBenchEvaluationResult | SWEBenchEvaluationResult | MLEBenchEvaluationResult>;
