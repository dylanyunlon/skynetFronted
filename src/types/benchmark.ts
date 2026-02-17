// src/types/benchmark.ts - Benchmark类型定义
// v3: 支持GitTaskBench, MLE-bench + Tree抽象层
// SWE-bench暂不启用（需要120GB+磁盘空间）

export type BenchmarkType = 
  | 'swe_bench'
  | 'swe_bench_verified'
  | 'swe_bench_lite'
  | 'mle_bench'
  | 'mle_bench_lite'
  | 'gittaskbench'
  | 'custom';

export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SessionStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// 日志类型
export interface BenchmarkLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

// ==================== Tree抽象层 ====================

export interface TreeAbstraction {
  tree_content: string;
  flat_paths: string[];
  path_mapping: Record<string, string>;
  filtered_count: number;
  exclude_patterns: string[];
  generated_at: string;
}

export interface TreeConfig {
  exclude_patterns: string[];
  max_depth: number;
  include_hidden: boolean;
  file_extensions?: string[];
}

export const DEFAULT_TREE_CONFIG: TreeConfig = {
  exclude_patterns: [
    'node_modules', '__pycache__', '.git', '.venv', 'venv',
    'dist', 'build', '.cache', 'logs', 'log', 'dataset', 'data',
    '.pytest_cache', '.mypy_cache', 'htmlcov', '.tox',
    '*.pyc', '*.pyo', '*.egg-info', '.DS_Store'
  ],
  max_depth: 5,
  include_hidden: false,
  file_extensions: ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.go', '.rs']
};

// ==================== 任务定义 ====================

export interface BenchmarkTask {
  id: string;
  benchmark_type: BenchmarkType;
  name: string;
  description: string;
  difficulty: TaskDifficulty;
  domain: string;
  modality?: string;
  repo_url?: string;
  repository_url?: string;
  base_commit?: string;
  problem_statement?: string;
  hints_text?: string;
  test_patch?: string;
  fail_to_pass?: string[];
  pass_to_pass?: string[];
  competition_id?: string;
  kaggle_metric?: string;
  dataset_size_mb?: number;
  success_criteria?: {
    type: string;
    metric: string;
    threshold: number;
  };
  evaluation_script?: string;
  input_data?: Record<string, any>;
  expected_output?: string;
  market_value_usd?: number;
  metadata?: Record<string, any>;
}

// ==================== 执行步骤 ====================

export interface ExecutionStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  token_usage?: number;
  output?: string;
  error?: string;
  sub_steps?: {
    id: string;
    name: string;
    status: StepStatus;
    detail?: string;
    timestamp?: string;
  }[];
}

export const BENCHMARK_STAGES = [
  'repo_clone',
  'tree_analysis',
  'hierarchical_analysis',
  'key_component_identification',
  'context_building',
  'solution_generation',
  'code_extraction',
  'code_execution',
  'validation'
] as const;

export type BenchmarkStage = typeof BENCHMARK_STAGES[number];

// ==================== 指标 ====================

export interface BenchmarkMetrics {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_api_calls: number;
  total_duration_ms: number;
  estimated_cost_usd: number;
  execution_completion_rate: number;
  task_pass_rate: number;
  alpha_score: number;
  kaggle_score?: number;
  percentile?: number;
  medal?: 'gold' | 'silver' | 'bronze' | null;
  resolved?: boolean;
  tests_passed?: number;
  tests_failed?: number;
}

// ==================== 验证结果 ====================

export interface ValidationResult {
  passed: boolean;
  tests_run: number;
  tests_passed: number;
  tests_failed: number;
  score?: number;
  medal?: string;
  evaluation_mode?: string;
  details?: Record<string, any>;
  error?: string;
}

// ==================== 会话 ====================

export interface BenchmarkSession {
  id: string;
  task: BenchmarkTask;
  status: SessionStatus;
  started_at: string;
  completed_at?: string;
  stages: Record<string, {
    status: StepStatus;
    started_at?: string;
    completed_at?: string;
    duration_ms?: number;
    token_usage?: number;
    output?: string;
    error?: string;
    sub_steps?: any[];
  }>;
  current_stage: string;
  steps: ExecutionStep[];
  current_step_index: number;
  tree_abstraction?: TreeAbstraction;
  repo_analysis?: {
    repo_name?: string;
    stats?: {
      total_modules: number;
      total_functions: number;
      total_classes: number;
    };
    key_modules?: Array<{
      path: string;
      importance_score: number;
      description?: string;
    }>;
    entry_points?: string[];
  };
  code_explorations: any[];
  metrics: BenchmarkMetrics;
  logs: BenchmarkLog[];
  generated_code: Array<{
    language: string;
    content: string;
    filename?: string;
  }>;
  execution_results: Array<{
    index?: number;
    filename?: string;
    status: string;
    exit_code?: number;
    stdout?: string;
    stderr?: string;
    duration_ms?: number;
    success?: boolean;
  }>;
  validation_result?: ValidationResult;
  output_files?: string[];
  generated_patch?: string;
  generated_submission?: string;
}

// ==================== 请求/响应 ====================

export interface BenchmarkRunRequest {
  task_id: string;
  benchmark_type: BenchmarkType;
  config?: BenchmarkConfig;
  repository_url?: string;
  custom_task?: {
    name?: string;
    description: string;
    domain?: string;
    modality?: string;
    expected_output?: string;
    evaluation_script?: string;
  };
}

export interface BatchBenchmarkRequest {
  benchmark_types: BenchmarkType[];
  tasks_per_benchmark: number;
  config?: BenchmarkConfig;
}

// ==================== 配置 ====================

export interface BenchmarkConfig {
  model: string;
  timeout: number;
  max_iterations: number;
  use_docker?: boolean;
  parallel_execution?: boolean;
  enable_logging?: boolean;
  tree_config?: TreeConfig;
  temperature?: number;
  max_tokens?: number;
  context_window_size?: number;
}

export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  model: 'claude-sonnet-4-20250514',
  timeout: 600,
  max_iterations: 10,
  use_docker: false,
  parallel_execution: true,
  enable_logging: true,
  temperature: 0.3,
  max_tokens: 4000,
  tree_config: DEFAULT_TREE_CONFIG
};

// ==================== 流式事件 ====================

export interface BenchmarkStreamEvent {
  type: 'step_start' | 'step_progress' | 'step_complete' | 'step_error' | 
        'log' | 'metrics_update' | 'session_complete' | 'session_error' |
        'tree_update';
  data: any;
  timestamp: string;
}

// ==================== 仓库分析结果 ====================

export interface RepoAnalysisResult {
  repo_name: string;
  total_modules: number;
  total_classes: number;
  total_functions: number;
  total_lines: number;
  tree_abstraction?: TreeAbstraction;
  key_modules: {
    path: string;
    importance_score: number;
    description: string;
  }[];
  entry_points: {
    path: string;
    reason: string;
  }[];
  call_graph_nodes: number;
  structure_tree: string;
}

// ==================== Benchmark信息 ====================

export interface BenchmarkInfo {
  name: string;
  description: string;
  task_count: number;
  domains: string[];
  status: 'available' | 'disabled' | 'coming_soon';
  paper_url?: string;
  metrics?: string[];
  reason?: string;
}

export const BENCHMARK_INFO: Record<BenchmarkType, BenchmarkInfo> = {
  gittaskbench: {
    name: 'GitTaskBench',
    description: '54个仓库级真实世界任务，覆盖图像、语音、文档等7个领域',
    task_count: 54,
    domains: ['image_processing', 'speech_processing', 'document_processing', 'web_scraping', 'security', 'biomedical', 'video_processing'],
    status: 'available',
    paper_url: 'https://arxiv.org/abs/2508.18993',
    metrics: ['ECR (执行完成率)', 'TPR (任务通过率)', 'α-score (经济效益)']
  },
  mle_bench: {
    name: 'MLE-bench',
    description: '75个Kaggle机器学习竞赛任务',
    task_count: 75,
    domains: ['classification', 'regression', 'nlp', 'computer_vision', 'time_series', 'audio'],
    status: 'available',
    paper_url: 'https://github.com/openai/mle-bench',
    metrics: ['Any Medal (%)', 'Bronze/Silver/Gold Rate']
  },
  mle_bench_lite: {
    name: 'MLE-bench Lite',
    description: '22个低复杂度Kaggle任务（快速测试）',
    task_count: 22,
    domains: ['classification', 'regression', 'tabular'],
    status: 'available'
  },
  swe_bench: {
    name: 'SWE-bench',
    description: '2,294个真实GitHub issue修复任务',
    task_count: 2294,
    domains: ['django', 'flask', 'requests', 'scikit-learn', 'matplotlib', 'numpy', 'pandas'],
    status: 'disabled',
    reason: '需要120GB+磁盘空间和Docker full模式'
  },
  swe_bench_verified: {
    name: 'SWE-bench Verified',
    description: '500个人工验证的高质量任务',
    task_count: 500,
    domains: ['django', 'flask', 'requests', 'scikit-learn', 'matplotlib'],
    status: 'disabled',
    reason: '需要120GB+磁盘空间和Docker full模式'
  },
  swe_bench_lite: {
    name: 'SWE-bench Lite',
    description: '300个精选的轻量级任务',
    task_count: 300,
    domains: ['django', 'flask', 'requests', 'sympy', 'pytest'],
    status: 'disabled',
    reason: '需要大磁盘空间'
  },
  custom: {
    name: '自定义任务',
    description: '用户自定义的测试任务',
    task_count: 0,
    domains: [],
    status: 'available'
  }
};

// 阶段名称映射
export const STAGE_NAMES: Record<string, string> = {
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

// 示例任务列表
export const SAMPLE_BENCHMARK_TASKS: BenchmarkTask[] = [
  {
    id: "gittaskbench_basicsr_01",
    benchmark_type: "gittaskbench",
    name: "图像修复 - BasicSR",
    description: "使用深度学习模型修复损坏或有噪声的图像",
    difficulty: "hard",
    domain: "image_processing",
    modality: "image",
    repository_url: "https://github.com/XPixelGroup/BasicSR"
  },
  {
    id: "gittaskbench_whisper_01",
    benchmark_type: "gittaskbench",
    name: "Whisper语音识别",
    description: "使用Whisper模型将语音转换为文本",
    difficulty: "easy",
    domain: "speech_processing",
    modality: "audio",
    repository_url: "https://github.com/openai/whisper"
  },
  {
    id: "mle_bench_titanic",
    benchmark_type: "mle_bench",
    name: "Titanic 生存预测",
    description: "预测泰坦尼克号乘客的生存概率",
    difficulty: "easy",
    domain: "classification",
    modality: "tabular",
    competition_id: "titanic"
  },
  {
    id: "gittaskbench_pdf_email_01",
    benchmark_type: "gittaskbench",
    name: "PDF邮箱提取",
    description: "从PDF文档中提取所有邮箱地址",
    difficulty: "easy",
    domain: "document_processing",
    modality: "document",
    repository_url: "https://github.com/pymupdf/PyMuPDF"
  }
];