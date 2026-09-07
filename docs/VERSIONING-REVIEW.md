# Versioning Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## 1. Change Categories

### EDITORIAL

**Definition:** Typo fixes, formatting, non-semantic changes.

**Authority required:** None.

**Conformance impact:** None.

**Example:** Fixing a typo in PCM.md.

### CLARIFICATION

**Definition:** Making existing semantics clearer without changing them.

**Authority required:** None.

**Conformance impact:** None.

**Example:** Adding an example to explain an invariant.

### PWF POLICY

**Definition:** Changes to recommended or optional PWF behaviors.

**Authority required:** None.

**Conformance impact:** None (only affects recommendations).

**Example:** Adding a new recommended behavior.

### CONFORMANCE

**Definition:** Changes to conformance criteria or test specifications.

**Authority required:** PWF review.

**Conformance impact:** May affect what is tested.

**Example:** Adding a new conformance test.

### PCM SEMANTIC CHANGE

**Definition:** Changes to PCM primitives, invariants, state model, or core semantics.

**Authority required:** Authority Gate.

**Conformance impact:** Fundamental — may break existing conformant implementations.

**Example:** Adding a new invariant or primitive.

### STABILITY GRADUATION

**Definition:** 0.x → 1.0.0 promotion without PCM/PWF semantic change.

**Authority required:** Authority Gate (approved by PCM-GATE-02A).

**Conformance impact:** None — prior conformance evidence remains valid.

**Example:** Promoting PCM/PWF v0.2 to v1.0 after accumulated review/validation work.

---

## 2. Authority Requirements

| Category | Authority Required | Review Required |
|----------|-------------------|-----------------|
| Editorial | None | None |
| Clarification | None | None |
| PWF Policy | None | None |
| Conformance | PWF review | Yes |
| PCM Semantic | Authority Gate | Yes |
| Stability Graduation | Authority Gate | Yes |

---

## 3. Conformance Evidence After Changes

**Editorial/Clarification:** Existing conformance evidence remains valid.

**PWF Policy:** Existing conformance evidence remains valid (policy changes don't affect mandatory behavior).

**Conformance:** Existing evidence may need updating if test criteria change.

**PCM Semantic:** Existing evidence may be invalid if semantics change. Re-validation required.

**Stability Graduation:** Existing conformance evidence remains valid (semantics unchanged).

---

## 4. Migration

**Editorial/Clarification:** No migration needed.

**PWF Policy:** No migration needed.

**Conformance:** May need re-testing against new criteria.

**PCM Semantic:** Migration plan required. Previous conformance may not transfer.

**Stability Graduation:** No migration required (semantics unchanged).

---

## 5. Version Numbering

**Major:** Incompatible changes to invariants or primitives (PCM semantic changes).

**Minor:** Compatible additions or clarifications (new PWF behaviors, new conformance tests).

**Patch:** Corrections or editorial changes.

**Stability Graduation:** 0.x → 1.0.0 promotion without semantic change (requires Authority Gate).

---

## 6. Conclusion

The versioning model is:
- Clear in categories
- Appropriate in authority requirements
- Correct in conformance evidence handling
- Includes Stability Graduation for 0.x → 1.0.0 promotion (approved by PCM-GATE-02A)

**FREEZE IMPLICATION:** Versioning model is stable.
