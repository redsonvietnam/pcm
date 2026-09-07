'use strict';

const fs = require('fs');
const path = require('path');
const { readManifest, manifestsMatch } = require('./manifest');

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

function checkIdempotency(targetDir, newManifest) {
  const existing = readManifest(targetDir);
  if (!existing) {
    return { isFirstInit: true, isStale: false, isManuallyModified: false };
  }

  const matched = manifestsMatch(existing, newManifest);
  return {
    isFirstInit: false,
    isStale: !matched,
    isManuallyModified: !matched && existing.initializedAt !== undefined,
    existingManifest: existing,
  };
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
