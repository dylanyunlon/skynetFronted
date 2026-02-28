/* Copyright 2026 SkyNet. OutputArea - displays command/code execution output. */

import React, { useState, useRef, useEffect } from "react";
import { Terminal, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface OutputAreaProps {
  output: string;
  stderr?: string;
  exitCode?: number;
  isStreaming?: boolean;
  maxHeight?: number;
  className?: string;
}

export function OutputArea({
  output,
  stderr,
  exitCode,
  isStreaming = false,
  maxHeight = 300,
  className,
}: OutputAreaProps) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output + (stderr ? "\n" + stderr : ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasError = exitCode != null && exitCode !== 0;

  return (
    <div className={cn("rounded-lg border overflow-hidden", hasError ? "border-red-500/30" : "border-border", className)}>
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-muted/50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-xs">
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-medium">Output</span>
          {exitCode != null && (
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-mono", hasError ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400")}>
              exit {exitCode}
            </span>
          )}
          {isStreaming && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">streaming</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-1 hover:bg-muted rounded">
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
          </button>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>
      
      {expanded && (
        <div className="overflow-auto bg-[#0d1117]" style={{ maxHeight }}>
          {output && (
            <pre className="p-3 text-xs font-mono text-[#c9d1d9] whitespace-pre-wrap break-all leading-relaxed">
              {output}
            </pre>
          )}
          {stderr && (
            <pre className="p-3 text-xs font-mono text-red-400 whitespace-pre-wrap break-all leading-relaxed border-t border-red-500/20">
              {stderr}
            </pre>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

export default OutputArea;
