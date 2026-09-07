'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const { execute, parseArgs, getPackageRoot } = require('../src/cli');
const { detect } = require('../src/detect');
const { loadCatalog } = require('../src/catalog');
const { select, capabilitiesSatisfied, isTrusted } = require('../src/select');
const { resolveArtifact } = require('../src/resolve');
const { createManifest, readManifest, writeManifest, manifestsMatch } = require('../src/manifest');

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

// === A: Empty/unknown repo, no tools -> generic ===
console.log('A: Empty repo -> generic adapter');
{
  const d = tmpDir();
  const origEnv = { ...process.env };
  // Clear tool paths to simulate no tools
  delete process.env.PATH;
  process.env.PATH = '/usr/bin:/bin';
  const env = detect();
  const cat = loadCatalog(pkgRoot);
  const adapter = select(cat, env);
  assert(adapter.id === 'generic', 'should select generic when no tools present');
  process.env = origEnv;
  cleanup(d);
}

// === B: Unknown repo, OpenCode present -> opencode ===
console.log('B: OpenCode present -> opencode adapter');
{
  const env = detect();
  const cat = loadCatalog(pkgRoot);
  const adapter = select(cat, env);
  // On this machine opencode may or may not be present
  if (env.capabilities.opencode) {
    assert(adapter.id === 'opencode', 'should select opencode');
  } else {
    assert(adapter.id === 'generic', 'should fallback to generic');
  }
}

// === E: Repeat init idempotent ===
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

// === G: Modified core -> overwrite ===
console.log('G: Modified core -> overwrite');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const pcmPath = path.join(d, 'pcm', 'docs', 'PCM.md');
  fs.writeFileSync(pcmPath, 'MODIFIED');
  execute(d, pkgRoot);
  const after = fs.readFileSync(pcmPath, 'utf8');
  assert(after !== 'MODIFIED', 'core overwritten after modification');
  assert(after.startsWith('# Protocol'), 'core has correct content');
  cleanup(d);
}

// === L: Modified binding -> preserve ===
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

// === M: Missing binding -> recreate ===
console.log('M: Missing binding -> recreate');
{
  const d = tmpDir();
  execute(d, pkgRoot);
  const m = getManifest(d);
  if (m.binding.length > 0) {
    const bindPath = path.join(d, m.binding[0]);
    fs.unlinkSync(bindPath);
    execute(d, pkgRoot);
    assert(fs.existsSync(bindPath), 'binding recreated after deletion');
  } else {
    assert(true, 'skipped (no binding files)');
  }
  cleanup(d);
}

// === H: Governance untouched ===
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

// === CLI: invalid args ===
console.log('CLI: invalid args');
{
  const r1 = parseArgs(['node', 'pcm.js', 'a', 'b']);
  assert(r1.error !== undefined, 'too many args -> error');

  const r2 = parseArgs(['node', 'pcm.js', '--force']);
  assert(r2.error !== undefined, 'unsupported flag -> error');

  const r3 = parseArgs(['node', 'pcm.js']);
  assert(r3.target !== undefined, 'no args -> default target');
}

// === Selection: determinism ===
console.log('Selection: deterministic');
{
  const env = detect();
  const cat = loadCatalog(pkgRoot);
  const a1 = select(cat, env);
  const a2 = select(cat, env);
  assert(a1.id === a2.id, 'same adapter selected twice');
  assert(a1.priority === a2.priority, 'same priority');
}

// === Catalog: validation ===
console.log('Catalog: validation');
{
  const cat = loadCatalog(pkgRoot);
  assert(cat.version === '1.0', 'catalog version is 1.0');
  assert(cat.adapters.length >= 2, 'at least 2 adapters');
  assert(isTrusted('opencode'), 'opencode is trusted');
  assert(isTrusted('generic'), 'generic is trusted');
}

// === capabilitiesSatisfied ===
console.log('capabilitiesSatisfied');
{
  assert(capabilitiesSatisfied(null, {}), 'null requires -> true');
  assert(capabilitiesSatisfied({}, {}), 'empty requires -> true');
  assert(capabilitiesSatisfied({ opencode: '*' }, { opencode: 'present' }), 'cap present -> true');
  assert(!capabilitiesSatisfied({ opencode: '*' }, {}), 'cap missing -> false');
}

// === MANIFEST: schema ===
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
  assert(m.state === 'bootstrapped', 'state is bootstrapped');
  assert(Array.isArray(m.binding), 'binding is array');
  assert(Array.isArray(m.managedFiles), 'managedFiles is array');
}

// === MANIFEST: match ===
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
  // Both have same content except initializedAt (different timestamps)
  // manifestsMatch checks everything except initializedAt
  assert(manifestsMatch(m1, m2), 'identical manifests match');
}

// === SUMMARY ===
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
