# PCM-GATE-02A — Stability Graduation Policy Authority Gate

**Gate Identifier:** PCM-GATE-02A
**Gate Type:** VERSIONING POLICY CLARIFICATION
**Date:** 2026-09-07
**Status:** PROPOSED — PENDING AUTHORITY DECISION

---

**THIS RECORD IS NOT AN AUTHORITY APPROVAL.**
**IT IS A DECISION REQUEST.**
**THE AUTHORITY DECISION HAS NOT YET BEEN MADE.**

---

## 1. Current Canonical Baseline

- **Version:** PCM/PWF v0.2
- **Commit:** ab9f61914a50bf1e8ff0889057e19a2da1922d77
- **Approved by:** PCM-GATE-01
- **Status:** Canonical

---

## 2. Proposed Policy Artifact

- **Document:** docs/VERSION-STABILITY-GOVERNANCE-PROPOSAL.md
- **Commit:** ecc4562
- **Status:** PROPOSAL — NOT an Authority decision

---

## 3. Exact Policy Change Being Requested

Add a new category to the versioning policy:

### Current Policy (docs/CHANGE-CONTROL.md, lines 121–125)

- **Major:** PCM semantic changes (invariants, primitives, roles, state model)
- **Minor:** Conformance changes, PWF policy changes, clarifications
- **Patch:** Editorial changes, formatting, typo fixes

### Proposed Clarification

Add **Stability Graduation** as a distinct category:

- **Stability Graduation:** 0.x → 1.0.0 promotion without semantic change
- **Authority Required:** Authority Gate (mandatory)
- **Conditions:** No PCM/PWF semantic change; accumulated governance evidence; explicit Authority approval

### What Changes

- A new versioning category is defined.
- The Major category is NOT redefined. Major still means PCM semantic changes.
- The new category applies ONLY to 0.x → 1.0.0 promotions.

### What Does NOT Change

- PCM primitives (WORKSTREAM, TASK, HANDOFF, GATE)
- PCM invariants (7.1–7.6)
- PCM roles (AUTHORITY, PROPOSER, OPERATOR, OBSERVER)
- PCM state model (canonical, proposed, execution, context)
- PWF mandatory behaviors (5 behaviors)
- Authority Gate requirements for PCM semantic changes
- Authority Gate requirements for conformance changes

---

## 4. Semantic Delta

**PCM primitives:** UNCHANGED
**PCM invariants:** UNCHANGED
**PCM roles:** UNCHANGED
**PCM state model:** UNCHANGED
**PWF mandatory behaviors:** UNCHANGED

**PCM semantic changes = ZERO**
**PWF semantic changes = ZERO**

The policy clarification modifies the versioning policy only. It does not modify any PCM or PWF semantic content.

---

## 5. Authority Requirement

**Policy clarification requires Authority Gate.**

R1 must decide:
- **PASS:** Approve the Stability Graduation policy clarification.
- **FAIL:** Reject the Stability Graduation policy clarification.

The Authority Gate for this policy clarification is separate from and prior to the Authority Gate for the v1.0 promotion (PCM-GATE-02).

---

## 6. Conformance Impact

**NONE.**

The Stability Graduation policy clarification:
- Does not change conformance criteria
- Does not change conformance scenarios
- Does not change conformance evidence requirements
- Does not invalidate prior conformance evidence
- Does not require re-conformance testing

---

## 7. Migration Impact

**NONE.**

The Stability Graduation policy clarification:
- Does not require migration of existing implementations
- Does not require changes to existing adapters
- Does not require changes to existing workflows
- Does not affect existing project-specific integrations

---

## 8. Compatibility with PCM-GATE-01

**COMPATIBLE.**

PCM-GATE-01 approved PCM/PWF v0.2 at commit ab9f619.

The proposed Stability Graduation policy clarification:
- Does not change v0.2 semantics
- Does not invalidate PCM-GATE-01's approval
- Does not modify the approved baseline
- Preserves the authority of PCM-GATE-01's decision

---

## 9. Relationship to Future PCM-GATE-02

**SEQUENTIAL.**

PCM-GATE-02A (this gate) must be decided BEFORE PCM-GATE-02 (v1.0 promotion) can proceed.

If PCM-GATE-02A is PASS:
- The Stability Graduation policy clarification is approved.
- PCM-GATE-02 can proceed to assess the v1.0 promotion under the clarified policy.

If PCM-GATE-02A is FAIL:
- The existing versioning policy remains unchanged.
- PCM-GATE-02 cannot proceed with v1.0 promotion (v0.3 is the only valid option).

---

## 10. Risks and Mitigations

### Risk 1: Stability Graduation weakens Authority Gate

**Mitigation:** The Stability Graduation requires Authority Gate approval, same as PCM semantic changes. It does not weaken the governance requirement.

### Risk 2: Stability Graduation is used to hide semantic changes

**Mitigation:** The Authority Gate review explicitly requires semantic delta assessment. The proposer must document that no semantic change occurred. The Authority Gate verifies this claim.

### Risk 3: Stability Graduation creates confusion about version semantics

**Mitigation:** The policy clarification explicitly distinguishes Stability Graduation from Major/Minor/Patch. Version progression rules are documented.

### Risk 4: Future versions blur the distinction

**Mitigation:** The policy states that after v1.0.0, normal semantic versioning resumes. v1.0.1 = patch, v1.1.0 = minor, v2.0.0 = major semantic change.

---

## 11. Decision Request

**PASS:**
Approve the Stability Graduation policy clarification. This enables:
- A new versioning category for 0.x → 1.0.0 promotions.
- PCM-GATE-02 to proceed with v1.0 promotion under the clarified policy.
- No changes to PCM/PWF semantics.

**FAIL:**
Reject the Stability Graduation policy clarification. This means:
- The existing versioning policy remains unchanged.
- v0.2 → v1.0 is not valid without a PCM semantic change.
- The alternative is v0.2 → v0.3 (minor bump) under current policy.

---

**THIS RECORD IS NOT AN AUTHORITY APPROVAL.**
**THE AUTHORITY DECISION HAS NOT YET BEEN MADE.**
**C1 IS THE OPERATOR, NOT AUTHORITY.**
**C1 DOES NOT GRANT AUTHORITY APPROVAL.**
