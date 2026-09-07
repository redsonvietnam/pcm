# Evidence Provenance Matrix

**Date:** 2026-09-07
**Workstream:** PCM-GOVERNANCE-CORRECTION-01

---

## 1. Canonical Status

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| PCM/PWF v0.2 is canonical | PCM-GATE-01.md approving ab9f619 | Authority Gate record | v0.2 at ab9f619 was approved | Nothing about v1.0 |
| PCM/PWF v1.0 is canonical | Version headers in PCM.md, PWF.md, CONFORMANCE.md | Self-reported by operator | Operator designated v1.0 | No Authority Gate approved v1.0 |

## 2. v1.0 Approval

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| v1.0 was approved by PCM-GATE-01 | Multiple files reference this | Self-reported | Nothing — PCM-GATE-01 explicitly approved v0.2 | That v1.0 was approved |

## 3. Conformance Tests

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| 42 structured conformance specifications exist | conformance/scenarios/ files | Observed in repository | 42 declarative scenarios exist | That they are executable tests |
| 42 automated tests passed | None | N/A | N/A | N/A — no executable test harness exists |
| 20 scenario results exist | validation/bamso/RESULTS.md, validation/supervision/RESULTS.md | Self-reported by operator | 20 scenarios were evaluated | That results are independently verified |

## 4. Cross-Domain Validation

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| PCM semantics apply across domains | docs/CROSS-DOMAIN-VALIDATION.md, docs/NON-CODE-CONFORMANCE.md | Operator analysis | Analysis was performed | That analysis is independently verified |
| Software + ML pipeline + procurement validated | validation/ docs, docs/NON-CODE-CONFORMANCE.md | Operator analysis | Three domains were analyzed | That results are independently verified |

## 5. External Implementation

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| Two implementations exist | validation/bamso/, validation/supervision/ | Observed in repository | Two projects were studied | That they are independent |
| Implementations are independent | None | N/A | N/A — same developer for both | Independence |
| Implementations pass PCM invariants | validation/*/RESULTS.md | Self-reported by operator | Operator evaluated conformance | Independent verification |

## 6. Portability

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| PCM survives technology replacement | docs/PORTABILITY.md, docs/PORTABILITY-FINAL-REVIEW.md | Operator analysis | Analysis was performed | That analysis is independently verified |

## 7. Adversarial Review

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| 14 claims tested, no failures | docs/ADVERSARIAL-EXTERNAL-REVIEW.md | Self-reported by operator | Operator evaluated claims | Independent adversarial review |
| 12 claims tested in finalization | docs/FINALIZATION-01 review docs | Self-reported by operator | Operator evaluated claims | Independent adversarial review |

## 8. Freeze Readiness

| Claim | Evidence | Provenance | What It Proves | What It Does NOT Prove |
|-------|----------|------------|----------------|----------------------|
| Framework is FREEZE-READY | docs/FRAMEWORK-READINESS.md | Self-reported by operator | Operator determined freeze-readiness | Independent Authority approval |

---

## Summary of Provenance Issues

1. **v1.0 approval claim is false.** PCM-GATE-01 approved v0.2. No gate approved v1.0.

2. **"42 automated tests" is an overclaim.** The 42 items are declarative scenarios, not executable tests.

3. **"Independent implementations" is an overclaim.** Both projects are from the same developer.

4. **"Independent adversarial review" is an overclaim.** The review was performed by the same operator.

5. **"FREEZE-READY" is self-reported.** No independent Authority approved this determination.

---

## Corrected Claims

| Original Claim | Corrected Claim |
|---------------|-----------------|
| v1.0 is canonical (approved by PCM-GATE-01) | v0.2 is canonical (approved by PCM-GATE-01). v1.0 promotion requires Authority Gate. |
| 42 automated tests passed | 42 declarative conformance scenarios exist |
| Two independent implementations | Two projects from the same developer were analyzed |
| Independent adversarial review | Operator performed adversarial self-review |
| FREEZE-READY (Authority-approved) | Operator determined FREEZE-READY (pending Authority approval) |
