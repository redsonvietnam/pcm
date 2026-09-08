'use strict';

const fs = require('fs');
const path = require('path');
const { readManifest, manifestsMatch, isManifestComplete } = require('./manifest');

const GOVERNANCE_PREFIXES = ['docs/gates/', 'pcm/workstreams/'];

function isGovernanceFile(filePath, managedFiles) {
  const normalized = filePath.replace(/\\/g, '/');
  for (const prefix of GOVERNANCE_PREFIXES) {
    if (normalized.startsWith(prefix)) return true;
  }
  if (managedFiles && managedFiles.includes(normalized)) {
    for (const prefix of GOVERNANCE_PREFIXES) {
      if (normalized.startsWith(prefix)) return true;
    }
  }
  return false;
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function fileContentMatches(filePath, expectedContent) {
  if (!fs.existsSync(filePath)) return false;
  const actual = fs.readFileSync(filePath);
  if (Buffer.isBuffer(expectedContent)) {
    return actual.equals(expectedContent);
  }
  return actual.toString('utf8') === expectedContent;
}

function checkIdempotency(existingManifest, newManifest, targetDir) {
  if (!existingManifest) {
    return { status: 'first-init' };
  }

  if (!isManifestComplete(existingManifest)) {
    return { status: 'stale', existingManifest };
  }

  if (manifestsMatch(existingManifest, newManifest)) {
    return { status: 'current', existingManifest };
  }

  const adapterChanged = existingManifest.adapter &&
    existingManifest.adapter.id !== newManifest.adapter.id;
  const versionChanged = existingManifest.distributionVersion !== newManifest.distributionVersion;
  const stateIncomplete = existingManifest.state !== 'bootstrapped';

  if (adapterChanged || versionChanged || stateIncomplete) {
    return { status: 'stale', existingManifest };
  }

  if (existingManifest.managedFiles && existingManifest.managedFiles.length > 0) {
    const managedDir = targetDir ? path.join(targetDir) : null;
    for (const managedFile of existingManifest.managedFiles) {
      if (managedDir) {
        const fullPath = path.join(managedDir, managedFile);
        if (!fs.existsSync(fullPath)) {
          return { status: 'stale', existingManifest };
        }
      }
    }
  }

  return { status: 'manually-modified', existingManifest };
}

function preserveInitializedAt(existingManifest, newManifest) {
  if (existingManifest && existingManifest.initializedAt) {
    newManifest.initializedAt = existingManifest.initializedAt;
  }
  return newManifest;
}

module.exports = {
  isGovernanceFile,
  fileExists,
  fileContentMatches,
  checkIdempotency,
  preserveInitializedAt,
};
