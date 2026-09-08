'use strict';

/**
 * PCM/PWF Governance Artifact Validation (repository-level, NOT packaged).
 *
 * Validates GATE artifacts and Evidence records against the minimum
 * Governance Artifact Contract. This is development-time / repository-level
 * verification only. It does NOT mechanically prove human authority, human
 * intent, organizational approval, or the truthfulness of self-reported
 * evidence.
 */

const PROVENANCE = ['self-reported', 'independently-produced', 'automatically-observed'];
const DECISIONS = ['approved', 'rejected'];
const AUTHORITY_ROLE = 'authority';

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isIsoTimestamp(v) {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v));
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// ---------------------------------------------------------------------------
// Evidence record
// ---------------------------------------------------------------------------

function validateEvidence(record) {
  const errors = [];
  if (!isObject(record)) {
    return { valid: false, errors: ['evidence must be an object'] };
  }
  if (!isNonEmptyString(record.id)) errors.push('evidence.id must be a non-empty string');
  if (!PROVENANCE.includes(record.provenance)) {
    errors.push(`evidence.provenance must be one of: ${PROVENANCE.join(', ')}`);
  }
  if (!isNonEmptyString(record.subject)) errors.push('evidence.subject must be a non-empty string');
  if (!isIsoTimestamp(record.producedAt)) errors.push('evidence.producedAt must be an ISO-8601 timestamp');
  if (record.canonicalVersion !== undefined && !isNonEmptyString(record.canonicalVersion)) {
    errors.push('evidence.canonicalVersion must be a non-empty string when present');
  }
  if (record.expiresAt !== undefined && record.expiresAt !== null && !isIsoTimestamp(record.expiresAt)) {
    errors.push('evidence.expiresAt must be an ISO-8601 timestamp or null');
  }
  if (record.invalidatedAt !== undefined && record.invalidatedAt !== null && !isIsoTimestamp(record.invalidatedAt)) {
    errors.push('evidence.invalidatedAt must be an ISO-8601 timestamp or null');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Decide whether evidence can satisfy a required GATE condition.
 *
 * Status values:
 *  - current        : usable (accepted)
 *  - malformed      : schema violation
 *  - stale          : past its allowed validity
 *  - invalidated    : explicitly invalidated
 *  - wrong-binding  : canonical-version binding mismatch
 *  - missing-binding: no canonical binding recorded
 */
function evaluateEvidence(record, opts) {
  const now = (opts && opts.now) || Date.now();
  const expectedCanonicalVersion = opts && opts.expectedCanonicalVersion;

  const schema = validateEvidence(record);
  if (!schema.valid) {
    return { accepted: false, status: 'malformed', errors: schema.errors };
  }

  if (record.invalidatedAt !== undefined && record.invalidatedAt !== null) {
    return { accepted: false, status: 'invalidated', errors: ['evidence is explicitly invalidated'] };
  }

  if (record.expiresAt !== undefined && record.expiresAt !== null) {
    if (Date.parse(record.expiresAt) <= now) {
      return { accepted: false, status: 'stale', errors: ['evidence has expired'] };
    }
  }

  if (expectedCanonicalVersion !== undefined) {
    if (!isNonEmptyString(record.canonicalVersion)) {
      return { accepted: false, status: 'missing-binding', errors: ['evidence has no canonical-version binding'] };
    }
    if (record.canonicalVersion !== expectedCanonicalVersion) {
      return {
        accepted: false,
        status: 'wrong-binding',
        errors: [`evidence bounds canonical version "${record.canonicalVersion}" but gate evaluated "${expectedCanonicalVersion}"`],
      };
    }
  }

  return { accepted: true, status: 'current', errors: [] };
}

// ---------------------------------------------------------------------------
// GATE artifact
// ---------------------------------------------------------------------------

function validateGate(record) {
  const errors = [];
  if (!isObject(record)) {
    return { valid: false, errors: ['gate must be an object'] };
  }
  if (!isNonEmptyString(record.id)) errors.push('gate.id must be a non-empty string');
  if (!isNonEmptyString(record.subject)) errors.push('gate.subject must reference proposed state');
  if (!isNonEmptyString(record.canonicalVersion)) {
    errors.push('gate.canonicalVersion is required (binds decision to the canonical state evaluated)');
  }
  if (!DECISIONS.includes(record.decision)) {
    errors.push(`gate.decision must be one of: ${DECISIONS.join(', ')}`);
  }
  if (!isObject(record.authority) || !isNonEmptyString(record.authority.ref) || record.authority.role !== AUTHORITY_ROLE) {
    errors.push('gate.authority must be { role: "authority", ref: <non-empty> }');
  }
  if (!isIsoTimestamp(record.decidedAt)) errors.push('gate.decidedAt must be an ISO-8601 timestamp');
  if (record.evidence === undefined) {
    errors.push('gate.evidence array is required');
  } else if (!Array.isArray(record.evidence)) {
    errors.push('gate.evidence must be an array');
  } else {
    for (const e of record.evidence) {
      if (!isNonEmptyString(e)) errors.push('gate.evidence entries must be non-empty evidence IDs');
    }
  }
  if (record.decision === 'rejected' && !isNonEmptyString(record.rationale)) {
    errors.push('gate.rationale is required when decision is "rejected"');
  }
  for (const field of ['subject', 'canonicalVersion', 'decision', 'decidedAt', 'evidence']) {
    if (record[field] === undefined) errors.push(`gate.${field} is missing`);
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Fail-closed assessment of a GATE.
 *
 * Returns { gateStatus } where:
 *  - "approvable": structurally valid, canonical binding matches, all required
 *    evidence is current and correctly bound.
 *  - "blocked": any required evidence is missing/malformed/stale/invalidated/
 *    wrongly bound, or the binding/authority structure is invalid.
 *
 * A blocked GATE can never be treated as approval. "blocked" is distinct from
 * "rejected": a rejected GATE has a valid authoritative decision (with
 * rationale). "blocked" means the record cannot support any decision.
 */
function assessGate(record, opts) {
  const now = (opts && opts.now) || Date.now();
  const expectedCanonicalVersion = opts && opts.expectedCanonicalVersion;
  const evidenceById = (opts && opts.evidenceById) || {};

  const schema = validateGate(record);
  if (!schema.valid) {
    return { gateStatus: 'blocked', reasons: schema.errors };
  }

  if (expectedCanonicalVersion !== undefined && record.canonicalVersion !== expectedCanonicalVersion) {
    return {
      gateStatus: 'blocked',
      reasons: [`gate evaluates canonical version "${record.canonicalVersion}" but current is "${expectedCanonicalVersion}"`],
    };
  }

  const failures = [];
  for (const evidenceId of record.evidence) {
    const ev = evidenceById[evidenceId];
    if (!ev) {
      failures.push(`required evidence "${evidenceId}" is missing`);
      continue;
    }
    const evaluation = evaluateEvidence(ev, {
      now,
      expectedCanonicalVersion: record.canonicalVersion,
    });
    if (!evaluation.accepted) {
      failures.push(`evidence "${evidenceId}" ${evaluation.status}: ${evaluation.errors.join('; ')}`);
    }
  }

  if (failures.length > 0) {
    return { gateStatus: 'blocked', reasons: failures };
  }

  return { gateStatus: 'approvable', decision: record.decision };
}

module.exports = {
  PROVENANCE,
  DECISIONS,
  validateEvidence,
  evaluateEvidence,
  validateGate,
  assessGate,
};