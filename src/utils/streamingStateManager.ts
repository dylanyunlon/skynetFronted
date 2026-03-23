/**
 * StreamingStateManager — v17
 * 
 * Manages the state of streaming content blocks during SSE processing.
 * Tracks active/completed blocks, accumulates partial data.
 */

// ============================================================
// Types
// ============================================================
export interface StreamingBlockState {
  accumulatedJson: string;
  accumulatedThinking: string;
  accumulatedText: string;
  thinkingSummary: string;
  toolMessage: string;
  startTime: number;
}

export interface StreamingState {
  activeBlocks: Map<number, StreamingBlockState>;
  completedBlocks: StreamingBlockState[];
}

// ============================================================
// createStreamingState
// ============================================================
export function createStreamingState(): StreamingState {
  return {
    activeBlocks: new Map(),
    completedBlocks: [],
  };
}

// ============================================================
// Internal: ensure block exists
// ============================================================
function ensureBlock(state: StreamingState, index: number): StreamingBlockState {
  let block = state.activeBlocks.get(index);
  if (!block) {
    block = {
      accumulatedJson: '',
      accumulatedThinking: '',
      accumulatedText: '',
      thinkingSummary: '',
      toolMessage: '',
      startTime: Date.now(),
    };
    state.activeBlocks.set(index, block);
  }
  return block;
}

// ============================================================
// updateStreamingDelta — add delta data to active block
// ============================================================
export function updateStreamingDelta(
  state: StreamingState,
  index: number,
  delta: any
): StreamingState {
  const newState: StreamingState = {
    activeBlocks: new Map(state.activeBlocks),
    completedBlocks: [...state.completedBlocks],
  };

  const block = ensureBlock(newState, index);
  // We need to create a new object to avoid mutation issues
  const updated = { ...block };

  switch (delta.type) {
    case 'input_json_delta':
      updated.accumulatedJson = block.accumulatedJson + (delta.partial_json || '');
      break;
    case 'thinking_delta':
      updated.accumulatedThinking = block.accumulatedThinking + (delta.thinking || '');
      break;
    case 'text_delta':
      updated.accumulatedText = block.accumulatedText + (delta.text || '');
      break;
    case 'thinking_summary_delta':
      if (delta.summary && typeof delta.summary === 'object') {
        updated.thinkingSummary = delta.summary.summary || '';
      } else if (typeof delta.summary === 'string') {
        updated.thinkingSummary = delta.summary;
      }
      break;
    case 'tool_use_block_update_delta':
      updated.toolMessage = delta.message || block.toolMessage;
      break;
  }

  newState.activeBlocks.set(index, updated);
  return newState;
}

// ============================================================
// finalizeStreamingBlock — move from active to completed
// ============================================================
export function finalizeStreamingBlock(state: StreamingState, index: number): StreamingState {
  const newState: StreamingState = {
    activeBlocks: new Map(state.activeBlocks),
    completedBlocks: [...state.completedBlocks],
  };

  const block = newState.activeBlocks.get(index);
  if (block) {
    newState.completedBlocks.push(block);
    newState.activeBlocks.delete(index);
  }

  return newState;
}

// ============================================================
// getActiveStreams — list currently streaming block indices
// ============================================================
export function getActiveStreams(state: StreamingState): number[] {
  return Array.from(state.activeBlocks.keys());
}

// ============================================================
// getStreamProgress — estimate completion (0-100)
// ============================================================
export function getStreamProgress(state: StreamingState, index: number): number {
  const block = state.activeBlocks.get(index);
  if (!block) return 100; // completed or not found
  
  // Heuristic: estimate based on accumulated content length
  const totalLen = block.accumulatedJson.length + block.accumulatedThinking.length + block.accumulatedText.length;
  // Rough estimate: assume average block is ~500 chars
  const estimated = Math.min(100, Math.round((totalLen / 500) * 100));
  return Math.max(0, Math.min(100, estimated));
}

// ============================================================
// Export class-style interface
// ============================================================
export class StreamingStateManager {
  private state: StreamingState;

  constructor() {
    this.state = createStreamingState();
  }

  update(index: number, delta: any): void {
    this.state = updateStreamingDelta(this.state, index, delta);
  }

  finalize(index: number): void {
    this.state = finalizeStreamingBlock(this.state, index);
  }

  getActive(): number[] {
    return getActiveStreams(this.state);
  }

  getProgress(index: number): number {
    return getStreamProgress(this.state, index);
  }

  getState(): StreamingState {
    return this.state;
  }
}
