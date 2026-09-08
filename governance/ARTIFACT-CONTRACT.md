# Governance Artifact Contract v1

**Status:** Repository-level / development-time contract. NOT packaged with the PCM distribution.

**Scope:** Minimum artifact schemas and validation rules for GATE records and Evidence records, derived from PCM Core v1.0 (GATE semantics, Evidence Provenance, State Model) and PWF v1.0 (GATE Support, Evidence Collection).

---

## 1. Purpose

Establishes the first concrete governance-artifact layer for PCM/PWF.

It turns already-established semantic requirements into explicit, testable schemas and validation rules. It does NOT introduce new primitives, roles, invariants, or lifecycle states.

## 2. Artifacts Covered

- **GATE artifact** — records an AUTHORITY decision on a proposed-state change.
- **Evidence record** — records evidence with inspectable provenance used to support a GATE.

TASK and HANDOFF schemas are out of scope for this contract.

## 3. Semantic Baseline (must not be weakened)

1. A GATE is the only mechanism that promotes Proposed State to Canonical State.
2. Proposed State != Canonical State.
3. Implementation != Approval.
4. Agent/executor capability does not create authority.
5. Evidence provenance is semantically meaningful.
6. Evidence may become stale.
7. Evidence may be invalidated.
8. A GATE must be bound to the canonical version/state that it evaluated.
9. Fail-closed is a meta-rule: missing/invalid required evidence must not silently produce an approval.
10. COMPLETED task != canonical approval.

---

## 4. GATE Artifact

### 4.1 Schema

```json
{
  "id": "GATE-2026-0001",
  "subject": "PROPOSAL-2026-0042",
  "canonicalVersion": "canonical/2026-09-08/v23",
  "decision": "approved",
  "authority": {
    "role": "authority",
    "ref": "authority/jane-doe"
  },
  "decidedAt": "2026-09-08T12:00:00.000Z",
  "evidence": ["ev-001", "ev-002"],
  "rationale": "required when decision is rejected"
}
```

### 4.2 Fields

| Field | Required | Type | Constraint |
|-------|----------|------|-----------|
| `id` | Yes | string | Non-empty. Identity of the GATE record. |
| `subject` | Yes | string | Reference to the proposed-state change being evaluated. |
| `canonicalVersion` | Yes | string | **The canonical version/state that was evaluated.** Binds the decision to a specific canonical state. |
| `decision` | Yes | string | `"approved"` or `"rejected"`. |
| `authority` | Yes | object | `{ role: "authority", ref: <non-empty> }` — authority identity/reference. |
| `decidedAt` | Yes | string | ISO-8601 timestamp of the decision. |
| `evidence` | Yes | string[] | Evidence IDs that support this GATE. May be empty only if the GATE itself does not require evidence (structural emptiness is permitted; fail-closed applies to *required* evidence). |
| `rationale` | Conditional | string | Required when `decision` is `"rejected"`. |

### 4.3 Canonical-version binding

The field `canonicalVersion` exists precisely to make it impossible to confuse:

> "I approved proposal X"

with:

> "I approved proposal X against canonical state version Y."

Validation rule: a GATE is approvable **only if** its `canonicalVersion` equals the canonical version/state it claims to evaluate. This is the binding check enforced by `assessGate`.

### 4.4 Decision semantics

- `approved` — proposed state may be promoted to canonical (subject to valid evidence + binding).
- `rejected` — proposed state is rejected, with rationale. This is a valid authoritative decision, distinct from "blocked".

---

## 5. Evidence Record

### 5.1 Schema

```json
{
  "id": "ev-001",
  "provenance": "independently-produced",
  "subject": "test suite passed for PROPOSAL-2026-0042",
  "producedAt": "2026-09-08T11:55:00.000Z",
  "canonicalVersion": "canonical/2026-09-08/v23",
  "expiresAt": null,
  "invalidatedAt": null
}
```

### 5.2 Fields

| Field | Required | Type | Constraint |
|-------|----------|------|-----------|
| `id` | Yes | string | Non-empty. Identity of the evidence record. |
| `provenance` | Yes | string | Exactly one of: `self-reported`, `independently-produced`, `automatically-observed`. |
| `subject` | Yes | string | Non-empty. What the evidence is about. |
| `producedAt` | Yes | string | ISO-8601 timestamp when evidence was produced. |
| `canonicalVersion` | For binding | string | The canonical version/state the evidence was observed against. Optional in the raw record; **required** when the evidence is required to satisfy a GATE with a canonical binding. |
| `expiresAt` | No (null allowed) | string\|null | ISO-8601 freshness limit. `null` = no expiry. |
| `invalidatedAt` | No (null allowed) | string\|null | ISO-8601 invalidation timestamp. `null` = not invalidated. |

### 5.3 Provenance categories

Exactly the three categories established by PCM Section 12:

- `self-reported` — produced by the actor performing the work.
- `independently-produced` — produced by a different actor.
- `automatically-observed` — produced by automated systems/tooling.

### 5.4 Freshness semantics

Freshness is **data-driven**, not a global timeout.

- An evidence record with `expiresAt` set is stale when `now > expiresAt`.
- An evidence record with `expiresAt: null` has no self-imposed expiry.
- Freshness is evaluated relative to an explicit `now` reference supplied at validation/assessment time.

### 5.5 Invalidation semantics

- A record with `invalidatedAt` set is invalidated and **cannot** satisfy a required GATE condition.

### 5.6 Binding semantics

- When evidence is required by a GATE, its `canonicalVersion` must equal the GATE's `canonicalVersion`. Mismatch or absence → the evidence cannot satisfy the GATE.

---

## 6. Fail-Closed Behavior

`assessGate` classifies a GATE as:

| Status | Meaning |
|--------|---------|
| `approvable` | Structurally valid, canonical binding matches, all required evidence is current and correctly bound. |
| `blocked` | Any required evidence is missing/malformed/stale/invalidated/wrongly-bound, OR the binding/authority structure is invalid. |

A blocked GATE **must not** be treated as an approval. "blocked" is not "rejected":

- `rejected` = a valid authoritative decision (with rationale).
- `blocked` = the record cannot support any decision.

Fail-closed guarantees:

1. Missing required evidence → blocked.
2. Malformed required evidence → blocked.
3. Invalidated required evidence → blocked.
4. Stale required evidence → blocked.
5. Required evidence bound to a wrong canonical version → blocked.
6. GATE with missing/wrong canonical binding → blocked.
7. No approval is produced from stale/invalid/mismatched evidence.

---

## 7. What This Implementation Does NOT Mechanically Prove

This validation layer does not prove:

- actual human authority;
- human intent;
- organizational approval;
- truthfulness of self-reported evidence;
- that `authority.ref` resolves to a real delegated authority.

It only enforces the *structural* and *state-consistency* rules of the artifact contract.

---

## 8. Location and Ownership

- Live here: `governance/` (repository-level, development-time).
- **NOT** part of the npm package payload (`governance/` is absent from `package.json` `files`).
- Implemented in `governance/validate.js`.
- Structural verification is wired into `scripts/conformance.js` (repository-only runner).
- Tests live in `test/index.js` (repository-only; `test/` is not packaged).