/**
 * TDD v19 — Module 1: CodeExecutionEngine
 * 
 * Manages code execution lifecycle: language detection, sandbox state,
 * execution queueing, output streaming, and exit code handling.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  createExecutionContext,
  ExecutionContext,
  ExecutionStatus,
  queueExecution,
  ExecutionQueue,
  createExecutionQueue,
  resolveExecution,
  getQueueStats,
  formatExitCode,
  parseExecutionOutput,
  ExecutionOutput,
  estimateExecutionComplexity,
  mergeExecutionOutputs,
} from '@/utils/codeExecutionEngine';

describe('CodeExecutionEngine', () => {

  // ─── Test 1: detectLanguage from command string ───
  describe('detectLanguage', () => {
    it('should detect python from python3/python commands and .py files', () => {
      expect(detectLanguage('python3 script.py')).toBe('python');
      expect(detectLanguage('python -c "print(1)"')).toBe('python');
      expect(detectLanguage('pip install requests')).toBe('python');
      expect(detectLanguage('pytest tests/')).toBe('python');
    });

    it('should detect node/javascript from node/npm/npx commands', () => {
      expect(detectLanguage('node server.js')).toBe('javascript');
      expect(detectLanguage('npm run build')).toBe('javascript');
      expect(detectLanguage('npx vitest run')).toBe('javascript');
      expect(detectLanguage('yarn add react')).toBe('javascript');
    });

    it('should detect bash/shell for generic commands', () => {
      expect(detectLanguage('ls -la')).toBe('bash');
      expect(detectLanguage('cat /etc/hosts')).toBe('bash');
      expect(detectLanguage('grep -r "TODO" src/')).toBe('bash');
      expect(detectLanguage('cd /home && mkdir test')).toBe('bash');
    });

    it('should detect specialized languages', () => {
      expect(detectLanguage('rustc main.rs')).toBe('rust');
      expect(detectLanguage('cargo build --release')).toBe('rust');
      expect(detectLanguage('go run main.go')).toBe('go');
      expect(detectLanguage('javac Main.java')).toBe('java');
      expect(detectLanguage('gcc -o main main.c')).toBe('c');
      expect(detectLanguage('g++ -o main main.cpp')).toBe('cpp');
    });

    it('should return bash for unrecognized commands', () => {
      expect(detectLanguage('')).toBe('bash');
      expect(detectLanguage('some-unknown-binary')).toBe('bash');
    });
  });

  // ─── Test 2: createExecutionContext ───
  describe('createExecutionContext', () => {
    it('should create a valid context with defaults', () => {
      const ctx = createExecutionContext('echo hello');
      expect(ctx.id).toBeTruthy();
      expect(ctx.command).toBe('echo hello');
      expect(ctx.language).toBe('bash');
      expect(ctx.status).toBe('pending');
      expect(ctx.createdAt).toBeGreaterThan(0);
      expect(ctx.output).toBeNull();
      expect(ctx.exitCode).toBeNull();
    });

    it('should auto-detect language and accept overrides', () => {
      const ctx1 = createExecutionContext('python3 train.py');
      expect(ctx1.language).toBe('python');

      const ctx2 = createExecutionContext('python3 train.py', { language: 'bash' });
      expect(ctx2.language).toBe('bash'); // override wins
    });

    it('should generate unique IDs for each context', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) {
        ids.add(createExecutionContext(`cmd_${i}`).id);
      }
      expect(ids.size).toBe(50);
    });
  });

  // ─── Test 3: ExecutionQueue — queueing and ordering ───
  describe('ExecutionQueue', () => {
    it('should queue executions in FIFO order', () => {
      let queue = createExecutionQueue();
      queue = queueExecution(queue, createExecutionContext('cmd1'));
      queue = queueExecution(queue, createExecutionContext('cmd2'));
      queue = queueExecution(queue, createExecutionContext('cmd3'));
      expect(queue.pending.length).toBe(3);
      expect(queue.pending[0].command).toBe('cmd1');
      expect(queue.pending[2].command).toBe('cmd3');
    });

    it('should move execution from pending to active on resolve start', () => {
      let queue = createExecutionQueue();
      const ctx = createExecutionContext('test_cmd');
      queue = queueExecution(queue, ctx);
      expect(queue.pending.length).toBe(1);
      expect(queue.active.length).toBe(0);

      queue = resolveExecution(queue, ctx.id, 'running');
      expect(queue.pending.length).toBe(0);
      expect(queue.active.length).toBe(1);
      expect(queue.active[0].status).toBe('running');
    });

    it('should move execution from active to completed on resolve done', () => {
      let queue = createExecutionQueue();
      const ctx = createExecutionContext('final_cmd');
      queue = queueExecution(queue, ctx);
      queue = resolveExecution(queue, ctx.id, 'running');
      queue = resolveExecution(queue, ctx.id, 'completed', { exitCode: 0 });
      expect(queue.active.length).toBe(0);
      expect(queue.completed.length).toBe(1);
      expect(queue.completed[0].exitCode).toBe(0);
      expect(queue.completed[0].status).toBe('completed');
    });
  });

  // ─── Test 4: getQueueStats ───
  describe('getQueueStats', () => {
    it('should compute correct stats for mixed queue', () => {
      let queue = createExecutionQueue();
      // 2 pending, 1 active, 3 completed (1 failed)
      queue = queueExecution(queue, createExecutionContext('p1'));
      queue = queueExecution(queue, createExecutionContext('p2'));

      const a1 = createExecutionContext('a1');
      queue = queueExecution(queue, a1);
      queue = resolveExecution(queue, a1.id, 'running');

      const c1 = createExecutionContext('c1');
      queue = queueExecution(queue, c1);
      queue = resolveExecution(queue, c1.id, 'running');
      queue = resolveExecution(queue, c1.id, 'completed', { exitCode: 0 });

      const c2 = createExecutionContext('c2');
      queue = queueExecution(queue, c2);
      queue = resolveExecution(queue, c2.id, 'running');
      queue = resolveExecution(queue, c2.id, 'completed', { exitCode: 0 });

      const c3 = createExecutionContext('c3');
      queue = queueExecution(queue, c3);
      queue = resolveExecution(queue, c3.id, 'running');
      queue = resolveExecution(queue, c3.id, 'failed', { exitCode: 1 });

      const stats = getQueueStats(queue);
      expect(stats.pending).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.completed).toBe(3);
      expect(stats.failed).toBe(1);
      expect(stats.succeeded).toBe(2);
      expect(stats.total).toBe(6);
    });
  });

  // ─── Test 5: formatExitCode ───
  describe('formatExitCode', () => {
    it('should format common exit codes with human-readable messages', () => {
      expect(formatExitCode(0)).toEqual({ code: 0, label: 'Success', severity: 'success' });
      expect(formatExitCode(1)).toEqual({ code: 1, label: 'General error', severity: 'error' });
      expect(formatExitCode(2)).toEqual({ code: 2, label: 'Misuse of shell command', severity: 'error' });
      expect(formatExitCode(126)).toEqual({ code: 126, label: 'Permission denied', severity: 'error' });
      expect(formatExitCode(127)).toEqual({ code: 127, label: 'Command not found', severity: 'error' });
      expect(formatExitCode(130)).toEqual({ code: 130, label: 'Interrupted (Ctrl+C)', severity: 'warning' });
      expect(formatExitCode(137)).toEqual({ code: 137, label: 'Killed (OOM or SIGKILL)', severity: 'error' });
      expect(formatExitCode(143)).toEqual({ code: 143, label: 'Terminated (SIGTERM)', severity: 'warning' });
    });

    it('should handle unknown exit codes gracefully', () => {
      const result = formatExitCode(42);
      expect(result.code).toBe(42);
      expect(result.severity).toBe('error');
      expect(result.label).toContain('42');
    });

    it('should handle null/undefined exit codes', () => {
      expect(formatExitCode(null as any).severity).toBe('unknown');
      expect(formatExitCode(undefined as any).severity).toBe('unknown');
    });
  });

  // ─── Test 6: parseExecutionOutput ───
  describe('parseExecutionOutput', () => {
    it('should parse JSON-formatted bash output', () => {
      const json = JSON.stringify({ returncode: 0, stdout: 'hello\nworld', stderr: '' });
      const result = parseExecutionOutput(json, 'bash_tool');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('hello\nworld');
      expect(result.stderr).toBe('');
      expect(result.success).toBe(true);
      expect(result.lineCount).toBe(2);
    });

    it('should parse failed bash output with stderr', () => {
      const json = JSON.stringify({ returncode: 1, stdout: '', stderr: 'Error: file not found' });
      const result = parseExecutionOutput(json, 'bash_tool');
      expect(result.exitCode).toBe(1);
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('file not found');
    });

    it('should handle non-JSON text output gracefully', () => {
      const result = parseExecutionOutput('plain text output', 'bash');
      expect(result.stdout).toBe('plain text output');
      expect(result.exitCode).toBe(0);
      expect(result.success).toBe(true);
    });

    it('should truncate very long outputs and set truncated flag', () => {
      const longOutput = 'x'.repeat(50000);
      const json = JSON.stringify({ returncode: 0, stdout: longOutput, stderr: '' });
      const result = parseExecutionOutput(json, 'bash_tool');
      expect(result.truncated).toBe(true);
      expect(result.stdout.length).toBeLessThanOrEqual(20000);
    });
  });

  // ─── Test 7: estimateExecutionComplexity ───
  describe('estimateExecutionComplexity', () => {
    it('should rate simple commands as low complexity', () => {
      expect(estimateExecutionComplexity('echo hello')).toBe('low');
      expect(estimateExecutionComplexity('ls -la')).toBe('low');
      expect(estimateExecutionComplexity('cat file.txt')).toBe('low');
      expect(estimateExecutionComplexity('pwd')).toBe('low');
    });

    it('should rate build/install commands as medium complexity', () => {
      expect(estimateExecutionComplexity('npm install')).toBe('medium');
      expect(estimateExecutionComplexity('pip install pandas --break-system-packages')).toBe('medium');
      expect(estimateExecutionComplexity('npm run build')).toBe('medium');
      expect(estimateExecutionComplexity('cargo build')).toBe('medium');
    });

    it('should rate test suites and multi-step pipelines as high complexity', () => {
      expect(estimateExecutionComplexity('pytest tests/ -v --cov')).toBe('high');
      expect(estimateExecutionComplexity('npm run build && npm run test && npm run lint')).toBe('high');
      expect(estimateExecutionComplexity('docker compose up --build -d')).toBe('high');
    });
  });

  // ─── Test 8: mergeExecutionOutputs ───
  describe('mergeExecutionOutputs', () => {
    it('should merge multiple outputs into a single combined output', () => {
      const outputs: ExecutionOutput[] = [
        { exitCode: 0, stdout: 'step1 ok', stderr: '', success: true, lineCount: 1, truncated: false, language: 'bash' },
        { exitCode: 0, stdout: 'step2 ok', stderr: '', success: true, lineCount: 1, truncated: false, language: 'bash' },
        { exitCode: 1, stdout: '', stderr: 'step3 failed', success: false, lineCount: 1, truncated: false, language: 'bash' },
      ];
      const merged = mergeExecutionOutputs(outputs);
      expect(merged.success).toBe(false); // any failure → overall failure
      expect(merged.exitCode).toBe(1); // last non-zero
      expect(merged.stdout).toContain('step1 ok');
      expect(merged.stdout).toContain('step2 ok');
      expect(merged.stderr).toContain('step3 failed');
      expect(merged.lineCount).toBe(3);
    });

    it('should handle empty outputs array', () => {
      const merged = mergeExecutionOutputs([]);
      expect(merged.success).toBe(true);
      expect(merged.exitCode).toBe(0);
      expect(merged.stdout).toBe('');
    });
  });

  // ─── Test 9: ExecutionContext state transitions ───
  describe('ExecutionContext state transitions', () => {
    it('should only allow valid transitions: pending→running→completed/failed', () => {
      let queue = createExecutionQueue();
      const ctx = createExecutionContext('test');
      queue = queueExecution(queue, ctx);

      // pending → completed directly should still work (skip running)
      queue = resolveExecution(queue, ctx.id, 'completed', { exitCode: 0 });
      expect(queue.completed.length).toBe(1);
    });

    it('should handle resolving non-existent ID gracefully', () => {
      let queue = createExecutionQueue();
      // Should not throw
      queue = resolveExecution(queue, 'non-existent-id', 'running');
      expect(queue.pending.length).toBe(0);
      expect(queue.active.length).toBe(0);
    });
  });

  // ─── Test 10: Complex pipeline parsing ───
  describe('complex execution scenarios', () => {
    it('should handle piped commands and detect correct language', () => {
      expect(detectLanguage('cat file.py | python3')).toBe('python');
      expect(detectLanguage('find . -name "*.ts" | wc -l')).toBe('bash');
      expect(detectLanguage('npm test 2>&1 | tee output.log')).toBe('javascript');
    });

    it('should create context with working directory and env overrides', () => {
      const ctx = createExecutionContext('npm test', {
        workDir: '/home/project',
        env: { NODE_ENV: 'test' },
        timeout: 30000,
      });
      expect(ctx.workDir).toBe('/home/project');
      expect(ctx.env).toEqual({ NODE_ENV: 'test' });
      expect(ctx.timeout).toBe(30000);
    });
  });
});
