/**
 * DomainAllowlistManager — v19
 * 
 * Manages network egress domain allowlist, validates URLs against the list,
 * supports wildcard patterns, and tracks network request history.
 */

// ============================================================
// Types
// ============================================================
export interface NetworkRequest {
  url: string;
  method: string;
  allowed: boolean;
  timestamp: number;
}

export interface DomainAllowlist {
  domains: string[];
  allDomainsAllowed: boolean;
  history: NetworkRequest[];
}

export interface DomainMatchResult {
  allowed: boolean;
  matchedPattern?: string;
}

// ============================================================
// createDomainAllowlist
// ============================================================
export function createDomainAllowlist(): DomainAllowlist {
  return { domains: [], allDomainsAllowed: false, history: [] };
}

// ============================================================
// addDomain / removeDomain
// ============================================================
export function addDomain(list: DomainAllowlist, domain: string): DomainAllowlist {
  if (list.domains.includes(domain)) return list;
  return { ...list, domains: [...list.domains, domain] };
}

export function removeDomain(list: DomainAllowlist, domain: string): DomainAllowlist {
  return { ...list, domains: list.domains.filter(d => d !== domain) };
}

// ============================================================
// getAllowedDomains
// ============================================================
export function getAllowedDomains(list: DomainAllowlist): string[] {
  return [...list.domains];
}

// ============================================================
// setAllDomainsMode
// ============================================================
export function setAllDomainsMode(list: DomainAllowlist, allowed: boolean): DomainAllowlist {
  return { ...list, allDomainsAllowed: allowed };
}

// ============================================================
// matchesWildcard
// ============================================================
export function matchesWildcard(pattern: string, domain: string): boolean {
  if (!pattern.startsWith('*.')) {
    return pattern === domain;
  }
  const suffix = pattern.slice(1); // ".example.com"
  return domain.endsWith(suffix) && domain.length > suffix.length;
}

// ============================================================
// isDomainAllowed
// ============================================================
export function isDomainAllowed(list: DomainAllowlist, domain: string): boolean {
  if (list.allDomainsAllowed) return true;

  for (const pattern of list.domains) {
    if (pattern.startsWith('*.')) {
      if (matchesWildcard(pattern, domain)) return true;
    } else {
      // Exact match or subdomain match
      if (domain === pattern) return true;
      if (domain.endsWith('.' + pattern)) return true;
    }
  }

  return false;
}

// ============================================================
// parseUrlDomain
// ============================================================
export function parseUrlDomain(url: string): string {
  if (!url) return '';
  try {
    // Add protocol if missing for URL parsing
    let normalized = url;
    if (!/^[a-z]+:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    return parsed.hostname;
  } catch {
    // Try basic extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^/:?\s]+)/);
    return match ? match[1] : '';
  }
}

// ============================================================
// isUrlAllowed
// ============================================================
export function isUrlAllowed(list: DomainAllowlist, url: string): boolean {
  if (!url) return false;
  const domain = parseUrlDomain(url);
  if (!domain) return false;
  return isDomainAllowed(list, domain);
}

// ============================================================
// Network request tracking
// ============================================================
export function recordNetworkRequest(list: DomainAllowlist, request: NetworkRequest): DomainAllowlist {
  return { ...list, history: [...list.history, request] };
}

export function getNetworkHistory(list: DomainAllowlist): NetworkRequest[] {
  return [...list.history];
}

export function getBlockedRequests(list: DomainAllowlist): NetworkRequest[] {
  return list.history.filter(r => !r.allowed);
}

// ============================================================
// getDomainStats
// ============================================================
export function getDomainStats(list: DomainAllowlist): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const req of list.history) {
    const domain = parseUrlDomain(req.url);
    if (domain) {
      stats[domain] = (stats[domain] || 0) + 1;
    }
  }
  return stats;
}
