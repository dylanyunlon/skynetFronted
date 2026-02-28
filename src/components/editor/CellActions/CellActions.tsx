/* Copyright 2026 SkyNet. CellActions - actions bar for code cells. */
import React from "react";
import { Play, Trash2, Copy, MoreHorizontal, MoveUp, MoveDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CellActionsProps {
  onRun?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility?: () => void;
  isRunning?: boolean;
  isVisible?: boolean;
  className?: string;
}

export function CellActions({
  onRun, onDelete, onDuplicate, onMoveUp, onMoveDown,
  onToggleVisibility, isRunning, isVisible = true, className,
}: CellActionsProps) {
  return (
    <div className={cn("flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", className)}>
      {onRun && (
        <button onClick={onRun} disabled={isRunning}
          className="p-1 rounded hover:bg-muted disabled:opacity-50" title="Run cell">
          <Play className={cn("h-3.5 w-3.5", isRunning && "animate-spin")} />
        </button>
      )}
      {onMoveUp && (
        <button onClick={onMoveUp} className="p-1 rounded hover:bg-muted" title="Move up">
          <MoveUp className="h-3.5 w-3.5" />
        </button>
      )}
      {onMoveDown && (
        <button onClick={onMoveDown} className="p-1 rounded hover:bg-muted" title="Move down">
          <MoveDown className="h-3.5 w-3.5" />
        </button>
      )}
      {onToggleVisibility && (
        <button onClick={onToggleVisibility} className="p-1 rounded hover:bg-muted" title={isVisible ? "Hide" : "Show"}>
          {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
      )}
      {onDuplicate && (
        <button onClick={onDuplicate} className="p-1 rounded hover:bg-muted" title="Duplicate">
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className="p-1 rounded hover:bg-muted text-red-400" title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
export default CellActions;
