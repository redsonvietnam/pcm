'use strict';

const path = require('path');
const fs = require('fs');
const { detect } = require('./detect');
const { loadCatalog } = require('./catalog');
const { select } = require('./select');
const { resolveArtifact } = require('./resolve');
const { createManifest, readManifest, writeManifest, manifestsMatch } = require('./manifest');
const { installCoreFiles, installBindingFiles, getCoreTargetPaths } = require('./install');
const { checkIdempotency, preserveInitializedAt, fileContentMatches } = require('./idempotency');

const PCM_VERSION = '1.0';
const DISTRIBUTION_VERSION = '1.0.0';

function getPackageRoot() {
  return path.resolve(__dirname, '..');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const positional = [];
  const flags = [];

  for (const arg of args) {
    if (arg.startsWith('-')) {
      flags.push(arg);
    } else {
      positional.push(arg);
    }
  }

  if (flags.length > 0) {
    const supported = [];
    const unsupported = flags.filter((f) => !supported.includes(f));
    if (unsupported.length > 0) {
      return {
        error: `Unsupported option: ${unsupported[0]}`,
        recovery:
          'MVP does not support options. Run: npx pcm init [target]',
      };
    }
  }

  if (positional.length > 1) {
    return {
      error: `Too many arguments: expected at most 1, got ${positional.length}`,
      recovery: 'Usage: npx pcm init [target]',
    };
  }

  if (positional.length === 0) {
    return { target: process.cwd() };
  }

  const target = path.resolve(positional[0]);
  if (!fs.existsSync(target)) {
    return {
      error: `Target path does not exist: ${target}`,
      recovery: 'Provide a valid directory path as target',
    };
  }
  if (!fs.statSync(target).isDirectory()) {
    return {
      error: `Target is not a directory: ${target}`,
      recovery: 'Provide a directory path, not a file path',
    };
  }

  try {
    fs.accessSync(target, fs.constants.W_OK);
  } catch {
    return {
      error: `Target directory is not writable: ${target}`,
      recovery: 'Check directory permissions',
    };
  }

  return { target };
}

function execute(targetDir, packageRoot) {
  let catalog;
  try {
    catalog = loadCatalog(packageRoot);
  } catch (err) {
    return { exitCode: 1, error: err.message, recovery: 'Ensure the pcm package is installed correctly' };
  }

  let environment;
  try {
    environment = detect();
  } catch (err) {
    return { exitCode: 1, error: err.message, recovery: 'Ensure your platform is supported' };
  }

  const selectedAdapter = select(catalog, environment);

  let bindingRecords = null;
  if (selectedAdapter.artifact !== null) {
    try {
      bindingRecords = resolveArtifact(selectedAdapter, packageRoot);
    } catch (err) {
      return { exitCode: 1, error: `Artifact resolution failed: ${err.message}`, recovery: 'Ensure adapter artifacts are present in the package' };
    }
  }

  const newManifest = createManifest({
    pcmVersion: PCM_VERSION,
    distributionVersion: DISTRIBUTION_VERSION,
    adapter: selectedAdapter,
    binding: bindingRecords ? bindingRecords.map((r) => r.targetPath) : [],
    managedFiles: [],
  });

  const idempotency = checkIdempotency(targetDir, newManifest);

  if (!idempotency.isFirstInit && idempotency.existingManifest) {
    if (idempotency.existingManifest.adapter && idempotency.existingManifest.adapter.id !== selectedAdapter.id) {
      return {
        exitCode: 1,
        error: `Existing installation uses adapter "${idempotency.existingManifest.adapter.id}", selected adapter is "${selectedAdapter.id}"`,
        recovery: 'Remove the existing pcm/ directory and re-run npx pcm init',
      };
    }
  }

  const existingManifest = readManifest(targetDir);
  preserveInitializedAt(existingManifest, newManifest);

  let totalFilesWritten = 0;

  try {
    const coreResult = installCoreFiles(targetDir, packageRoot);
    totalFilesWritten += coreResult.filesWritten;

    const bindingResult = installBindingFiles(targetDir, bindingRecords);
    totalFilesWritten += bindingResult.filesWritten;
  } catch (err) {
    return { exitCode: 1, error: err.message, recovery: 'Check file permissions and re-run npx pcm init' };
  }

  const allManagedFiles = [
    ...getCoreTargetPaths(),
    ...(bindingRecords ? bindingRecords.map((r) => r.targetPath) : []),
  ];
  newManifest.managedFiles = allManagedFiles;

  if (!existingManifest || !manifestsMatch(existingManifest, newManifest)) {
    try {
      writeManifest(targetDir, newManifest);
    } catch (err) {
      return { exitCode: 1, error: `Failed to write manifest: ${err.message}`, recovery: 'Check directory permissions' };
    }
  }

  const lines = [
    'PCM initialized successfully.',
    `Adapter: ${selectedAdapter.id}`,
    `Files written: ${totalFilesWritten}`,
    `Target: ${targetDir}`,
  ];

  if (selectedAdapter.id === 'generic') {
    lines.push('Generic adapter applied. Configure your tools manually.');
  }

  return { exitCode: 0, stdout: lines.join('\n'), adapter: selectedAdapter.id, filesWritten: totalFilesWritten };
}

function run(argv) {
  const parsed = parseArgs(argv);
  if (parsed.error) {
    console.error(`Error: ${parsed.error}`);
    console.error(`Recovery: ${parsed.recovery}`);
    process.exit(1);
  }

  const result = execute(parsed.target, getPackageRoot());
  if (result.exitCode !== 0) {
    console.error(`Error: ${result.error}`);
    console.error(`Recovery: ${result.recovery}`);
    process.exit(result.exitCode);
  }

  console.log(result.stdout);
  process.exit(0);
}

module.exports = { run, execute, parseArgs, getPackageRoot };
