// src/components/Benchmark/index.ts
// Benchmark组件导出文件
// 兼容现有组件，添加新的baloonet界面

// 现有组件
export { default as BenchmarkRunner } from './BenchmarkRunner';
export { default as EnhancedBenchmarkInterface } from './EnhancedBenchmarkInterface';

// 新增: baloonet非端到端Benchmark界面
export { default as RepoMasterBenchmarkInterface } from './RepoMasterBenchmarkInterface';

// 类型重导出
export type {
  BenchmarkTask,
  BenchmarkSession,
  BenchmarkConfig,
  BenchmarkType,
  ExecutionStep,
  BenchmarkMetrics,
  BenchmarkLog,
  RepoAnalysisResult
} from '@/types/benchmark';
