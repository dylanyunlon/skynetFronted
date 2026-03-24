/**
 * ArtifactRenderer — v19
 * 
 * Manages artifact creation, versioning, type detection, and rendering metadata.
 * Supports HTML, React, SVG, Mermaid, Markdown, Code, PDF artifacts.
 */

// ============================================================
// Types
// ============================================================
export type ArtifactType = 'html' | 'react' | 'svg' | 'mermaid' | 'markdown' | 'code' | 'pdf';

export interface ArtifactMeta {
  id: string;
  title: string;
  type: ArtifactType;
  content: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  language?: string;
}

export interface ArtifactStore {
  artifacts: Map<string, ArtifactMeta>;
}

export interface ArtifactRenderConfig {
  sandbox: boolean;
  allowScripts: boolean;
  inline: boolean;
  maxHeight: number;
  framework?: string;
  requiresLibrary: boolean;
  library?: string;
}

export interface ArtifactValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================
// detectArtifactType
// ============================================================
export function detectArtifactType(content: string): ArtifactType {
  if (!content || !content.trim()) return 'code';
  const trimmed = content.trim();

  // SVG
  if (trimmed.startsWith('<svg') || /<svg\s/.test(trimmed)) return 'svg';

  // React/JSX — check before HTML since React uses HTML-like syntax
  if (/import\s+.*from\s+['"]react['"]/.test(trimmed) ||
      /import\s+\{.*\}\s+from\s+['"]react['"]/.test(trimmed) ||
      /\bclassName\s*=/.test(trimmed) ||
      /export\s+default\s+function/.test(trimmed) && /<\w/.test(trimmed)) {
    return 'react';
  }

  // HTML
  if (/^<!DOCTYPE\s+html/i.test(trimmed) ||
      /^<html/i.test(trimmed) ||
      (/<(div|span|p|h[1-6]|style|script|table|form|section|article|header|footer)\b/i.test(trimmed) && !/<svg/.test(trimmed))) {
    return 'html';
  }

  // Mermaid
  if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey)\b/m.test(trimmed)) {
    return 'mermaid';
  }

  // Markdown — heading is a strong signal, especially with other indicators
  if (/^#{1,6}\s+\S/m.test(trimmed)) {
    // If has additional markdown features, definitely markdown
    if (/\*\*[^*]+\*\*/.test(trimmed) || /\[.*\]\(.*\)/.test(trimmed) || /^[-*]\s/m.test(trimmed) ||
        /\n#{1,6}\s+/m.test(trimmed) || /\n\n/.test(trimmed)) {
      return 'markdown';
    }
    // Single heading line — still markdown if it's the primary content
    if (trimmed.startsWith('#')) {
      return 'markdown';
    }
  }

  return 'code';
}

// ============================================================
// File extension to artifact type
// ============================================================
const EXT_MAP: Record<string, ArtifactType> = {
  '.html': 'html', '.htm': 'html',
  '.jsx': 'react', '.tsx': 'react',
  '.svg': 'svg',
  '.mermaid': 'mermaid', '.mmd': 'mermaid',
  '.md': 'markdown', '.markdown': 'markdown',
  '.pdf': 'pdf',
};

function typeFromExtension(path: string): ArtifactType | null {
  for (const [ext, type] of Object.entries(EXT_MAP)) {
    if (path.endsWith(ext)) return type;
  }
  return null;
}

// ============================================================
// createArtifact
// ============================================================
let artifactCounter = 0;
export function createArtifact(opts: { title: string; content: string; type?: ArtifactType; language?: string }): ArtifactMeta {
  const now = Date.now();
  return {
    id: `art_${now}_${++artifactCounter}_${Math.random().toString(36).slice(2, 8)}`,
    title: opts.title,
    type: opts.type ?? detectArtifactType(opts.content),
    content: opts.content,
    version: 1,
    createdAt: now,
    updatedAt: now,
    language: opts.language,
  };
}

// ============================================================
// updateArtifactContent
// ============================================================
export function updateArtifactContent(
  artifact: ArtifactMeta,
  newContent: string,
  opts?: { preserveType?: boolean }
): ArtifactMeta {
  return {
    ...artifact,
    content: newContent,
    type: opts?.preserveType ? artifact.type : detectArtifactType(newContent),
    version: artifact.version + 1,
    updatedAt: Date.now(),
  };
}

// ============================================================
// getArtifactVersion (latest from store)
// ============================================================
export function getArtifactVersion(artifact: ArtifactMeta): number {
  return artifact.version;
}

// ============================================================
// ArtifactStore CRUD
// ============================================================
export function createArtifactStore(): ArtifactStore {
  return { artifacts: new Map() };
}

export function addArtifact(store: ArtifactStore, artifact: ArtifactMeta): ArtifactStore {
  const newMap = new Map(store.artifacts);
  newMap.set(artifact.id, artifact);
  return { artifacts: newMap };
}

export function getArtifact(store: ArtifactStore, id: string): ArtifactMeta | null {
  return store.artifacts.get(id) ?? null;
}

export function listArtifacts(store: ArtifactStore): ArtifactMeta[] {
  return Array.from(store.artifacts.values());
}

export function deleteArtifact(store: ArtifactStore, id: string): ArtifactStore {
  const newMap = new Map(store.artifacts);
  newMap.delete(id);
  return { artifacts: newMap };
}

// ============================================================
// getArtifactRenderConfig
// ============================================================
export function getArtifactRenderConfig(type: ArtifactType): ArtifactRenderConfig {
  switch (type) {
    case 'html':
      return { sandbox: true, allowScripts: true, inline: false, maxHeight: 600, requiresLibrary: false };
    case 'react':
      return { sandbox: true, allowScripts: true, inline: false, maxHeight: 600, framework: 'react', requiresLibrary: false };
    case 'svg':
      return { sandbox: false, allowScripts: false, inline: true, maxHeight: 400, requiresLibrary: false };
    case 'mermaid':
      return { sandbox: false, allowScripts: false, inline: false, maxHeight: 500, requiresLibrary: true, library: 'mermaid' };
    case 'markdown':
      return { sandbox: false, allowScripts: false, inline: false, maxHeight: 800, requiresLibrary: false };
    case 'code':
      return { sandbox: false, allowScripts: false, inline: false, maxHeight: 600, requiresLibrary: false };
    case 'pdf':
      return { sandbox: true, allowScripts: false, inline: false, maxHeight: 800, requiresLibrary: false };
    default:
      return { sandbox: false, allowScripts: false, inline: false, maxHeight: 400, requiresLibrary: false };
  }
}

// ============================================================
// extractArtifactFromToolResult
// ============================================================
export function extractArtifactFromToolResult(
  toolName: string,
  resultText: string
): ArtifactMeta | null {
  if (toolName === 'create_file') {
    try {
      const parsed = JSON.parse(resultText);
      const path = parsed.path || '';
      const content = parsed.content || '';
      if (!path || !content) return null;

      const filename = path.split('/').pop() || 'artifact';
      const extType = typeFromExtension(path);
      return createArtifact({
        title: filename,
        content,
        type: extType ?? undefined,
      });
    } catch {
      return null;
    }
  }

  if (toolName === 'present_files') {
    try {
      const parsed = JSON.parse(resultText);
      const filepaths = parsed.filepaths || [];
      if (filepaths.length === 0) return null;
      const filename = filepaths[0].split('/').pop() || 'artifact';
      const extType = typeFromExtension(filepaths[0]);
      return createArtifact({
        title: filename,
        content: '', // content would be fetched separately
        type: extType ?? undefined,
      });
    } catch {
      return null;
    }
  }

  return null;
}

// ============================================================
// validateArtifactContent
// ============================================================
const SIZE_WARNING_THRESHOLD = 500000; // 500KB

export function validateArtifactContent(content: string, type: ArtifactType): ArtifactValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || !content.trim()) {
    errors.push('Content is empty');
    return { isValid: false, errors, warnings };
  }

  if (content.length > SIZE_WARNING_THRESHOLD) {
    warnings.push(`Content size (${Math.round(content.length / 1024)}KB) is very large and may affect performance`);
  }

  switch (type) {
    case 'html':
      // HTML just needs some content
      break;
    case 'react':
      if (!/export\s+(default\s+)?/.test(content) && 
          !/function\s+\w+\s*\(/.test(content) &&
          !(/const\s+\w+\s*=/.test(content) && /<\w/.test(content))) {
        errors.push('React artifact should contain an exported component or function');
      }
      break;
    case 'svg':
      if (!/<svg[\s>]/i.test(content)) {
        errors.push('SVG artifact must contain an <svg> element');
      }
      break;
    case 'mermaid':
      if (!/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey)\b/m.test(content)) {
        errors.push('Mermaid artifact must start with a valid diagram keyword');
      }
      break;
  }

  return { isValid: errors.length === 0, errors, warnings };
}
