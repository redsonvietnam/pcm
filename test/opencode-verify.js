'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { globalBindingPaths, runOpencodeVerification } = require('../src/opencode-verify');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${message}`);
  }
}

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

const packageRoot = path.resolve(__dirname, '..');
const canonicalSkill = fs.readFileSync(path.join(packageRoot, 'adapters/opencode/SKILL.md'));
const canonicalCommand = fs.readFileSync(path.join(packageRoot, 'adapters/opencode/commands/pcm.md'));

console.log('OpenCode verification: exact global binding passes');
{
  const home = tmpDir('pcm-home-');
  const cwd = tmpDir('pcm-cwd-');
  const paths = globalBindingPaths(home);
  fs.mkdirSync(path.dirname(paths.skill), { recursive: true });
  fs.mkdirSync(path.dirname(paths.command), { recursive: true });
  fs.writeFileSync(paths.skill, canonicalSkill);
  fs.writeFileSync(paths.command, canonicalCommand);

  const result = runOpencodeVerification({ packageRoot, homeDir: home, cwd });
  assert(result.status === 'PASS', `expected PASS, got ${result.status}`);
  assert(result.aepVersion === '1.0', 'AEP version is 1.0');
  assert(result.checks.some((c) => c.name === 'canonical-aep' && c.status === 'PASS'), 'canonical AEP is present');
  assert(result.checks.some((c) => c.name === 'global-skill' && c.status === 'PASS'), 'global skill exact match');
  assert(result.checks.some((c) => c.name === 'global-command' && c.status === 'PASS'), 'global command exact match');
  assert(result.behavioralConformance === 'SESSION-REQUIRED', 'behavior remains session-level');

  cleanup(home);
  cleanup(cwd);
}

console.log('OpenCode verification: detects skill drift');
{
  const home = tmpDir('pcm-home-');
  const cwd = tmpDir('pcm-cwd-');
  const paths = globalBindingPaths(home);
  fs.mkdirSync(path.dirname(paths.skill), { recursive: true });
  fs.mkdirSync(path.dirname(paths.command), { recursive: true });
  fs.writeFileSync(paths.skill, Buffer.concat([canonicalSkill, Buffer.from('\nDRIFT')]));
  fs.writeFileSync(paths.command, canonicalCommand);

  const result = runOpencodeVerification({ packageRoot, homeDir: home, cwd });
  assert(result.status === 'FAIL', 'skill drift causes FAIL');
  assert(result.checks.some((c) => c.name === 'global-skill' && c.reason === 'hash-mismatch'), 'skill hash mismatch reported');

  cleanup(home);
  cleanup(cwd);
}

console.log('OpenCode verification: detects missing command');
{
  const home = tmpDir('pcm-home-');
  const cwd = tmpDir('pcm-cwd-');
  const paths = globalBindingPaths(home);
  fs.mkdirSync(path.dirname(paths.skill), { recursive: true });
  fs.writeFileSync(paths.skill, canonicalSkill);

  const result = runOpencodeVerification({ packageRoot, homeDir: home, cwd });
  assert(result.status === 'FAIL', 'missing command causes FAIL');
  assert(result.checks.some((c) => c.name === 'global-command' && c.reason === 'missing'), 'missing command reported');

  cleanup(home);
  cleanup(cwd);
}

console.log('OpenCode verification: reports legacy binding ambiguity');
{
  const home = tmpDir('pcm-home-');
  const cwd = tmpDir('pcm-cwd-');
  const paths = globalBindingPaths(home);
  fs.mkdirSync(path.dirname(paths.skill), { recursive: true });
  fs.mkdirSync(path.dirname(paths.command), { recursive: true });
  fs.writeFileSync(paths.skill, canonicalSkill);
  fs.writeFileSync(paths.command, canonicalCommand);
  fs.mkdirSync(path.dirname(paths.legacySkill), { recursive: true });
  fs.writeFileSync(paths.legacySkill, 'legacy');

  const result = runOpencodeVerification({ packageRoot, homeDir: home, cwd });
  assert(result.status === 'PASS-WITH-WARNINGS', `legacy binding warning status, got ${result.status}`);
  assert(result.warnings.some((w) => w.includes('legacy skill')), 'legacy skill warning present');

  cleanup(home);
  cleanup(cwd);
}

console.log(`OpenCode verification tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
