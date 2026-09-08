'use strict';

/**
 * PCM/PWF Governance Gate Execution and Canonical Promotion (repository-level, NOT packaged).
 *
 * Minimal end-to-end execution flow:
 *   1. Represent proposed/canonical state
 *   2. Execute a GATE (validate structure, binding, evidence, fail-closed)
 *   3. Promote Proposed State to Canonical State ONLY when GATE is approved
 *
 * This does NOT prove authority, intent, or organizational approval.
 * It only enforces structural and state-consistency rules.
 */

const { validateGate, evaluateEvidence } = require('./validate');

// ---------------------------------------------------------------------------
// State model
// ---------------------------------------------------------------------------

function createCanonicalState(version) {
  return { version, committedAt: new Date().toISOString() };
}

function createProposedState(id, canonicalVersion, description) {
  return {
    id,
    canonicalVersion,
    description,
    proposedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Gate execution
// ---------------------------------------------------------------------------

function executeGate(gate, evidenceById, opts) {
  const now = (opts && opts.now) || Date.now();

  const schema = validateGate(gate);
  if (!schema.valid) {
    return { decision: 'blocked', reasons: schema.errors };
  }

  const failures = [];

  for (const evidenceId of gate.evidence) {
    const ev = evidenceById[evidenceId];
    if (!ev) {
      failures.push(`required evidence "${evidenceId}" is missing`);
      continue;
    }
    const evaluation = evaluateEvidence(ev, {
      now,
      expectedCanonicalVersion: gate.canonicalVersion,
    });
    if (!evaluation.accepted) {
      failures.push(`evidence "${evidenceId}" ${evaluation.status}: ${evaluation.errors.join('; ')}`);
    }
  }

  if (failures.length > 0) {
    return { decision: 'blocked', reasons: failures };
  }

  return { decision: gate.decision, reasons: [] };
}

// ---------------------------------------------------------------------------
// Canonical promotion
// ---------------------------------------------------------------------------

function promoteState(canonical, proposed, gate, evidenceById, opts) {
  const now = (opts && opts.now) || Date.now();

  if (proposed.canonicalVersion !== canonical.version) {
    return {
      promoted: false,
      gateResult: { decision: 'blocked', reasons: [`proposed references canonical "${proposed.canonicalVersion}" but current is "${canonical.version}"`] },
      canonical,
    };
  }

  const gateResult = executeGate(gate, evidenceById, { now });
  if (gateResult.decision !== 'approved') {
    return { promoted: false, gateResult, canonical };
  }

  return {
    promoted: true,
    gateResult,
    canonical: createCanonicalState(`${proposed.id}/promoted`),
  };
}

module.exports = {
  createCanonicalState,
  createProposedState,
  executeGate,
  promoteState,
};
