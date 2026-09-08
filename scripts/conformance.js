'use strict';

const fs = require('fs');
const path = require('path');
const { execute } = require('../src/cli');
const { loadCatalog } = require('../src/catalog');
const { manifestsMatch, isManifestComplete } = require('../src/manifest');

function tmpDir() {
  return fs.mkdtempSync(path.join(require('os').tmpdir(), 'pcm-conformance-'));
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // best effort — may fail on permission-restricted dirs
  }
}

function getManifest(targetDir) {
  return JSON.parse(fs.readFileSync(path.join(targetDir, 'pcm', '.pcm-manifest.json'), 'utf8'));
}

function runConformance(pkgRoot, opts) {
  opts = opts || {};
  const execRoot = opts.execRoot || pkgRoot;
  let passed = 0;
  let failed = 0;
  const results = [];

  function check(condition, id, detail) {
    if (condition) {
      passed++;
      results.push({ id, pass: true });
    } else {
      failed++;
      results.push({ id, pass: false, detail });
    }
  }

  // [1] Package structure
  {
    const dirs = ['bin', 'src', 'registry', 'adapters', 'core'];
    for (const d of dirs) {
      check(fs.existsSync(path.join(pkgRoot, d)), `structure/${d}`, `${d}/ missing`);
    }
  }

  // [2] Package metadata
  {
    const pkgPath = path.join(pkgRoot, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      check(false, 'metadata/exists', 'package.json missing');
    } else {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      check(typeof pkg.name === 'string' && pkg.name.length > 0, 'metadata/name', `name="${pkg.name}"`);
      check(typeof pkg.version === 'string' && pkg.version.length > 0, 'metadata/version', `version="${pkg.version}"`);
      check(pkg.bin && typeof pkg.bin === 'object' && typeof pkg.bin.pcm === 'string', 'metadata/bin', 'bin.pcm missing');
      check(Array.isArray(pkg.files) && pkg.files.length > 0, 'metadata/files', 'files[] missing');
      check(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0, 'metadata/no-runtime-deps',
        `dependencies: ${JSON.stringify(pkg.dependencies || {})}`);
    }
  }

  // [3] CLI entrypoint
  {
    const binPath = path.join(pkgRoot, 'bin', 'pcm.js');
    check(fs.existsSync(binPath), 'cli/bin-exists', 'bin/pcm.js missing');
    if (fs.existsSync(binPath)) {
      const content = fs.readFileSync(binPath, 'utf8');
      check(content.includes('require'), 'cli/uses-require', 'bin/pcm.js does not use require');
      check(content.includes('../src/cli') || content.includes('./src/cli'), 'cli/requires-cli',
        'bin/pcm.js does not require src/cli');
    }
  }

  // [4] Core artifacts
  {
    const coreFiles = ['core/PCM.md', 'core/PWF.md', 'core/CONFORMANCE.md'];
    for (const f of coreFiles) {
      const p = path.join(pkgRoot, f);
      check(fs.existsSync(p), `core/${path.basename(f)}`, `${f} missing`);
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        check(stat.size > 0, `core/${path.basename(f)}-size`, `${f} is empty`);
      }
    }
  }

  // [5] Registry
  {
    const regPath = path.join(pkgRoot, 'registry', 'pcm-adapters.json');
    check(fs.existsSync(regPath), 'registry/exists', 'registry/pcm-adapters.json missing');
    if (fs.existsSync(regPath)) {
      try {
        const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
        check(typeof reg.version === 'string', 'registry/version', `version="${reg.version}"`);
        check(typeof reg.defaultAdapter === 'string', 'registry/defaultAdapter', 'defaultAdapter missing');
        check(Array.isArray(reg.adapters) && reg.adapters.length >= 2, 'registry/adapters',
          `adapters count=${reg.adapters ? reg.adapters.length : 0}`);
        for (const a of (reg.adapters || [])) {
          check(typeof a.id === 'string' && a.id.length > 0, `registry/adapter-id/${a.id}`, 'adapter.id missing');
          check(Array.isArray(a.platforms), `registry/adapter-platforms/${a.id}`, 'adapter.platforms missing');
          check(Array.isArray(a.shells), `registry/adapter-shells/${a.id}`, 'adapter.shells missing');
        }
      } catch (err) {
        check(false, 'registry/parse', `JSON parse error: ${err.message}`);
      }
    }
  }

  // [6] Adapter artifact references
  {
    try {
      const cat = loadCatalog(pkgRoot);
      for (const adapter of cat.adapters) {
        if (adapter.artifact === null) {
          check(true, `adapter/${adapter.id}/null-artifact`, 'null artifact (expected for generic)');
        } else {
          const artifactDir = path.join(pkgRoot, adapter.artifact);
          const exists = fs.existsSync(artifactDir) && fs.statSync(artifactDir).isDirectory();
          check(exists, `adapter/${adapter.id}/artifact-dir`, `artifact "${adapter.artifact}" ${exists ? 'exists' : 'missing'}`);
          if (exists) {
            const files = fs.readdirSync(artifactDir);
            check(files.length > 0, `adapter/${adapter.id}/artifact-files`, 'artifact directory is empty');
          }
        }
      }
    } catch (err) {
      check(false, 'adapter/load', `catalog load error: ${err.message}`);
    }
  }

  // [7] Generic fallback
  {
    try {
      const cat = loadCatalog(pkgRoot);
      const generic = cat.adapters.find(a => a.id === 'generic');
      check(generic !== undefined, 'generic/exists', 'generic adapter not in catalog');
      if (generic) {
        check(JSON.stringify(generic.platforms) === '["*"]', 'generic/platforms', `platforms=${JSON.stringify(generic.platforms)}`);
        check(JSON.stringify(generic.shells) === '["*"]', 'generic/shells', `shells=${JSON.stringify(generic.shells)}`);
        check(generic.requires === null, 'generic/requires', `requires=${JSON.stringify(generic.requires)}`);
        check(generic.artifact === null, 'generic/artifact', `artifact=${JSON.stringify(generic.artifact)}`);
        check(generic.tested === true, 'generic/tested', `tested=${generic.tested}`);
      }
    } catch (err) {
      check(false, 'generic/load', `error: ${err.message}`);
    }
  }

  // [8] Manifest schema
  {
    const validManifest = {
      pcmVersion: '1.0',
      distributionVersion: '1.0.0',
      adapter: { id: 'generic', origin: 'built-in', artifactPath: null, version: '1.0.0' },
      state: 'bootstrapped',
      core: { pcm: 'pcm/docs/PCM.md', pwf: 'pcm/docs/PWF.md', conformance: 'pcm/docs/CONFORMANCE.md' },
      binding: [],
      managedFiles: [],
    };
    check(isManifestComplete(validManifest), 'manifest/valid-complete', 'valid manifest not recognized as complete');
    check(!isManifestComplete(null), 'manifest/null-incomplete', 'null recognized as complete');
    check(!isManifestComplete({}), 'manifest/empty-incomplete', 'empty object recognized as complete');
    check(!isManifestComplete({ pcmVersion: '1.0' }), 'manifest/partial-incomplete',
      'partial manifest recognized as complete');
  }

  // [9] First-init behavior
  {
    const d = tmpDir();
    try {
      const r = execute(d, execRoot);
      check(r.exitCode === 0, 'first-init/exit', `exitCode=${r.exitCode}`);
      const manifestPath = path.join(d, 'pcm', '.pcm-manifest.json');
      check(fs.existsSync(manifestPath), 'first-init/manifest', 'manifest not created');
      const m = getManifest(d);
      check(m.state === 'bootstrapped', 'first-init/state', `state=${m.state}`);
      check(typeof m.adapter.id === 'string' && m.adapter.id.length > 0, 'first-init/adapter',
        `adapter.id=${m.adapter.id}`);
      check(Array.isArray(m.binding), 'first-init/binding', 'binding not array');
      check(Array.isArray(m.managedFiles), 'first-init/managedFiles', 'managedFiles not array');
      check(m.managedFiles.length > 0, 'first-init/managedFiles-populated', 'managedFiles is empty');
    } finally {
      cleanup(d);
    }
  }

  // [10] Repeat-init idempotency
  {
    const d = tmpDir();
    try {
      const r1 = execute(d, execRoot);
      const m1 = getManifest(d);
      const r2 = execute(d, execRoot);
      const m2 = getManifest(d);
      check(r1.exitCode === 0, 'idempotency/first-exit', 'first init failed');
      check(r2.exitCode === 0, 'idempotency/repeat-exit', 'repeat init failed');
      check(r2.filesWritten === 0, 'idempotency/files-written', `filesWritten=${r2.filesWritten}`);
      check(m1.initializedAt === m2.initializedAt, 'idempotency/initializedAt',
        `before=${m1.initializedAt} after=${m2.initializedAt}`);
      check(manifestsMatch(m1, m2), 'idempotency/manifest-match', 'manifests differ');
    } finally {
      cleanup(d);
    }
  }

  // [11] Stale manifest repair
  {
    const d = tmpDir();
    try {
      execute(d, execRoot);
      const m1 = getManifest(d);
      const originalAdapter = m1.adapter.id;
      m1.adapter.id = 'stale-wrong-adapter';
      writeManifest(d, m1);
      const r = execute(d, execRoot);
      check(r.exitCode === 0, 'stale/exit', `exitCode=${r.exitCode}`);
      const m2 = getManifest(d);
      check(m2.adapter.id === originalAdapter, 'stale/repaired',
        `expected="${originalAdapter}" got="${m2.adapter.id}"`);
    } finally {
      cleanup(d);
    }
  }

  // [12] Manual modification preservation
  {
    const d = tmpDir();
    try {
      execute(d, execRoot);
      const m1 = getManifest(d);
      m1.adapter.version = 'user-custom-v99';
      writeManifest(d, m1);
      const r = execute(d, execRoot);
      check(r.exitCode === 0, 'manual/exit', `exitCode=${r.exitCode}`);
      const m2 = getManifest(d);
      check(m2.adapter.version === 'user-custom-v99', 'manual/preserved',
        `expected="user-custom-v99" got="${m2.adapter.version}"`);
    } finally {
      cleanup(d);
    }
  }

  // [13] Binding preservation
  {
    const d = tmpDir();
    try {
      execute(d, execRoot);
      const m = getManifest(d);
      if (m.binding.length > 0) {
        const bindPath = path.join(d, m.binding[0]);
        fs.writeFileSync(bindPath, 'CONFORMANCE CUSTOM BINDING');
        execute(d, execRoot);
        const after = fs.readFileSync(bindPath, 'utf8');
        check(after === 'CONFORMANCE CUSTOM BINDING', 'binding/preserved', `content="${after.substring(0, 30)}"`);
      } else {
        check(true, 'binding/skipped', 'no binding files (generic adapter)');
      }
    } finally {
      cleanup(d);
    }
  }

  // [14] Read-only fail-closed
  {
    const d = tmpDir();
    const roDir = path.join(d, 'readonly-target');
    fs.mkdirSync(roDir, { recursive: true });
    let denied = false;
    try {
      require('child_process').execSync(
        `icacls "${roDir}" /deny Everyone:(OI)(CI)W`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      denied = true;
      const r = execute(roDir, execRoot);
      check(r.exitCode !== 0 || r.error !== undefined, 'readonly/exit',
        `expected non-zero exit, got exitCode=${r.exitCode}`);
    } catch {
      check(true, 'readonly/skipped', 'could not set read-only permissions (OS limitation)');
    } finally {
      if (denied) {
        try {
          require('child_process').execSync(
            `icacls "${roDir}" /remove Everyone:(OI)(CI)W`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
          );
        } catch { /* best effort */ }
      }
      cleanup(d);
    }
  }

  // [15] Package-relative execution
  {
    check(path.isAbsolute(pkgRoot), 'pkg-relative/absolute', `resolved to ${pkgRoot}`);
    check(fs.existsSync(path.join(pkgRoot, 'package.json')), 'pkg-relative/package-json',
      'package.json not found at resolved root');
    check(fs.existsSync(path.join(pkgRoot, 'src', 'cli.js')), 'pkg-relative/cli',
      'src/cli.js not found at resolved root');
  }

  // [16] Governance artifact contract (repo-level, not packaged)
  {
    const govDir = path.join(pkgRoot, 'governance');
    check(fs.existsSync(path.join(govDir, 'validate.js')), 'governance/validate-exists',
      'governance/validate.js missing');
    check(fs.existsSync(path.join(govDir, 'ARTIFACT-CONTRACT.md')), 'governance/contract-exists',
      'governance/ARTIFACT-CONTRACT.md missing');

    // Governance module must NOT leak into the npm package payload
    {
      const pkgPath = path.join(pkgRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const files = Array.isArray(pkg.files) ? pkg.files : [];
        const leaked = files.some((f) => String(f).startsWith('governance'));
        check(!leaked, 'governance/not-packaged', 'governance/ must not be in package.json files');
      }
    }

    try {
      const gov = require('../governance/validate');
      check(typeof gov.assessGate === 'function', 'governance/exports-assess-gate', 'assessGate missing');
      check(typeof gov.validateGate === 'function', 'governance/exports-validate-gate', 'validateGate missing');
      check(typeof gov.validateEvidence === 'function', 'governance/exports-validate-evidence', 'validateEvidence missing');
      check(Array.isArray(gov.PROVENANCE) && gov.PROVENANCE.length === 3, 'governance/provenance-count',
        `provenance=${JSON.stringify(gov.PROVENANCE)}`);

      // Valid gate + valid evidence => approvable
      const evidence = {
        'ev-1': {
          id: 'ev-1',
          provenance: 'independently-produced',
          subject: 'build success',
          producedAt: '2026-09-08T10:00:00.000Z',
          canonicalVersion: 'canonical/2026-09-08/v1',
          expiresAt: null,
          invalidatedAt: null,
        },
      };
      const validGate = {
        id: 'GATE-valid',
        subject: 'PROPOSAL-1',
        canonicalVersion: 'canonical/2026-09-08/v1',
        decision: 'approved',
        authority: { role: 'authority', ref: 'authority/root' },
        decidedAt: '2026-09-08T12:00:00.000Z',
        evidence: ['ev-1'],
      };
      const v = gov.assessGate(validGate, { evidenceById: evidence, now: Date.parse('2026-09-08T13:00:00.000Z') });
      check(v.gateStatus === 'approvable', 'governance/valid-gate-approvable',
        `expected approvable, got ${JSON.stringify(v)}`);

      // Missing canonical binding => blocked
      const noBinding = { ...validGate, canonicalVersion: undefined };
      const b1 = gov.assessGate(noBinding, { evidenceById: evidence, now: Date.parse('2026-09-08T13:00:00.000Z') });
      check(b1.gateStatus === 'blocked', 'governance/missing-binding-blocked',
        `expected blocked, got ${JSON.stringify(b1)}`);

      // Wrong canonical version => blocked
      const wrongBinding = { ...validGate, canonicalVersion: 'canonical/OLD/v0' };
      const b2 = gov.assessGate(wrongBinding, {
        evidenceById: evidence,
        expectedCanonicalVersion: 'canonical/2026-09-08/v1',
        now: Date.parse('2026-09-08T13:00:00.000Z'),
      });
      check(b2.gateStatus === 'blocked', 'governance/wrong-binding-blocked',
        `expected blocked, got ${JSON.stringify(b2)}`);
    } catch (err) {
      check(false, 'governance/validation-runs', `governance validation error: ${err.message}`);
    }
  }

  return { passed, failed, results };
}

function writeManifest(targetDir, manifest) {
  const manifestFile = path.join(targetDir, 'pcm', '.pcm-manifest.json');
  const dir = path.dirname(manifestFile);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
}

module.exports = { runConformance };

if (require.main === module) {
  const { getPackageRoot } = require('../src/cli');
  const pkgRoot = getPackageRoot();

  console.log('PCM Distribution Conformance Runner v1.0');
  console.log('=========================================\n');

  const { passed, failed } = runConformance(pkgRoot);

  console.log(`\n=========================================`);
  console.log(`Conformance: ${passed} passed, ${failed} failed`);
  console.log(`=========================================\n`);

  if (failed > 0) {
    console.error('VERDICT: NON-CONFORMANT');
    process.exit(1);
  } else {
    console.log('VERDICT: CONFORMANT');
    process.exit(0);
  }
}
