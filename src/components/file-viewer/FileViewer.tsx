/* Copyright 2026 SkyNet. FileViewer - tree-based file browser with preview. */

import React, { useState, useMemo } from "react";
import {
  File, Folder, FolderOpen, ChevronRight, ChevronDown,
  FileCode, FileText, FileImage, FileJson, FileType,
  Download, ExternalLink, Search,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
  language?: string;
  content?: string;
}

export interface FileViewerProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  onFileDownload?: (file: FileNode) => void;
  selectedPath?: string;
  showPreview?: boolean;
  className?: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  ts: <FileCode className="h-4 w-4 text-blue-400" />,
  tsx: <FileCode className="h-4 w-4 text-blue-400" />,
  js: <FileCode className="h-4 w-4 text-yellow-400" />,
  jsx: <FileCode className="h-4 w-4 text-yellow-400" />,
  py: <FileCode className="h-4 w-4 text-green-400" />,
  json: <FileJson className="h-4 w-4 text-yellow-300" />,
  md: <FileText className="h-4 w-4 text-gray-400" />,
  txt: <FileText className="h-4 w-4 text-gray-400" />,
  css: <FileType className="h-4 w-4 text-purple-400" />,
  html: <FileCode className="h-4 w-4 text-orange-400" />,
  png: <FileImage className="h-4 w-4 text-pink-400" />,
  jpg: <FileImage className="h-4 w-4 text-pink-400" />,
  svg: <FileImage className="h-4 w-4 text-pink-400" />,
};

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || <File className="h-4 w-4 text-muted-foreground" />;
}

function formatSize(bytes?: number): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function TreeNode({
  node,
  depth = 0,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth?: number;
  selectedPath?: string;
  onSelect?: (node: FileNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isDir = node.type === "directory";
  const isSelected = node.path === selectedPath;

  return (
    <div>
      <button
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-xs hover:bg-muted/50 rounded transition-colors text-left",
          isSelected && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) setExpanded(!expanded);
          else onSelect?.(node);
        }}
      >
        {isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
            {expanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-blue-400" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-blue-400" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
        {node.size != null && !isDir && (
          <span className="ml-auto text-muted-foreground text-[10px] shrink-0">{formatSize(node.size)}</span>
        )}
      </button>
      {isDir && expanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export function FileViewer({
  files,
  onFileSelect,
  onFileDownload,
  selectedPath,
  showPreview = true,
  className,
}: FileViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<FileNode | null>(null);

  const handleSelect = (node: FileNode) => {
    setSelected(node);
    onFileSelect?.(node);
  };

  const flatFiles = useMemo(() => {
    const result: FileNode[] = [];
    function flatten(nodes: FileNode[]) {
      for (const n of nodes) {
        if (n.type === "file") result.push(n);
        if (n.children) flatten(n.children);
      }
    }
    flatten(files);
    return result;
  }, [files]);

  const filteredFiles = searchQuery
    ? flatFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  return (
    <div className={cn("flex border rounded-lg overflow-hidden bg-background", showPreview ? "h-96" : "", className)}>
      {/* File tree */}
      <div className={cn("border-r overflow-auto", showPreview ? "w-64 shrink-0" : "w-full")}>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-full rounded border bg-transparent pl-7 pr-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="p-1">
          {filteredFiles ? (
            filteredFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => handleSelect(f)}
                className={cn(
                  "w-full flex items-center gap-1.5 px-2 py-1 text-xs hover:bg-muted/50 rounded text-left",
                  f.path === selectedPath && "bg-primary/10 text-primary"
                )}
              >
                {getFileIcon(f.name)}
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-muted-foreground text-[10px]">{formatSize(f.size)}</span>
              </button>
            ))
          ) : (
            files.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                selectedPath={selected?.path || selectedPath}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>

      {/* Preview pane */}
      {showPreview && (
        <div className="flex-1 overflow-auto">
          {selected ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-xs">
                  {getFileIcon(selected.name)}
                  <span className="font-mono">{selected.path}</span>
                </div>
                <div className="flex gap-1">
                  {onFileDownload && (
                    <button
                      onClick={() => onFileDownload(selected)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3">
                {selected.content ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80">{selected.content}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No preview available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select a file to preview
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileViewer;
