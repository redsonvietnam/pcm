'use strict';

const fs = require('fs');
const path = require('path');
const { isGovernanceFile, fileContentMatches } = require('./idempotency');
const { readManifest } = require('./manifest');

const CORE_MAPPING = {
  'core/PCM.md': 'pcm/docs/PCM.md',
  'core/PWF.md': 'pcm/docs/PWF.md',
  'core/CONFORMANCE.md': 'pcm/docs/CONFORMANCE.md',
};

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function writeOrSkip(targetPath, content, ownership, messages) {
  if (isGovernanceFile(targetPath, null)) {
    messages.push({ type: 'skip', reason: 'governance', path: targetPath });
    return false;
  }

  if (!fs.existsSync(targetPath)) {
    ensureDir(targetPath);
    fs.writeFileSync(targetPath, content);
    messages.push({ type: 'write', path: targetPath });
    return true;
  }

  if (fileContentMatches(targetPath, content)) {
    messages.push({ type: 'skip', reason: 'identical', path: targetPath });
    return false;
  }

  if (ownership === 'core' || ownership === 'tooling') {
    try {
      fs.accessSync(targetPath, fs.constants.W_OK);
    } catch {
      throw new Error(`Cannot write: ${targetPath} (file is read-only)`);
    }
    fs.writeFileSync(targetPath, content);
    messages.push({ type: 'overwrite', ownership, path: targetPath });
    return true;
  }

  if (ownership === 'binding') {
    messages.push({ type: 'preserve', path: targetPath });
    return false;
  }

  return false;
}

function installCoreFiles(targetDir, packageRoot) {
  const messages = [];
  let filesWritten = 0;

  for (const [srcRel, targetRel] of Object.entries(CORE_MAPPING)) {
    const srcPath = path.join(packageRoot, srcRel);
    const targetPath = path.join(targetDir, targetRel);

    if (!fs.existsSync(srcPath)) {
      throw new Error(`Core file missing in package: ${srcRel}`);
    }

    const content = fs.readFileSync(srcPath);
    const wrote = writeOrSkip(targetPath, content, 'core', messages);
    if (wrote) filesWritten++;
  }

  return { filesWritten, messages };
}

function installBindingFiles(targetDir, bindingRecords) {
  if (!bindingRecords || bindingRecords.length === 0) {
    return { filesWritten: 0, messages: [] };
  }

  const messages = [];
  let filesWritten = 0;

  for (const record of bindingRecords) {
    const targetPath = path.join(targetDir, record.targetPath);
    const wrote = writeOrSkip(targetPath, record.content, 'binding', messages);
    if (wrote) filesWritten++;
  }

  return { filesWritten, messages };
}

function getCoreTargetPaths() {
  return Object.values(CORE_MAPPING);
}

module.exports = { installCoreFiles, installBindingFiles, writeOrSkip, getCoreTargetPaths };
