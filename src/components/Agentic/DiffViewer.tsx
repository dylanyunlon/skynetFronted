// src/components/Agentic/DiffViewer.tsx
// TASK-11: Side-by-side & Unified diff 视图组件
// Claude Code 风格 — 支持 unified/split 模式切换

import React, { useState, useMemo } from 'react';
import { Columns, AlignJustify, Copy, Check } from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header';
  content: string;
  oldLineNo?: number;
  newLineNo?: number;
}

interface DiffViewerProps {
  diff: string;
  filename?: string;
  addedLines?: number;
  removedLines?: number;
  defaultMode?: 'unified' | 'split';
}

/** Parse a unified diff string into structured lines */
function parseDiff(diff: string): DiffLine[] {
  if (!diff) return [];
  const lines = diff.split('\n');
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
      result.push({ type: 'header', content: line });
    } else if (line.startsWith('+++') || line.startsWith('---')) {
      // File header lines — skip or show as header
      result.push({ type: 'header', content: line });
    } else if (line.startsWith('+')) {
      result.push({ type: 'added', content: line.substring(1), newLineNo: newLine });
      newLine++;
    } else if (line.startsWith('-')) {
      result.push({ type: 'removed', content: line.substring(1), oldLineNo: oldLine });
      oldLine++;
    } else {
      // Context line (space prefix or no prefix)
      const content = line.startsWith(' ') ? line.substring(1) : line;
      result.push({ type: 'context', content, oldLineNo: oldLine, newLineNo: newLine });
      oldLine++;
      newLine++;
    }
  }
  return result;
}

/** Build side-by-side pairs from parsed diff lines */
function buildSideBySide(parsed: DiffLine[]): Array<{ left: DiffLine | null; right: DiffLine | null }> {
  const pairs: Array<{ left: DiffLine | null; right: DiffLine | null }> = [];
  let i = 0;

  while (i < parsed.length) {
    const line = parsed[i];

    if (line.type === 'header') {
      pairs.push({ left: line, right: line });
      i++;
      continue;
    }

    if (line.type === 'context') {
      pairs.push({ left: line, right: line });
      i++;
      continue;
    }

    // Collect consecutive removed and added lines for pairing
    const removed: DiffLine[] = [];
    const added: DiffLine[] = [];

    while (i < parsed.length && parsed[i].type === 'removed') {
      removed.push(parsed[i]);
      i++;
    }
    while (i < parsed.length && parsed[i].type === 'added') {
      added.push(parsed[i]);
      i++;
    }

    const maxLen = Math.max(removed.length, added.length);
    for (let j = 0; j < maxLen; j++) {
      pairs.push({
        left: j < removed.length ? removed[j] : null,
        right: j < added.length ? added[j] : null,
      });
    }
  }

  return pairs;
}

const lineStyle = (type: DiffLine['type']) => {
  switch (type) {
    case 'added': return 'bg-green-900/25 text-green-300';
    case 'removed': return 'bg-red-900/25 text-red-300';
    case 'header': return 'bg-blue-900/20 text-blue-400';
    case 'context': return 'text-gray-400';
    default: return 'text-gray-400';
  }
};

const lineNoStyle = 'text-gray-600 select-none text-right pr-2 w-10 shrink-0';

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diff,
  filename,
  addedLines = 0,
  removedLines = 0,
  defaultMode = 'unified',
}) => {
  const [mode, setMode] = useState<'unified' | 'split'>(defaultMode);
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => parseDiff(diff), [diff]);
  const sideBySide = useMemo(() => buildSideBySide(parsed), [parsed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!diff) return null;

  return (
    <div className="border border-gray-700/40 rounded-lg overflow-hidden bg-gray-900/60 my-2">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/60 border-b border-gray-700/30">
        <div className="flex items-center gap-2 text-xs">
          {filename && <span className="text-gray-300 font-mono">{filename}</span>}
          {addedLines > 0 && <span className="text-green-400">+{addedLines}</span>}
          {removedLines > 0 && <span className="text-red-400">-{removedLines}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('unified')}
            className={`p-1 rounded text-xs ${mode === 'unified' ? 'bg-gray-600/50 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            title="Unified view"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMode('split')}
            className={`p-1 rounded text-xs ${mode === 'split' ? 'bg-gray-600/50 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
            title="Split view"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-gray-500 hover:text-gray-300 ml-1"
            title="Copy diff"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto text-[11px] font-mono leading-5">
        {mode === 'unified' ? (
          /* ── Unified View ── */
          <table className="w-full border-collapse">
            <tbody>
              {parsed.map((line, i) => (
                <tr key={i} className={lineStyle(line.type)}>
                  <td className={`${lineNoStyle} border-r border-gray-700/20`}>
                    {line.type !== 'added' && line.type !== 'header' ? line.oldLineNo : ''}
                  </td>
                  <td className={`${lineNoStyle} border-r border-gray-700/20`}>
                    {line.type !== 'removed' && line.type !== 'header' ? line.newLineNo : ''}
                  </td>
                  <td className="px-2 whitespace-pre-wrap break-all">
                    {line.type === 'added' && <span className="text-green-500 mr-1">+</span>}
                    {line.type === 'removed' && <span className="text-red-500 mr-1">-</span>}
                    {line.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ── Split (Side-by-Side) View ── */
          <div className="flex">
            {/* Left (old) */}
            <div className="w-1/2 border-r border-gray-700/30">
              <table className="w-full border-collapse">
                <tbody>
                  {sideBySide.map((pair, i) => {
                    const left = pair.left;
                    if (!left) {
                      return (
                        <tr key={i} className="bg-gray-800/20">
                          <td className={lineNoStyle}></td>
                          <td className="px-2">&nbsp;</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i} className={left.type === 'removed' ? 'bg-red-900/20 text-red-300' : left.type === 'header' ? 'bg-blue-900/15 text-blue-400' : 'text-gray-400'}>
                        <td className={`${lineNoStyle} border-r border-gray-700/20`}>
                          {left.type !== 'header' ? left.oldLineNo : ''}
                        </td>
                        <td className="px-2 whitespace-pre-wrap break-all">{left.content}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Right (new) */}
            <div className="w-1/2">
              <table className="w-full border-collapse">
                <tbody>
                  {sideBySide.map((pair, i) => {
                    const right = pair.right;
                    if (!right) {
                      return (
                        <tr key={i} className="bg-gray-800/20">
                          <td className={lineNoStyle}></td>
                          <td className="px-2">&nbsp;</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i} className={right.type === 'added' ? 'bg-green-900/20 text-green-300' : right.type === 'header' ? 'bg-blue-900/15 text-blue-400' : 'text-gray-400'}>
                        <td className={`${lineNoStyle} border-r border-gray-700/20`}>
                          {right.type !== 'header' ? right.newLineNo : ''}
                        </td>
                        <td className="px-2 whitespace-pre-wrap break-all">{right.content}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;