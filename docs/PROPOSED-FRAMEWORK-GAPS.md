# Proposed Framework Gaps

**Date:** 2026-09-07
**Workstream:** PCM-VALIDATION-01

---

## Status

**No genuine PCM semantic gaps discovered.**

All observed friction during external validation was resolved at the adapter or PWF policy layer.

---

## Evidence

### 1. Task State Tracking

**Observed Behavior:** Supervision does not track task lifecycle.

**Implementation:** Supervision (personal ML pipeline)

**Evidence:** No formal task state machine — ad-hoc descriptions only.

**Current Rule:** PCM does not require formal task state tracking. It is a PWF recommendation.

**Why Adapter/Policy is Insufficient:** Not needed for a personal tool. The developer tracks work mentally or via git history.

**Assessment:** NOT A FRAMEWORK GAP. Task state tracking is a PWF recommendation, not a PCM requirement. A minimal tool can function without it.

---

### 2. Formal Authority Gate

**Observed Behavior:** Neither Bamso nor Supervision has a formal Authority Gate record.

**Implementation:** Both projects

**Evidence:** No `docs/gates/` directory in either project. Merge to main is the de facto gate.

**Current Rule:** PCM requires authority separation but does not mandate a specific gate mechanism.

**Why Adapter/Policy is Insufficient:** Both projects use implicit gates (merge criteria, test pass). This is sufficient for single-developer projects.

**Assessment:** NOT A FRAMEWORK GAP. Formal Authority Gate records are a PWF recommendation for multi-party projects. Single-developer projects can use implicit gates.

---

### 3. Checkpoint Mechanism

**Observed Behavior:** Neither project has formal checkpoints for recovery.

**Implementation:** Both projects

**Evidence:** No checkpoint files or mechanisms. Supervision restarts from beginning on failure.

**Current Rule:** PCM does not require checkpoints. PWF recommends them for complex tasks.

**Why Adapter/Policy is Insufficient:** Simple projects can restart from beginning. Checkpoints are only needed for long-running tasks.

**Assessment:** NOT A FRAMEWORK GAP. Checkpoints are a PWF recommendation, not a PCM requirement.

---

### 4. Formal Conflict Resolution

**Observed Behavior:** Bamso uses ad-hoc conflict resolution.

**Implementation:** Bamso

**Evidence:** HANDOFF.md Phiên 2 records conflict detection but no formal resolution mechanism.

**Current Rule:** PCM requires conflict detection (invariant 7.6) but does not mandate a specific resolution mechanism.

**Why Adapter/Policy is Insufficient:** Git merge conflicts provide detection. Resolution is ad-hoc but effective.

**Assessment:** NOT A FRAMEWORK GAP. Formal conflict resolution is a PWF recommendation. Git provides sufficient detection.

---

### 5. Multi-Party Workflow

**Observed Behavior:** Both projects are single-developer.

**Implementation:** Both projects

**Evidence:** No multi-party workflows tested.

**Current Rule:** PCM supports single-actor operation (invariant 7.1 allows PROPOSER+AUTHORITY in one actor).

**Why Adapter/Policy is Insufficient:** Not needed for single-developer projects.

**Assessment:** NOT A FRAMEWORK GAP. Multi-party workflows are a use case, not a requirement. PCM explicitly allows single-actor operation.

---

## Conclusion

**No genuine PCM semantic gaps were discovered during external validation.**

All observed friction was resolved at the adapter or PWF policy layer:
- Task state tracking → PWF recommendation (not required)
- Formal Authority Gate → PWF recommendation (not required)
- Checkpoints → PWF recommendation (not required)
- Formal conflict resolution → PWF recommendation (not required)
- Multi-party workflow → Use case (not required)

**The canonical PCM specification remains unchanged. v1.0 has identical semantics to v0.2.**
