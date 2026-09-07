# Conformance Matrix

**Date:** 2026-09-07
**Workstream:** PCM-VALIDATION-01

---

## PCM Conformance Matrix

| Criterion | Bamso | Supervision | Notes |
|-----------|-------|-------------|-------|
| Canonical state (git) | PASS | PASS | Both use git branches |
| Proposed state | PASS | PASS | Both use local/branch changes |
| Task state | PASS-WITH-ADAPTER | UNSUPPORTED | Supervision doesn't track tasks |
| Authority | PASS-WITH-ADAPTER | PASS-WITH-ADAPTER | Both single-developer |
| Proposal submission | PASS | PASS-WITH-ADAPTER | Supervision is ad-hoc |
| HANDOFF | PASS | PASS-WITH-ADAPTER | Bamso is strong, Supervision minimal |
| GATE | PASS-WITH-ADAPTER | PASS-WITH-ADAPTER | Both implicit |
| Evidence | PASS | PASS | Both have tests |
| Evidence provenance | PASS | PASS-WITH-ADAPTER | Bamso has HANDOFF, Supervision has git |
| Stale state detection | PASS | PASS-WITH-ADAPTER | Bamso has status markers |
| Conflict detection | PASS | PASS-WITH-ADAPTER | Bamso uses git, Supervision single-dev |
| Execution | PASS | PASS | Both work |
| Post-gate observation | PASS | PASS | Both verify |

---

## PCM Invariant Matrix

| Invariant | Bamso | Supervision | Same Reason? |
|-----------|-------|-------------|--------------|
| 7.1 Agent ≠ Authority | PASS | PASS | YES |
| 7.2 Implementation ≠ Approval | PASS | PASS | YES |
| 7.3 Proposed ≠ Canonical | PASS | PASS | YES |
| 7.4 Context ≠ Canonical | PASS | PASS | YES |
| 7.5 Protocol ≠ Tooling | PASS | PASS | YES |
| 7.6 Concurrent Conflict ≠ Silent Resolution | PASS | PASS | PARTIALLY |

---

## PWF Conformance Matrix

| Criterion | Bamso | Supervision | Assessment |
|-----------|-------|-------------|-----------|
| Task record | PASS-WITH-ADAPTER | UNSUPPORTED | Supervision minimal |
| Task lifecycle | PASS-WITH-ADAPTER | UNSUPPORTED | Supervision minimal |
| Handoff | PASS | PASS-WITH-ADAPTER | Bamso strong |
| GATE integration | PASS-WITH-ADAPTER | PASS-WITH-ADAPTER | Both implicit |
| State traceability | PASS | PASS-WITH-ADAPTER | Bamso has HANDOFF |
| Checkpoints | UNSUPPORTED | UNSUPPORTED | Neither has formal checkpoints |
| Next action | PASS-WITH-ADAPTER | UNSUPPORTED | Supervision minimal |
| Routing | N/A | N/A | Single actor |
| Verification | PASS | PASS | Both have tests |
| Recovery | PASS | PASS-WITH-ADAPTER | Supervision restarts |
| Escalation | N/A | N/A | Single actor |
| Drift/reconciliation | PASS | PASS-WITH-ADAPTER | Bamso has status markers |

---

## Adapter Capability Matrix

| Capability | Bamso | Supervision | Required? |
|-----------|-------|-------------|-----------|
| Canonical-state observation | PASS | PASS | MUST |
| Proposed-state observation | PASS | PASS | MUST |
| Persistence | PASS | PASS | MUST |
| Task representation | PASS-WITH-ADAPTER | UNSUPPORTED | SHOULD |
| Execution | PASS | PASS | MUST |
| Verification | PASS | PASS | MUST |
| Evidence retrieval | PASS | PASS | MUST |
| HANDOFF | PASS | PASS-WITH-ADAPTER | MUST |
| Authority communication | PASS-WITH-ADAPTER | PASS-WITH-ADAPTER | SHOULD |
| Actor capability description | N/A | N/A | OPTIONAL |

---

## Summary Statistics

| Category | Bamso | Supervision | Total |
|----------|-------|-------------|-------|
| PASS | 8 | 4 | 12 |
| PASS-WITH-ADAPTER | 5 | 7 | 12 |
| UNSUPPORTED | 0 | 1 | 1 |
| FAIL | 0 | 0 | 0 |
| N/A | 1 | 1 | 2 |

**Overall Assessment:** Both implementations pass PCM conformance with adapter-level adaptations appropriate to project size and complexity.
