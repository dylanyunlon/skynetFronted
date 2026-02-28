/* Copyright 2026 SkyNet. CodeEditor component with syntax highlighting. */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Copy, Check, WrapText, Maximize2, Minimize2, FileCode } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/cn";

export interface CodeEditorProps {
  code: string;
  language?: string;
  filename?: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  maxHeight?: number;
  theme?: "dark" | "light";
  className?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  py: "python",
  js: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  sh: "bash",
  yml: "yaml",
  md: "markdown",
  rs: "rust",
  go: "go",
  rb: "ruby",
  java: "java",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  sql: "sql",
  json: "json",
  html: "html",
  css: "css",
  scss: "scss",
  xml: "xml",
  toml: "toml",
  ini: "ini",
  dockerfile: "dockerfile",
};

function detectLanguage(filename?: string, code?: string): string {
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (LANGUAGE_MAP[ext]) return LANGUAGE_MAP[ext];
    if (ext === "py") return "python";
    return ext;
  }
  if (code) {
    if (code.startsWith("#!/usr/bin/env python") || code.includes("import ") && code.includes("def ")) return "python";
    if (code.startsWith("#!/bin/bash") || code.startsWith("#!/bin/sh")) return "bash";
    if (code.includes("function ") || code.includes("const ") || code.includes("=>")) return "javascript";
  }
  return "text";
}

export function CodeEditor({
  code,
  language,
  filename,
  readOnly = true,
  onChange,
  showLineNumbers = true,
  wrapLines: initialWrap = false,
  maxHeight = 500,
  theme = "dark",
  className,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(initialWrap);
  const [expanded, setExpanded] = useState(false);
  const [editableCode, setEditableCode] = useState(code);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const detectedLang = language || detectLanguage(filename, code);
  const lineCount = code.split("\n").length;

  useEffect(() => {
    setEditableCode(code);
  }, [code]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(readOnly ? code : editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code, editableCode, readOnly]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditableCode(e.target.value);
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={cn("rounded-lg border overflow-hidden bg-[#1e1e2e]", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-[#313244] text-xs">
        <div className="flex items-center gap-2 text-[#cdd6f4]">
          <FileCode className="h-3.5 w-3.5 text-[#89b4fa]" />
          {filename && <span className="font-mono">{filename}</span>}
          <span className="text-[#6c7086]">{detectedLang} · {lineCount} lines</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={cn(
              "p-1 rounded hover:bg-[#313244] transition-colors",
              wrapLines ? "text-[#89b4fa]" : "text-[#6c7086]"
            )}
            title={wrapLines ? "Disable word wrap" : "Enable word wrap"}
          >
            <WrapText className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-[#313244] text-[#6c7086] transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#313244] text-[#6c7086] transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#a6e3a1]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div
        className="overflow-auto"
        style={{ maxHeight: expanded ? "none" : maxHeight }}
      >
        {readOnly ? (
          <SyntaxHighlighter
            language={detectedLang}
            style={theme === "dark" ? oneDark : oneLight}
            showLineNumbers={showLineNumbers}
            wrapLines={wrapLines}
            wrapLongLines={wrapLines}
            customStyle={{
              margin: 0,
              padding: "0.75rem",
              fontSize: "0.8125rem",
              lineHeight: "1.5",
              background: "transparent",
            }}
            lineNumberStyle={{
              minWidth: "2.5em",
              paddingRight: "1em",
              color: "#6c7086",
              userSelect: "none",
            }}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <textarea
            ref={textareaRef}
            value={editableCode}
            onChange={handleChange}
            spellCheck={false}
            className="w-full min-h-[200px] bg-transparent text-[#cdd6f4] font-mono text-[0.8125rem] leading-relaxed p-3 resize-none focus:outline-none"
            style={{ tabSize: 2 }}
          />
        )}
      </div>
    </div>
  );
}

export default CodeEditor;
