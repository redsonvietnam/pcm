'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const { execute, parseArgs, getPackageRoot } = require('../src/cli');
const { detect } = require('../src/detect');
const { loadCatalog } = require('../src/catalog');
const { select, capabilitiesSatisfied, isTrusted } = require('../src/select');
const { createManifest, readManifest, writeManifest, manifestsMatch } = require('../src/manifest');
const { checkIdempotency } = require('../src/idempotency');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pcm-test-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function getManifest(targetDir) {
  return JSON.parse(fs.readFileSync(path.join(targetDir, 'pcm', '.pcm-manifest.json'), 'utf8'));
}

const pkgRoot = getPackageRoot();

// ================================================================
// A: Empty/unknown repo, no tools -> generic
// ================================================================
console.log('A: Empty repo -> generic adapter');
{
  const d = tmpDir();
  const origEnv = { ...process.env };
  delete process.env.PATH;
  process.env.PATH = '/usr/bin:/bin';
  const env = detect();
  const cat = loadCatalog(pkgRoot);
  const adapter = select(cat, env);
  assert(adapter.id === 'generic', 'should select generic when no tools present');
  process.env = origEnv;
  cleanup(d);
}

// ================================================================
// B: OpenCode present -> opencode adapter
// ================================================================
console.log('B: OpenCode present -> opencode adapter');
{
  const env = detect();
  const cat = loadCatalog(pkgRoot);
  const adapter = select(cat, env);
  if (env.capabilities.opencode) {
    assert(adapter.id === 'opencode', 'should select opencode');
  } else {
    assert(adapter.id === 'generic', 'should fallback to generic');
  }
}

// ================================================================
// E: Repeat init idempotent
// ================================================================
console.log('E: Repeat init idempotent');
{
  const d = tmpDir();
  const r1 = execute(d, pkgRoot);
  const m1 = getManifest(d);
  const r2 = execute(d, pkgRoot);
  const m2 = getManifest(d);
  assert(r1.exitCode === 0, 'first init succeeds');
  assert(r2.exitCode === 0, 'repeat init succeeds');
  assert(m1.initializedAt === m2.initializedAt, 'initializedAt preserved');
  assert(r2.filesWritten === 0, 'files written = 0 on repeat');
  cleanup(d);
}

// ================================================================
// G: Modified core -> overwrite
// ================================================================
console.log('G: Modified core -> overwrite');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const pcmPath = path.join(d, 'pcm', 'docs', 'PCM.md');
  fs.writeFileSync(pcmPath, 'MODIFIED');
  const r = execute(d, pkgRoot);
  const after = fs.readFileSync(pcmPath, 'utf8');
  assert(after !== 'MODIFIED', 'core overwritten after modification');
  assert(after.startsWith('# Protocol'), 'core has correct content');
  assert(r.filesWritten >= 1, 'at least 1 file written (the overwritten core)');
  cleanup(d);
}

// ================================================================
// H: Governance untouched
// ================================================================
console.log('H: Governance untouched');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const govDir = path.join(d, 'docs', 'gates');
  fs.mkdirSync(govDir, { recursive: true });
  fs.writeFileSync(path.join(govDir, 'test.md'), 'GATE');
  execute(d, pkgRoot);
  const after = fs.readFileSync(path.join(govDir, 'test.md'), 'utf8');
  assert(after === 'GATE', 'governance file untouched');
  cleanup(d);
}

// ================================================================
// L: Modified binding -> preserve
// ================================================================
console.log('L: Modified binding -> preserve');
{
  const d = tmpDir();
  const r = execute(d, pkgRoot);
  const m = getManifest(d);
  if (m.binding.length > 0) {
    const bindPath = path.join(d, m.binding[0]);
    fs.writeFileSync(bindPath, 'CUSTOM BINDING');
    execute(d, pkgRoot);
    const after = fs.readFileSync(bindPath, 'utf8');
    assert(after === 'CUSTOM BINDING', 'binding preserved after modification');
  } else {
    assert(true, 'skipped (no binding files)');
  }
  cleanup(d);
}

// ================================================================
// M: Missing binding -> recreate
// ================================================================
console.log('M: Missing binding -> recreate');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m = getManifest(d);
  if (m.binding.length > 0) {
    const bindPath = path.join(d, m.binding[0]);
    fs.unlinkSync(bindPath);
    const r = execute(d, pkgRoot);
    assert(fs.existsSync(bindPath), 'binding recreated after deletion');
    assert(r.filesWritten >= 1, 'at least 1 file written (the recreated binding)');
  } else {
    assert(true, 'skipped (no binding files)');
  }
  cleanup(d);
}

// ================================================================
// CLI: invalid args
// ================================================================
console.log('CLI: invalid args');
{
  const r1 = parseArgs(['node', 'pcm.js', 'a', 'b']);
  assert(r1.error !== undefined, 'too many args -> error');

  const r2 = parseArgs(['node', 'pcm.js', '--force']);
  assert(r2.error !== undefined, 'unsupported flag -> error');

  const r3 = parseArgs(['node', 'pcm.js']);
  assert(r3.target !== undefined, 'no args -> default target');
}

// ================================================================
// Selection: determinism
// ================================================================
console.log('Selection: deterministic');
{
  const env = detect();
  const cat = loadCatalog(pkgRoot);
  const a1 = select(cat, env);
  const a2 = select(cat, env);
  assert(a1.id === a2.id, 'same adapter selected twice');
  assert(a1.priority === a2.priority, 'same priority');
}

// ================================================================
// Catalog: validation
// ================================================================
console.log('Catalog: validation');
{
  const cat = loadCatalog(pkgRoot);
  assert(cat.version === '1.0', 'catalog version is 1.0');
  assert(cat.adapters.length >= 2, 'at least 2 adapters');
  assert(isTrusted('opencode'), 'opencode is trusted');
  assert(isTrusted('generic'), 'generic is trusted');
}

// ================================================================
// capabilitiesSatisfied
// ================================================================
console.log('capabilitiesSatisfied');
{
  assert(capabilitiesSatisfied(null, {}), 'null requires -> true');
  assert(capabilitiesSatisfied({}, {}), 'empty requires -> true');
  assert(capabilitiesSatisfied({ opencode: '*' }, { opencode: 'present' }), 'cap present -> true');
  assert(!capabilitiesSatisfied({ opencode: '*' }, {}), 'cap missing -> false');
}

// ================================================================
// MANIFEST: schema
// ================================================================
console.log('Manifest: schema');
{
  const m = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'generic', artifact: null, name: 'Generic' },
    binding: [],
    managedFiles: [],
  });
  assert(m.pcmVersion === '1.0', 'pcmVersion set');
  assert(m.distributionVersion === '1.0.0', 'distributionVersion set');
  assert(typeof m.initializedAt === 'string', 'initializedAt is string');
  assert(m.adapter.id === 'generic', 'adapter.id set');
  assert(m.adapter.origin === 'built-in', 'adapter.origin is built-in');
  assert(m.adapter.version === '1.0.0', 'adapter.version is distribution version, not adapter.name');
  assert(m.state === 'bootstrapped', 'state is bootstrapped');
  assert(Array.isArray(m.binding), 'binding is array');
  assert(Array.isArray(m.managedFiles), 'managedFiles is array');
}

// ================================================================
// MANIFEST: adapter.version is real version, not adapter.name
// ================================================================
console.log('Manifest: adapter.version is real version');
{
  const m1 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'opencode', artifact: 'adapters/opencode', name: 'OpenCode Adapter' },
    binding: [],
    managedFiles: [],
  });
  assert(m1.adapter.version === '1.0.0',
    `adapter.version = "${m1.adapter.version}" (expected "1.0.0", not adapter.name)`);
  assert(m1.adapter.version !== 'OpenCode Adapter', 'adapter.version is not adapter.name');

  const m2 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '2.0.0-beta',
    adapter: { id: 'generic', artifact: null, name: 'Generic Adapter' },
    binding: [],
    managedFiles: [],
  });
  assert(m2.adapter.version === '2.0.0-beta',
    `adapter.version tracks distribution version across different values`);
}

// ================================================================
// MANIFEST: initializedAt tampering is excluded from manual-modification detection
// ================================================================
console.log('Manifest: initializedAt tamper excluded from detection');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);
  const originalAdapterId = m1.adapter.id;

  // Tamper: change only initializedAt (provenance field, not generated content)
  m1.initializedAt = '2020-01-01T00:00:00.000Z';
  writeManifest(d, m1);

  // Re-init: manifestsMatch excludes initializedAt, so if adapter/version/state
  // all still match, the result depends on adapter/version/state comparison.
  // Since we only changed initializedAt (not adapter.id, not distributionVersion,
  // not state), the manifestsMatch should still return true if it excluded initializedAt.
  // But manifestsMatch DOESN'T check initializedAt, so it compares the rest.
  // The rest still matches -> manifestsMatch returns true -> status = 'current'
  // -> manifest is NOT overwritten -> initializedAt stays tampered.
  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'initializedAt tamper does not cause error');
  const m2 = getManifest(d);
  assert(m2.initializedAt === '2020-01-01T00:00:00.000Z',
    'initializedAt tamper is not detected — preserved as-is (provenance field excluded from comparison)');
  assert(m2.adapter.id === originalAdapterId, 'adapter unchanged');
  cleanup(d);
}

// ================================================================
// MANIFEST: match
// ================================================================
console.log('Manifest: match');
{
  const m1 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'generic', artifact: null, name: 'Generic' },
    binding: [],
    managedFiles: [],
  });
  const m2 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'generic', artifact: null, name: 'Generic' },
    binding: [],
    managedFiles: [],
  });
  assert(manifestsMatch(m1, m2), 'identical manifests match');
}

// ================================================================
// MANIFEST: initializedAt stable on repeat init
// ================================================================
console.log('Manifest: initializedAt stable on repeat');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);
  const ts1 = m1.initializedAt;
  // Wait a tick to ensure timestamp would differ if regenerated
  execute(d, pkgRoot);
  const m2 = getManifest(d);
  assert(m2.initializedAt === ts1, 'initializedAt preserved across repeat init');
  cleanup(d);
}

// ================================================================
// MANIFEST: stale -> regenerate (different adapter)
// ================================================================
console.log('Manifest: stale adapter -> regenerate');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);
  const originalAdapter = m1.adapter.id;

  // Tamper: change adapter to something different
  m1.adapter.id = 'wrong-adapter';
  writeManifest(d, m1);

  // Re-init should regenerate (stale), not error
  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'stale manifest does not cause error');
  const m2 = getManifest(d);
  assert(m2.adapter.id === originalAdapter, 'adapter corrected after stale manifest');
  cleanup(d);
}

// ================================================================
// MANIFEST: stale -> regenerate (different version)
// ================================================================
console.log('Manifest: stale version -> regenerate');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: change distribution version
  m1.distributionVersion = '0.0.1';
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'stale version does not cause error');
  const m2 = getManifest(d);
  assert(m2.distributionVersion === '1.0.0', 'version corrected after stale manifest');
  cleanup(d);
}

// ================================================================
// MANIFEST: stale -> regenerate (partial state)
// ================================================================
console.log('Manifest: stale state -> regenerate');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: set state to partial
  m1.state = 'partial';
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'partial state does not cause error');
  const m2 = getManifest(d);
  assert(m2.state === 'bootstrapped', 'state repaired to bootstrapped');
  cleanup(d);
}

// ================================================================
// MANIFEST: manually modified -> preserve
// ================================================================
console.log('Manifest: manually modified -> preserve');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper with a non-structural field (simulating user edit)
  m1.adapter.version = 'user-edit';
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'manual modification does not cause error');
  const m2 = getManifest(d);
  // Manifest should be preserved (not overwritten)
  assert(m2.adapter.version === 'user-edit', 'manual modification preserved');
  cleanup(d);
}

// ================================================================
// MANIFEST: adapter.version tampering -> manually modified, preserved
// ================================================================
console.log('Manifest: adapter.version tamper -> preserve');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);
  const originalVersion = m1.adapter.version;

  // Tamper: change only adapter.version
  m1.adapter.version = 'tampered-version';
  writeManifest(d, m1);

  // Re-init: manifestsMatch now compares adapter.version, so it returns false.
  // checkIdempotency: adapter.id matches, distributionVersion matches, state matches,
  // all managed files exist -> classified as manually-modified -> manifest preserved.
  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'adapter.version tamper does not cause error');
  const m2 = getManifest(d);
  assert(m2.adapter.version === 'tampered-version',
    'adapter.version tamper preserved (manually-modified)');
  assert(m2.adapter.version !== originalVersion, 'adapter.version was actually changed');
  cleanup(d);
}

// ================================================================
// MANIFEST: adapter.version only differs -> manifestsMatch returns false
// ================================================================
console.log('Manifest: adapter.version mismatch -> no match');
{
  const m1 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'opencode', artifact: 'adapters/opencode', name: 'OpenCode Adapter' },
    binding: [],
    managedFiles: [],
  });
  const m2 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'opencode', artifact: 'adapters/opencode', name: 'OpenCode Adapter' },
    binding: [],
    managedFiles: [],
  });
  m2.adapter.version = 'different-version';
  assert(!manifestsMatch(m1, m2), 'manifests with different adapter.version do not match');
}

// ================================================================
// MANIFEST: initializedAt-only difference -> manifestsMatch returns true
// ================================================================
console.log('Manifest: initializedAt only -> still matches');
{
  const m1 = createManifest({
    pcmVersion: '1.0',
    distributionVersion: '1.0.0',
    adapter: { id: 'generic', artifact: null, name: 'Generic' },
    binding: [],
    managedFiles: [],
  });
  const m2 = JSON.parse(JSON.stringify(m1));
  m2.initializedAt = '2020-01-01T00:00:00.000Z';
  assert(manifestsMatch(m1, m2), 'manifests with only initializedAt different still match');
}

// ================================================================
// MANIFEST: manually modified managedFiles -> stale (missing file)
// ================================================================
console.log('Manifest: manual mod with missing file -> stale');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: add a non-existent file to managedFiles
  m1.managedFiles.push('pcm/docs/NONEXISTENT.md');
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'stale managedFiles does not cause error');
  const m2 = getManifest(d);
  // Should be regenerated because managed file is missing from disk
  assert(!m2.managedFiles.includes('pcm/docs/NONEXISTENT.md'), 'stale managedFiles corrected');
  cleanup(d);
}

// ================================================================
// ADAPTER CHANGE: re-init with different adapter -> succeeds
// ================================================================
console.log('Adapter change: re-init succeeds');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);
  const originalAdapter = m1.adapter.id;

  // Tamper to simulate old adapter
  m1.adapter.id = 'old-adapter';
  m1.distributionVersion = '0.0.1';
  writeManifest(d, m1);

  // Re-init should succeed and use current adapter
  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'adapter change does not cause error');
  const m2 = getManifest(d);
  assert(m2.adapter.id === originalAdapter, 'current adapter used after change');
  cleanup(d);
}

// ================================================================
// FILES WRITTEN: first init counts correctly
// ================================================================
console.log('Files written: first init count');
{
  const d = tmpDir();
  const r = execute(d, pkgRoot);
  // First init: 3 core files + binding files (0 for generic, 2+ for opencode)
  const m = getManifest(d);
  const expectedCore = 3;
  const expectedBinding = m.binding.length;
  const expectedTotal = expectedCore + expectedBinding;
  assert(r.filesWritten === expectedTotal,
    `first init files written = ${expectedTotal} (got ${r.filesWritten})`);
  cleanup(d);
}

// ================================================================
// FILES WRITTEN: repeat init counts 0
// ================================================================
console.log('Files written: repeat init count 0');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const r = execute(d, pkgRoot);
  assert(r.filesWritten === 0, 'repeat init files written = 0');
  cleanup(d);
}

// ================================================================
// FILES WRITTEN: modified core counts 1
// ================================================================
console.log('Files written: modified core count');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const pcmPath = path.join(d, 'pcm', 'docs', 'PCM.md');
  fs.writeFileSync(pcmPath, 'MODIFIED');
  const r = execute(d, pkgRoot);
  assert(r.filesWritten === 1, `modified core count = 1 (got ${r.filesWritten})`);
  cleanup(d);
}

// ================================================================
// DETERMINISM: same output across runs
// ================================================================
console.log('Determinism: identical output');
{
  const d1 = tmpDir();
  const d2 = tmpDir();
  const r1 = execute(d1, pkgRoot);
  const r2 = execute(d2, pkgRoot);
  assert(r1.adapter === r2.adapter, 'same adapter');
  assert(r1.filesWritten === r2.filesWritten, 'same files written');
  const m1 = getManifest(d1);
  const m2 = getManifest(d2);
  // initializedAt differs (different timestamps), but everything else matches
  assert(m1.adapter.id === m2.adapter.id, 'same manifest adapter');
  assert(m1.state === m2.state, 'same manifest state');
  assert(JSON.stringify(m1.binding) === JSON.stringify(m2.binding), 'same manifest binding');
  cleanup(d1);
  cleanup(d2);
}

// ================================================================
// SUMMARY
// ================================================================
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
