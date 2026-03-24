/**
 * ArtifactPanelLogic — v20
 *
 * Manages artifact display panel: extraction from tool results,
 * version navigation, preview, validation, and timeline.
 */
import {
  detectArtifactType,
  validateArtifactContent,
  type ArtifactType,
  type ArtifactValidation,
} from './artifactRenderer';

// ============================================================
// Types
// ============================================================

export interface PanelArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  content: string;
  filepath?: string;
  createdAt: number;
  versions: string[]; // content at each version
  viewingVersion: number; // index into versions array
  language?: string;
}

export interface ArtifactPanelState {
  artifacts: PanelArtifact[];
  activeArtifactId: string | null;
  panelVisible: boolean;
}

export interface ArtifactPreviewSummary {
  title: string;
  type: ArtifactType;
  lineCount: number;
  charCount: number;
  versionCount: number;
}

export interface ArtifactTimelineEntry {
  id: string;
  title: string;
  type: ArtifactType;
  createdAt: number;
  versionCount: number;
}

export interface ToolResultInput {
  tool: string;
  result: string;
  meta: Record<string, any>;
}

// ============================================================
// State creation
// ============================================================

let _nextArtifactId = 1;

export function createArtifactPanelState(): ArtifactPanelState {
  return {
    artifacts: [],
    activeArtifactId: null,
    panelVisible: false,
  };
}

// ============================================================
// Artifact extraction
// ============================================================

function inferLanguageFromFilename(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', rs: 'rust', go: 'go', java: 'java', rb: 'ruby',
    css: 'css', html: 'html', md: 'markdown', json: 'json', yaml: 'yaml',
    yml: 'yaml', svg: 'svg', sh: 'bash', sql: 'sql',
  };
  return ext ? langMap[ext] : undefined;
}

function inferTypeFromFilename(filename: string): ArtifactType {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'code';
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'svg') return 'svg';
  if (ext === 'md' || ext === 'markdown') return 'markdown';
  if (ext === 'mermaid') return 'mermaid';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'jsx' || ext === 'tsx') return 'react' as ArtifactType; // fallback to code
  return 'code';
}

export function extractAndAddArtifact(
  state: ArtifactPanelState,
  toolResult: ToolResultInput,
): ArtifactPanelState {
  const filename = toolResult.meta?.filename || 'untitled';
  const filepath = toolResult.meta?.filepath;
  const content = toolResult.result || '';

  // Check for existing artifact with same filepath (update instead of duplicate)
  if (filepath) {
    const existing = state.artifacts.find(a => a.filepath === filepath);
    if (existing) {
      return updateArtifactInPanel(state, existing.id, content);
    }
  }

  // Detect type from content first, then filename
  let type: ArtifactType;
  if (content.length > 0) {
    type = detectArtifactType(content);
    // If detectArtifactType returns 'code' (generic), try inferring from filename
    if (type === 'code') {
      type = inferTypeFromFilename(filename);
    }
  } else {
    type = inferTypeFromFilename(filename);
  }

  const artifact: PanelArtifact = {
    id: `artifact-${_nextArtifactId++}-${Date.now()}`,
    title: filename,
    type,
    content,
    filepath,
    createdAt: Date.now(),
    versions: [content],
    viewingVersion: 0,
    language: inferLanguageFromFilename(filename),
  };

  return {
    ...state,
    artifacts: [...state.artifacts, artifact],
    activeArtifactId: artifact.id,
    panelVisible: true,
  };
}

export function updateArtifactInPanel(
  state: ArtifactPanelState,
  artifactId: string,
  newContent: string,
): ArtifactPanelState {
  return {
    ...state,
    artifacts: state.artifacts.map(a => {
      if (a.id !== artifactId) return a;
      const newVersions = [...a.versions, newContent];
      return {
        ...a,
        content: newContent,
        versions: newVersions,
        viewingVersion: newVersions.length - 1,
      };
    }),
  };
}

// ============================================================
// Navigation
// ============================================================

export function selectArtifact(state: ArtifactPanelState, id: string): ArtifactPanelState {
  const exists = state.artifacts.some(a => a.id === id);
  if (!exists) return state;
  return { ...state, activeArtifactId: id };
}

export function navigateVersion(
  state: ArtifactPanelState,
  artifactId: string,
  direction: 'prev' | 'next',
): ArtifactPanelState {
  return {
    ...state,
    artifacts: state.artifacts.map(a => {
      if (a.id !== artifactId) return a;
      let newVersion = a.viewingVersion;
      if (direction === 'prev') newVersion = Math.max(0, newVersion - 1);
      if (direction === 'next') newVersion = Math.min(a.versions.length - 1, newVersion + 1);
      return { ...a, viewingVersion: newVersion };
    }),
  };
}

// ============================================================
// Queries
// ============================================================

export function getActiveArtifact(state: ArtifactPanelState): PanelArtifact | null {
  if (!state.activeArtifactId) return null;
  return state.artifacts.find(a => a.id === state.activeArtifactId) || null;
}

export function getArtifactPreviewSummary(
  state: ArtifactPanelState,
  artifactId: string,
): ArtifactPreviewSummary | null {
  const artifact = state.artifacts.find(a => a.id === artifactId);
  if (!artifact) return null;
  return {
    title: artifact.title,
    type: artifact.type,
    lineCount: artifact.content.split('\n').length,
    charCount: artifact.content.length,
    versionCount: artifact.versions.length,
  };
}

export function validateActiveArtifact(state: ArtifactPanelState): ArtifactValidation | null {
  const artifact = getActiveArtifact(state);
  if (!artifact) return null;
  return validateArtifactContent(artifact.content, artifact.type);
}

export function removeArtifact(state: ArtifactPanelState, id: string): ArtifactPanelState {
  const newArtifacts = state.artifacts.filter(a => a.id !== id);
  const newActiveId = state.activeArtifactId === id
    ? (newArtifacts.length > 0 ? newArtifacts[newArtifacts.length - 1].id : null)
    : state.activeArtifactId;
  return {
    ...state,
    artifacts: newArtifacts,
    activeArtifactId: newActiveId,
    panelVisible: newArtifacts.length > 0,
  };
}

export function getArtifactTimeline(state: ArtifactPanelState): ArtifactTimelineEntry[] {
  return state.artifacts
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(a => ({
      id: a.id,
      title: a.title,
      type: a.type,
      createdAt: a.createdAt,
      versionCount: a.versions.length,
    }));
}

export function exportArtifactPanelState(state: ArtifactPanelState): string {
  return JSON.stringify({
    artifacts: state.artifacts.map(a => ({
      id: a.id,
      title: a.title,
      type: a.type,
      content: a.content,
      filepath: a.filepath,
      createdAt: a.createdAt,
      versionCount: a.versions.length,
    })),
    activeArtifactId: state.activeArtifactId,
    exportedAt: new Date().toISOString(),
  });
}
