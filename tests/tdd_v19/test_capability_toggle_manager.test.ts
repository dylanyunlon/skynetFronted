/**
 * TDD v19 — Module 9: CapabilityToggleManager
 * 
 * Manages Claude.ai-style feature toggles: code execution, artifacts, 
 * visualizations, network egress, domain allowlist. Each capability can
 * be enabled/disabled and has associated configuration.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  Capability,
  CapabilityConfig,
  CapabilityStore,
  createCapabilityStore,
  registerCapability,
  enableCapability,
  disableCapability,
  isEnabled,
  getCapabilityConfig,
  updateCapabilityConfig,
  listCapabilities,
  listEnabledCapabilities,
  getCapabilityStatus,
  CapabilityStatus,
  BUILTIN_CAPABILITIES,
  serializeCapabilities,
  deserializeCapabilities,
  resetToDefaults,
} from '@/utils/capabilityToggleManager';

describe('CapabilityToggleManager', () => {

  // ─── Test 1: BUILTIN_CAPABILITIES ───
  describe('BUILTIN_CAPABILITIES', () => {
    it('should define all Claude.ai capabilities', () => {
      expect(BUILTIN_CAPABILITIES).toContainEqual(
        expect.objectContaining({ id: 'code_execution', name: expect.any(String) })
      );
      expect(BUILTIN_CAPABILITIES).toContainEqual(
        expect.objectContaining({ id: 'artifacts', name: expect.any(String) })
      );
      expect(BUILTIN_CAPABILITIES).toContainEqual(
        expect.objectContaining({ id: 'inline_visualizations', name: expect.any(String) })
      );
      expect(BUILTIN_CAPABILITIES).toContainEqual(
        expect.objectContaining({ id: 'network_egress', name: expect.any(String) })
      );
      expect(BUILTIN_CAPABILITIES).toContainEqual(
        expect.objectContaining({ id: 'ai_powered_artifacts', name: expect.any(String) })
      );
    });

    it('should have descriptions for all capabilities', () => {
      for (const cap of BUILTIN_CAPABILITIES) {
        expect(cap.description).toBeTruthy();
        expect(cap.description.length).toBeGreaterThan(10);
      }
    });
  });

  // ─── Test 2: createCapabilityStore ───
  describe('createCapabilityStore', () => {
    it('should create store with builtin capabilities pre-registered', () => {
      const store = createCapabilityStore();
      const all = listCapabilities(store);
      expect(all.length).toBeGreaterThanOrEqual(5);
    });

    it('should have default enabled/disabled states', () => {
      const store = createCapabilityStore();
      // code_execution and artifacts should be enabled by default
      expect(isEnabled(store, 'code_execution')).toBe(true);
      expect(isEnabled(store, 'artifacts')).toBe(true);
      // network_egress should be disabled by default (security)
      expect(isEnabled(store, 'network_egress')).toBe(false);
    });
  });

  // ─── Test 3: enable/disable capabilities ───
  describe('enableCapability / disableCapability', () => {
    it('should toggle capability state', () => {
      let store = createCapabilityStore();
      expect(isEnabled(store, 'network_egress')).toBe(false);

      store = enableCapability(store, 'network_egress');
      expect(isEnabled(store, 'network_egress')).toBe(true);

      store = disableCapability(store, 'network_egress');
      expect(isEnabled(store, 'network_egress')).toBe(false);
    });

    it('should be no-op for non-existent capability', () => {
      let store = createCapabilityStore();
      store = enableCapability(store, 'non_existent');
      expect(isEnabled(store, 'non_existent')).toBe(false);
    });
  });

  // ─── Test 4: registerCapability ───
  describe('registerCapability', () => {
    it('should add custom capability', () => {
      let store = createCapabilityStore();
      store = registerCapability(store, {
        id: 'custom_tool',
        name: 'Custom Tool',
        description: 'A custom tool for testing',
        enabled: true,
        category: 'tools',
      });

      expect(isEnabled(store, 'custom_tool')).toBe(true);
      const cap = getCapabilityConfig(store, 'custom_tool');
      expect(cap).toBeTruthy();
      expect(cap!.name).toBe('Custom Tool');
    });
  });

  // ─── Test 5: getCapabilityConfig and updateCapabilityConfig ───
  describe('getCapabilityConfig / updateCapabilityConfig', () => {
    it('should get and update capability configuration', () => {
      let store = createCapabilityStore();
      const config = getCapabilityConfig(store, 'network_egress');
      expect(config).toBeTruthy();
      expect(config!.id).toBe('network_egress');

      store = updateCapabilityConfig(store, 'network_egress', {
        domainAllowlist: ['npmjs.org', 'pypi.org'],
      });

      const updated = getCapabilityConfig(store, 'network_egress');
      expect(updated!.config).toBeDefined();
      expect(updated!.config!.domainAllowlist).toEqual(['npmjs.org', 'pypi.org']);
    });

    it('should return null for non-existent capability', () => {
      const store = createCapabilityStore();
      expect(getCapabilityConfig(store, 'nonexistent')).toBeNull();
    });
  });

  // ─── Test 6: listEnabledCapabilities ───
  describe('listEnabledCapabilities', () => {
    it('should only list enabled capabilities', () => {
      let store = createCapabilityStore();
      store = enableCapability(store, 'network_egress');

      const enabled = listEnabledCapabilities(store);
      expect(enabled.every(c => c.enabled)).toBe(true);
      expect(enabled.find(c => c.id === 'network_egress')).toBeTruthy();
    });
  });

  // ─── Test 7: getCapabilityStatus ───
  describe('getCapabilityStatus', () => {
    it('should return detailed status for a capability', () => {
      let store = createCapabilityStore();
      store = enableCapability(store, 'code_execution');

      const status = getCapabilityStatus(store, 'code_execution');
      expect(status.id).toBe('code_execution');
      expect(status.enabled).toBe(true);
      expect(status.name).toBeTruthy();
      expect(status.description).toBeTruthy();
      expect(status.category).toBeTruthy();
    });

    it('should return disabled status', () => {
      const store = createCapabilityStore();
      const status = getCapabilityStatus(store, 'network_egress');
      expect(status.enabled).toBe(false);
    });
  });

  // ─── Test 8: serializeCapabilities / deserializeCapabilities ───
  describe('serialize / deserialize', () => {
    it('should roundtrip serialize and deserialize', () => {
      let store = createCapabilityStore();
      store = enableCapability(store, 'network_egress');
      store = disableCapability(store, 'artifacts');
      store = updateCapabilityConfig(store, 'network_egress', { domainAllowlist: ['x.com'] });

      const json = serializeCapabilities(store);
      expect(typeof json).toBe('string');

      const restored = deserializeCapabilities(json);
      expect(isEnabled(restored, 'network_egress')).toBe(true);
      expect(isEnabled(restored, 'artifacts')).toBe(false);
      expect(getCapabilityConfig(restored, 'network_egress')!.config!.domainAllowlist).toEqual(['x.com']);
    });

    it('should handle malformed JSON gracefully', () => {
      const store = deserializeCapabilities('not json');
      // Should return default store
      expect(listCapabilities(store).length).toBeGreaterThan(0);
    });
  });

  // ─── Test 9: resetToDefaults ───
  describe('resetToDefaults', () => {
    it('should reset all capabilities to default state', () => {
      let store = createCapabilityStore();
      store = enableCapability(store, 'network_egress');
      store = disableCapability(store, 'code_execution');

      store = resetToDefaults(store);
      expect(isEnabled(store, 'network_egress')).toBe(false); // default off
      expect(isEnabled(store, 'code_execution')).toBe(true); // default on
    });
  });

  // ─── Test 10: Immutability ───
  describe('Immutability', () => {
    it('should not mutate original store on operations', () => {
      const original = createCapabilityStore();
      const withNetworkEnabled = enableCapability(original, 'network_egress');

      expect(isEnabled(original, 'network_egress')).toBe(false);
      expect(isEnabled(withNetworkEnabled, 'network_egress')).toBe(true);
    });

    it('should not mutate on config updates', () => {
      const original = createCapabilityStore();
      const updated = updateCapabilityConfig(original, 'code_execution', { timeout: 60000 });

      expect(getCapabilityConfig(original, 'code_execution')!.config).toBeUndefined();
      expect(getCapabilityConfig(updated, 'code_execution')!.config!.timeout).toBe(60000);
    });
  });
});
