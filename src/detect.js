'use strict';

const { execSync } = require('child_process');
const path = require('path');

const PLATFORM_MAP = {
  win32: 'windows',
  linux: 'linux',
  darwin: 'macos',
};

const CAPABILITY_NAMES = ['opencode', 'copilot', 'codex'];

function detectPlatform() {
  const platform = PLATFORM_MAP[process.platform];
  if (!platform) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  return platform;
}

function detectShell() {
  const comspec = process.env.COMSPEC || '';
  if (comspec.toLowerCase().includes('powershell') || comspec.toLowerCase().includes('pwsh')) {
    return 'powershell';
  }
  const shell = (process.env.SHELL || '').toLowerCase();
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  return 'bash';
}

function detectGitVersion() {
  try {
    const raw = execSync('git --version', { encoding: 'utf8', timeout: 5000 }).trim();
    const match = raw.match(/git version (.+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function commandExists(cmd) {
  const isWindows = process.platform === 'win32';
  try {
    execSync(isWindows ? `where ${cmd}` : `which ${cmd}`, {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return true;
  } catch {
    return false;
  }
}

function detectCapabilities() {
  const capabilities = {};
  for (const name of CAPABILITY_NAMES) {
    if (commandExists(name)) {
      capabilities[name] = 'present';
    }
  }
  return capabilities;
}

function detect() {
  return {
    platform: detectPlatform(),
    shell: detectShell(),
    gitVersion: detectGitVersion(),
    capabilities: detectCapabilities(),
  };
}

module.exports = { detect };
