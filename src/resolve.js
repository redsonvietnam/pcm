'use strict';

const fs = require('fs');
const path = require('path');

const PATH_MAPPING = {
  opencode: {
    'SKILL.md': '.opencode/skills/pcm-pwf/SKILL.md',
    'pcm-core.mdc': '.opencode/rules/pcm-core.mdc',
  },
};

function mapToTargetPath(relativePath, adapterId) {
  const mapping = PATH_MAPPING[adapterId];
  if (mapping && mapping[relativePath]) {
    return mapping[relativePath];
  }
  return relativePath;
}

function readDirRecursive(dir, base) {
  base = base || dir;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      files.push(...readDirRecursive(fullPath, base));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

function isGovernancePath(targetPath) {
  const normalized = targetPath.replace(/\\/g, '/');
  if (normalized.startsWith('docs/gates/')) return true;
  if (normalized.startsWith('pcm/workstreams/')) return true;
  return false;
}

function hasPathTraversal(targetPath) {
  return targetPath.includes('..');
}

function resolveArtifact(adapterEntry, packageRoot) {
  if (adapterEntry.artifact === null) {
    return null;
  }

  const sourceDir = path.join(packageRoot, adapterEntry.artifact);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    return null;
  }

  const rawFiles = readDirRecursive(sourceDir);
  rawFiles.sort();

  const records = [];
  for (const relPath of rawFiles) {
    const sourcePath = path.join(sourceDir, relPath);
    const targetPath = mapToTargetPath(relPath, adapterEntry.id);

    if (hasPathTraversal(targetPath)) {
      continue;
    }
    if (isGovernancePath(targetPath)) {
      continue;
    }

    const content = fs.readFileSync(sourcePath);
    records.push({ sourcePath, targetPath, content });
  }

  return records;
}

module.exports = { resolveArtifact, mapToTargetPath, isGovernancePath };
