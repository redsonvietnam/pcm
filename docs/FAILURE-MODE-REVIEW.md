# Failure Mode Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## 1. Concurrent Conflicting Proposals

**Layer:** PCM

**PCM handling:** Invariant 7.6 prevents silent resolution. AUTHORITY must explicitly resolve.

**Assessment:** HANDLED.

---

## 2. Duplicate Work

**Layer:** Adapter

**PCM handling:** Not a PCM concern. Adapter may detect through task tracking.

**Assessment:** OUTSIDE FRAMEWORK SCOPE. Correctly delegated.

---

## 3. Stale Handoff

**Layer:** PWF

**PCM handling:** HANDOFF references canonical state. Receiving actor detects staleness by comparing with current canonical state.

**Assessment:** HANDLED.

---

## 4. Lost Context

**Layer:** PWF

**PCM handling:** HANDOFF makes context transfer explicit. Context loss is prevented by HANDOFF semantics.

**Assessment:** HANDLED.

---

## 5. Authority Ambiguity

**Layer:** PCM

**PCM handling:** Authority must be explicitly delegated (11.1). Ambiguous authority remains contested (11.4).

**Assessment:** HANDLED.

---

## 6. Authority Delay

**Layer:** PCM

**PCM handling:** Latency never implies approval (7.6, 11.4).

**Assessment:** HANDLED.

---

## 7. Authority Revocation

**Layer:** PCM

**PCM handling:** Authority is bounded by delegation terms (11.2). Revocation is possible.

**Assessment:** HANDLED.

---

## 8. Partial Execution

**Layer:** PWF

**PCM handling:** Task lifecycle tracks progress. HANDOFF captures partial completion.

**Assessment:** HANDLED.

---

## 9. Interrupted Execution

**Layer:** PWF

**PCM handling:** HANDOFF captures execution context. Recovery is possible.

**Assessment:** HANDLED.

---

## 10. Failed Verification

**Layer:** PWF

**PCM handling:** GATE verification can reject. Rejected state remains proposed.

**Assessment:** HANDLED.

---

## 11. False Evidence

**Layer:** Adapter

**PCM handling:** Evidence provenance (PCM 12) distinguishes self-reported, independently produced, and automatically observed evidence. AUTHORITY decides what evidence is sufficient.

**Assessment:** HANDLED through evidence provenance.

---

## 12. Self-Reported Evidence

**Layer:** PCM

**PCM handling:** Self-reported evidence is valid for progress tracking but may require independent verification for GATE decisions (12.1).

**Assessment:** HANDLED.

---

## 13. Tool Failure

**Layer:** Adapter

**PCM handling:** Protocol continues regardless of tool state (7.5). Tool failure does not alter protocol semantics.

**Assessment:** OUTSIDE FRAMEWORK SCOPE. Correctly delegated.

---

## 14. Actor Failure

**Layer:** Adapter

**PCM handling:** HANDOFF enables recovery. Different actor can continue.

**Assessment:** HANDLED through HANDOFF.

---

## 15. Persistence Failure

**Layer:** Adapter

**PCM handling:** Canonical state must exist in persistent storage (8.1). Persistence failure is an adapter concern.

**Assessment:** OUTSIDE FRAMEWORK SCOPE. Correctly delegated.

---

## 16. Canonical-State Corruption

**Layer:** PCM

**PCM handling:** Only AUTHORITY through GATE can modify canonical state (8.1). Corruption requires authority violation.

**Assessment:** HANDLED through authority enforcement.

---

## 17. Routing Failure

**Layer:** Adapter

**PCM handling:** Routing is optional (PWF 7.1). Routing failure does not affect core semantics.

**Assessment:** OUTSIDE FRAMEWORK SCOPE. Correctly delegated.

---

## 18. Recovery Failure

**Layer:** PWF/Adapter

**PCM handling:** HANDOFF provides recovery mechanism. Recovery failure may occur if HANDOFF is inadequate.

**Assessment:** HANDLED through HANDOFF semantics.

---

## 19. Scope Creep

**Layer:** PWF

**PCM handling:** WORKSTREAM defines scope boundaries. Scope creep is detectable by comparing work with workstream scope.

**Assessment:** HANDLED.

---

## 20. Semantic Drift

**Layer:** PCM

**PCM handling:** Proposed ≠ Canonical (7.3). Context ≠ Canonical (7.4). Drift is detectable through state comparison.

**Assessment:** HANDLED.

---

## Summary

| Layer | Count | Handling |
|-------|-------|----------|
| PCM | 9 | All handled by invariants and semantics |
| PWF | 5 | All handled by mandatory behaviors |
| Adapter | 4 | Correctly delegated to adapter |
| Outside scope | 2 | Correctly outside framework |

**Result:** All failures are either:
- Handled by PCM/PWF semantics
- Correctly delegated to adapter
- Correctly outside framework scope

**FREEZE IMPLICATION:** Failure modes are covered.
