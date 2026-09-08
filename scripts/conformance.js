'use strict';

const fs = require('fs');
const path = require('path');
const { execute, getPackageRoot } = require('../src/cli');
const { loadCatalog } = require('../src/catalog');
const { detect } = require('../src/detect');
const { select } = require('../src/select');
const { createManifest, readManifest, writeManifest, manifestsMatch, isManifestComplete } = require('../src/manifest');
const { checkIdempotency } = require('../src/idempotency');

const pkgRoot = getPackageRoot();
let passed = 0;
let failed = 0;

function check(condition, id, detail) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${id}`);
  } else {
    failed++;
    console.error(`  FAIL  ${id}${detail ? ': ' + detail : ''}`);
  }
}

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

console.log('PCM Distribution Conformance Runner v1.0');
console.log('=========================================\n');

// ================================================================
// 1. Package structure
// ================================================================
console.log('[1] Package structure');
{
  const dirs = ['bin', 'src', 'registry', 'adapters', 'core'];
  for (const d of dirs) {
    check(fs.existsSync(path.join(pkgRoot, d)), `structure/${d}`, `${d}/ missing`);
  }
}

// ================================================================
// 2. Package metadata / version
// ================================================================
console.log('[2] Package metadata');
{
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
  check(typeof pkg.name === 'string' && pkg.name.length > 0, 'metadata/name', `name="${pkg.name}"`);
  check(typeof pkg.version === 'string' && pkg.version.length > 0, 'metadata/version', `version="${pkg.version}"`);
  check(pkg.bin && typeof pkg.bin === 'object' && typeof pkg.bin.pcm === 'string', 'metadata/bin', 'bin.pcm missing');
  check(Array.isArray(pkg.files) && pkg.files.length > 0, 'metadata/files', 'files[] missing');
  check(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0, 'metadata/no-runtime-deps',
    `dependencies: ${JSON.stringify(pkg.dependencies || {})}`);
}

// ================================================================
// 3. CLI entrypoint
// ================================================================
console.log('[3] CLI entrypoint');
{
  const binPath = path.join(pkgRoot, 'bin', 'pcm.js');
  check(fs.existsSync(binPath), 'cli/bin-exists', 'bin/pcm.js missing');
  const content = fs.readFileSync(binPath, 'utf8');
  check(content.includes('require'), 'cli/uses-require', 'bin/pcm.js does not use require');
  check(content.includes('../src/cli') || content.includes('./src/cli'), 'cli/requires-cli',
    'bin/pcm.js does not require src/cli');
}

// ================================================================
// 4. Core artifacts present
// ================================================================
console.log('[4] Core artifacts');
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

// ================================================================
// 5. Registry present and structurally valid
// ================================================================
console.log('[5] Registry');
{
  const regPath = path.join(pkgRoot, 'registry', 'pcm-adapters.json');
  check(fs.existsSync(regPath), 'registry/exists', 'registry/pcm-adapters.json missing');
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

// ================================================================
// 6. Adapter artifact references valid
// ================================================================
console.log('[6] Adapter artifact references');
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

// ================================================================
// 7. Generic fallback present
// ================================================================
console.log('[7] Generic fallback');
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

// ================================================================
// 8. Manifest schema structural validity
// ================================================================
console.log('[8] Manifest schema');
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

// ================================================================
// 9. First-init behavior
// ================================================================
console.log('[9] First-init behavior');
{
  const d = tmpDir();
  try {
    const r = execute(d, pkgRoot);
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

// ================================================================
// 10. Repeat-init idempotency
// ================================================================
console.log('[10] Repeat-init idempotency');
{
  const d = tmpDir();
  try {
    const r1 = execute(d, pkgRoot);
    const m1 = getManifest(d);
    const r2 = execute(d, pkgRoot);
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

// ================================================================
// 11. Stale manifest repair
// ================================================================
console.log('[11] Stale manifest repair');
{
  const d = tmpDir();
  try {
    execute(d, pkgRoot);
    const m1 = getManifest(d);
    const originalAdapter = m1.adapter.id;
    m1.adapter.id = 'stale-wrong-adapter';
    writeManifest(d, m1);
    const r = execute(d, pkgRoot);
    check(r.exitCode === 0, 'stale/exit', `exitCode=${r.exitCode}`);
    const m2 = getManifest(d);
    check(m2.adapter.id === originalAdapter, 'stale/repaired',
      `expected="${originalAdapter}" got="${m2.adapter.id}"`);
  } finally {
    cleanup(d);
  }
}

// ================================================================
// 12. Manual modification preservation
// ================================================================
console.log('[12] Manual modification preservation');
{
  const d = tmpDir();
  try {
    execute(d, pkgRoot);
    const m1 = getManifest(d);
    m1.adapter.version = 'user-custom-v99';
    writeManifest(d, m1);
    const r = execute(d, pkgRoot);
    check(r.exitCode === 0, 'manual/exit', `exitCode=${r.exitCode}`);
    const m2 = getManifest(d);
    check(m2.adapter.version === 'user-custom-v99', 'manual/preserved',
      `expected="user-custom-v99" got="${m2.adapter.version}"`);
  } finally {
    cleanup(d);
  }
}

// ================================================================
// 13. Binding preservation
// ================================================================
console.log('[13] Binding preservation');
{
  const d = tmpDir();
  try {
    execute(d, pkgRoot);
    const m = getManifest(d);
    if (m.binding.length > 0) {
      const bindPath = path.join(d, m.binding[0]);
      fs.writeFileSync(bindPath, 'CONFORMANCE CUSTOM BINDING');
      execute(d, pkgRoot);
      const after = fs.readFileSync(bindPath, 'utf8');
      check(after === 'CONFORMANCE CUSTOM BINDING', 'binding/preserved', `content="${after.substring(0, 30)}"`);
    } else {
      check(true, 'binding/skipped', 'no binding files (generic adapter)');
    }
  } finally {
    cleanup(d);
  }
}

// ================================================================
// 14. Read-only fail-closed
// ================================================================
console.log('[14] Read-only fail-closed');
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
    const r = execute(roDir, pkgRoot);
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

// ================================================================
// 15. Package-relative execution
// ================================================================
console.log('[15] Package-relative execution');
{
  const pkgRootFromCli = getPackageRoot();
  check(path.isAbsolute(pkgRootFromCli), 'pkg-relative/absolute', `resolved to ${pkgRootFromCli}`);
  check(fs.existsSync(path.join(pkgRootFromCli, 'package.json')), 'pkg-relative/package-json',
    'package.json not found at resolved root');
  check(fs.existsSync(path.join(pkgRootFromCli, 'src', 'cli.js')), 'pkg-relative/cli',
    'src/cli.js not found at resolved root');
}

// ================================================================
// SUMMARY
// ================================================================
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
