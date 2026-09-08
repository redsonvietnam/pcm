'use strict';

const fs = require('fs');
const path = require('path');

const MANIFEST_NAME = '.pcm-manifest.json';
const MANIFEST_PATH = path.join('pcm', MANIFEST_NAME);

function createManifest({ pcmVersion, distributionVersion, adapter, binding, managedFiles }) {
  return {
    pcmVersion,
    distributionVersion,
    initializedAt: new Date().toISOString(),
    adapter: {
      id: adapter.id,
      origin: 'built-in',
      artifactPath: adapter.artifact,
      version: distributionVersion,
    },
    core: {
      pcm: 'pcm/docs/PCM.md',
      pwf: 'pcm/docs/PWF.md',
      conformance: 'pcm/docs/CONFORMANCE.md',
    },
    binding: binding || [],
    managedFiles: managedFiles || [],
    state: 'bootstrapped',
  };
}

function readManifest(targetDir) {
  const manifestFile = path.join(targetDir, MANIFEST_PATH);
  if (!fs.existsSync(manifestFile)) return null;
  try {
    const raw = fs.readFileSync(manifestFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeManifest(targetDir, manifest) {
  const manifestFile = path.join(targetDir, MANIFEST_PATH);
  const dir = path.dirname(manifestFile);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
}

function manifestsMatch(a, b) {
  if (!a || !b) return false;
  if (!a.adapter || !b.adapter) return false;
  return (
    a.pcmVersion === b.pcmVersion &&
    a.distributionVersion === b.distributionVersion &&
    a.adapter.id === b.adapter.id &&
    a.adapter.artifactPath === b.adapter.artifactPath &&
    a.adapter.version === b.adapter.version &&
    a.state === b.state &&
    JSON.stringify(a.core) === JSON.stringify(b.core) &&
    JSON.stringify(a.binding) === JSON.stringify(b.binding) &&
    JSON.stringify(a.managedFiles) === JSON.stringify(b.managedFiles)
  );
}

function isManifestComplete(manifest) {
  if (!manifest || typeof manifest !== 'object') return false;
  if (typeof manifest.pcmVersion !== 'string') return false;
  if (typeof manifest.distributionVersion !== 'string') return false;
  if (!manifest.adapter || typeof manifest.adapter !== 'object') return false;
  if (typeof manifest.adapter.id !== 'string') return false;
  if (typeof manifest.adapter.origin !== 'string') return false;
  if (!('artifactPath' in manifest.adapter)) return false;
  if (typeof manifest.state !== 'string') return false;
  if (!manifest.core || typeof manifest.core !== 'object') return false;
  if (!Array.isArray(manifest.binding)) return false;
  if (!Array.isArray(manifest.managedFiles)) return false;
  return true;
}

module.exports = { createManifest, readManifest, writeManifest, manifestsMatch, isManifestComplete, MANIFEST_PATH };
