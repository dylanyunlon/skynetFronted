/**
 * TDD v19 — Module 8: ExecutionMetrics
 * 
 * Tracks execution timing, resource usage, cost estimation, and generates
 * session-level performance reports for code execution sessions.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  ExecutionTimer,
  createExecutionTimer,
  startTimer,
  stopTimer,
  getElapsed,
  SessionMetrics,
  createSessionMetrics,
  recordExecution,
  getSessionSummary,
  SessionSummary,
  estimateCost,
  CostEstimate,
  calculateThroughput,
  Throughput,
  getExecutionTimeline,
  TimelineEvent,
  formatDuration,
  formatBytes,
  getTopSlowCommands,
} from '@/utils/executionMetrics';

describe('ExecutionMetrics', () => {

  // ─── Test 1: ExecutionTimer ───
  describe('ExecutionTimer', () => {
    it('should track start and stop times', () => {
      let timer = createExecutionTimer();
      expect(timer.startTime).toBeNull();

      timer = startTimer(timer);
      expect(timer.startTime).toBeGreaterThan(0);
      expect(timer.isRunning).toBe(true);

      timer = stopTimer(timer);
      expect(timer.stopTime).toBeGreaterThan(0);
      expect(timer.isRunning).toBe(false);
      expect(timer.stopTime!).toBeGreaterThanOrEqual(timer.startTime!);
    });

    it('should compute elapsed time', () => {
      let timer = createExecutionTimer();
      timer = startTimer(timer);

      const elapsed = getElapsed(timer);
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(1000);
    });

    it('should handle double-start gracefully (reset)', () => {
      let timer = createExecutionTimer();
      timer = startTimer(timer);
      const first = timer.startTime;
      timer = startTimer(timer); // should reset
      expect(timer.startTime).toBeGreaterThanOrEqual(first!);
    });

    it('should handle stop without start', () => {
      let timer = createExecutionTimer();
      timer = stopTimer(timer); // no-op
      expect(timer.stopTime).toBeNull();
      expect(timer.isRunning).toBe(false);
    });
  });

  // ─── Test 2: createSessionMetrics and recordExecution ───
  describe('SessionMetrics', () => {
    it('should record execution entries', () => {
      let metrics = createSessionMetrics();
      metrics = recordExecution(metrics, {
        command: 'npm test',
        durationMs: 5000,
        exitCode: 0,
        success: true,
        tool: 'bash_tool',
      });
      metrics = recordExecution(metrics, {
        command: 'npm run build',
        durationMs: 12000,
        exitCode: 0,
        success: true,
        tool: 'bash_tool',
      });
      expect(metrics.executions.length).toBe(2);
    });
  });

  // ─── Test 3: getSessionSummary ───
  describe('getSessionSummary', () => {
    it('should compute aggregate statistics', () => {
      let metrics = createSessionMetrics();
      metrics = recordExecution(metrics, { command: 'echo 1', durationMs: 100, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'echo 2', durationMs: 200, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'bad cmd', durationMs: 50, exitCode: 1, success: false, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'edit file', durationMs: 300, exitCode: 0, success: true, tool: 'str_replace' });

      const summary = getSessionSummary(metrics);
      expect(summary.totalExecutions).toBe(4);
      expect(summary.successCount).toBe(3);
      expect(summary.failCount).toBe(1);
      expect(summary.totalDurationMs).toBe(650);
      expect(summary.avgDurationMs).toBeCloseTo(162.5, 0);
      expect(summary.successRate).toBeCloseTo(0.75, 2);
    });

    it('should handle empty session', () => {
      const summary = getSessionSummary(createSessionMetrics());
      expect(summary.totalExecutions).toBe(0);
      expect(summary.successRate).toBe(1); // no failures = 100%
      expect(summary.totalDurationMs).toBe(0);
    });
  });

  // ─── Test 4: estimateCost ───
  describe('estimateCost', () => {
    it('should estimate cost based on input/output tokens', () => {
      const cost = estimateCost({
        inputTokens: 10000,
        outputTokens: 5000,
        model: 'claude-sonnet-4-20250514',
      });
      expect(cost.inputCost).toBeGreaterThan(0);
      expect(cost.outputCost).toBeGreaterThan(0);
      expect(cost.totalCost).toBe(cost.inputCost + cost.outputCost);
      expect(cost.currency).toBe('USD');
    });

    it('should handle different models with different pricing', () => {
      const sonnetCost = estimateCost({ inputTokens: 1000, outputTokens: 1000, model: 'claude-sonnet-4-20250514' });
      const opusCost = estimateCost({ inputTokens: 1000, outputTokens: 1000, model: 'claude-opus-4-20250514' });
      // Opus should be more expensive
      expect(opusCost.totalCost).toBeGreaterThan(sonnetCost.totalCost);
    });

    it('should handle zero tokens', () => {
      const cost = estimateCost({ inputTokens: 0, outputTokens: 0, model: 'claude-sonnet-4-20250514' });
      expect(cost.totalCost).toBe(0);
    });

    it('should handle unknown model with fallback pricing', () => {
      const cost = estimateCost({ inputTokens: 1000, outputTokens: 1000, model: 'unknown-model' });
      expect(cost.totalCost).toBeGreaterThan(0); // should use fallback
    });
  });

  // ─── Test 5: calculateThroughput ───
  describe('calculateThroughput', () => {
    it('should calculate commands per minute', () => {
      let metrics = createSessionMetrics();
      // 10 commands in 60 seconds
      for (let i = 0; i < 10; i++) {
        metrics = recordExecution(metrics, {
          command: `cmd ${i}`, durationMs: 6000, exitCode: 0, success: true, tool: 'bash_tool',
        });
      }

      const throughput = calculateThroughput(metrics);
      expect(throughput.commandsPerMinute).toBeGreaterThan(0);
      expect(throughput.avgCommandDurationMs).toBe(6000);
    });
  });

  // ─── Test 6: getExecutionTimeline ───
  describe('getExecutionTimeline', () => {
    it('should produce ordered timeline of events', () => {
      let metrics = createSessionMetrics();
      metrics = recordExecution(metrics, { command: 'first', durationMs: 100, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'second', durationMs: 200, exitCode: 0, success: true, tool: 'str_replace' });
      metrics = recordExecution(metrics, { command: 'third', durationMs: 50, exitCode: 1, success: false, tool: 'bash_tool' });

      const timeline = getExecutionTimeline(metrics);
      expect(timeline.length).toBe(3);
      expect(timeline[0].command).toBe('first');
      expect(timeline[2].command).toBe('third');
      expect(timeline[2].success).toBe(false);
    });
  });

  // ─── Test 7: formatDuration ───
  describe('formatDuration', () => {
    it('should format milliseconds to human-readable string', () => {
      expect(formatDuration(500)).toBe('0.5s');
      expect(formatDuration(1000)).toBe('1.0s');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(60000)).toBe('1m 0s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(3661000)).toBe('1h 1m 1s');
    });

    it('should handle zero and small values', () => {
      expect(formatDuration(0)).toBe('0.0s');
      expect(formatDuration(50)).toBe('0.1s');
    });
  });

  // ─── Test 8: formatBytes ───
  describe('formatBytes', () => {
    it('should format bytes to human-readable string', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1048576)).toBe('1.0 MB');
      expect(formatBytes(1073741824)).toBe('1.0 GB');
    });
  });

  // ─── Test 9: getTopSlowCommands ───
  describe('getTopSlowCommands', () => {
    it('should return top N slowest commands', () => {
      let metrics = createSessionMetrics();
      metrics = recordExecution(metrics, { command: 'fast', durationMs: 100, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'medium', durationMs: 5000, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'slow', durationMs: 30000, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'slowest', durationMs: 60000, exitCode: 0, success: true, tool: 'bash_tool' });

      const top3 = getTopSlowCommands(metrics, 3);
      expect(top3.length).toBe(3);
      expect(top3[0].command).toBe('slowest');
      expect(top3[1].command).toBe('slow');
      expect(top3[2].command).toBe('medium');
    });
  });

  // ─── Test 10: Session metrics with tool breakdown ───
  describe('Session metrics tool breakdown', () => {
    it('should break down metrics by tool type', () => {
      let metrics = createSessionMetrics();
      metrics = recordExecution(metrics, { command: 'npm test', durationMs: 5000, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'cd src', durationMs: 100, exitCode: 0, success: true, tool: 'bash_tool' });
      metrics = recordExecution(metrics, { command: 'edit file', durationMs: 200, exitCode: 0, success: true, tool: 'str_replace' });
      metrics = recordExecution(metrics, { command: 'create file', durationMs: 150, exitCode: 0, success: true, tool: 'create_file' });
      metrics = recordExecution(metrics, { command: 'view file', durationMs: 50, exitCode: 0, success: true, tool: 'view' });

      const summary = getSessionSummary(metrics);
      expect(summary.byTool).toBeDefined();
      expect(summary.byTool!['bash_tool']).toBe(2);
      expect(summary.byTool!['str_replace']).toBe(1);
      expect(summary.byTool!['create_file']).toBe(1);
      expect(summary.byTool!['view']).toBe(1);
    });
  });
});
