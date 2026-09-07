'use strict';

function capabilitiesSatisfied(requires, envCapabilities) {
  if (requires === null) return true;
  if (Object.keys(requires).length === 0) return true;
  for (const cap of Object.keys(requires)) {
    if (!(cap in envCapabilities)) return false;
  }
  return true;
}

function isTrusted(/* adapterId */) {
  return true;
}

function select(catalog, environment) {
  const byPlatform = catalog.adapters.filter(
    (a) =>
      a.platforms.includes(environment.platform) || a.platforms.includes('*')
  );

  const byShell = byPlatform.filter(
    (a) =>
      a.shells.includes(environment.shell) || a.shells.includes('*')
  );

  const byCapability = byShell.filter((a) =>
    capabilitiesSatisfied(a.requires, environment.capabilities)
  );

  const trusted = byCapability.filter((a) => isTrusted(a.id));

  if (trusted.length === 0) {
    return catalog.adapters.find((a) => a.id === catalog.defaultAdapter);
  }

  trusted.sort(
    (a, b) => (b.tested - a.tested) || (a.priority - b.priority)
  );

  return trusted[0];
}

module.exports = { select, capabilitiesSatisfied, isTrusted };
