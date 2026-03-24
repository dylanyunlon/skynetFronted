/**
 * SandboxStateManager — v19
 * 
 * Manages the code execution sandbox lifecycle: initialization, environment
 * variables, working directory, resource limits, and cleanup.
 */

// ============================================================
// Types
// ============================================================
export type SandboxStatus = 'initializing' | 'ready' | 'executing' | 'terminated';
export type SandboxCapability = 'network_egress' | 'file_write' | 'file_read' | 'gpu_access' | 'docker' | 'sudo';

export interface ResourceLimits {
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxDiskMB: number;
  maxExecutionTimeMs: number;
}

export interface SandboxConfig {
  workDir?: string;
  env?: Record<string, string>;
  resourceLimits?: Partial<ResourceLimits>;
}

export interface SandboxState {
  id: string;
  status: SandboxStatus;
  workDir: string;
  env: Record<string, string>;
  capabilities: Set<SandboxCapability>;
  resourceLimits: ResourceLimits;
  createdAt: number;
  terminatedAt?: number;
}

export interface SandboxManager {
  sandboxes: Map<string, SandboxState>;
}

// ============================================================
// Default resource limits
// ============================================================
const DEFAULT_LIMITS: ResourceLimits = {
  maxMemoryMB: 2048,
  maxCpuPercent: 100,
  maxDiskMB: 10240,
  maxExecutionTimeMs: 600000, // 10 minutes
};

// ============================================================
// createSandbox
// ============================================================
let sandboxCounter = 0;
export function createSandbox(config?: SandboxConfig): SandboxState {
  return {
    id: `sb_${Date.now()}_${++sandboxCounter}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'initializing',
    workDir: config?.workDir ?? '/home/claude',
    env: config?.env ? { ...config.env } : {},
    capabilities: new Set(),
    resourceLimits: { ...DEFAULT_LIMITS, ...config?.resourceLimits },
    createdAt: Date.now(),
  };
}

// ============================================================
// updateSandboxStatus
// ============================================================
export function updateSandboxStatus(sb: SandboxState, newStatus: SandboxStatus): SandboxState {
  if (sb.status === 'terminated') return sb; // no transitions from terminated
  return {
    ...sb,
    status: newStatus,
    capabilities: new Set(sb.capabilities),
    terminatedAt: newStatus === 'terminated' ? Date.now() : sb.terminatedAt,
  };
}

// ============================================================
// Working directory
// ============================================================
export function setSandboxWorkDir(sb: SandboxState, workDir: string): SandboxState {
  // Normalize: remove trailing slash, collapse double slashes
  let normalized = workDir.replace(/\/+/g, '/').replace(/\/$/, '');
  if (!normalized) normalized = '/';
  return { ...sb, workDir: normalized, capabilities: new Set(sb.capabilities) };
}

// ============================================================
// Environment variables
// ============================================================
export function addSandboxEnv(sb: SandboxState, key: string, value: string): SandboxState {
  return { ...sb, env: { ...sb.env, [key]: value }, capabilities: new Set(sb.capabilities) };
}

export function removeSandboxEnv(sb: SandboxState, key: string): SandboxState {
  const newEnv = { ...sb.env };
  delete newEnv[key];
  return { ...sb, env: newEnv, capabilities: new Set(sb.capabilities) };
}

export function getSandboxEnv(sb: SandboxState, key: string): string | undefined {
  return sb.env[key];
}

// ============================================================
// Resource limits
// ============================================================
export function setSandboxResourceLimits(sb: SandboxState, limits: Partial<ResourceLimits>): SandboxState {
  return {
    ...sb,
    resourceLimits: { ...sb.resourceLimits, ...limits },
    capabilities: new Set(sb.capabilities),
  };
}

// ============================================================
// Capabilities
// ============================================================
export function enableCapability(sb: SandboxState, cap: SandboxCapability): SandboxState {
  const newCaps = new Set(sb.capabilities);
  newCaps.add(cap);
  return { ...sb, capabilities: newCaps };
}

export function disableCapability(sb: SandboxState, cap: SandboxCapability): SandboxState {
  const newCaps = new Set(sb.capabilities);
  newCaps.delete(cap);
  return { ...sb, capabilities: newCaps };
}

export function hasCapability(sb: SandboxState, cap: SandboxCapability): boolean {
  return sb.capabilities.has(cap);
}

// ============================================================
// getSandboxUptime
// ============================================================
export function getSandboxUptime(sb: SandboxState): number {
  const endTime = sb.terminatedAt ?? Date.now();
  return endTime - sb.createdAt;
}

// ============================================================
// SandboxManager
// ============================================================
export function createSandboxManager(): SandboxManager {
  return { sandboxes: new Map() };
}

export function registerSandbox(manager: SandboxManager, sb: SandboxState): SandboxManager {
  const newMap = new Map(manager.sandboxes);
  newMap.set(sb.id, sb);
  return { sandboxes: newMap };
}

export function terminateSandbox(manager: SandboxManager, id: string): SandboxManager {
  const newMap = new Map(manager.sandboxes);
  const sb = newMap.get(id);
  if (sb) {
    newMap.set(id, updateSandboxStatus(sb, 'terminated'));
  }
  return { sandboxes: newMap };
}

export function getSandboxById(manager: SandboxManager, id: string): SandboxState | null {
  return manager.sandboxes.get(id) ?? null;
}

export function getActiveSandboxes(manager: SandboxManager): SandboxState[] {
  return Array.from(manager.sandboxes.values()).filter(s => s.status !== 'terminated');
}

// ============================================================
// formatSandboxInfo
// ============================================================
export function formatSandboxInfo(sb: SandboxState): string {
  const caps = Array.from(sb.capabilities).join(', ') || 'none';
  return `Sandbox [${sb.status}] workDir=${sb.workDir} capabilities=[${caps}]`;
}
