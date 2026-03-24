/**
 * TDD v19 — Module 10: SessionStateManager
 * 
 * Manages the complete agent session state: combines execution engine,
 * file operations, package installs, sandbox, capabilities into a single
 * coherent session object. Handles session lifecycle and persistence.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  AgentSession,
  createAgentSession,
  SessionPhase,
  updateSessionPhase,
  addSessionMessage,
  SessionMessage,
  getSessionMessages,
  addSessionToolCall,
  SessionToolCall,
  getSessionToolCalls,
  getSessionDuration,
  getSessionStats,
  SessionStats,
  exportSession,
  importSession,
  createSessionSnapshot,
  restoreSessionSnapshot,
  SessionSnapshot,
  formatSessionReport,
  isSessionActive,
} from '@/utils/sessionStateManager';

describe('SessionStateManager', () => {

  // ─── Test 1: createAgentSession ───
  describe('createAgentSession', () => {
    it('should create a new session with default state', () => {
      const session = createAgentSession();
      expect(session.id).toBeTruthy();
      expect(session.phase).toBe('idle');
      expect(session.messages).toEqual([]);
      expect(session.toolCalls).toEqual([]);
      expect(session.createdAt).toBeGreaterThan(0);
      expect(session.model).toBe('');
    });

    it('should accept initial config', () => {
      const session = createAgentSession({
        model: 'claude-sonnet-4-20250514',
        workDir: '/home/claude/project',
      });
      expect(session.model).toBe('claude-sonnet-4-20250514');
      expect(session.workDir).toBe('/home/claude/project');
    });

    it('should generate unique session IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 30; i++) {
        ids.add(createAgentSession().id);
      }
      expect(ids.size).toBe(30);
    });
  });

  // ─── Test 2: updateSessionPhase ───
  describe('updateSessionPhase', () => {
    it('should transition through valid phases', () => {
      let session = createAgentSession();
      expect(session.phase).toBe('idle');

      session = updateSessionPhase(session, 'thinking');
      expect(session.phase).toBe('thinking');

      session = updateSessionPhase(session, 'executing');
      expect(session.phase).toBe('executing');

      session = updateSessionPhase(session, 'responding');
      expect(session.phase).toBe('responding');

      session = updateSessionPhase(session, 'completed');
      expect(session.phase).toBe('completed');
    });

    it('should record phase transition timestamp', () => {
      let session = createAgentSession();
      session = updateSessionPhase(session, 'thinking');
      expect(session.phaseHistory.length).toBe(1);
      expect(session.phaseHistory[0].phase).toBe('thinking');
      expect(session.phaseHistory[0].timestamp).toBeGreaterThan(0);
    });
  });

  // ─── Test 3: addSessionMessage and getSessionMessages ───
  describe('Session messages', () => {
    it('should add and retrieve messages', () => {
      let session = createAgentSession();
      session = addSessionMessage(session, {
        role: 'user',
        content: 'Fix the bug in app.ts',
      });
      session = addSessionMessage(session, {
        role: 'assistant',
        content: 'I will look at app.ts and fix the issue.',
      });

      const messages = getSessionMessages(session);
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });

    it('should assign sequential message IDs', () => {
      let session = createAgentSession();
      session = addSessionMessage(session, { role: 'user', content: 'msg1' });
      session = addSessionMessage(session, { role: 'assistant', content: 'msg2' });
      session = addSessionMessage(session, { role: 'user', content: 'msg3' });

      const messages = getSessionMessages(session);
      // Each message should have a unique ID
      const ids = messages.map(m => m.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  // ─── Test 4: addSessionToolCall and getSessionToolCalls ───
  describe('Session tool calls', () => {
    it('should add and retrieve tool calls', () => {
      let session = createAgentSession();
      session = addSessionToolCall(session, {
        tool: 'bash_tool',
        command: 'npm test',
        durationMs: 5000,
        exitCode: 0,
        success: true,
      });
      session = addSessionToolCall(session, {
        tool: 'str_replace',
        command: 'edit src/app.ts',
        durationMs: 200,
        exitCode: 0,
        success: true,
      });

      const calls = getSessionToolCalls(session);
      expect(calls.length).toBe(2);
      expect(calls[0].tool).toBe('bash_tool');
      expect(calls[1].tool).toBe('str_replace');
    });
  });

  // ─── Test 5: getSessionDuration ───
  describe('getSessionDuration', () => {
    it('should compute duration from creation time', () => {
      const session = createAgentSession();
      const duration = getSessionDuration(session);
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(1000);
    });

    it('should use endedAt for completed sessions', () => {
      let session = createAgentSession();
      session = { ...session, endedAt: session.createdAt + 30000 };
      const duration = getSessionDuration(session);
      expect(duration).toBe(30000);
    });
  });

  // ─── Test 6: getSessionStats ───
  describe('getSessionStats', () => {
    it('should compute comprehensive session statistics', () => {
      let session = createAgentSession();
      session = addSessionMessage(session, { role: 'user', content: 'Fix bugs' });
      session = addSessionMessage(session, { role: 'assistant', content: 'Working on it' });
      session = addSessionToolCall(session, { tool: 'bash_tool', command: 'npm test', durationMs: 5000, exitCode: 0, success: true });
      session = addSessionToolCall(session, { tool: 'bash_tool', command: 'npm build', durationMs: 12000, exitCode: 0, success: true });
      session = addSessionToolCall(session, { tool: 'str_replace', command: 'edit file', durationMs: 200, exitCode: 0, success: true });
      session = addSessionToolCall(session, { tool: 'bash_tool', command: 'bad cmd', durationMs: 100, exitCode: 1, success: false });

      const stats = getSessionStats(session);
      expect(stats.messageCount).toBe(2);
      expect(stats.toolCallCount).toBe(4);
      expect(stats.successfulToolCalls).toBe(3);
      expect(stats.failedToolCalls).toBe(1);
      expect(stats.totalToolDurationMs).toBe(17300);
      expect(stats.toolBreakdown).toBeDefined();
      expect(stats.toolBreakdown['bash_tool']).toBe(3);
      expect(stats.toolBreakdown['str_replace']).toBe(1);
    });
  });

  // ─── Test 7: exportSession / importSession ───
  describe('exportSession / importSession', () => {
    it('should roundtrip export and import', () => {
      let session = createAgentSession({ model: 'claude-sonnet-4-20250514' });
      session = addSessionMessage(session, { role: 'user', content: 'Test' });
      session = addSessionToolCall(session, { tool: 'bash_tool', command: 'echo hi', durationMs: 100, exitCode: 0, success: true });

      const exported = exportSession(session);
      expect(typeof exported).toBe('string');

      const imported = importSession(exported);
      expect(imported.id).toBe(session.id);
      expect(imported.model).toBe('claude-sonnet-4-20250514');
      expect(getSessionMessages(imported).length).toBe(1);
      expect(getSessionToolCalls(imported).length).toBe(1);
    });

    it('should handle malformed import gracefully', () => {
      const session = importSession('not json');
      expect(session.id).toBeTruthy(); // should return new session
      expect(session.messages).toEqual([]);
    });
  });

  // ─── Test 8: createSessionSnapshot / restoreSessionSnapshot ───
  describe('Session snapshots', () => {
    it('should create and restore snapshots', () => {
      let session = createAgentSession();
      session = addSessionMessage(session, { role: 'user', content: 'Initial' });

      const snapshot = createSessionSnapshot(session);
      expect(snapshot.sessionId).toBe(session.id);
      expect(snapshot.timestamp).toBeGreaterThan(0);

      // Modify session after snapshot
      session = addSessionMessage(session, { role: 'assistant', content: 'Extra' });
      expect(getSessionMessages(session).length).toBe(2);

      // Restore should go back to 1 message
      const restored = restoreSessionSnapshot(snapshot);
      expect(getSessionMessages(restored).length).toBe(1);
      expect(getSessionMessages(restored)[0].content).toBe('Initial');
    });
  });

  // ─── Test 9: formatSessionReport ───
  describe('formatSessionReport', () => {
    it('should produce human-readable session report', () => {
      let session = createAgentSession({ model: 'claude-sonnet-4-20250514' });
      session = addSessionMessage(session, { role: 'user', content: 'Build an API' });
      session = addSessionToolCall(session, { tool: 'bash_tool', command: 'npm init', durationMs: 1000, exitCode: 0, success: true });
      session = addSessionToolCall(session, { tool: 'create_file', command: 'create index.js', durationMs: 200, exitCode: 0, success: true });

      const report = formatSessionReport(session);
      expect(report).toContain('claude-sonnet');
      expect(report).toContain('2'); // tool calls
      expect(report).toContain('1'); // messages or some count
    });
  });

  // ─── Test 10: isSessionActive ───
  describe('isSessionActive', () => {
    it('should detect active vs completed sessions', () => {
      let session = createAgentSession();
      expect(isSessionActive(session)).toBe(true); // idle is active

      session = updateSessionPhase(session, 'thinking');
      expect(isSessionActive(session)).toBe(true);

      session = updateSessionPhase(session, 'executing');
      expect(isSessionActive(session)).toBe(true);

      session = updateSessionPhase(session, 'completed');
      expect(isSessionActive(session)).toBe(false);

      session = updateSessionPhase(session, 'error');
      expect(isSessionActive(session)).toBe(false);
    });
  });
});
