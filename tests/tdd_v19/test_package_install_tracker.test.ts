/**
 * TDD v19 — Module 5: PackageInstallTracker
 * 
 * Tracks package installations (npm, pip, apt), detects package manager,
 * extracts package names/versions, and computes dependency statistics.
 * 
 * 10 tests — expected ~50% failure rate on first implementation.
 */
import { describe, it, expect } from 'vitest';
import {
  PackageManager,
  PackageInstall,
  detectPackageManager,
  parseInstallCommand,
  PackageInstallTracker,
  createPackageInstallTracker,
  recordInstall,
  getInstalledPackages,
  getInstallsByManager,
  getInstallStats,
  PackageInstallStats,
  isDevDependency,
  formatInstallSummary,
  deduplicatePackages,
} from '@/utils/packageInstallTracker';

describe('PackageInstallTracker', () => {

  // ─── Test 1: detectPackageManager ───
  describe('detectPackageManager', () => {
    it('should detect npm commands', () => {
      expect(detectPackageManager('npm install react')).toBe('npm');
      expect(detectPackageManager('npm i axios')).toBe('npm');
      expect(detectPackageManager('npx create-react-app my-app')).toBe('npm');
      expect(detectPackageManager('npm ci')).toBe('npm');
    });

    it('should detect pip commands', () => {
      expect(detectPackageManager('pip install requests')).toBe('pip');
      expect(detectPackageManager('pip3 install flask --break-system-packages')).toBe('pip');
      expect(detectPackageManager('python -m pip install numpy')).toBe('pip');
    });

    it('should detect yarn commands', () => {
      expect(detectPackageManager('yarn add lodash')).toBe('yarn');
      expect(detectPackageManager('yarn install')).toBe('yarn');
    });

    it('should detect apt/system package managers', () => {
      expect(detectPackageManager('apt-get install -y tree')).toBe('apt');
      expect(detectPackageManager('apt install curl')).toBe('apt');
      expect(detectPackageManager('sudo apt-get install git')).toBe('apt');
    });

    it('should detect cargo/go/gem', () => {
      expect(detectPackageManager('cargo add serde')).toBe('cargo');
      expect(detectPackageManager('go get github.com/gin-gonic/gin')).toBe('go');
      expect(detectPackageManager('gem install rails')).toBe('gem');
    });

    it('should return null for non-install commands', () => {
      expect(detectPackageManager('ls -la')).toBeNull();
      expect(detectPackageManager('echo hello')).toBeNull();
      expect(detectPackageManager('cd /src')).toBeNull();
    });
  });

  // ─── Test 2: parseInstallCommand — npm ───
  describe('parseInstallCommand — npm', () => {
    it('should extract package names from npm install', () => {
      const result = parseInstallCommand('npm install react react-dom');
      expect(result.manager).toBe('npm');
      expect(result.packages).toEqual([
        { name: 'react', version: undefined },
        { name: 'react-dom', version: undefined },
      ]);
    });

    it('should extract package names with versions', () => {
      const result = parseInstallCommand('npm install react@18.2.0 typescript@^5.3');
      expect(result.packages[0]).toEqual({ name: 'react', version: '18.2.0' });
      expect(result.packages[1]).toEqual({ name: 'typescript', version: '^5.3' });
    });

    it('should detect --save-dev flag', () => {
      const result = parseInstallCommand('npm install --save-dev vitest @testing-library/react');
      expect(result.isDev).toBe(true);
      expect(result.packages.length).toBe(2);
    });

    it('should handle npm install with no packages (installs from package.json)', () => {
      const result = parseInstallCommand('npm install');
      expect(result.packages.length).toBe(0);
      expect(result.isFromLockfile).toBe(true);
    });
  });

  // ─── Test 3: parseInstallCommand — pip ───
  describe('parseInstallCommand — pip', () => {
    it('should extract pip package names', () => {
      const result = parseInstallCommand('pip install requests flask');
      expect(result.manager).toBe('pip');
      expect(result.packages).toEqual([
        { name: 'requests', version: undefined },
        { name: 'flask', version: undefined },
      ]);
    });

    it('should extract pip packages with version specifiers', () => {
      const result = parseInstallCommand('pip install "numpy>=1.24" pandas==2.0.0');
      expect(result.packages[0]).toEqual({ name: 'numpy', version: '>=1.24' });
      expect(result.packages[1]).toEqual({ name: 'pandas', version: '==2.0.0' });
    });

    it('should handle --break-system-packages flag', () => {
      const result = parseInstallCommand('pip install pandas --break-system-packages');
      expect(result.packages.length).toBe(1);
      expect(result.packages[0].name).toBe('pandas');
      // flag should be stripped from packages
    });

    it('should handle -r requirements.txt', () => {
      const result = parseInstallCommand('pip install -r requirements.txt');
      expect(result.isFromLockfile).toBe(true);
      expect(result.packages.length).toBe(0);
    });
  });

  // ─── Test 4: parseInstallCommand — apt ───
  describe('parseInstallCommand — apt', () => {
    it('should extract apt package names', () => {
      const result = parseInstallCommand('apt-get install -y tree curl git');
      expect(result.manager).toBe('apt');
      expect(result.packages.length).toBe(3);
      expect(result.packages.map(p => p.name)).toEqual(['tree', 'curl', 'git']);
    });

    it('should handle sudo prefix', () => {
      const result = parseInstallCommand('sudo apt-get install -y nodejs');
      expect(result.manager).toBe('apt');
      expect(result.packages[0].name).toBe('nodejs');
    });
  });

  // ─── Test 5: PackageInstallTracker record and query ───
  describe('PackageInstallTracker', () => {
    it('should record and retrieve installations', () => {
      let tracker = createPackageInstallTracker();
      tracker = recordInstall(tracker, 'npm install react react-dom');
      tracker = recordInstall(tracker, 'pip install flask --break-system-packages');

      const all = getInstalledPackages(tracker);
      expect(all.length).toBe(3); // react, react-dom, flask
    });

    it('should query by package manager', () => {
      let tracker = createPackageInstallTracker();
      tracker = recordInstall(tracker, 'npm install react');
      tracker = recordInstall(tracker, 'pip install flask');
      tracker = recordInstall(tracker, 'npm install axios');

      const npmPkgs = getInstallsByManager(tracker, 'npm');
      expect(npmPkgs.length).toBe(2);

      const pipPkgs = getInstallsByManager(tracker, 'pip');
      expect(pipPkgs.length).toBe(1);
    });
  });

  // ─── Test 6: getInstallStats ───
  describe('getInstallStats', () => {
    it('should compute stats across all managers', () => {
      let tracker = createPackageInstallTracker();
      tracker = recordInstall(tracker, 'npm install react react-dom axios');
      tracker = recordInstall(tracker, 'npm install --save-dev vitest');
      tracker = recordInstall(tracker, 'pip install flask requests');
      tracker = recordInstall(tracker, 'apt-get install -y tree');

      const stats = getInstallStats(tracker);
      expect(stats.totalPackages).toBe(7);
      expect(stats.byManager.npm).toBe(4);
      expect(stats.byManager.pip).toBe(2);
      expect(stats.byManager.apt).toBe(1);
      expect(stats.devDependencies).toBe(1);
      expect(stats.prodDependencies).toBe(6);
    });
  });

  // ─── Test 7: isDevDependency ───
  describe('isDevDependency', () => {
    it('should detect dev-dependency install commands', () => {
      expect(isDevDependency('npm install --save-dev vitest')).toBe(true);
      expect(isDevDependency('npm install -D eslint')).toBe(true);
      expect(isDevDependency('yarn add --dev jest')).toBe(true);
      expect(isDevDependency('npm install react')).toBe(false);
      expect(isDevDependency('pip install pytest')).toBe(false); // pip has no dev concept
    });
  });

  // ─── Test 8: formatInstallSummary ───
  describe('formatInstallSummary', () => {
    it('should produce human-readable summary', () => {
      let tracker = createPackageInstallTracker();
      tracker = recordInstall(tracker, 'npm install react axios');
      tracker = recordInstall(tracker, 'pip install flask');

      const summary = formatInstallSummary(tracker);
      expect(summary).toContain('npm');
      expect(summary).toContain('pip');
      expect(summary).toContain('3'); // total packages
    });

    it('should handle empty tracker', () => {
      const tracker = createPackageInstallTracker();
      const summary = formatInstallSummary(tracker);
      expect(summary).toContain('0');
    });
  });

  // ─── Test 9: deduplicatePackages ───
  describe('deduplicatePackages', () => {
    it('should deduplicate same package installed multiple times', () => {
      let tracker = createPackageInstallTracker();
      tracker = recordInstall(tracker, 'npm install react');
      tracker = recordInstall(tracker, 'npm install react'); // duplicate
      tracker = recordInstall(tracker, 'npm install react@18.2.0'); // same name, different version

      const deduped = deduplicatePackages(tracker);
      // Should keep latest version of each package
      expect(deduped.length).toBe(1);
      expect(deduped[0].name).toBe('react');
    });
  });

  // ─── Test 10: complex multi-manager scenario ───
  describe('complex scenarios', () => {
    it('should handle mixed installs in a real agent session', () => {
      let tracker = createPackageInstallTracker();

      // Typical agent session installs
      tracker = recordInstall(tracker, 'apt-get install -y tree');
      tracker = recordInstall(tracker, 'npm install');  // from package.json
      tracker = recordInstall(tracker, 'pip install pandas matplotlib --break-system-packages');
      tracker = recordInstall(tracker, 'npm install --save-dev @types/node');
      tracker = recordInstall(tracker, 'cargo add serde serde_json');

      const stats = getInstallStats(tracker);
      expect(stats.totalPackages).toBe(6); // tree, pandas, matplotlib, @types/node, serde, serde_json
      // npm install (no packages) shouldn't count individual packages
      expect(stats.byManager.apt).toBe(1);
      expect(stats.byManager.pip).toBe(2);
      expect(stats.byManager.npm).toBe(1);
      expect(stats.byManager.cargo).toBe(2);
    });
  });
});
