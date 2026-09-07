# Version Promotion Analysis

**Date:** 2026-09-07
**Workstream:** PCM-VERSION-GOVERNANCE-01

---

## 1. Current Versioning Policy

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

## 2. Exact Contradiction

PCM-GATE-02-PROPOSAL.md proposes **v0.2 → v1.0** (major bump) while simultaneously stating:

> "Core PCM semantics: UNCHANGED since v0.2"
> "Core PWF semantics: UNCHANGED since v0.2"

Under the existing policy:
- **Major = PCM semantic changes**
- **No PCM semantic change = no major version bump**

The proposal is self-contradictory under current policy.

---

## 3. Option A: Keep Existing Policy Literally

**Can v0.2 → v1.0 occur without PCM semantic change?**

**NO.**

The policy explicitly states: Major = PCM semantic changes. If no PCM semantic change occurred, the version bump is NOT a major change. The correct version would be:

- v0.2 → v0.3 (minor, for conformance/documentation additions)
- v0.2 → v0.2.1 (patch, for editorial corrections)

| Dimension | Assessment |
|-----------|-----------|
| Semantic impact | NONE |
| Governance impact | NONE — existing policy is clear and sufficient |
| Compatibility impact | NONE |
| Conformance impact | NONE |
| Migration impact | NONE |
| Existing Authority approval | SUFFICIENT (for minor/patch) |
| New Authority Gate | NOT REQUIRED (for minor/patch) |

---

## 4. Option B: Treat v1.0 as Stability Graduation Milestone

**Would this require a change/clarification to CHANGE-CONTROL?**

**YES.**

The current policy does not define a "stability graduation" category. Major is defined as "PCM semantic changes" — not "stability graduation." This would require adding a new category or redefining Major.

| Dimension | Assessment |
|-----------|-----------|
| Semantic impact | NONE (versioning policy clarification) |
| Governance impact | Substantive policy clarification requiring Authority Gate |
| Compatibility impact | NONE |
| Conformance impact | NONE |
| Migration impact | NONE |
| Existing Authority approval | NOT SUFFICIENT |
| New Authority Gate | REQUIRED (for policy clarification) |

---

## 5. Option C: Promote to Another 0.x Version

**What version is consistent with the current policy?**

- **v0.3** — minor version bump for conformance/documentation additions
- **v0.2.1** — patch version bump for editorial changes

The changes since ab9f619 are:
- New documents (reviews, validation, conformance tests) → Minor
- Claim precision corrections → Patch
- Version header changes → Metadata

The correct version under current policy would be **v0.3** (minor).

| Dimension | Assessment |
|-----------|-----------|
| Semantic impact | NONE |
| Governance impact | NONE |
| Compatibility impact | NONE |
| Conformance impact | NONE |
| Migration impact | NONE |
| Existing Authority approval | SUFFICIENT |
| New Authority Gate | NOT REQUIRED |

---

## 6. Option D: Clarify 0.x → 1.0 as Stability Graduation

**Would this be a policy clarification or semantic change?**

**POLICY CLARIFICATION.**

It would clarify the versioning policy to allow a "stability graduation" category. This is a substantive policy clarification, not an editorial change.

| Dimension | Assessment |
|-----------|-----------|
| Semantic impact | NONE (PCM semantics unchanged) |
| Governance impact | Requires Authority Gate for policy clarification |
| Compatibility impact | NONE |
| Conformance impact | NONE |
| Migration impact | NONE |
| Existing Authority approval | NOT SUFFICIENT |
| New Authority Gate | REQUIRED (for policy clarification) |

---

## 7. Recommended Resolution

**OPTION C is the minimum viable path.**

1. **Do not change the versioning policy.** The existing policy is clear and sufficient.
2. **Do not propose v1.0.** The existing policy does not support a major bump without semantic changes.
3. **Propose v0.3** if the accumulated review/validation work warrants a version increment.
4. **v0.3 can be approved by PCM-GATE-02** without requiring a new Authority Gate for policy clarification.

**If R1/Authority wants v1.0:**

1. **Option D first:** Create a policy clarification that allows "stability graduation" as a major bump category.
2. **Authority Gate for policy clarification:** R1 must approve the policy clarification.
3. **Then approve v1.0:** After the policy is clarified, v1.0 can be approved under the new policy.

---

## 8. Policy Modification Required?

**For Option C (v0.3):** NO — existing policy is sufficient.

**For Option D (v1.0):** YES — substantive policy clarification required, but it is a versioning policy clarification, not a PCM semantic change.

---

## 9. Authority Gate Required?

**For Option C (v0.3):** NO — existing Authority approval (PCM-GATE-01) is sufficient.

**For Option D (v1.0):** YES — R1 must approve the policy clarification first.

---

## 10. PCM Semantic Changes = ZERO

## 11. PWF Semantic Changes = ZERO

## 12. Gate-02 Proposal Status

**INVALID UNDER CURRENT POLICY.**

The proposal self-contradicts the versioning policy: it proposes a major version bump while explicitly stating no major change occurred.

---

## 13. Remote HEAD

ab86be0

---

## 14. Governance Status

**VERSIONING-BLOCKED** (at time of analysis)

The current versioning policy does not support the proposed v0.2 → v1.0 promotion without either:
- A policy clarification (Option D)
- A different version number (Option C: v0.3)

R1 must decide:
1. Accept v0.3 under current policy (no policy change needed)
2. Clarify policy to allow v1.0 stability graduation (policy change + Authority Gate)

---

**CURRENT STATUS (2026-09-07):**

PCM-GATE-02A = PASS. The Stability Graduation policy clarification is now canonical.

The v0.2 → v1.0 promotion is now valid as a Stability Graduation under the approved policy.

This analysis was accurate at the time of creation. The versioning is no longer BLOCKED.
