# PCM/PWF Semantic Hardening Consolidation

**Status:** Proposed — awaiting Canonical Gate  
**Authority:** R1  
**Date:** 2026-09-16  

## Purpose

Consolidate three R1-authorized semantic-hardening changes into a single proposed state as the next candidate PCM baseline.

## Canonical Baseline

PCM/PWF v0.2  
ab9f61914a50bf1e8ff0889057e19a2da1922d77  
Approved by PCM-GATE-01

## Accepted Semantic Changes

### 1. Evidence Freshness (§10.1)

**Commit:** be703b8a75e99102e9516fe5a3c1ad11002cae35  
**Conformance:** D5

GATE evidence is valid only for the proposed state and decision criteria actually evaluated by that GATE. A material change to that proposed state or its applicable criteria invalidates prior GATE evidence for canonicalization. Non-material changes do not automatically invalidate existing evidence.

### 2. HANDOFF Materiality (§9.1)

**Commit:** 7b6f3edf866d6addb78ddb0a319ff79e09236875  
**Conformance:** C7–C14

A HANDOFF is valid only when it preserves the material work state necessary for the receiving actor to continue the transferred work. Claims or context transmitted by a HANDOFF do not thereby become verified evidence, authority, approval, or canonical state. Materiality is task-relative, not receiver-preference-relative.

### 3. Authorization Validity (§11.5)

**Commit:** 3de0772de24d7933ad0e6d61d7c91f2cd9fd2574  
**Conformance:** A9–A13

Authorization remains bounded by the material scope and decision-relevant object for which it was explicitly granted. A material change to that scope or object does not automatically extend the prior authorization. Non-material change does not unnecessarily invalidate authorization. Re-authorization does not create approval authority, canonical authority, or authority beyond its explicit scope.

## Interaction Among Changes

The three rules are complementary and non-overlapping:

- **Evidence Freshness** governs whether evidence remains admissible/reliable for a later decision.
- **HANDOFF Materiality** governs whether transferred context/state remains valid after a material handoff change.
- **Authorization Validity** governs whether execution authority remains valid when the authorized scope/object materially changes.

Each addresses a distinct failure mode. None subsumes the others.

## Invariant Compatibility

All six PCM invariants remain unchanged and unviolated:

1. Agent ≠ Authority
2. Implementation ≠ Approval
3. Proposed State ≠ Canonical State
4. Context ≠ Canonical State
5. Protocol ≠ Tooling
6. Concurrent Conflict ≠ Silent Resolution

## Primitive Count

Unchanged: WORKSTREAM, TASK, HANDOFF, GATE (4 primitives)

## Conformance Summary

| Group | Tests | Change |
|-------|-------|--------|
| A — Authority | 13 | +5 (A9–A13: authorization validity) |
| B — State | 8 | — |
| C — Handoff | 14 | +8 (C7–C14: materiality) |
| D — Evidence | 5 | +1 (D5: evidence freshness) |
| E — Concurrency | 6 | — |
| F — Task/PWF | 10 | — |
| **Total** | **56** | **+14** |

## Proposed Consolidated State

**Branch:** feat/semantic-hardening-consolidation  
**Base:** 3de0772de24d7933ad0e6d61d7c91f2cd9fd2574  
**Status:** PROPOSED — not canonical  
**Authority:** R1 — awaiting Canonical Gate  

## What This Is Not

- This is not canonical state.
- This is not Gate-approved.
- This is not a new version number.
- This is not a redesign of PCM.
- This does not add primitives, invariants, or roles.
- This does not create approval authority.

## Next Action

R1 performs Canonical Gate to approve or reject this consolidated state as the next PCM baseline.
