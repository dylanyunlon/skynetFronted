/**
 * PackageInstallTracker — v19
 * 
 * Tracks package installations (npm, pip, apt), detects package manager,
 * extracts package names/versions, and computes dependency statistics.
 */

// ============================================================
// Types
// ============================================================
export type PackageManager = 'npm' | 'pip' | 'yarn' | 'apt' | 'cargo' | 'go' | 'gem';

export interface PackageInfo {
  name: string;
  version?: string;
}

export interface PackageInstall {
  manager: PackageManager;
  packages: PackageInfo[];
  isDev: boolean;
  isFromLockfile: boolean;
  command: string;
  timestamp: number;
}

export interface PackageInstallTracker {
  installs: PackageInstall[];
}

export interface PackageInstallStats {
  totalPackages: number;
  byManager: Record<string, number>;
  devDependencies: number;
  prodDependencies: number;
}

// ============================================================
// detectPackageManager
// ============================================================
export function detectPackageManager(command: string): PackageManager | null {
  const lower = command.toLowerCase().trim();
  // Strip sudo prefix
  const clean = lower.replace(/^sudo\s+/, '');

  if (/^(npm\s|npx\s)/.test(clean)) return 'npm';
  if (/^yarn\s/.test(clean)) return 'yarn';
  if (/^(pip3?\s|python\s.*-m\s+pip)/.test(clean)) return 'pip';
  if (/^(apt-get\s|apt\s)/.test(clean)) return 'apt';
  if (/^cargo\s/.test(clean)) return 'cargo';
  if (/^go\s+(get|install)\b/.test(clean)) return 'go';
  if (/^gem\s/.test(clean)) return 'gem';

  return null;
}

// ============================================================
// Flags and options to strip from package names
// ============================================================
const NPM_FLAGS = /^(-[a-zA-Z]|--[a-z][-a-z]*)(=\S+)?$/;
const PIP_FLAGS = /^(-[a-zA-Z]|--[a-z][-a-z]*)(=\S+)?$/;
const APT_FLAGS = /^-[a-zA-Z]+$/;

// ============================================================
// parseInstallCommand
// ============================================================
export function parseInstallCommand(command: string): PackageInstall {
  const manager = detectPackageManager(command) || 'npm';
  const result: PackageInstall = {
    manager,
    packages: [],
    isDev: false,
    isFromLockfile: false,
    command,
    timestamp: Date.now(),
  };

  // Strip sudo
  let clean = command.replace(/^sudo\s+/, '').trim();

  switch (manager) {
    case 'npm': return parseNpmCommand(clean, result);
    case 'yarn': return parseYarnCommand(clean, result);
    case 'pip': return parsePipCommand(clean, result);
    case 'apt': return parseAptCommand(clean, result);
    case 'cargo': return parseCargoCommand(clean, result);
    case 'go': return parseGoCommand(clean, result);
    default: return result;
  }
}

function parseNpmCommand(cmd: string, result: PackageInstall): PackageInstall {
  // npm install / npm i / npm ci
  const isDevFlag = /--save-dev|-D\b/.test(cmd);
  result.isDev = isDevFlag;

  // Strip the npm command prefix
  const afterCmd = cmd.replace(/^npm\s+(install|i|ci|add)\s*/, '').trim();

  if (!afterCmd || /^(--[a-z]|-[a-zA-Z])/.test(afterCmd) && !afterCmd.match(/\s\S/)) {
    // npm install (no packages) or npm ci
    result.isFromLockfile = true;
    return result;
  }

  const parts = afterCmd.split(/\s+/);
  for (const part of parts) {
    if (NPM_FLAGS.test(part)) continue;
    if (!part) continue;

    const atIdx = part.lastIndexOf('@');
    if (atIdx > 0) {
      result.packages.push({ name: part.slice(0, atIdx), version: part.slice(atIdx + 1) });
    } else {
      result.packages.push({ name: part, version: undefined });
    }
  }

  // If no actual packages were found after flags, it's from lockfile
  if (result.packages.length === 0) {
    result.isFromLockfile = true;
  }

  return result;
}

function parseYarnCommand(cmd: string, result: PackageInstall): PackageInstall {
  result.isDev = /--dev|-D\b/.test(cmd);
  const afterCmd = cmd.replace(/^yarn\s+(add|install)\s*/, '').trim();

  if (!afterCmd || afterCmd === 'install') {
    result.isFromLockfile = true;
    return result;
  }

  const parts = afterCmd.split(/\s+/);
  for (const part of parts) {
    if (/^(--[a-z]|-[a-zA-Z])/.test(part)) continue;
    if (!part) continue;
    result.packages.push({ name: part, version: undefined });
  }

  return result;
}

function parsePipCommand(cmd: string, result: PackageInstall): PackageInstall {
  // pip install packages --break-system-packages
  const afterCmd = cmd.replace(/^(pip3?\s+install|python.*-m\s+pip\s+install)\s*/, '').trim();

  if (/^-r\s/.test(afterCmd)) {
    result.isFromLockfile = true;
    return result;
  }

  const parts = afterCmd.split(/\s+/);
  for (const part of parts) {
    if (PIP_FLAGS.test(part)) continue;
    if (!part) continue;

    // Handle version specifiers: numpy>=1.24, pandas==2.0.0
    // Strip surrounding quotes
    const cleaned = part.replace(/^["']|["']$/g, '');
    const versionMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\s*(>=|<=|==|!=|~=|>|<)(.+)$/);
    if (versionMatch) {
      result.packages.push({ name: versionMatch[1], version: versionMatch[2] + versionMatch[3] });
    } else {
      result.packages.push({ name: cleaned, version: undefined });
    }
  }

  return result;
}

function parseAptCommand(cmd: string, result: PackageInstall): PackageInstall {
  const afterCmd = cmd.replace(/^(apt-get|apt)\s+install\s*/, '').trim();
  const parts = afterCmd.split(/\s+/);

  for (const part of parts) {
    if (APT_FLAGS.test(part)) continue;
    if (!part) continue;
    result.packages.push({ name: part, version: undefined });
  }

  return result;
}

function parseCargoCommand(cmd: string, result: PackageInstall): PackageInstall {
  const afterCmd = cmd.replace(/^cargo\s+add\s*/, '').trim();
  const parts = afterCmd.split(/\s+/);

  for (const part of parts) {
    if (/^--/.test(part)) continue;
    if (!part) continue;
    result.packages.push({ name: part, version: undefined });
  }

  return result;
}

function parseGoCommand(cmd: string, result: PackageInstall): PackageInstall {
  const afterCmd = cmd.replace(/^go\s+(get|install)\s*/, '').trim();
  const parts = afterCmd.split(/\s+/);

  for (const part of parts) {
    if (!part) continue;
    result.packages.push({ name: part, version: undefined });
  }

  return result;
}

// ============================================================
// PackageInstallTracker
// ============================================================
export function createPackageInstallTracker(): PackageInstallTracker {
  return { installs: [] };
}

export function recordInstall(tracker: PackageInstallTracker, command: string): PackageInstallTracker {
  const parsed = parseInstallCommand(command);
  return { installs: [...tracker.installs, parsed] };
}

// ============================================================
// getInstalledPackages — flat list of all installed packages
// ============================================================
export function getInstalledPackages(tracker: PackageInstallTracker): PackageInfo[] {
  const result: PackageInfo[] = [];
  for (const install of tracker.installs) {
    for (const pkg of install.packages) {
      result.push(pkg);
    }
  }
  return result;
}

// ============================================================
// getInstallsByManager
// ============================================================
export function getInstallsByManager(tracker: PackageInstallTracker, manager: PackageManager): PackageInfo[] {
  const result: PackageInfo[] = [];
  for (const install of tracker.installs) {
    if (install.manager === manager) {
      for (const pkg of install.packages) {
        result.push(pkg);
      }
    }
  }
  return result;
}

// ============================================================
// getInstallStats
// ============================================================
export function getInstallStats(tracker: PackageInstallTracker): PackageInstallStats {
  const byManager: Record<string, number> = {};
  let devDeps = 0;
  let prodDeps = 0;
  let totalPackages = 0;

  for (const install of tracker.installs) {
    const count = install.packages.length;
    totalPackages += count;
    byManager[install.manager] = (byManager[install.manager] || 0) + count;

    if (install.isDev) {
      devDeps += count;
    } else {
      prodDeps += count;
    }
  }

  return { totalPackages, byManager, devDependencies: devDeps, prodDependencies: prodDeps };
}

// ============================================================
// isDevDependency
// ============================================================
export function isDevDependency(command: string): boolean {
  return /--save-dev|-D\b|--dev\b/.test(command);
}

// ============================================================
// formatInstallSummary
// ============================================================
export function formatInstallSummary(tracker: PackageInstallTracker): string {
  const stats = getInstallStats(tracker);
  if (stats.totalPackages === 0) return 'Installed 0 packages';

  const parts: string[] = [];
  for (const [mgr, count] of Object.entries(stats.byManager)) {
    parts.push(`${mgr}: ${count}`);
  }
  return `Installed ${stats.totalPackages} packages (${parts.join(', ')})`;
}

// ============================================================
// deduplicatePackages — keep latest version of each package
// ============================================================
export function deduplicatePackages(tracker: PackageInstallTracker): PackageInfo[] {
  const seen = new Map<string, PackageInfo>();
  for (const install of tracker.installs) {
    for (const pkg of install.packages) {
      seen.set(pkg.name, pkg); // last write wins
    }
  }
  return Array.from(seen.values());
}
