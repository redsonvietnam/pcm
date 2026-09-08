'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const { execute, parseArgs, getPackageRoot } = require('../src/cli');
const { detect } = require('../src/detect');
const { loadCatalog } = require('../src/catalog');
const { select, capabilitiesSatisfied, isTrusted } = require('../src/select');
const { createManifest, readManifest, writeManifest, manifestsMatch, isManifestComplete } = require('../src/manifest');
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
// MANIFEST: valid JSON but missing adapter object
// ================================================================
console.log('Manifest: missing adapter object');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove adapter entirely
  delete m1.adapter;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing adapter does not cause crash');
  const m2 = getManifest(d);
  assert(m2.adapter && m2.adapter.id, 'manifest regenerated with adapter');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but missing adapter.id
// ================================================================
console.log('Manifest: missing adapter.id');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove adapter.id
  delete m1.adapter.id;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing adapter.id does not cause crash');
  const m2 = getManifest(d);
  assert(typeof m2.adapter.id === 'string' && m2.adapter.id.length > 0,
    'manifest regenerated with adapter.id');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but missing adapter.artifactPath
// ================================================================
console.log('Manifest: missing adapter.artifactPath');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove adapter.artifactPath
  delete m1.adapter.artifactPath;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing adapter.artifactPath does not cause crash');
  const m2 = getManifest(d);
  assert('artifactPath' in m2.adapter, 'manifest regenerated with artifactPath');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but missing state
// ================================================================
console.log('Manifest: missing state');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove state
  delete m1.state;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing state does not cause crash');
  const m2 = getManifest(d);
  assert(m2.state === 'bootstrapped', 'manifest regenerated with state');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but missing core
// ================================================================
console.log('Manifest: missing core');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove core
  delete m1.core;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing core does not cause crash');
  const m2 = getManifest(d);
  assert(m2.core && m2.core.pcm, 'manifest regenerated with core');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but missing binding
// ================================================================
console.log('Manifest: missing binding');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove binding
  delete m1.binding;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing binding does not cause crash');
  const m2 = getManifest(d);
  assert(Array.isArray(m2.binding), 'manifest regenerated with binding array');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but missing managedFiles
// ================================================================
console.log('Manifest: missing managedFiles');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper: remove managedFiles
  delete m1.managedFiles;
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'missing managedFiles does not cause crash');
  const m2 = getManifest(d);
  assert(Array.isArray(m2.managedFiles), 'manifest regenerated with managedFiles array');
  cleanup(d);
}

// ================================================================
// MANIFEST: valid JSON but empty object
// ================================================================
console.log('Manifest: empty JSON object');
{
  const d = tmpDir();
  fs.mkdirSync(path.join(d, 'pcm'), { recursive: true });
  fs.writeFileSync(path.join(d, 'pcm', '.pcm-manifest.json'), '{}');

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'empty JSON object does not cause crash');
  const m = getManifest(d);
  assert(m.adapter && m.adapter.id, 'manifest regenerated with full structure');
  cleanup(d);
}

// ================================================================
// MANIFEST: malformed JSON
// ================================================================
console.log('Manifest: malformed JSON');
{
  const d = tmpDir();
  fs.mkdirSync(path.join(d, 'pcm'), { recursive: true });
  fs.writeFileSync(path.join(d, 'pcm', '.pcm-manifest.json'), '{invalid json!!!');

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'malformed JSON does not cause crash');
  const m = getManifest(d);
  assert(m.adapter && m.adapter.id, 'manifest regenerated after malformed JSON');
  cleanup(d);
}

// ================================================================
// MANIFEST: isManifestComplete validation
// ================================================================
console.log('Manifest: isManifestComplete');
{
  assert(!isManifestComplete(null), 'null is not complete');
  assert(!isManifestComplete(undefined), 'undefined is not complete');
  assert(!isManifestComplete('string'), 'string is not complete');
  assert(!isManifestComplete({}), 'empty object is not complete');

  // Missing adapter
  assert(!isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    state: 'bootstrapped', core: {}, binding: [], managedFiles: []
  }), 'missing adapter is not complete');

  // Missing adapter.id
  assert(!isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { origin: 'built-in' },
    state: 'bootstrapped', core: {}, binding: [], managedFiles: []
  }), 'missing adapter.id is not complete');

  // Missing state
  assert(!isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { id: 'generic', origin: 'built-in' },
    core: {}, binding: [], managedFiles: []
  }), 'missing state is not complete');

  // Missing core
  assert(!isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { id: 'generic', origin: 'built-in' },
    state: 'bootstrapped', binding: [], managedFiles: []
  }), 'missing core is not complete');

  // Missing binding (not array)
  assert(!isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { id: 'generic', origin: 'built-in' },
    state: 'bootstrapped', core: {}, managedFiles: []
  }), 'missing binding is not complete');

  // Full valid manifest
  assert(isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { id: 'generic', origin: 'built-in', artifactPath: null, version: '1.0.0' },
    state: 'bootstrapped',
    core: { pcm: 'pcm/docs/PCM.md', pwf: 'pcm/docs/PWF.md', conformance: 'pcm/docs/CONFORMANCE.md' },
    binding: [],
    managedFiles: []
  }), 'complete manifest passes');
}

// ================================================================
// MANIFEST: existing manual-modification case remains preserved
// ================================================================
console.log('Manifest: manual modification after structural hardening');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);

  // Tamper with adapter.version (non-structural user edit)
  m1.adapter.version = 'user-custom-version';
  writeManifest(d, m1);

  const r = execute(d, pkgRoot);
  assert(r.exitCode === 0, 'manual modification does not cause error');
  const m2 = getManifest(d);
  assert(m2.adapter.version === 'user-custom-version', 'manual modification preserved');
  cleanup(d);
}

// ================================================================
// MANIFEST: existing stale-manifest cases remain recoverable
// ================================================================
console.log('Manifest: stale cases remain recoverable');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m1 = getManifest(d);
  const originalAdapter = m1.adapter.id;

  // Case 1: wrong adapter
  m1.adapter.id = 'wrong-adapter';
  writeManifest(d, m1);
  let r = execute(d, pkgRoot);
  let m2 = getManifest(d);
  assert(r.exitCode === 0, 'wrong adapter does not cause error');
  assert(m2.adapter.id === originalAdapter, 'wrong adapter corrected');

  // Case 2: wrong version
  execute(d, pkgRoot);
  m2 = getManifest(d);
  m2.distributionVersion = '0.0.1';
  writeManifest(d, m2);
  r = execute(d, pkgRoot);
  const m3 = getManifest(d);
  assert(r.exitCode === 0, 'wrong version does not cause error');
  assert(m3.distributionVersion === '1.0.0', 'wrong version corrected');

  cleanup(d);
}

// ================================================================
// CONFORMANCE: missing required manifest structure
// ================================================================
console.log('Conformance: missing manifest structure detected');
{
  const d = tmpDir();
  fs.mkdirSync(path.join(d, 'pcm'), { recursive: true });
  fs.writeFileSync(path.join(d, 'pcm', '.pcm-manifest.json'), '{}');
  const m = readManifest(d);
  assert(!isManifestComplete(m), 'empty manifest detected as incomplete');

  fs.writeFileSync(path.join(d, 'pcm', '.pcm-manifest.json'),
    JSON.stringify({ pcmVersion: '1.0' }));
  const m2 = readManifest(d);
  assert(!isManifestComplete(m2), 'partial manifest detected as incomplete');
  cleanup(d);
}

// ================================================================
// CONFORMANCE: invalid registry structure
// ================================================================
console.log('Conformance: invalid registry structure detected');
{
  assert(!isManifestComplete(null), 'null manifest detected');
  assert(!isManifestComplete('string'), 'string manifest detected');
  assert(!isManifestComplete(42), 'number manifest detected');

  // Valid manifest structure check
  assert(isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { id: 'generic', origin: 'built-in', artifactPath: null, version: '1.0.0' },
    state: 'bootstrapped',
    core: { pcm: 'x', pwf: 'y', conformance: 'z' },
    binding: [], managedFiles: []
  }), 'valid manifest passes isManifestComplete');

  // Invalid: adapter missing required fields
  assert(!isManifestComplete({
    pcmVersion: '1.0', distributionVersion: '1.0.0',
    adapter: { id: 'generic' },
    state: 'bootstrapped', core: {}, binding: [], managedFiles: []
  }), 'adapter missing origin detected');
}

// ================================================================
// CONFORMANCE: missing adapter artifact
// ================================================================
console.log('Conformance: missing adapter artifact detected');
{
  const { resolveArtifact } = require('../src/resolve');
  const fakeAdapter = { id: 'nonexistent', artifact: 'adapters/nonexistent' };
  const result = resolveArtifact(fakeAdapter, pkgRoot);
  assert(result === null, 'missing adapter artifact returns null');
}

// ================================================================
// CONFORMANCE: missing core artifact
// ================================================================
console.log('Conformance: missing core artifact detected');
{
  const d = tmpDir();
  const r = execute(d, pkgRoot);
  // Verify core files exist after init
  const corePath = path.join(d, 'pcm', 'docs', 'PCM.md');
  assert(fs.existsSync(corePath), 'core artifact exists after init');

  // Simulate missing core by removing it
  fs.unlinkSync(corePath);
  const m = getManifest(d);
  // Manifest still references the core file
  assert(m.core.pcm === 'pcm/docs/PCM.md', 'manifest references core file');
  assert(!fs.existsSync(corePath), 'core file is actually missing');
  cleanup(d);
}

// ================================================================
// CONFORMANCE: broken package-relative resolution
// ================================================================
console.log('Conformance: package-relative resolution');
{
  const root = getPackageRoot();
  assert(path.isAbsolute(root), 'package root is absolute path');
  assert(fs.existsSync(path.join(root, 'package.json')), 'package.json found at root');
  assert(fs.existsSync(path.join(root, 'src', 'cli.js')), 'src/cli.js found at root');
  assert(fs.existsSync(path.join(root, 'bin', 'pcm.js')), 'bin/pcm.js found at root');

  // Verify resolveArtifact uses package-relative paths
  const { resolveArtifact } = require('../src/resolve');
  const adapter = { id: 'opencode', artifact: 'adapters/opencode' };
  const records = resolveArtifact(adapter, root);
  assert(Array.isArray(records) && records.length > 0,
    'resolveArtifact finds files using package-relative path');
}

// ================================================================
// CONFORMANCE RUNNER: invalid registry detection
// ================================================================
console.log('Conformance runner: invalid registry detected');
{
  const { runConformance } = require('../scripts/conformance');
  const fixture = tmpDir();
  try {
    // Create a minimal valid package structure
    fs.mkdirSync(path.join(fixture, 'bin'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'src'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'registry'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'adapters', 'opencode'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'core'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0', bin: { pcm: 'bin/pcm.js' }, files: ['bin/'] }));
    fs.writeFileSync(path.join(fixture, 'bin', 'pcm.js'), '#!/usr/bin/env node\nrequire("../src/cli")');
    fs.writeFileSync(path.join(fixture, 'src', 'cli.js'), 'module.exports = {}');
    fs.writeFileSync(path.join(fixture, 'core', 'PCM.md'), '# PCM');
    fs.writeFileSync(path.join(fixture, 'core', 'PWF.md'), '# PWF');
    fs.writeFileSync(path.join(fixture, 'core', 'CONFORMANCE.md'), '# CONFORMANCE');
    fs.writeFileSync(path.join(fixture, 'adapters', 'opencode', 'SKILL.md'), '# SKILL');

    // Break: invalid registry JSON
    fs.writeFileSync(path.join(fixture, 'registry', 'pcm-adapters.json'), '{invalid json');

    const result = runConformance(fixture, { execRoot: pkgRoot });
    assert(result.failed > 0, 'runner detects invalid registry',
      `expected failures, got ${result.failed}`);
    const registryParse = result.results.find(r => r.id === 'registry/parse');
    assert(registryParse && !registryParse.pass, 'registry/parse failed',
      'registry parse failure not detected');
  } finally {
    cleanup(fixture);
  }
}

// ================================================================
// CONFORMANCE RUNNER: missing adapter artifact detection
// ================================================================
console.log('Conformance runner: missing adapter artifact detected');
{
  const { runConformance } = require('../scripts/conformance');
  const fixture = tmpDir();
  try {
    // Create a minimal valid package structure
    fs.mkdirSync(path.join(fixture, 'bin'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'src'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'registry'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'adapters', 'opencode'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'core'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0', bin: { pcm: 'bin/pcm.js' }, files: ['bin/'] }));
    fs.writeFileSync(path.join(fixture, 'bin', 'pcm.js'), '#!/usr/bin/env node\nrequire("../src/cli")');
    fs.writeFileSync(path.join(fixture, 'src', 'cli.js'), 'module.exports = {}');
    fs.writeFileSync(path.join(fixture, 'core', 'PCM.md'), '# PCM');
    fs.writeFileSync(path.join(fixture, 'core', 'PWF.md'), '# PWF');
    fs.writeFileSync(path.join(fixture, 'core', 'CONFORMANCE.md'), '# CONFORMANCE');
    fs.writeFileSync(path.join(fixture, 'adapters', 'opencode', 'SKILL.md'), '# SKILL');

    // Break: catalog references artifact path that doesn't exist
    fs.writeFileSync(path.join(fixture, 'registry', 'pcm-adapters.json'), JSON.stringify({
      version: '1.0',
      defaultAdapter: 'opencode',
      adapters: [
        { id: 'opencode', name: 'OpenCode', platforms: ['*'], shells: ['*'],
          requires: null, tested: true, priority: 1, artifact: 'adapters/opencode' },
        { id: 'generic', name: 'Generic', platforms: ['*'], shells: ['*'],
          requires: null, tested: true, priority: 999, artifact: null },
      ]
    }));
    // Remove the adapter artifact directory to simulate missing
    fs.rmSync(path.join(fixture, 'adapters', 'opencode'), { recursive: true, force: true });

    const result = runConformance(fixture, { execRoot: pkgRoot });
    assert(result.failed > 0, 'runner detects missing adapter artifact',
      `expected failures, got ${result.failed}`);
    const loadFail = result.results.find(r => r.id === 'adapter/load' && !r.pass);
    assert(loadFail !== undefined, 'adapter/load failure detected',
      'missing adapter artifact not detected via catalog validation');
  } finally {
    cleanup(fixture);
  }
}

// ================================================================
// CONFORMANCE RUNNER: missing core artifact detection
// ================================================================
console.log('Conformance runner: missing core artifact detected');
{
  const { runConformance } = require('../scripts/conformance');
  const fixture = tmpDir();
  try {
    // Create a minimal valid package structure but missing core files
    fs.mkdirSync(path.join(fixture, 'bin'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'src'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'registry'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'adapters', 'opencode'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'core'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0', bin: { pcm: 'bin/pcm.js' }, files: ['bin/'] }));
    fs.writeFileSync(path.join(fixture, 'bin', 'pcm.js'), '#!/usr/bin/env node\nrequire("../src/cli")');
    fs.writeFileSync(path.join(fixture, 'src', 'cli.js'), 'module.exports = {}');
    fs.writeFileSync(path.join(fixture, 'adapters', 'opencode', 'SKILL.md'), '# SKILL');
    fs.writeFileSync(path.join(fixture, 'registry', 'pcm-adapters.json'), JSON.stringify({
      version: '1.0',
      defaultAdapter: 'opencode',
      adapters: [
        { id: 'opencode', name: 'OpenCode', platforms: ['*'], shells: ['*'],
          requires: null, tested: true, priority: 1, artifact: 'adapters/opencode' },
        { id: 'generic', name: 'Generic', platforms: ['*'], shells: ['*'],
          requires: null, tested: true, priority: 999, artifact: null },
      ]
    }));
    // core/ exists but is empty — all 3 core files missing
    // (no PCM.md, no PWF.md, no CONFORMANCE.md)

    const result = runConformance(fixture, { execRoot: pkgRoot });
    assert(result.failed > 0, 'runner detects missing core artifacts',
      `expected failures, got ${result.failed}`);
    const pcmCheck = result.results.find(r => r.id === 'core/PCM.md' && !r.pass);
    const pwfCheck = result.results.find(r => r.id === 'core/PWF.md' && !r.pass);
    const confCheck = result.results.find(r => r.id === 'core/CONFORMANCE.md' && !r.pass);
    assert(pcmCheck !== undefined, 'core/PCM.md missing detected');
    assert(pwfCheck !== undefined, 'core/PWF.md missing detected');
    assert(confCheck !== undefined, 'core/CONFORMANCE.md missing detected');
  } finally {
    cleanup(fixture);
  }
}

// ================================================================
// CONFORMANCE RUNNER: healthy package still reports CONFORMANT
// ================================================================
console.log('Conformance runner: healthy package reports CONFORMANT');
{
  const { runConformance } = require('../scripts/conformance');
  const result = runConformance(pkgRoot);
  assert(result.failed === 0, 'healthy package has 0 failures',
    `got ${result.failed} failures: ${result.results.filter(r => !r.pass).map(r => r.id).join(', ')}`);
  assert(result.passed > 50, 'healthy package has many passes',
    `got ${result.passed} passes`);
}

// ================================================================
// GOVERNANCE: artifact contract
// ================================================================
const { validateEvidence, evaluateEvidence, validateGate, assessGate } = require('../governance/validate');

console.log('Governance: valid evidence current -> accepted');
{
  const ev = {
    id: 'ev-1',
    provenance: 'independently-produced',
    subject: 'build success',
    producedAt: '2026-09-08T10:00:00.000Z',
    canonicalVersion: 'canonical/2026-09-08/v1',
    expiresAt: null,
    invalidatedAt: null,
  };
  assert(validateEvidence(ev).valid, 'valid evidence passes schema');
  const r = evaluateEvidence(ev, { now: Date.parse('2026-09-08T11:00:00.000Z') });
  assert(r.accepted && r.status === 'current', `current evidence accepted, got ${r.status}`);
}

console.log('Governance: provenance categories');
{
  for (const p of ['self-reported', 'independently-produced', 'automatically-observed']) {
    const ev = {
      id: 'ev-' + p,
      provenance: p,
      subject: 'x',
      producedAt: '2026-09-08T10:00:00.000Z',
      expiresAt: null,
      invalidatedAt: null,
    };
    assert(validateEvidence(ev).valid, `${p} is valid provenance`);
  }
  const bad = { id: 'ev-bad', provenance: 'rumored', subject: 'x', producedAt: '2026-09-08T10:00:00.000Z' };
  assert(!validateEvidence(bad).valid, 'unknown provenance rejected');
  assert(evaluateEvidence(bad, {}).status === 'malformed', 'bad provenance -> malformed');
}

console.log('Governance: stale evidence rejected');
{
  const ev = {
    id: 'ev-stale',
    provenance: 'self-reported',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: '2026-09-08T12:00:00.000Z',
    invalidatedAt: null,
  };
  const r = evaluateEvidence(ev, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!r.accepted && r.status === 'stale', `stale rejected, got ${r.status}`);
}

console.log('Governance: invalidated evidence rejected');
{
  const ev = {
    id: 'ev-invalidated',
    provenance: 'independently-produced',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: null,
    invalidatedAt: '2026-09-08T11:00:00.000Z',
  };
  const r = evaluateEvidence(ev, { now: Date.parse('2026-09-08T11:30:00.000Z') });
  assert(!r.accepted && r.status === 'invalidated', `invalidated rejected, got ${r.status}`);
}

console.log('Governance: wrong canonical binding rejected');
{
  const ev = {
    id: 'ev-wrong',
    provenance: 'automatically-observed',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    canonicalVersion: 'canonical/OLD',
    expiresAt: null,
    invalidatedAt: null,
  };
  const r = evaluateEvidence(ev, { now: Date.now(), expectedCanonicalVersion: 'canonical/NEW' });
  assert(!r.accepted && r.status === 'wrong-binding', `wrong binding rejected, got ${r.status}`);

  const missing = { id: 'ev-nobind', provenance: 'self-reported', subject: 'x', producedAt: '2026-09-08T10:00:00.000Z' };
  const r2 = evaluateEvidence(missing, { now: Date.now(), expectedCanonicalVersion: 'canonical/NEW' });
  assert(!r2.accepted && r2.status === 'missing-binding', `missing binding rejected, got ${r2.status}`);
}

console.log('Governance: malformed evidence rejected');
{
  const r = evaluateEvidence({ id: 42 }, { now: Date.now() });
  assert(!r.accepted && r.status === 'malformed', 'malformed evidence rejected');
}

console.log('Governance: boundary now === expiresAt => stale');
{
  const ev = {
    id: 'ev-boundary',
    provenance: 'self-reported',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: '2026-09-08T12:00:00.000Z',
    invalidatedAt: null,
  };
  const r = evaluateEvidence(ev, { now: Date.parse('2026-09-08T12:00:00.000Z') });
  assert(!r.accepted && r.status === 'stale', `exact boundary stale, got ${r.status}`);
}

console.log('Governance: boundary now < expiresAt => current');
{
  const ev = {
    id: 'ev-before-boundary',
    provenance: 'automatically-observed',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: '2026-09-08T12:00:00.000Z',
    invalidatedAt: null,
  };
  const r = evaluateEvidence(ev, { now: Date.parse('2026-09-08T11:59:59.999Z') });
  assert(r.accepted && r.status === 'current', `just before boundary current, got ${r.status}`);
}

console.log('Governance: invalidated evidence remains invalidated regardless of expiry');
{
  const ev = {
    id: 'ev-invalidated-stale',
    provenance: 'independently-produced',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: '2026-09-08T11:00:00.000Z',
    invalidatedAt: '2026-09-08T10:30:00.000Z',
  };
  const r = evaluateEvidence(ev, { now: Date.parse('2026-09-08T12:00:00.000Z') });
  assert(!r.accepted && r.status === 'invalidated', `invalidated takes precedence, got ${r.status}`);
}

console.log('Governance: valid ISO timestamp accepted');
{
  const ev = {
    id: 'ev-iso',
    provenance: 'self-reported',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: '2026-09-08T12:00:00.000Z',
    invalidatedAt: null,
  };
  assert(validateEvidence(ev).valid, 'canonical ISO timestamp accepted');
}

console.log('Governance: malformed timestamp rejected');
{
  const ev = {
    id: 'ev-badt',
    provenance: 'self-reported',
    subject: 'x',
    producedAt: 'not-a-date',
    invalidatedAt: null,
  };
  assert(!validateEvidence(ev).valid, 'malformed producedAt rejected');
  const ev2 = {
    id: 'ev-badt2',
    provenance: 'self-reported',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    expiresAt: '09/08/2026',
    invalidatedAt: null,
  };
  assert(!validateEvidence(ev2).valid, 'non-ISO expiresAt rejected');
  const ev3 = {
    id: 'ev-badt3',
    provenance: 'self-reported',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    invalidatedAt: 'September 8, 2026',
  };
  assert(!validateEvidence(ev3).valid, 'non-ISO invalidatedAt rejected');
}

console.log('Governance: canonical-version binding unchanged');
{
  const ev = {
    id: 'ev-bind',
    provenance: 'independently-produced',
    subject: 'x',
    producedAt: '2026-09-08T10:00:00.000Z',
    canonicalVersion: 'canonical/2026-09-08/v1',
    expiresAt: null,
    invalidatedAt: null,
  };
  const r = evaluateEvidence(ev, { now: Date.now(), expectedCanonicalVersion: 'canonical/2026-09-08/v1' });
  assert(r.accepted && r.status === 'current', 'binding matches');
  const r2 = evaluateEvidence(ev, { now: Date.now(), expectedCanonicalVersion: 'canonical/OTHER' });
  assert(!r2.accepted && r2.status === 'wrong-binding', 'binding mismatch');
}

// ---- GATE ----

function baseEvidence() {
  return {
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
}

function baseGate() {
  return {
    id: 'GATE-1',
    subject: 'PROPOSAL-1',
    canonicalVersion: 'canonical/2026-09-08/v1',
    decision: 'approved',
    authority: { role: 'authority', ref: 'authority/root' },
    decidedAt: '2026-09-08T12:00:00.000Z',
    evidence: ['ev-1'],
  };
}

console.log('Governance: valid gate approvable');
{
  assert(validateGate(baseGate()).valid, 'valid gate passes schema');
  const r = assessGate(baseGate(), {
    evidenceById: baseEvidence(),
    expectedCanonicalVersion: 'canonical/2026-09-08/v1',
    now: Date.parse('2026-09-08T13:00:00.000Z'),
  });
  assert(r.gateStatus === 'approvable' && r.decision === 'approved', `approvable, got ${JSON.stringify(r)}`);
}

console.log('Governance: gate missing canonical binding -> blocked');
{
  const g = baseGate();
  delete g.canonicalVersion;
  assert(!validateGate(g).valid, 'missing canonical binding fails schema');
  const r = assessGate(g, { evidenceById: baseEvidence(), now: Date.now() });
  assert(r.gateStatus === 'blocked', `blocked, got ${JSON.stringify(r)}`);
}

console.log('Governance: gate mismatched canonical version -> blocked');
{
  const g = baseGate();
  g.canonicalVersion = 'canonical/OLD';
  const r = assessGate(g, {
    evidenceById: baseEvidence(),
    expectedCanonicalVersion: 'canonical/2026-09-08/v1',
    now: Date.now(),
  });
  assert(r.gateStatus === 'blocked', `blocked, got ${JSON.stringify(r)}`);
}

console.log('Governance: gate malformed authority -> blocked');
{
  const g = baseGate();
  g.authority = { role: 'operator', ref: 'someone' };
  assert(!validateGate(g).valid, 'non-authority role fails schema');
  const r = assessGate(g, { evidenceById: baseEvidence(), now: Date.now() });
  assert(r.gateStatus === 'blocked', `blocked, got ${JSON.stringify(r)}`);
}

console.log('Governance: gate missing required evidence -> blocked');
{
  const g = baseGate();
  g.evidence = ['ev-missing'];
  const r = assessGate(g, { evidenceById: baseEvidence(), now: Date.now() });
  assert(r.gateStatus === 'blocked', `blocked, got ${JSON.stringify(r)}`);
}

console.log('Governance: gate invalid decision structure -> blocked');
{
  const g = baseGate();
  g.decision = 'maybe';
  assert(!validateGate(g).valid, 'invalid decision fails schema');
  const r = assessGate(g, { evidenceById: baseEvidence(), now: Date.now() });
  assert(r.gateStatus === 'blocked', `blocked, got ${JSON.stringify(r)}`);
}

// ---- FAIL-CLOSED ----

console.log('Governance: fail-closed any invalid required evidence => cannot approve');
{
  // stale evidence
  {
    const ev = baseEvidence();
    ev['ev-1'].expiresAt = '2026-09-08T12:00:00.000Z';
    const r = assessGate(baseGate(), { evidenceById: ev, now: Date.parse('2026-09-08T13:00:00.000Z') });
    assert(r.gateStatus === 'blocked', `stale evidence blocks, got ${r.gateStatus}`);
  }
  // invalidated evidence
  {
    const ev = baseEvidence();
    ev['ev-1'].invalidatedAt = '2026-09-08T12:30:00.000Z';
    const r = assessGate(baseGate(), { evidenceById: ev, now: Date.parse('2026-09-08T13:00:00.000Z') });
    assert(r.gateStatus === 'blocked', `invalidated evidence blocks, got ${r.gateStatus}`);
  }
  // wrong canonical binding evidence
  {
    const ev = baseEvidence();
    ev['ev-1'].canonicalVersion = 'canonical/OLD';
    const r = assessGate(baseGate(), { evidenceById: ev, now: Date.parse('2026-09-08T13:00:00.000Z') });
    assert(r.gateStatus === 'blocked', `wrong binding blocks, got ${r.gateStatus}`);
  }
  // missing evidence
  {
    const r = assessGate(baseGate(), { evidenceById: {}, now: Date.now() });
    assert(r.gateStatus === 'blocked', `missing evidence blocks, got ${r.gateStatus}`);
  }
  // rejected is distinct from blocked
  {
    const g = baseGate();
    g.decision = 'rejected';
    g.rationale = 'criteria not met';
    const r = assessGate(g, { evidenceById: baseEvidence(), now: Date.parse('2026-09-08T13:00:00.000Z') });
    assert(r.gateStatus === 'approvable' && r.decision === 'rejected',
      `rejected gate is approvable-as-recorded, got ${JSON.stringify(r)}`);
    const noRationale = baseGate();
    noRationale.decision = 'rejected';
    assert(!validateGate(noRationale).valid, 'rejected without rationale fails schema');
  }
}

// ================================================================
// GOVERNANCE: gate execution (end-to-end)
// ================================================================
const { createCanonicalState, createProposedState, executeGate, promoteState } = require('../governance/promote');

// --- helpers ---

function govEvidence(id, opts) {
  return {
    id,
    provenance: opts.provenance || 'independently-produced',
    subject: opts.subject || 'test evidence',
    producedAt: opts.producedAt || '2026-09-08T10:00:00.000Z',
    canonicalVersion: opts.canonicalVersion || null,
    expiresAt: opts.expiresAt || null,
    invalidatedAt: opts.invalidatedAt || null,
  };
}

function govGate(id, opts) {
  const g = {
    id,
    subject: opts.subject || id,
    canonicalVersion: opts.canonicalVersion || 'c/1',
    decision: opts.decision || 'approved',
    authority: { role: 'authority', ref: opts.authorityRef || 'authority/root' },
    decidedAt: opts.decidedAt || '2026-09-08T12:00:00.000Z',
    evidence: opts.evidence || [],
  };
  if (opts.decision === 'rejected') g.rationale = opts.rationale || 'not approved';
  return g;
}

// --- HAPPY PATH ---

console.log('GateExec: approved gate promotes canonical v1 -> v2');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-1', 'c/1', 'test change');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-1', { subject: 'PROPOSAL-1', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(result.promoted, 'approved gate promotes');
  assert(result.canonical.version === 'PROPOSAL-1/promoted', `canonical advanced, got ${result.canonical.version}`);
  assert(result.gateResult.decision === 'approved', 'gate decision approved');
}

// --- REJECTION ---

console.log('GateExec: rejected gate does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-2', 'c/1', 'rejected change');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-2', { subject: 'PROPOSAL-2', canonicalVersion: 'c/1', decision: 'rejected', evidence: ['ev-1'], rationale: 'no' });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'rejected gate does not promote');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'rejected', 'gate decision rejected');
}

// --- BLOCKED: missing evidence ---

console.log('GateExec: blocked gate (missing evidence) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-3', 'c/1', 'blocked change');
  const gate = govGate('GATE-3', { subject: 'PROPOSAL-3', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-missing'] });
  const result = promoteState(canonical, proposed, gate, {}, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'missing evidence blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: malformed evidence ---

console.log('GateExec: blocked gate (malformed evidence) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-4', 'c/1', 'malformed');
  const evidence = { 'ev-1': { id: 42 } };
  const gate = govGate('GATE-4', { subject: 'PROPOSAL-4', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'malformed evidence blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: stale evidence ---

console.log('GateExec: blocked gate (stale evidence) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-5', 'c/1', 'stale');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1', expiresAt: '2026-09-08T12:00:00.000Z' }) };
  const gate = govGate('GATE-5', { subject: 'PROPOSAL-5', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'stale evidence blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: invalidated evidence ---

console.log('GateExec: blocked gate (invalidated evidence) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-6', 'c/1', 'invalidated');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1', invalidatedAt: '2026-09-08T11:00:00.000Z' }) };
  const gate = govGate('GATE-6', { subject: 'PROPOSAL-6', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'invalidated evidence blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: wrong evidence canonicalVersion ---

console.log('GateExec: blocked gate (wrong evidence binding) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-7', 'c/1', 'wrong binding');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/OLD' }) };
  const gate = govGate('GATE-7', { subject: 'PROPOSAL-7', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'wrong evidence binding blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: GATE wrong canonicalVersion ---

console.log('GateExec: blocked gate (gate wrong canonicalVersion) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-8', 'c/1', 'gate wrong binding');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-8', { subject: 'PROPOSAL-8', canonicalVersion: 'c/WRONG', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'gate wrong canonicalVersion blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: missing canonicalVersion ---

console.log('GateExec: blocked gate (missing canonicalVersion) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-9', 'c/1', 'no binding');
  const gate = { id: 'GATE-9', subject: 'PROPOSAL-9', decision: 'approved', authority: { role: 'authority', ref: 'authority/root' }, decidedAt: '2026-09-08T12:00:00.000Z', evidence: [] };
  const result = promoteState(canonical, proposed, gate, {}, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'missing canonicalVersion blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: invalid authority structure ---

console.log('GateExec: blocked gate (invalid authority) does not promote');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-10', 'c/1', 'bad authority');
  const gate = { id: 'GATE-10', subject: 'PROPOSAL-10', canonicalVersion: 'c/1', decision: 'approved', authority: { role: 'operator', ref: 'someone' }, decidedAt: '2026-09-08T12:00:00.000Z', evidence: [] };
  const result = promoteState(canonical, proposed, gate, {}, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'invalid authority blocks');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- BLOCKED: proposed references stale canonical ---

console.log('GateExec: blocked when proposed references stale canonical');
{
  const canonical = createCanonicalState('c/2');
  const proposed = createProposedState('PROPOSAL-11', 'c/1', 'stale ref');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-11', { subject: 'PROPOSAL-11', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'stale proposed canonical reference blocks');
  assert(result.canonical.version === 'c/2', 'canonical unchanged');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- VERSION BINDING (race/concurrency) ---

console.log('GateExec: version binding - canonical advances -> old gate blocked');
{
  const canonicalV1 = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-12', 'c/1', 'concurrent');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-12', { subject: 'PROPOSAL-12', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });

  // Canonical advances independently to v2
  const canonicalV2 = createCanonicalState('c/2');

  // Old gate evaluated against v1, but current canonical is v2 -> blocked
  const result = promoteState(canonicalV2, proposed, gate, evidence, {
    now: Date.parse('2026-09-08T13:00:00.000Z'),
  });
  assert(!result.promoted, 'old gate blocked by advanced canonical');
  assert(result.canonical.version === 'c/2', 'canonical unchanged at v2');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

// --- EVIDENCE FRESHNESS boundary ---

console.log('GateExec: exact expiry -> blocked');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-13', 'c/1', 'boundary');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1', expiresAt: '2026-09-08T12:00:00.000Z' }) };
  const gate = govGate('GATE-13', { subject: 'PROPOSAL-13', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T12:00:00.000Z') });
  assert(!result.promoted, 'exact expiry blocks');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
}

console.log('GateExec: just before expiry -> approved');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('PROPOSAL-14', 'c/1', 'just before');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1', expiresAt: '2026-09-08T12:00:00.000Z' }) };
  const gate = govGate('GATE-14', { subject: 'PROPOSAL-14', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T11:59:59.999Z') });
  assert(result.promoted, 'just before expiry promotes');
  assert(result.gateResult.decision === 'approved', 'gate decision approved');
}

// --- BINDING CHECKS ---

console.log('GateExec: gate.subject != proposal.id => blocked');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('P-15', 'c/1', 'subject mismatch');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-15', { subject: 'P-WRONG', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'wrong subject blocks');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
}

console.log('GateExec: gate.canonicalVersion != proposed.canonicalVersion => blocked');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('P-16', 'c/1', 'gate binding mismatch');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-16', { subject: 'P-16', canonicalVersion: 'c/WRONG', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'wrong gate canonical binding blocks');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
}

console.log('GateExec: gate.canonicalVersion != canonical.version => blocked');
{
  const canonical = createCanonicalState('c/2');
  const proposed = createProposedState('P-17', 'c/1', 'stale canonical');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-17', { subject: 'P-17', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'wrong canonical version blocks');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
  assert(result.canonical.version === 'c/2', 'canonical unchanged');
}

console.log('GateExec: all three bindings match => promotes');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('P-18', 'c/1', 'all match');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-18', { subject: 'P-18', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(result.promoted, 'all bindings match promotes');
  assert(result.gateResult.decision === 'approved', 'gate decision approved');
}

console.log('GateExec: race - canonical advances after proposal/gate => old gate blocked');
{
  const canonicalV2 = createCanonicalState('c/2');
  const proposed = createProposedState('P-19', 'c/1', 'stale race');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-19', { subject: 'P-19', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonicalV2, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'race blocks');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
  assert(result.canonical.version === 'c/2', 'canonical unchanged at v2');
}

console.log('GateExec: rejection semantics unchanged');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('P-20', 'c/1', 'rejected');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1' }) };
  const gate = govGate('GATE-20', { subject: 'P-20', canonicalVersion: 'c/1', decision: 'rejected', evidence: ['ev-1'], rationale: 'no' });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'rejection does not promote');
  assert(result.gateResult.decision === 'rejected', 'gate decision rejected');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
}

console.log('GateExec: stale/invalidated evidence semantics unchanged');
{
  const canonical = createCanonicalState('c/1');
  const proposed = createProposedState('P-21', 'c/1', 'stale ev');
  const evidence = { 'ev-1': govEvidence('ev-1', { canonicalVersion: 'c/1', expiresAt: '2026-09-08T12:00:00.000Z' }) };
  const gate = govGate('GATE-21', { subject: 'P-21', canonicalVersion: 'c/1', decision: 'approved', evidence: ['ev-1'] });
  const result = promoteState(canonical, proposed, gate, evidence, { now: Date.parse('2026-09-08T13:00:00.000Z') });
  assert(!result.promoted, 'stale evidence blocks');
  assert(result.gateResult.decision === 'blocked', 'gate decision blocked');
  assert(result.canonical.version === 'c/1', 'canonical unchanged');
}

// ================================================================
// SUMMARY
// ================================================================
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
