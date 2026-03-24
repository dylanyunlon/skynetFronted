/**
 * SessionStateManager — v19
 * 
 * Manages the complete agent session state: combines execution engine,
 * file operations, package installs, sandbox, capabilities into a single
 * coherent session object.
 */

// ============================================================
// Types
// ============================================================
export type SessionPhase = 'idle' | 'thinking' | 'executing' | 'responding' | 'completed' | 'error';

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface SessionToolCall {
  id: string;
  tool: string;
  command: string;
  durationMs: number;
  exitCode: number;
  success: boolean;
  timestamp: number;
}

export interface PhaseTransition {
  phase: SessionPhase;
  timestamp: number;
}

export interface AgentSession {
  id: string;
  model: string;
  workDir: string;
  phase: SessionPhase;
  messages: SessionMessage[];
  toolCalls: SessionToolCall[];
  phaseHistory: PhaseTransition[];
  createdAt: number;
  endedAt?: number;
}

export interface SessionStats {
  messageCount: number;
  toolCallCount: number;
  successfulToolCalls: number;
  failedToolCalls: number;
  totalToolDurationMs: number;
  toolBreakdown: Record<string, number>;
}

export interface SessionSnapshot {
  sessionId: string;
  timestamp: number;
  data: string;
}

// ============================================================
// createAgentSession
// ============================================================
let sessionCounter = 0;
export function createAgentSession(config?: { model?: string; workDir?: string }): AgentSession {
  return {
    id: `session_${Date.now()}_${++sessionCounter}_${Math.random().toString(36).slice(2, 8)}`,
    model: config?.model ?? '',
    workDir: config?.workDir ?? '/home/claude',
    phase: 'idle',
    messages: [],
    toolCalls: [],
    phaseHistory: [],
    createdAt: Date.now(),
  };
}

// ============================================================
// updateSessionPhase
// ============================================================
export function updateSessionPhase(session: AgentSession, phase: SessionPhase): AgentSession {
  return {
    ...session,
    phase,
    phaseHistory: [...session.phaseHistory, { phase, timestamp: Date.now() }],
    endedAt: (phase === 'completed' || phase === 'error') ? Date.now() : session.endedAt,
  };
}

// ============================================================
// Messages
// ============================================================
let messageCounter = 0;
export function addSessionMessage(
  session: AgentSession,
  msg: { role: 'user' | 'assistant' | 'system'; content: string }
): AgentSession {
  const message: SessionMessage = {
    id: `msg_${Date.now()}_${++messageCounter}`,
    role: msg.role,
    content: msg.content,
    timestamp: Date.now(),
  };
  return { ...session, messages: [...session.messages, message] };
}

export function getSessionMessages(session: AgentSession): SessionMessage[] {
  return [...session.messages];
}

// ============================================================
// Tool Calls
// ============================================================
let toolCallCounter = 0;
export function addSessionToolCall(
  session: AgentSession,
  call: { tool: string; command: string; durationMs: number; exitCode: number; success: boolean }
): AgentSession {
  const toolCall: SessionToolCall = {
    id: `tc_${Date.now()}_${++toolCallCounter}`,
    ...call,
    timestamp: Date.now(),
  };
  return { ...session, toolCalls: [...session.toolCalls, toolCall] };
}

export function getSessionToolCalls(session: AgentSession): SessionToolCall[] {
  return [...session.toolCalls];
}

// ============================================================
// getSessionDuration
// ============================================================
export function getSessionDuration(session: AgentSession): number {
  const endTime = session.endedAt ?? Date.now();
  return endTime - session.createdAt;
}

// ============================================================
// getSessionStats
// ============================================================
export function getSessionStats(session: AgentSession): SessionStats {
  const toolBreakdown: Record<string, number> = {};
  let successfulToolCalls = 0;
  let failedToolCalls = 0;
  let totalToolDurationMs = 0;

  for (const tc of session.toolCalls) {
    toolBreakdown[tc.tool] = (toolBreakdown[tc.tool] || 0) + 1;
    if (tc.success) successfulToolCalls++;
    else failedToolCalls++;
    totalToolDurationMs += tc.durationMs;
  }

  return {
    messageCount: session.messages.length,
    toolCallCount: session.toolCalls.length,
    successfulToolCalls,
    failedToolCalls,
    totalToolDurationMs,
    toolBreakdown,
  };
}

// ============================================================
// exportSession / importSession
// ============================================================
export function exportSession(session: AgentSession): string {
  return JSON.stringify(session);
}

export function importSession(json: string): AgentSession {
  try {
    const data = JSON.parse(json);
    // Validate minimum fields
    if (data.id && data.messages && data.toolCalls) {
      return {
        id: data.id,
        model: data.model || '',
        workDir: data.workDir || '/home/claude',
        phase: data.phase || 'idle',
        messages: data.messages || [],
        toolCalls: data.toolCalls || [],
        phaseHistory: data.phaseHistory || [],
        createdAt: data.createdAt || Date.now(),
        endedAt: data.endedAt,
      };
    }
    return createAgentSession();
  } catch {
    return createAgentSession();
  }
}

// ============================================================
// Snapshots
// ============================================================
export function createSessionSnapshot(session: AgentSession): SessionSnapshot {
  return {
    sessionId: session.id,
    timestamp: Date.now(),
    data: JSON.stringify(session),
  };
}

export function restoreSessionSnapshot(snapshot: SessionSnapshot): AgentSession {
  try {
    return JSON.parse(snapshot.data);
  } catch {
    return createAgentSession();
  }
}

// ============================================================
// formatSessionReport
// ============================================================
export function formatSessionReport(session: AgentSession): string {
  const stats = getSessionStats(session);
  const duration = getSessionDuration(session);
  const parts = [
    `Session: ${session.id}`,
    `Model: ${session.model || 'unknown'}`,
    `Phase: ${session.phase}`,
    `Messages: ${stats.messageCount}`,
    `Tool calls: ${stats.toolCallCount} (${stats.successfulToolCalls} ok, ${stats.failedToolCalls} failed)`,
    `Duration: ${Math.round(duration / 1000)}s`,
  ];
  return parts.join(' | ');
}

// ============================================================
// isSessionActive
// ============================================================
export function isSessionActive(session: AgentSession): boolean {
  return session.phase !== 'completed' && session.phase !== 'error';
}
