# Drift/Reconciliation Model V1

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Make the distinction between drift and reconciliation explicit.

## Definitions

### Drift

**Definition:** A mismatch between what an actor/session assumes and what canonical/persistent state actually indicates.

**Characteristics:**
- Actor's context is stale
- Proposed state diverges from canonical
- Assumptions contradict actual state
- Evidence gaps exist

### Reconciliation

**Definition:** Bringing the working proposal/context back into alignment with current canonical state.

**Characteristics:**
- Detect drift
- Assess significance
- Determine approach
- Execute reconciliation
- Verify alignment

## Drift Indicators

- Stale handoff reference
- Changed canonical state since last observation
- Conflicting proposals
- Authority change
- Revoked delegation
- Evidence gaps
- Context/canonical divergence

## Reconciliation Triggers

### Stale Handoff Reference

**Trigger:** Handoff references canonical state that has changed

**Action:**
- Detect divergence
- Flag stale handoff
- Require reconciliation before use

---

### Changed Canonical State

**Trigger:** Canonical state has changed since actor's last observation

**Action:**
- Detect change
- Update actor's context
- Reconcile proposals if needed

---

### Conflicting Proposals

**Trigger:** Multiple proposals conflict for same canonical state

**Action:**
- Detect conflict
- Block silent resolution
- Require AUTHORITY resolution

---

### Authority Change

**Trigger:** Authority for scope has changed

**Action:**
- Detect authority change
- Update authority status
- Reconcile pending decisions

---

### Revoked Delegation

**Trigger:** Authority delegation has been revoked

**Action:**
- Detect revocation
- Block delegated actions
- Reconcile affected work

---

### Evidence Gaps

**Trigger:** Evidence required for decision is missing

**Action:**
- Detect gaps
- Request additional evidence
- Block decision until evidence provided

---

### Context/Canonical Divergence

**Trigger:** Actor's context diverges from canonical state

**Action:**
- Detect divergence
- Flag stale context
- Require fresh canonical state

## Implementation Notes

Drift detection and reconciliation mechanisms are adapter-specific. The semantic requirement is that stale claims can be invalidated by actual state. Specific polling intervals, detection algorithms, and reconciliation procedures are implementation details.