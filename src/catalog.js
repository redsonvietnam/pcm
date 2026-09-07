'use strict';

const fs = require('fs');
const path = require('path');

const VALID_PLATFORMS = ['windows', 'linux', 'macos', '*'];
const VALID_SHELLS = ['powershell', 'bash', 'zsh', '*'];
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

function loadCatalog(packageRoot) {
  const catalogPath = path.join(packageRoot, 'registry', 'pcm-adapters.json');
  let raw;
  try {
    raw = fs.readFileSync(catalogPath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read catalog: ${catalogPath} — ${err.message}`);
  }

  let catalog;
  try {
    catalog = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Catalog is not valid JSON: ${err.message}`);
  }

  validateCatalog(catalog, packageRoot);
  return catalog;
}

function validateCatalog(catalog, packageRoot) {
  if (catalog.version !== '1.0') {
    throw new Error(`Catalog version must be "1.0", got "${catalog.version}"`);
  }

  if (!Array.isArray(catalog.adapters) || catalog.adapters.length === 0) {
    throw new Error('Catalog adapters array must be non-empty');
  }

  const ids = new Set();
  for (const adapter of catalog.adapters) {
    if (!adapter.id || typeof adapter.id !== 'string') {
      throw new Error('Adapter id is required and must be a string');
    }
    if (!ID_PATTERN.test(adapter.id)) {
      throw new Error(`Adapter id "${adapter.id}" must match pattern ${ID_PATTERN}`);
    }
    if (ids.has(adapter.id)) {
      throw new Error(`Duplicate adapter id: "${adapter.id}"`);
    }
    ids.add(adapter.id);

    if (!adapter.name || typeof adapter.name !== 'string') {
      throw new Error(`Adapter "${adapter.id}" name is required and must be a non-empty string`);
    }

    if (!Array.isArray(adapter.platforms) || adapter.platforms.length === 0) {
      throw new Error(`Adapter "${adapter.id}" platforms must be non-empty array`);
    }
    for (const p of adapter.platforms) {
      if (!VALID_PLATFORMS.includes(p)) {
        throw new Error(`Adapter "${adapter.id}" invalid platform "${p}"`);
      }
    }

    if (!Array.isArray(adapter.shells) || adapter.shells.length === 0) {
      throw new Error(`Adapter "${adapter.id}" shells must be non-empty array`);
    }
    for (const s of adapter.shells) {
      if (!VALID_SHELLS.includes(s)) {
        throw new Error(`Adapter "${adapter.id}" invalid shell "${s}"`);
      }
    }

    if (adapter.requires !== null && typeof adapter.requires === 'object') {
      for (const [cap, ver] of Object.entries(adapter.requires)) {
        if (ver !== '*') {
          throw new Error(
            `MVP requires '*' for capability "${cap}" in adapter "${adapter.id}"`
          );
        }
      }
    } else if (adapter.requires !== null) {
      throw new Error(`Adapter "${adapter.id}" requires must be object or null`);
    }

    if (typeof adapter.tested !== 'boolean') {
      throw new Error(`Adapter "${adapter.id}" tested must be boolean`);
    }

    if (typeof adapter.priority !== 'number' || adapter.priority <= 0) {
      throw new Error(`Adapter "${adapter.id}" priority must be a positive integer`);
    }

    if (adapter.artifact !== null) {
      if (typeof adapter.artifact !== 'string') {
        throw new Error(`Adapter "${adapter.id}" artifact must be string or null`);
      }
      const artifactDir = path.join(packageRoot, adapter.artifact);
      if (!fs.existsSync(artifactDir) || !fs.statSync(artifactDir).isDirectory()) {
        throw new Error(
          `Adapter "${adapter.id}" artifact directory not found: ${adapter.artifact}`
        );
      }
    }
  }

  if (!ids.has(catalog.defaultAdapter)) {
    throw new Error(
      `defaultAdapter "${catalog.defaultAdapter}" does not reference a valid adapter`
    );
  }
}

module.exports = { loadCatalog };
