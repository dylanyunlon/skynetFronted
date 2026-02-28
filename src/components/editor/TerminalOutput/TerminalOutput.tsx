/* Copyright 2026 SkyNet. TerminalOutput - macOS-style terminal display. */
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

export interface TerminalOutputProps {
  lines: Array<{ text: string; type?: "stdout" | "stderr" | "command" | "info"; timestamp?: string }>;
  isRunning?: boolean;
  title?: string;
  className?: string;
}

export function TerminalOutput({ lines, isRunning, title = "Terminal", className }: TerminalOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines.length]);

  return (
    <div className={cn("rounded-lg overflow-hidden border border-[#3a3a3a]", className)}>
      {/* macOS title bar */}
      <div className="flex items-center px-3 py-2 bg-[#2d2d2d]">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#999] font-medium">{title}</span>
        {isRunning && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
      </div>
      {/* Terminal body */}
      <div className="bg-[#1a1a1a] p-3 max-h-80 overflow-auto font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.timestamp && <span className="text-[#555] shrink-0 select-none">[{line.timestamp}]</span>}
            <span className={cn(
              line.type === "stderr" && "text-red-400",
              line.type === "command" && "text-[#89b4fa]",
              line.type === "info" && "text-[#a6e3a1]",
              (!line.type || line.type === "stdout") && "text-[#cdd6f4]",
            )}>
              {line.type === "command" && "$ "}{line.text}
            </span>
          </div>
        ))}
        {isRunning && (
          <div className="text-[#cdd6f4]">
            <span className="animate-pulse">▊</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
export default TerminalOutput;
