/**
 * TDD v20 — Module 1: CodeExecutionPanelLogic
 * 
 * Tests for the logic layer that connects CodeExecutionEngine,
 * StreamingCodeOutput, and SandboxStateManager into a unified panel state.
 * 
 * This module should:
 * - Create a unified panel state from sandbox + execution queue + output buffer
 * - Submit code for execution (queue + sandbox status transition)
 * - Stream output lines into the buffer and format for display
 * - Track execution history with timing and exit codes
 * - Handle multiple concurrent executions with ordering
 * - Provide formatted panel summary (stats, active/idle, uptime)
 * - Cancel running executions
 * - Clear output buffer
 * - Detect and display progress bars from streaming output
 * - Export execution history for debugging
 */
import { describe, it, expect } from 'vitest';

// Module under test — does NOT exist yet (TDD red phase)
import {
  createPanelState,
  submitExecution,
  appendOutput,
  getExecutionHistory,
  cancelExecution,
  clearOutput,
  getPanelSummary,
  detectProgressFromOutput,
  exportPanelHistory,
  getActiveExecution,
  type CodeExecutionPanelState,
  type PanelSummary,
  type ExecutionHistoryEntry,
} from '@/utils/codeExecutionPanelLogic';

describe('CodeExecutionPanelLogic', () => {
  // ======= Test 1: createPanelState =======
  describe('createPanelState', () => {
    it('should create a panel state with empty defaults', () => {
      const state = createPanelState();
      expect(state).toBeDefined();
      expect(state.executions).toEqual([]);
      expect(state.outputBuffer).toBeDefined();
      expect(state.sandboxStatus).toBe('ready');
      expect(state.isExecuting).toBe(false);
    });

    it('should accept optional sandbox config', () => {
      const state = createPanelState({ workDir: '/tmp/test' });
      expect(state.sandboxWorkDir).toBe('/tmp/test');
    });
  });

  // ======= Test 2: submitExecution =======
  describe('submitExecution', () => {
    it('should add an execution to the queue and transition to executing', () => {
      const state = createPanelState();
      const next = submitExecution(state, 'echo hello', 'bash');
      expect(next.executions.length).toBe(1);
      expect(next.executions[0].command).toBe('echo hello');
      expect(next.executions[0].language).toBe('bash');
      expect(next.executions[0].status).toBe('running');
      expect(next.isExecuting).toBe(true);
      expect(next.sandboxStatus).toBe('executing');
    });

    it('should auto-detect language when not provided', () => {
      const state = createPanelState();
      const next = submitExecution(state, 'python3 train.py');
      expect(next.executions[0].language).toBe('python');
    });

    it('should assign sequential execution IDs', () => {
      let state = createPanelState();
      state = submitExecution(state, 'cmd1', 'bash');
      state = submitExecution(state, 'cmd2', 'bash');
      expect(state.executions[0].id).not.toBe(state.executions[1].id);
    });

    it('should record start timestamp', () => {
      const state = createPanelState();
      const before = Date.now();
      const next = submitExecution(state, 'ls');
      const after = Date.now();
      expect(next.executions[0].startedAt).toBeGreaterThanOrEqual(before);
      expect(next.executions[0].startedAt).toBeLessThanOrEqual(after);
    });
  });

  // ======= Test 3: appendOutput =======
  describe('appendOutput', () => {
    it('should append stdout chunks to the output buffer', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo hello', 'bash');
      const execId = state.executions[0].id;
      state = appendOutput(state, execId, 'hello\nworld\n', 'stdout');
      expect(state.outputBuffer.lines.length).toBe(2);
      expect(state.outputBuffer.lines[0].text).toBe('hello');
      expect(state.outputBuffer.lines[1].text).toBe('world');
    });

    it('should append stderr chunks with error type', () => {
      let state = createPanelState();
      state = submitExecution(state, 'bad_cmd', 'bash');
      const execId = state.executions[0].id;
      state = appendOutput(state, execId, 'command not found\n', 'stderr');
      expect(state.outputBuffer.lines[0].type).toBe('error');
    });

    it('should strip ANSI codes from output', () => {
      let state = createPanelState();
      state = submitExecution(state, 'ls --color', 'bash');
      const execId = state.executions[0].id;
      state = appendOutput(state, execId, '\x1b[32mgreen\x1b[0m\n', 'stdout');
      expect(state.outputBuffer.lines[0].text).toBe('green');
    });
  });

  // ======= Test 4: getExecutionHistory =======
  describe('getExecutionHistory', () => {
    it('should return empty array for fresh state', () => {
      const state = createPanelState();
      expect(getExecutionHistory(state)).toEqual([]);
    });

    it('should return completed executions with timing info', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo ok', 'bash');
      const execId = state.executions[0].id;
      // Simulate completion
      state = {
        ...state,
        executions: state.executions.map(e =>
          e.id === execId
            ? { ...e, status: 'completed' as const, exitCode: 0, completedAt: Date.now() }
            : e
        ),
        isExecuting: false,
        sandboxStatus: 'ready',
      };
      const history = getExecutionHistory(state);
      expect(history.length).toBe(1);
      expect(history[0].exitCode).toBe(0);
      expect(history[0].command).toBe('echo ok');
    });
  });

  // ======= Test 5: cancelExecution =======
  describe('cancelExecution', () => {
    it('should mark a running execution as failed with cancel reason', () => {
      let state = createPanelState();
      state = submitExecution(state, 'sleep 100', 'bash');
      const execId = state.executions[0].id;
      state = cancelExecution(state, execId);
      expect(state.executions[0].status).toBe('failed');
      expect(state.executions[0].cancelledAt).toBeDefined();
      expect(state.isExecuting).toBe(false);
    });

    it('should not affect completed executions', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo done', 'bash');
      const execId = state.executions[0].id;
      state = {
        ...state,
        executions: state.executions.map(e =>
          e.id === execId ? { ...e, status: 'completed' as const, exitCode: 0 } : e
        ),
        isExecuting: false,
      };
      const before = { ...state.executions[0] };
      state = cancelExecution(state, execId);
      expect(state.executions[0].status).toBe('completed');
      expect(state.executions[0].exitCode).toBe(before.exitCode);
    });
  });

  // ======= Test 6: clearOutput =======
  describe('clearOutput', () => {
    it('should clear all output buffer lines', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo hello', 'bash');
      const execId = state.executions[0].id;
      state = appendOutput(state, execId, 'hello\nworld\n', 'stdout');
      expect(state.outputBuffer.lines.length).toBe(2);
      state = clearOutput(state);
      expect(state.outputBuffer.lines.length).toBe(0);
    });
  });

  // ======= Test 7: getPanelSummary =======
  describe('getPanelSummary', () => {
    it('should return idle summary for fresh state', () => {
      const state = createPanelState();
      const summary = getPanelSummary(state);
      expect(summary.status).toBe('idle');
      expect(summary.totalExecutions).toBe(0);
      expect(summary.activeCount).toBe(0);
    });

    it('should return executing summary with active count', () => {
      let state = createPanelState();
      state = submitExecution(state, 'npm test', 'bash');
      state = submitExecution(state, 'npm build', 'bash');
      const summary = getPanelSummary(state);
      expect(summary.status).toBe('executing');
      expect(summary.totalExecutions).toBe(2);
      expect(summary.activeCount).toBe(2);
    });

    it('should include output line count in summary', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo hi', 'bash');
      const execId = state.executions[0].id;
      state = appendOutput(state, execId, 'line1\nline2\nline3\n', 'stdout');
      const summary = getPanelSummary(state);
      expect(summary.outputLineCount).toBe(3);
    });
  });

  // ======= Test 8: detectProgressFromOutput =======
  describe('detectProgressFromOutput', () => {
    it('should detect a progress bar pattern', () => {
      const progress = detectProgressFromOutput('Downloading [####----] 50%');
      expect(progress).not.toBeNull();
      expect(progress!.percentage).toBe(50);
    });

    it('should return null for non-progress lines', () => {
      const progress = detectProgressFromOutput('hello world');
      expect(progress).toBeNull();
    });

    it('should detect npm/pip style progress', () => {
      const progress = detectProgressFromOutput('Installing packages... 75% complete');
      expect(progress).not.toBeNull();
      expect(progress!.percentage).toBe(75);
    });
  });

  // ======= Test 9: exportPanelHistory =======
  describe('exportPanelHistory', () => {
    it('should export as JSON string with all executions', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo 1', 'bash');
      state = submitExecution(state, 'echo 2', 'bash');
      const json = exportPanelHistory(state);
      const parsed = JSON.parse(json);
      expect(parsed.executions).toHaveLength(2);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should include output buffer in export', () => {
      let state = createPanelState();
      state = submitExecution(state, 'echo hi', 'bash');
      const execId = state.executions[0].id;
      state = appendOutput(state, execId, 'hi\n', 'stdout');
      const json = exportPanelHistory(state);
      const parsed = JSON.parse(json);
      expect(parsed.outputLines).toHaveLength(1);
    });
  });

  // ======= Test 10: getActiveExecution =======
  describe('getActiveExecution', () => {
    it('should return null when no executions are running', () => {
      const state = createPanelState();
      expect(getActiveExecution(state)).toBeNull();
    });

    it('should return the most recent running execution', () => {
      let state = createPanelState();
      state = submitExecution(state, 'cmd1', 'bash');
      state = submitExecution(state, 'cmd2', 'bash');
      const active = getActiveExecution(state);
      expect(active).not.toBeNull();
      expect(active!.command).toBe('cmd2');
    });
  });
});
