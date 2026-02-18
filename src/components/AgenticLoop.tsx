/**
 * AgenticLoop Component
 * =====================
 * Displays the agentic loop execution in Claude Code style.
 * Shows collapsible tool call steps with:
 * - "Ran 7 commands" headers
 * - "Viewed 3 files" summaries
 * - "Searched the web" with results
 * - File edit diffs (+N, -N)
 * - Expandable Script blocks
 * - Real-time SSE streaming
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Types
interface ToolCall {
  id: string;
  tool_name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration_ms?: number;
  result?: any;
}

interface FileChange {
  file: string;
  additions: number;
  deletions: number;
}

interface AgentStep {
  id: string;
  step_type: string;
  display_title: string;
  display_detail: string;
  is_collapsed: boolean;
  files_changed: FileChange[];
  tool_calls: ToolCall[];
  timestamp: number;
}

interface SessionStats {
  total_tool_calls: number;
  total_files_viewed: number;
  total_files_edited: number;
  total_commands_run: number;
  total_searches: number;
}

interface AgenticEvent {
  type: string;
  data: any;
  timestamp: number;
  session_id: string;
}

// === Sub-components ===

/** Spinner for loading states */
const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline-block' }}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/** Chevron icon for expandable sections */
const ChevronIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{
      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
      transition: 'transform 0.15s ease',
    }}
  >
    <path d="M6 4l4 4-4 4" />
  </svg>
);

/** Done checkmark */
const DoneIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="#22c55e">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
  </svg>
);

/** Error icon */
const ErrorIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="#ef4444">
    <circle cx="8" cy="8" r="7" fill="none" stroke="#ef4444" strokeWidth="1.5" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#ef4444" strokeWidth="1.5" />
  </svg>
);

/** File change badge (+N, -N) */
const FileChangeBadge: React.FC<{ change: FileChange }> = ({ change }) => (
  <span style={{ fontSize: '12px', fontFamily: 'monospace', marginLeft: '8px' }}>
    <span style={{ color: '#a3a3a3' }}>{change.file.split('/').pop()}</span>
    {change.additions > 0 && (
      <span style={{ color: '#22c55e', marginLeft: '4px' }}>+{change.additions}</span>
    )}
    {change.deletions > 0 && (
      <span style={{ color: '#ef4444', marginLeft: '2px' }}>-{change.deletions}</span>
    )}
  </span>
);

/** Search result item */
const SearchResult: React.FC<{ result: any; index: number }> = ({ result, index }) => (
  <div style={{
    padding: '8px 0',
    borderBottom: '1px solid #2a2a2a',
  }}>
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
    >
      {result.title}
    </a>
    <div style={{ color: '#22c55e', fontSize: '12px', marginTop: '2px' }}>
      {result.domain || result.url}
    </div>
    {result.snippet && (
      <div style={{ color: '#a3a3a3', fontSize: '13px', marginTop: '4px' }}>
        {result.snippet}
      </div>
    )}
  </div>
);

/** Collapsible tool step - main building block */
const ToolStep: React.FC<{
  step: AgentStep;
  isLast: boolean;
}> = ({ step, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const isRunning = step.tool_calls.some(tc => tc.status === 'running');
  const hasFailed = step.tool_calls.some(tc => tc.status === 'failed');
  const isDone = step.tool_calls.every(tc => tc.status === 'completed');

  return (
    <div style={{
      borderLeft: '2px solid #333',
      marginLeft: '12px',
      paddingLeft: '16px',
      paddingBottom: isLast ? '0' : '12px',
    }}>
      {/* Step header - clickable to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '6px 0',
          userSelect: 'none',
        }}
      >
        <ChevronIcon expanded={expanded} />
        
        {/* Status icon */}
        {isRunning ? <Spinner size={14} /> : hasFailed ? <ErrorIcon /> : isDone ? <DoneIcon /> : null}
        
        {/* Title */}
        <span style={{
          color: '#e5e5e5',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {step.display_title}
        </span>
        
        {/* File changes */}
        {step.files_changed.map((fc, i) => (
          <FileChangeBadge key={i} change={fc} />
        ))}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          marginTop: '4px',
          padding: '8px 12px',
          background: '#1a1a1a',
          borderRadius: '6px',
          fontSize: '13px',
        }}>
          {step.tool_calls.map((tc, i) => (
            <div key={tc.id} style={{
              padding: '6px 0',
              borderBottom: i < step.tool_calls.length - 1 ? '1px solid #2a2a2a' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tc.status === 'running' ? (
                  <Spinner size={12} />
                ) : tc.status === 'completed' ? (
                  <DoneIcon />
                ) : tc.status === 'failed' ? (
                  <ErrorIcon />
                ) : null}
                
                <span style={{ color: '#a3a3a3' }}>
                  {tc.description || tc.tool_name}
                </span>
                
                {tc.duration_ms && (
                  <span style={{ color: '#666', fontSize: '11px', marginLeft: 'auto' }}>
                    {tc.duration_ms.toFixed(0)}ms
                  </span>
                )}
              </div>
              
              {/* Show script content for command tools */}
              {tc.tool_name === 'run_script' && tc.result?.script && (
                <pre style={{
                  marginTop: '6px',
                  padding: '8px',
                  background: '#111',
                  borderRadius: '4px',
                  color: '#a3a3a3',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}>
                  {tc.result.script}
                </pre>
              )}
              
              {/* Show search results */}
              {tc.tool_name === 'web_search' && tc.result?.results && (
                <div style={{ marginTop: '8px' }}>
                  {tc.result.results.map((r: any, j: number) => (
                    <SearchResult key={j} result={r} index={j} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// === Main Component ===

interface AgenticLoopProps {
  apiBaseUrl?: string;
}

const AgenticLoop: React.FC<AgenticLoopProps> = ({
  apiBaseUrl = '/api',
}) => {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [status, setStatus] = useState<string>('idle');
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [textResponse, setTextResponse] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, textResponse]);

  // Send message and stream response
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    
    const message = input.trim();
    setInput('');
    setSteps([]);
    setTextResponse('');
    setIsStreaming(true);
    setStatus('running');
    
    try {
      const response = await fetch(`${apiBaseUrl}/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: AgenticEvent = JSON.parse(line.slice(6));
              handleEvent(event);
            } catch (e) {
              // Skip parse errors
            }
          }
        }
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, apiBaseUrl]);

  // Handle SSE events
  const handleEvent = useCallback((event: AgenticEvent) => {
    switch (event.type) {
      case 'session_start':
        setStatus('running');
        break;
        
      case 'step_completed':
        setSteps(prev => [...prev, event.data.step]);
        if (event.data.stats) {
          setStats(event.data.stats);
        }
        break;
        
      case 'tool_calls_start':
        // Add a new step in progress
        setSteps(prev => [...prev, {
          id: event.data.step_id,
          step_type: 'tool_call',
          display_title: event.data.display_title,
          display_detail: '',
          is_collapsed: false,
          files_changed: [],
          tool_calls: event.data.tools.map((t: any) => ({
            id: `${event.data.step_id}_${t.name}`,
            tool_name: t.name,
            description: t.description,
            status: 'running' as const,
          })),
          timestamp: Date.now() / 1000,
        }]);
        break;
        
      case 'tool_completed':
        setSteps(prev => {
          const updated = [...prev];
          const lastStep = updated[updated.length - 1];
          if (lastStep) {
            lastStep.tool_calls = lastStep.tool_calls.map(tc =>
              tc.id.includes(event.data.tool_name)
                ? { ...tc, status: 'completed' as const, duration_ms: event.data.duration_ms }
                : tc
            );
          }
          return updated;
        });
        break;
        
      case 'text_response':
        setTextResponse(event.data.content || '');
        setStatus('completed');
        break;
        
      case 'session_complete':
        setStatus('completed');
        if (event.data.stats) {
          setStats(event.data.stats);
        }
        break;
        
      case 'error':
        setStatus('error');
        break;
        
      case 'done':
        if (status !== 'error') setStatus('completed');
        break;
    }
  }, [status]);

  // Interrupt handler
  const handleInterrupt = useCallback(async () => {
    try {
      await fetch(`${apiBaseUrl}/agent/interrupt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: 'current' }),
      });
    } catch (e) {
      // Ignore
    }
  }, [apiBaseUrl]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0d0d0d',
      color: '#e5e5e5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚡</span>
          <span style={{ fontWeight: 600 }}>Skynet Agentic Loop</span>
          {status === 'running' && <Spinner />}
        </div>
        
        {stats && (
          <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '12px' }}>
            {stats.total_commands_run > 0 && <span>🖥 {stats.total_commands_run} cmds</span>}
            {stats.total_files_viewed > 0 && <span>📄 {stats.total_files_viewed} viewed</span>}
            {stats.total_files_edited > 0 && <span>✏️ {stats.total_files_edited} edited</span>}
            {stats.total_searches > 0 && <span>🔍 {stats.total_searches} searches</span>}
          </div>
        )}
      </div>

      {/* Steps display area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {steps.map((step, i) => (
          <ToolStep
            key={step.id}
            step={step}
            isLast={i === steps.length - 1 && !textResponse}
          />
        ))}

        {/* Final text response */}
        {textResponse && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#1a1a1a',
            borderRadius: '8px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {textResponse}
          </div>
        )}

        {/* Status indicator */}
        {status === 'completed' && steps.length > 0 && (
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#22c55e',
            fontSize: '13px',
          }}>
            <DoneIcon /> Done
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #2a2a2a',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Describe what you want to do..."
          disabled={isStreaming}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#e5e5e5',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        
        {isStreaming ? (
          <button
            onClick={handleInterrupt}
            style={{
              padding: '10px 20px',
              background: '#7f1d1d',
              color: '#fca5a5',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              padding: '10px 20px',
              background: input.trim() ? '#f59e0b' : '#333',
              color: input.trim() ? '#000' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: input.trim() ? 'pointer' : 'default',
              fontWeight: 600,
            }}
          >
            Run
          </button>
        )}
      </div>
    </div>
  );
};

export default AgenticLoop;
