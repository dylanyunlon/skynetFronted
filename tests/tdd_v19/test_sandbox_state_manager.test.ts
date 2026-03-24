/**
 * TDD v19 — Module 6: SandboxStateManager
 * 
 * Manages the code execution sandbox lifecycle: initialization, environment
 * variables, working directory, resource limits, and cleanup.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  SandboxConfig,
  SandboxState,
  SandboxStatus,
  createSandbox,
  updateSandboxStatus,
  setSandboxWorkDir,
  addSandboxEnv,
  removeSandboxEnv,
  getSandboxEnv,
  setSandboxResourceLimits,
  ResourceLimits,
  getSandboxUptime,
  SandboxCapability,
  enableCapability,
  disableCapability,
  hasCapability,
  getActiveSandboxes,
  SandboxManager,
  createSandboxManager,
  registerSandbox,
  terminateSandbox,
  getSandboxById,
  formatSandboxInfo,
} from '@/utils/sandboxStateManager';

describe('SandboxStateManager', () => {

  // ─── Test 1: createSandbox ───
  describe('createSandbox', () => {
    it('should create sandbox with default config', () => {
      const sandbox = createSandbox();
      expect(sandbox.id).toBeTruthy();
      expect(sandbox.status).toBe('initializing');
      expect(sandbox.workDir).toBe('/home/claude');
      expect(sandbox.env).toEqual({});
      expect(sandbox.capabilities).toBeDefined();
      expect(sandbox.createdAt).toBeGreaterThan(0);
    });

    it('should accept custom config', () => {
      const sandbox = createSandbox({
        workDir: '/workspace/project',
        env: { NODE_ENV: 'production' },
      });
      expect(sandbox.workDir).toBe('/workspace/project');
      expect(sandbox.env).toEqual({ NODE_ENV: 'production' });
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 20; i++) {
        ids.add(createSandbox().id);
      }
      expect(ids.size).toBe(20);
    });
  });

  // ─── Test 2: updateSandboxStatus ───
  describe('updateSandboxStatus', () => {
    it('should transition through valid states', () => {
      let sb = createSandbox();
      expect(sb.status).toBe('initializing');

      sb = updateSandboxStatus(sb, 'ready');
      expect(sb.status).toBe('ready');

      sb = updateSandboxStatus(sb, 'executing');
      expect(sb.status).toBe('executing');

      sb = updateSandboxStatus(sb, 'ready');
      expect(sb.status).toBe('ready');

      sb = updateSandboxStatus(sb, 'terminated');
      expect(sb.status).toBe('terminated');
    });

    it('should not allow transitions from terminated', () => {
      let sb = createSandbox();
      sb = updateSandboxStatus(sb, 'terminated');
      sb = updateSandboxStatus(sb, 'ready'); // should be ignored
      expect(sb.status).toBe('terminated');
    });
  });

  // ─── Test 3: Working directory management ───
  describe('setSandboxWorkDir', () => {
    it('should update working directory', () => {
      let sb = createSandbox();
      sb = setSandboxWorkDir(sb, '/home/claude/project');
      expect(sb.workDir).toBe('/home/claude/project');
    });

    it('should normalize paths', () => {
      let sb = createSandbox();
      sb = setSandboxWorkDir(sb, '/home/claude/project/');
      expect(sb.workDir).toBe('/home/claude/project'); // no trailing slash

      sb = setSandboxWorkDir(sb, '/home/claude//double');
      expect(sb.workDir).toBe('/home/claude/double'); // no double slashes
    });
  });

  // ─── Test 4: Environment variable management ───
  describe('Sandbox env management', () => {
    it('should add, get, and remove env vars', () => {
      let sb = createSandbox();
      sb = addSandboxEnv(sb, 'NODE_ENV', 'test');
      sb = addSandboxEnv(sb, 'PORT', '3000');

      expect(getSandboxEnv(sb, 'NODE_ENV')).toBe('test');
      expect(getSandboxEnv(sb, 'PORT')).toBe('3000');
      expect(getSandboxEnv(sb, 'MISSING')).toBeUndefined();

      sb = removeSandboxEnv(sb, 'PORT');
      expect(getSandboxEnv(sb, 'PORT')).toBeUndefined();
      expect(getSandboxEnv(sb, 'NODE_ENV')).toBe('test');
    });
  });

  // ─── Test 5: Resource limits ───
  describe('setSandboxResourceLimits', () => {
    it('should set and enforce resource limits', () => {
      let sb = createSandbox();
      sb = setSandboxResourceLimits(sb, {
        maxMemoryMB: 512,
        maxCpuPercent: 80,
        maxDiskMB: 1024,
        maxExecutionTimeMs: 300000,
      });

      expect(sb.resourceLimits.maxMemoryMB).toBe(512);
      expect(sb.resourceLimits.maxCpuPercent).toBe(80);
      expect(sb.resourceLimits.maxDiskMB).toBe(1024);
      expect(sb.resourceLimits.maxExecutionTimeMs).toBe(300000);
    });

    it('should have sensible defaults', () => {
      const sb = createSandbox();
      expect(sb.resourceLimits.maxMemoryMB).toBeGreaterThan(0);
      expect(sb.resourceLimits.maxExecutionTimeMs).toBeGreaterThan(0);
    });
  });

  // ─── Test 6: Capabilities ───
  describe('Sandbox capabilities', () => {
    it('should enable and check capabilities', () => {
      let sb = createSandbox();
      sb = enableCapability(sb, 'network_egress');
      sb = enableCapability(sb, 'file_write');

      expect(hasCapability(sb, 'network_egress')).toBe(true);
      expect(hasCapability(sb, 'file_write')).toBe(true);
      expect(hasCapability(sb, 'gpu_access')).toBe(false);
    });

    it('should disable capabilities', () => {
      let sb = createSandbox();
      sb = enableCapability(sb, 'network_egress');
      expect(hasCapability(sb, 'network_egress')).toBe(true);

      sb = disableCapability(sb, 'network_egress');
      expect(hasCapability(sb, 'network_egress')).toBe(false);
    });
  });

  // ─── Test 7: getSandboxUptime ───
  describe('getSandboxUptime', () => {
    it('should compute uptime from creation time', () => {
      const sb = createSandbox();
      // Uptime should be very small (just created)
      const uptime = getSandboxUptime(sb);
      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(uptime).toBeLessThan(1000); // less than 1 second
    });

    it('should return 0 for terminated sandbox', () => {
      let sb = createSandbox();
      sb = updateSandboxStatus(sb, 'terminated');
      sb = { ...sb, terminatedAt: sb.createdAt + 5000 };
      const uptime = getSandboxUptime(sb);
      expect(uptime).toBe(5000);
    });
  });

  // ─── Test 8: SandboxManager — multi-sandbox management ───
  describe('SandboxManager', () => {
    it('should register and retrieve multiple sandboxes', () => {
      let manager = createSandboxManager();
      const sb1 = createSandbox({ workDir: '/project1' });
      const sb2 = createSandbox({ workDir: '/project2' });

      manager = registerSandbox(manager, sb1);
      manager = registerSandbox(manager, sb2);

      expect(getActiveSandboxes(manager).length).toBe(2);
      expect(getSandboxById(manager, sb1.id)).toBeTruthy();
      expect(getSandboxById(manager, sb2.id)).toBeTruthy();
    });

    it('should terminate and remove sandboxes', () => {
      let manager = createSandboxManager();
      const sb = createSandbox();
      manager = registerSandbox(manager, sb);
      expect(getActiveSandboxes(manager).length).toBe(1);

      manager = terminateSandbox(manager, sb.id);
      const terminated = getSandboxById(manager, sb.id);
      expect(terminated!.status).toBe('terminated');
    });
  });

  // ─── Test 9: formatSandboxInfo ───
  describe('formatSandboxInfo', () => {
    it('should produce human-readable sandbox status', () => {
      let sb = createSandbox({ workDir: '/home/claude/project' });
      sb = addSandboxEnv(sb, 'NODE_ENV', 'development');
      sb = enableCapability(sb, 'network_egress');
      sb = enableCapability(sb, 'file_write');
      sb = updateSandboxStatus(sb, 'ready');

      const info = formatSandboxInfo(sb);
      expect(info).toContain('ready');
      expect(info).toContain('/home/claude/project');
      expect(info).toContain('network_egress');
    });
  });

  // ─── Test 10: Immutability ───
  describe('Immutability', () => {
    it('should not mutate original sandbox on updates', () => {
      const original = createSandbox();
      const updated = addSandboxEnv(original, 'KEY', 'VALUE');

      expect(getSandboxEnv(original, 'KEY')).toBeUndefined();
      expect(getSandboxEnv(updated, 'KEY')).toBe('VALUE');
      expect(original).not.toBe(updated);
    });

    it('should not mutate manager on register/terminate', () => {
      const manager = createSandboxManager();
      const sb = createSandbox();
      const updated = registerSandbox(manager, sb);

      expect(getActiveSandboxes(manager).length).toBe(0);
      expect(getActiveSandboxes(updated).length).toBe(1);
    });
  });
});
