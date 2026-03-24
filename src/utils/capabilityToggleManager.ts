/**
 * CapabilityToggleManager — v19
 * 
 * Manages Claude.ai-style feature toggles: code execution, artifacts,
 * visualizations, network egress, domain allowlist.
 */

// ============================================================
// Types
// ============================================================
export interface Capability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  config?: Record<string, any>;
}

export interface CapabilityConfig extends Capability {}

export interface CapabilityStore {
  capabilities: Map<string, Capability>;
}

export interface CapabilityStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

// ============================================================
// Builtin capabilities (matching Claude.ai settings)
// ============================================================
export const BUILTIN_CAPABILITIES: Capability[] = [
  {
    id: 'code_execution',
    name: 'Code Execution and File Creation',
    description: 'Claude can execute code and create and edit docs, spreadsheets, presentations, PDFs, and data reports.',
    enabled: true,
    category: 'execution',
  },
  {
    id: 'artifacts',
    name: 'Artifacts',
    description: 'Ask Claude to generate content like code snippets, text documents, or website designs, and Claude will create an Artifact that appears in a dedicated window alongside your conversation.',
    enabled: true,
    category: 'visuals',
  },
  {
    id: 'ai_powered_artifacts',
    name: 'AI-powered Artifacts',
    description: 'Create apps, prototypes, and interactive documents that use Claude inside the artifact. Start by saying "Let\'s build an AI app..." to access the power of Claude API.',
    enabled: true,
    category: 'visuals',
  },
  {
    id: 'inline_visualizations',
    name: 'Inline Visualizations',
    description: 'Allow Claude to generate interactive visualizations, charts, and diagrams directly in the conversation.',
    enabled: true,
    category: 'visuals',
  },
  {
    id: 'network_egress',
    name: 'Allow Network Egress',
    description: 'Give Claude network access to install packages and libraries in order to perform advanced data analysis, custom visualizations, and specialized file processing. Monitor chats closely as this comes with security risks.',
    enabled: false,
    category: 'network',
  },
  {
    id: 'domain_allowlist',
    name: 'Domain Allowlist',
    description: 'Choose which domains the sandbox can access. Configure specific domains or allow all domains.',
    enabled: false,
    category: 'network',
  },
  {
    id: 'tool_access',
    name: 'Tool Access Mode',
    description: 'Controls how connector tools are loaded in new conversations.',
    enabled: true,
    category: 'tools',
  },
];

// ============================================================
// createCapabilityStore
// ============================================================
export function createCapabilityStore(): CapabilityStore {
  const capabilities = new Map<string, Capability>();
  for (const cap of BUILTIN_CAPABILITIES) {
    capabilities.set(cap.id, { ...cap });
  }
  return { capabilities };
}

// ============================================================
// registerCapability
// ============================================================
export function registerCapability(store: CapabilityStore, cap: Capability): CapabilityStore {
  const newMap = new Map(store.capabilities);
  newMap.set(cap.id, { ...cap });
  return { capabilities: newMap };
}

// ============================================================
// enableCapability / disableCapability
// ============================================================
export function enableCapability(store: CapabilityStore, id: string): CapabilityStore {
  const cap = store.capabilities.get(id);
  if (!cap) return store;
  const newMap = new Map(store.capabilities);
  newMap.set(id, { ...cap, enabled: true });
  return { capabilities: newMap };
}

export function disableCapability(store: CapabilityStore, id: string): CapabilityStore {
  const cap = store.capabilities.get(id);
  if (!cap) return store;
  const newMap = new Map(store.capabilities);
  newMap.set(id, { ...cap, enabled: false });
  return { capabilities: newMap };
}

// ============================================================
// isEnabled
// ============================================================
export function isEnabled(store: CapabilityStore, id: string): boolean {
  return store.capabilities.get(id)?.enabled ?? false;
}

// ============================================================
// getCapabilityConfig / updateCapabilityConfig
// ============================================================
export function getCapabilityConfig(store: CapabilityStore, id: string): CapabilityConfig | null {
  const cap = store.capabilities.get(id);
  return cap ? { ...cap } : null;
}

export function updateCapabilityConfig(store: CapabilityStore, id: string, config: Record<string, any>): CapabilityStore {
  const cap = store.capabilities.get(id);
  if (!cap) return store;
  const newMap = new Map(store.capabilities);
  newMap.set(id, { ...cap, config: { ...cap.config, ...config } });
  return { capabilities: newMap };
}

// ============================================================
// listCapabilities / listEnabledCapabilities
// ============================================================
export function listCapabilities(store: CapabilityStore): Capability[] {
  return Array.from(store.capabilities.values());
}

export function listEnabledCapabilities(store: CapabilityStore): Capability[] {
  return Array.from(store.capabilities.values()).filter(c => c.enabled);
}

// ============================================================
// getCapabilityStatus
// ============================================================
export function getCapabilityStatus(store: CapabilityStore, id: string): CapabilityStatus {
  const cap = store.capabilities.get(id);
  if (!cap) return { id, name: '', description: '', enabled: false, category: '' };
  return { id: cap.id, name: cap.name, description: cap.description, enabled: cap.enabled, category: cap.category };
}

// ============================================================
// serializeCapabilities / deserializeCapabilities
// ============================================================
export function serializeCapabilities(store: CapabilityStore): string {
  const data: Record<string, Capability> = {};
  for (const [key, cap] of store.capabilities) {
    data[key] = cap;
  }
  return JSON.stringify(data);
}

export function deserializeCapabilities(json: string): CapabilityStore {
  try {
    const data = JSON.parse(json);
    const capabilities = new Map<string, Capability>();
    for (const [key, cap] of Object.entries(data)) {
      capabilities.set(key, cap as Capability);
    }
    return { capabilities };
  } catch {
    return createCapabilityStore(); // fallback to defaults
  }
}

// ============================================================
// resetToDefaults
// ============================================================
export function resetToDefaults(_store: CapabilityStore): CapabilityStore {
  return createCapabilityStore();
}
