/**
 * TDD v19 — Module 4: DomainAllowlistManager
 * 
 * Manages network egress domain allowlist, validates URLs against the list,
 * supports wildcard patterns, and tracks network request history.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  DomainAllowlist,
  createDomainAllowlist,
  addDomain,
  removeDomain,
  isDomainAllowed,
  isUrlAllowed,
  DomainMatchResult,
  parseUrlDomain,
  matchesWildcard,
  getAllowedDomains,
  setAllDomainsMode,
  NetworkRequest,
  recordNetworkRequest,
  getNetworkHistory,
  getBlockedRequests,
  getDomainStats,
} from '@/utils/domainAllowlistManager';

describe('DomainAllowlistManager', () => {

  // ─── Test 1: createDomainAllowlist and addDomain ───
  describe('createDomainAllowlist / addDomain', () => {
    it('should create empty allowlist in restrictive mode', () => {
      const list = createDomainAllowlist();
      expect(getAllowedDomains(list).length).toBe(0);
      expect(list.allDomainsAllowed).toBe(false);
    });

    it('should add and list domains', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'npmjs.org');
      list = addDomain(list, 'pypi.org');
      list = addDomain(list, 'registry.npmjs.org');
      expect(getAllowedDomains(list)).toEqual(['npmjs.org', 'pypi.org', 'registry.npmjs.org']);
    });

    it('should deduplicate domains', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'example.com');
      list = addDomain(list, 'example.com');
      list = addDomain(list, 'example.com');
      expect(getAllowedDomains(list).length).toBe(1);
    });
  });

  // ─── Test 2: removeDomain ───
  describe('removeDomain', () => {
    it('should remove a domain from the allowlist', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'a.com');
      list = addDomain(list, 'b.com');
      list = removeDomain(list, 'a.com');
      expect(getAllowedDomains(list)).toEqual(['b.com']);
    });

    it('should be no-op for non-existent domain', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'a.com');
      list = removeDomain(list, 'nonexistent.com');
      expect(getAllowedDomains(list)).toEqual(['a.com']);
    });
  });

  // ─── Test 3: isDomainAllowed ───
  describe('isDomainAllowed', () => {
    it('should allow listed domains', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'npmjs.org');
      list = addDomain(list, 'pypi.org');

      expect(isDomainAllowed(list, 'npmjs.org')).toBe(true);
      expect(isDomainAllowed(list, 'pypi.org')).toBe(true);
      expect(isDomainAllowed(list, 'evil.com')).toBe(false);
    });

    it('should match subdomains when parent domain is listed', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'npmjs.org');
      expect(isDomainAllowed(list, 'registry.npmjs.org')).toBe(true);
      expect(isDomainAllowed(list, 'cdn.npmjs.org')).toBe(true);
      expect(isDomainAllowed(list, 'npmjs.org.evil.com')).toBe(false);
    });

    it('should allow all domains in allDomainsAllowed mode', () => {
      let list = createDomainAllowlist();
      list = setAllDomainsMode(list, true);
      expect(isDomainAllowed(list, 'anything.com')).toBe(true);
      expect(isDomainAllowed(list, 'random.example.org')).toBe(true);
    });
  });

  // ─── Test 4: isUrlAllowed ───
  describe('isUrlAllowed', () => {
    it('should validate full URLs against allowlist', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'cdnjs.cloudflare.com');
      list = addDomain(list, 'unpkg.com');

      expect(isUrlAllowed(list, 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js')).toBe(true);
      expect(isUrlAllowed(list, 'https://unpkg.com/react@18/umd/react.production.min.js')).toBe(true);
      expect(isUrlAllowed(list, 'https://evil.com/malware.js')).toBe(false);
    });

    it('should handle URLs without protocol', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'example.com');
      expect(isUrlAllowed(list, 'example.com/path')).toBe(true);
    });

    it('should handle malformed URLs gracefully', () => {
      const list = createDomainAllowlist();
      expect(isUrlAllowed(list, '')).toBe(false);
      expect(isUrlAllowed(list, 'not-a-url')).toBe(false);
      expect(isUrlAllowed(list, '://broken')).toBe(false);
    });
  });

  // ─── Test 5: parseUrlDomain ───
  describe('parseUrlDomain', () => {
    it('should extract domain from various URL formats', () => {
      expect(parseUrlDomain('https://example.com/path?q=1')).toBe('example.com');
      expect(parseUrlDomain('http://sub.domain.org:8080/api')).toBe('sub.domain.org');
      expect(parseUrlDomain('https://registry.npmjs.org')).toBe('registry.npmjs.org');
      expect(parseUrlDomain('ftp://files.example.com')).toBe('files.example.com');
    });

    it('should handle edge cases', () => {
      expect(parseUrlDomain('')).toBe('');
      expect(parseUrlDomain('localhost:3000')).toBe('localhost');
      expect(parseUrlDomain('https://127.0.0.1:8080')).toBe('127.0.0.1');
    });
  });

  // ─── Test 6: matchesWildcard ───
  describe('matchesWildcard', () => {
    it('should match wildcard domain patterns', () => {
      expect(matchesWildcard('*.npmjs.org', 'registry.npmjs.org')).toBe(true);
      expect(matchesWildcard('*.npmjs.org', 'cdn.npmjs.org')).toBe(true);
      expect(matchesWildcard('*.npmjs.org', 'npmjs.org')).toBe(false); // strict wildcard
      expect(matchesWildcard('*.example.com', 'sub.example.com')).toBe(true);
      expect(matchesWildcard('*.example.com', 'deep.sub.example.com')).toBe(true);
    });

    it('should match exact patterns (no wildcard)', () => {
      expect(matchesWildcard('example.com', 'example.com')).toBe(true);
      expect(matchesWildcard('example.com', 'sub.example.com')).toBe(false);
    });
  });

  // ─── Test 7: recordNetworkRequest and getNetworkHistory ───
  describe('Network request tracking', () => {
    it('should record and retrieve network requests', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'api.example.com');

      list = recordNetworkRequest(list, {
        url: 'https://api.example.com/data',
        method: 'GET',
        allowed: true,
        timestamp: Date.now(),
      });
      list = recordNetworkRequest(list, {
        url: 'https://evil.com/hack',
        method: 'POST',
        allowed: false,
        timestamp: Date.now(),
      });

      const history = getNetworkHistory(list);
      expect(history.length).toBe(2);
    });

    it('should filter blocked requests', () => {
      let list = createDomainAllowlist();
      list = recordNetworkRequest(list, { url: 'https://ok.com', method: 'GET', allowed: true, timestamp: 1 });
      list = recordNetworkRequest(list, { url: 'https://blocked.com', method: 'GET', allowed: false, timestamp: 2 });
      list = recordNetworkRequest(list, { url: 'https://blocked2.com', method: 'POST', allowed: false, timestamp: 3 });

      const blocked = getBlockedRequests(list);
      expect(blocked.length).toBe(2);
      expect(blocked.every(r => !r.allowed)).toBe(true);
    });
  });

  // ─── Test 8: getDomainStats ───
  describe('getDomainStats', () => {
    it('should compute request counts per domain', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, 'api.com');

      list = recordNetworkRequest(list, { url: 'https://api.com/a', method: 'GET', allowed: true, timestamp: 1 });
      list = recordNetworkRequest(list, { url: 'https://api.com/b', method: 'GET', allowed: true, timestamp: 2 });
      list = recordNetworkRequest(list, { url: 'https://api.com/c', method: 'POST', allowed: true, timestamp: 3 });
      list = recordNetworkRequest(list, { url: 'https://other.com/x', method: 'GET', allowed: false, timestamp: 4 });

      const stats = getDomainStats(list);
      expect(stats['api.com']).toBe(3);
      expect(stats['other.com']).toBe(1);
    });
  });

  // ─── Test 9: setAllDomainsMode toggle ───
  describe('setAllDomainsMode', () => {
    it('should toggle between restricted and open mode', () => {
      let list = createDomainAllowlist();
      expect(list.allDomainsAllowed).toBe(false);

      list = setAllDomainsMode(list, true);
      expect(list.allDomainsAllowed).toBe(true);
      expect(isDomainAllowed(list, 'anything.io')).toBe(true);

      list = setAllDomainsMode(list, false);
      expect(list.allDomainsAllowed).toBe(false);
      expect(isDomainAllowed(list, 'anything.io')).toBe(false);
    });
  });

  // ─── Test 10: wildcard domains in allowlist ───
  describe('wildcard domains in allowlist', () => {
    it('should support adding wildcard patterns', () => {
      let list = createDomainAllowlist();
      list = addDomain(list, '*.cloudflare.com');
      list = addDomain(list, '*.githubusercontent.com');

      expect(isDomainAllowed(list, 'cdnjs.cloudflare.com')).toBe(true);
      expect(isDomainAllowed(list, 'workers.cloudflare.com')).toBe(true);
      expect(isDomainAllowed(list, 'raw.githubusercontent.com')).toBe(true);
      expect(isDomainAllowed(list, 'cloudflare.com')).toBe(false); // wildcard needs subdomain
      expect(isDomainAllowed(list, 'notcloudflare.com')).toBe(false);
    });
  });
});
