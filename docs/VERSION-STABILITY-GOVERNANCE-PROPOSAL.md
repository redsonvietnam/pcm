# Version Stability Governance Proposal

**Status:** PROPOSAL — NOT AN AUTHORITY DECISION
**Date:** 2026-09-07
**Workstream:** PCM-VERSION-GOVERNANCE-02
**Proposer:** C1 (Operator)

---

**THIS IS A PROPOSAL.**
**IT IS NOT AN AUTHORITY DECISION.**
**IT MUST NOT BE TREATED AS CANONICAL UNTIL R1/Authority approves it.**

---

## 1. Problem Statement

The current versioning policy (docs/CHANGE-CONTROL.md, lines 121–125) defines:

- **Major:** PCM semantic changes (invariants, primitives, roles, state model)
- **Minor:** Conformance changes, PWF policy changes, clarifications
- **Patch:** Editorial changes, formatting, typo fixes

PCM-GATE-02-PROPOSAL.md proposes **v0.2 → v1.0** (major bump) while explicitly stating:

> "Core PCM semantics: UNCHANGED since v0.2"
> "Core PWF semantics: UNCHANGED since v0.2"

Under the current policy, this is a contradiction: a major version bump requires a PCM semantic change, but no such change occurred.

R1 has decided to proceed with **Option D**: Allow a 0.x → 1.0.0 "Stability Graduation" without requiring a PCM semantic change.

---

## 2. Current Policy

**Source:** docs/CHANGE-CONTROL.md, lines 121–125

| Category | Definition | Authority Required |
|----------|-----------|-------------------|
| Major | PCM semantic changes (invariants, primitives, roles, state model) | Authority Gate |
| Minor | Conformance changes, PWF policy changes, clarifications | None or Authority Gate |
| Patch | Editorial changes, formatting, typo fixes | None |

**Source:** docs/VERSIONING-REVIEW.md, lines 98–104

| Category | Definition |
|----------|-----------|
| Major | Incompatible changes to invariants or primitives |
| Minor | Compatible additions or clarifications |
| Patch | Corrections or editorial changes |

---

## 3. Confirmed Contradiction

The existing policy defines Major exclusively as "PCM semantic changes." It does not define any other category that would allow a major version bump without semantic changes. Therefore:

- v0.2 → v1.0 **is not valid** under the current policy when PCM semantics are unchanged.
- The proposal self-contradicts the versioning policy.

---

## 4. Proposed Stability Graduation Rule

### 4.1 Definition

**Stability Graduation** is the promotion of a framework from a pre-1.0 development series (0.x) to a 1.0.0 stable release, signifying:

1. The framework has accumulated sufficient review, validation, and governance evidence.
2. The framework is considered stable for production use.
3. The core semantics have NOT changed from the last approved baseline.
4. The version bump reflects maturity, not semantic evolution.

### 4.2 Precise Conditions

A Stability Graduation (0.x → 1.0.0) is valid when ALL of the following are true:

1. **No PCM semantic change** has occurred since the last approved baseline.
2. **No PWF semantic change** has occurred since the last approved baseline.
3. **No conformance change** has occurred that would invalidate prior evidence.
4. The framework has undergone **Authority Gate review** at the 0.x level.
5. The framework has accumulated **additional governance evidence** (reviews, validation, conformance analysis) since the last approved baseline.
6. The **Authority Gate explicitly approves** the stability graduation.

### 4.3 What Stability Graduation Is NOT

- It is NOT a substitute for PCM semantic changes. Actual semantic changes still require a Major bump with Authority Gate.
- It is NOT an automatic promotion. It requires explicit Authority Gate approval.
- It is NOT a way to hide semantic changes. The semantic delta must be explicitly assessed and documented.
- It is NOT a weaker governance path. The Authority Gate requirement is preserved.

---

## 5. Authority Requirements

### 5.1 Policy Clarification

The proposed Stability Graduation rule is a **substantive policy clarification** to docs/CHANGE-CONTROL.md. It is NOT an editorial change.

**Authority Required:** Authority Gate (R1 must approve).

**Rationale:** This clarification changes the governance rules for version progression. It introduces a new category (Stability Graduation) that affects how version numbers are assigned and what Authority Gate review is required.

### 5.2 Stability Graduation Itself

A Stability Graduation (0.x → 1.0.0) requires:

- **Authority Gate review** of the proposed baseline.
- **Explicit Authority decision** (PASS/FAIL).
- **Documentation** in docs/gates/.

**Authority Required:** Authority Gate (same level as PCM semantic changes).

**Rationale:** Even though no semantic change occurs, the Authority Gate review is necessary to confirm:
1. No hidden semantic changes exist.
2. The accumulated evidence supports stability.
3. The promotion is appropriate for the framework's maturity.

### 5.3 Subsequent v1.0 Promotion

After the policy clarification is approved, the subsequent v1.0 promotion requires its own Authority decision. The policy clarification enables the promotion; it does not automatically approve it.

### 5.4 Future PCM Semantic Changes

Future PCM semantic changes remain subject to the existing Authority Gate requirement. The Stability Graduation rule does not weaken this requirement.

---

## 6. Versioning Rules After Clarification

### 6.1 Updated Categories

| Category | Definition | Authority Required |
|----------|-----------|-------------------|
| **Stability Graduation** | 0.x → 1.0.0 promotion without semantic change | Authority Gate |
| Major | PCM semantic changes (invariants, primitives, roles, state model) | Authority Gate |
| Minor | Conformance changes, PWF policy changes, clarifications | None or Authority Gate |
| Patch | Editorial changes, formatting, typo fixes | None |

### 6.2 Version Progression Rules

**PATCH (v0.2.x):**
- Editorial changes, formatting, typo fixes
- No semantic impact
- Authority: None

**MINOR (v0.x):**
- Conformance changes, PWF policy changes, clarifications
- Compatible additions or clarifications
- Authority: None or Authority Gate (depending on conformance impact)

**MAJOR (v1.x, v2.x, ...):**
- PCM semantic changes (invariants, primitives, roles, state model)
- Incompatible changes to core semantics
- Authority: Authority Gate (mandatory)

**STABILITY GRADUATION (v0.x → v1.0.0):**
- Framework maturity promotion
- No semantic change from last approved baseline
- Authority: Authority Gate (mandatory)

### 6.3 Distinguishing Categories

| Test | Category |
|------|----------|
| Did PCM invariants, primitives, roles, or state model change? | YES → Major |
| Did PWF mandatory behaviors change? | YES → Major or Minor (depending on impact) |
| Did conformance criteria change? | YES → Minor (with Authority Gate) |
| Did only editorial/clarity content change? | YES → Patch |
| Is this a 0.x → 1.0.0 promotion with no semantic change? | YES → Stability Graduation |

---

## 7. Conformance / Migration Impact

### 7.1 Stability Graduation with Unchanged Semantics

When a Stability Graduation occurs with NO semantic change:

- **Prior conformance evidence remains valid.**
- **No migration is required.**
- **No re-conformance is required.**
- **Existing implementations remain conformant.**

**Rationale:** If the semantics have not changed, the conformance criteria have not changed. Therefore, prior conformance evidence is still applicable.

### 7.2 Comparison with PCM Semantic Changes

When a PCM semantic change occurs (Major bump):

- Prior conformance evidence may be invalid.
- Migration plan required.
- Re-conformance required.
- Existing implementations may need updating.

**This distinction is critical:** Stability Graduation is explicitly NOT a PCM semantic change. It does NOT trigger the conformance invalidation that PCM semantic changes trigger.

---

## 8. Compatibility with PCM-GATE-01

PCM-GATE-01 approved PCM/PWF v0.2 at commit ab9f619.

The proposed Stability Graduation is compatible with PCM-GATE-01:

1. PCM-GATE-01 approved v0.2 semantics.
2. The Stability Graduation does not change v0.2 semantics.
3. The v1.0.0 promotion preserves v0.2 semantics exactly.
4. PCM-GATE-01's approval remains valid for the underlying semantic content.

**No conflict exists.**

---

## 9. Compatibility with PCM-GATE-02

PCM-GATE-02-PROPOSAL.md proposes v1.0 at commit f791185.

The proposed Stability Graduation is compatible with PCM-GATE-02:

1. PCM-GATE-02 explicitly states "Core PCM semantics: UNCHANGED since v0.2."
2. This matches the Stability Graduation requirement of no semantic change.
3. The Authority Gate review for the Stability Graduation will assess the same evidence.
4. If R1 approves the Stability Graduation policy AND the v1.0 promotion, both are valid.

**The policy clarification must be approved FIRST, then the v1.0 promotion can proceed.**

---

## 10. Semantic Delta

**PCM primitives:** UNCHANGED (WORKSTREAM, TASK, HANDOFF, GATE)

**PCM invariants:** UNCHANGED (7.1–7.6)

**PCM roles:** UNCHANGED (AUTHORITY, PROPOSER, OPERATOR, OBSERVER)

**PCM state model:** UNCHANGED (canonical, proposed, execution, context)

**PWF mandatory behaviors:** UNCHANGED (5 behaviors)

**PCM semantic changes = ZERO**

**PWF semantic changes = ZERO**

The Stability Graduation rule does not modify any PCM or PWF semantic content. It clarifies the versioning policy only.

---

## 11. Governance Risks

### 11.1 Risk: Stability Graduation weakens Authority Gate

**Mitigation:** The Stability Graduation requires Authority Gate approval, same as PCM semantic changes. It does not weaken the governance requirement.

### 11.2 Risk: Stability Graduation is used to hide semantic changes

**Mitigation:** The Authority Gate review explicitly requires semantic delta assessment. The proposer must document that no semantic change occurred. The Authority Gate verifies this claim.

### 11.3 Risk: Stability Graduation creates confusion about version semantics

**Mitigation:** The policy clarification explicitly distinguishes Stability Graduation from Major/Minor/Patch. Version progression rules are documented.

### 11.4 Risk: Future versions blur the distinction

**Mitigation:** The policy states that after v1.0.0, normal semantic versioning resumes. v1.0.1 = patch, v1.1.0 = minor, v2.0.0 = major semantic change.

---

## 12. Proposed Authority Decision

**If R1/Authority approves this policy clarification:**

1. The Stability Graduation rule is added to docs/CHANGE-CONTROL.md.
2. PCM-GATE-02 can proceed to assess the v1.0 promotion under the clarified policy.
3. The Authority Gate for the v1.0 promotion explicitly approves the Stability Graduation.

**If R1/Authority rejects this policy clarification:**

1. The existing versioning policy remains unchanged.
2. v0.2 → v1.0 is not valid without a PCM semantic change.
3. The alternative is v0.2 → v0.3 (minor bump) under current policy.

---

## 13. Explicit Statement

**THIS IS A PROPOSAL.**

**IT IS NOT AN AUTHORITY DECISION.**

**IT MUST NOT BE TREATED AS CANONICAL UNTIL R1/Authority approves it.**

**This proposal does NOT:**
- Approve the policy clarification
- Make the policy canonical
- Promote PCM/PWF to v1.0
- Modify PCM/PWF semantic definitions
- Modify conformance semantics
- Start adapter implementation
- Start adoption
- Change project-specific repos

**This proposal DOES:**
- Analyze the versioning-policy inconsistency
- Propose a precise Stability Graduation rule
- Document authority requirements
- Verify semantic preservation
- Identify governance risks
- Recommend an Authority decision path
