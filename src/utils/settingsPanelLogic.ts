/**
 * SettingsPanelLogic — v20
 *
 * UI-ready state manager wrapping CapabilityToggleManager with
 * categories, search, presets, validation, and diff tracking.
 */
import {
  BUILTIN_CAPABILITIES,
  type Capability,
} from './capabilityToggleManager';

// ============================================================
// Types
// ============================================================

export interface SettingsPanelState {
  capabilities: Capability[];
  savedCapabilities: Capability[]; // snapshot at last save
  isDirty: boolean;
  searchQuery: string;
}

export interface CapabilityGroup {
  category: string;
  label: string;
  capabilities: Capability[];
}

export type SettingsPreset = 'minimal' | 'standard' | 'full';

export interface CapabilityConflict {
  capabilityId: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface SettingsDiffEntry {
  id: string;
  name: string;
  from: boolean;
  to: boolean;
}

// ============================================================
// Category metadata
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  execution: 'Code Execution',
  visuals: 'Visuals & Artifacts',
  network: 'Network & Security',
  agent: 'Agent Features',
  search: 'Search & Discovery',
};

// ============================================================
// Preset definitions
// ============================================================

const PRESET_CONFIGS: Record<SettingsPreset, Set<string>> = {
  minimal: new Set(['code_execution']),
  standard: new Set(['code_execution', 'artifacts', 'inline_visualizations']),
  full: new Set(), // all enabled — handled specially
};

// ============================================================
// State creation
// ============================================================

export function createSettingsPanelState(): SettingsPanelState {
  const caps = BUILTIN_CAPABILITIES.map(c => ({ ...c }));
  return {
    capabilities: caps,
    savedCapabilities: caps.map(c => ({ ...c })),
    isDirty: false,
    searchQuery: '',
  };
}

// ============================================================
// Grouping
// ============================================================

export function groupCapabilitiesByCategory(state: SettingsPanelState): CapabilityGroup[] {
  const groups = new Map<string, Capability[]>();
  for (const cap of state.capabilities) {
    const cat = cap.category || 'other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(cap);
  }
  return Array.from(groups.entries()).map(([category, capabilities]) => ({
    category,
    label: CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1),
    capabilities,
  }));
}

// ============================================================
// Toggle
// ============================================================

export function toggleCapability(state: SettingsPanelState, capId: string): SettingsPanelState {
  const newCaps = state.capabilities.map(c =>
    c.id === capId ? { ...c, enabled: !c.enabled } : c
  );
  return {
    ...state,
    capabilities: newCaps,
    isDirty: true,
  };
}

// ============================================================
// Presets
// ============================================================

export function applyPreset(state: SettingsPanelState, preset: SettingsPreset): SettingsPanelState {
  const enabledSet = PRESET_CONFIGS[preset];
  const newCaps = state.capabilities.map(c => ({
    ...c,
    enabled: preset === 'full' ? true : enabledSet.has(c.id),
  }));
  return {
    ...state,
    capabilities: newCaps,
    isDirty: true,
  };
}

// ============================================================
// Search
// ============================================================

export function searchCapabilities(state: SettingsPanelState, query: string): Capability[] {
  if (!query || query.trim() === '') return [...state.capabilities];
  const lower = query.toLowerCase();
  return state.capabilities.filter(c =>
    c.name.toLowerCase().includes(lower) ||
    c.description.toLowerCase().includes(lower) ||
    c.id.toLowerCase().includes(lower)
  );
}

// ============================================================
// Dirty tracking
// ============================================================

export function hasUnsavedChanges(state: SettingsPanelState): boolean {
  return state.isDirty;
}

export function saveSettings(state: SettingsPanelState): SettingsPanelState {
  return {
    ...state,
    savedCapabilities: state.capabilities.map(c => ({ ...c })),
    isDirty: false,
  };
}

export function resetSettings(state: SettingsPanelState): SettingsPanelState {
  return {
    ...state,
    capabilities: state.savedCapabilities.map(c => ({ ...c })),
    isDirty: false,
  };
}

// ============================================================
// Validation
// ============================================================

export function validateCapabilityConflicts(state: SettingsPanelState): CapabilityConflict[] {
  const conflicts: CapabilityConflict[] = [];
  const capMap = new Map(state.capabilities.map(c => [c.id, c]));

  // network_egress enabled without domain_allowlist
  const egress = capMap.get('network_egress');
  const allowlist = capMap.get('domain_allowlist');
  if (egress?.enabled && allowlist && !allowlist.enabled) {
    conflicts.push({
      capabilityId: 'network_egress',
      message: 'Network egress is enabled but domain allowlist is disabled. This may expose the sandbox to security risks.',
      severity: 'warning',
    });
  }

  return conflicts;
}

// ============================================================
// Export
// ============================================================

export function exportSettingsConfig(state: SettingsPanelState): string {
  return JSON.stringify({
    capabilities: state.capabilities.map(c => ({
      id: c.id,
      name: c.name,
      enabled: c.enabled,
      category: c.category,
    })),
    exportedAt: new Date().toISOString(),
  });
}

// ============================================================
// Diff
// ============================================================

export function getSettingsDiff(state: SettingsPanelState): SettingsDiffEntry[] {
  const diffs: SettingsDiffEntry[] = [];
  for (const cap of state.capabilities) {
    const saved = state.savedCapabilities.find(s => s.id === cap.id);
    if (saved && saved.enabled !== cap.enabled) {
      diffs.push({
        id: cap.id,
        name: cap.name,
        from: saved.enabled,
        to: cap.enabled,
      });
    }
  }
  return diffs;
}
