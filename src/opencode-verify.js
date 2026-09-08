'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BINDING_MANIFEST = path.join('adapters', 'opencode', 'PCM-BINDING.json');
const CANONICAL_SKILL = path.join('adapters', 'opencode', 'SKILL.md');
const CANONICAL_COMMAND = path.join('adapters', 'opencode', 'commands', 'pcm.md');

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function homeOpenCodeRoot(homeDir) {
  return path.join(homeDir || os.homedir(), '.config', 'opencode');
}

function projectBindingPaths(cwd) {
  return {
    skill: path.join(cwd, '.opencode', 'skills', 'pcm-v1', 'SKILL.md'),
    command: path.join(cwd, '.opencode', 'commands', 'pcm.md'),
    legacySkill: path.join(cwd, '.opencode', 'skills', 'pcm-pwf', 'SKILL.md'),
  };
}

function globalBindingPaths(homeDir) {
  const root = homeOpenCodeRoot(homeDir);
  return {
    skill: path.join(root, 'skills', 'pcm-v1', 'SKILL.md'),
    command: path.join(root, 'commands', 'pcm.md'),
    legacySkill: path.join(root, 'skills', 'pcm-pwf', 'SKILL.md'),
  };
}

function fileCheck(filePath, expectedHash) {
  if (!fs.existsSync(filePath)) {
    return { status: 'FAIL', path: filePath, reason: 'missing' };
  }
  const actualHash = sha256File(filePath);
  if (actualHash !== expectedHash) {
    return {
      status: 'FAIL',
      path: filePath,
      reason: 'hash-mismatch',
      expectedHash,
      actualHash,
    };
  }
  return { status: 'PASS', path: filePath, reason: 'exact-match', actualHash };
}

function runOpencodeVerification({ packageRoot, cwd = process.cwd(), homeDir = os.homedir() } = {}) {
  const root = packageRoot || path.resolve(__dirname, '..');
  const manifestPath = path.join(root, BINDING_MANIFEST);
  const canonicalSkillPath = path.join(root, CANONICAL_SKILL);
  const canonicalCommandPath = path.join(root, CANONICAL_COMMAND);

  const result = {
    bindingId: 'pcm-v1',
    bindingVersion: '1.0',
    status: 'PASS',
    checks: [],
    warnings: [],
    behavioralConformance: 'SESSION-REQUIRED',
  };

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    result.status = 'FAIL';
    result.checks.push({ status: 'FAIL', name: 'canonical-manifest', reason: err.message });
    return result;
  }

  const identityOk =
    manifest.binding_id === result.bindingId &&
    manifest.binding_version === result.bindingVersion &&
    manifest.adapter === 'opencode';
  result.checks.push({
    status: identityOk ? 'PASS' : 'FAIL',
    name: 'binding-identity',
    bindingId: manifest.binding_id,
    bindingVersion: manifest.binding_version,
    adapter: manifest.adapter,
  });
  if (!identityOk) result.status = 'FAIL';

  for (const [name, filePath, expectedHash] of [
    ['canonical-skill', canonicalSkillPath, manifest.skill && manifest.skill.sha256],
    ['canonical-command', canonicalCommandPath, manifest.command && manifest.command.sha256],
  ]) {
    if (!expectedHash) {
      result.status = 'FAIL';
      result.checks.push({ status: 'FAIL', name, reason: 'missing expected hash in manifest' });
      continue;
    }
    const check = fileCheck(filePath, expectedHash);
    check.name = name;
    result.checks.push(check);
    if (check.status === 'FAIL') result.status = 'FAIL';
  }

  const globalPaths = globalBindingPaths(homeDir);
  for (const [name, filePath, expectedHash] of [
    ['global-skill', globalPaths.skill, manifest.skill && manifest.skill.sha256],
    ['global-command', globalPaths.command, manifest.command && manifest.command.sha256],
  ]) {
    const check = fileCheck(filePath, expectedHash);
    check.name = name;
    result.checks.push(check);
    if (check.status === 'FAIL') result.status = 'FAIL';
  }

  const projectPaths = projectBindingPaths(cwd);
  for (const [name, filePath, expectedHash] of [
    ['project-skill', projectPaths.skill, manifest.skill && manifest.skill.sha256],
    ['project-command', projectPaths.command, manifest.command && manifest.command.sha256],
  ]) {
    if (fs.existsSync(filePath)) {
      const check = fileCheck(filePath, expectedHash);
      check.name = name;
      result.checks.push(check);
      if (check.status === 'FAIL') result.status = 'FAIL';
    }
  }

  for (const [scope, filePath] of [
    ['global', globalPaths.legacySkill],
    ['project', projectPaths.legacySkill],
  ]) {
    if (fs.existsSync(filePath)) {
      result.warnings.push(`${scope} legacy skill found at ${filePath}; remove it to avoid binding ambiguity`);
    }
  }

  result.checks.push({
    status: 'INFO',
    name: 'behavioral-conformance',
    result: 'SESSION-REQUIRED',
    note: 'Artifact identity cannot prove that an OpenCode session actually followed PCM. Use /pcm startup and completion reports for behavioral evidence.',
  });

  if (result.warnings.length > 0 && result.status === 'PASS') result.status = 'PASS-WITH-WARNINGS';
  return result;
}

function formatVerification(result) {
  const lines = [
    `PCM OpenCode Verification: ${result.status}`,
    `Binding: ${result.bindingId} v${result.bindingVersion}`,
    '',
  ];

  for (const check of result.checks) {
    const suffix = check.path ? ` — ${check.path}` : '';
    const detail = check.reason || check.result || '';
    lines.push(`${check.status} ${check.name}${suffix}${detail ? ` (${detail})` : ''}`);
  }

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:');
    for (const warning of result.warnings) lines.push(`WARN ${warning}`);
  }

  lines.push(
    '',
    'Behavioral conformance: SESSION-REQUIRED',
    'A hash match proves artifact identity only. It does not prove agent behavior.',
    'Use /pcm and require the startup/completion report before treating PCM as active.',
  );

  return lines.join('\n');
}

module.exports = {
  BINDING_MANIFEST,
  CANONICAL_SKILL,
  CANONICAL_COMMAND,
  globalBindingPaths,
  projectBindingPaths,
  runOpencodeVerification,
  formatVerification,
};
