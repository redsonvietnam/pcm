# Core Minimality Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## 1. WORKSTREAM

**Problem solved:** Bounded unit of work with defined purpose, authority scope, and completion criteria.

**Can another primitive represent it?** No. Without WORKSTREAM, there is no scope boundary. Tasks float without authority context. HANDOFFs have no reference frame. GATEs have no authority scope.

**Does removing it create failure?** Yes. Unbounded work leads to scope creep, authority ambiguity, and inability to determine completion.

**Is it truly first-class?** Yes. It is the container that gives meaning to TASK, HANDOFF, and GATE. It cannot be decomposed into the other three.

**Assessment:** NECESSARY. Retain.

---

## 2. TASK

**Problem solved:** Specific action contributing to workstream purpose.

**Can another primitive represent it?** No. Without TASK, there is no unit of execution. WORKSTREAM is too coarse. HANDOFF is transfer, not work. GATE is approval, not work.

**Does removing it create failure?** Yes. No mechanism to track what needs doing, what is done, or what evidence exists.

**Is it truly first-class?** Yes. It is the atomic unit of execution that WORKSTREAM organizes and GATE approves.

**Assessment:** NECESSARY. Retain.

---

## 3. HANDOFF

**Problem solved:** Context reconstruction across actors and sessions.

**Can another primitive represent it?** No. Without HANDOFF, work is trapped in session memory. New actors cannot continue. Stale context cannot be detected. Session boundaries become opaque.

**Does removing it create failure?** Yes. Every session boundary becomes a potential information loss. The protocol cannot survive actor changes.

**Is it truly first-class?** Yes. It is the only mechanism that makes work reconstructable. It is distinct from TASK (execution) and GATE (approval).

**Assessment:** NECESSARY. Retain.

---

## 4. GATE

**Problem solved:** Verification point where proposed state becomes canonical.

**Can another primitive represent it?** No. Without GATE, there is no mechanism to distinguish proposed from canonical. Authority cannot act. Unreviewed changes become permanent.

**Does removing it create failure?** Yes. The core invariant (Proposed ≠ Canonical) becomes unenforceable. Self-approval becomes possible.

**Is it truly first-class?** Yes. It is the only bridge between proposed and canonical state. It cannot be decomposed.

**Assessment:** NECESSARY. Retain.

---

## 5. Cross-Primitive Analysis

| Primitive | Unique Function | Can Be Replaced? | Can Be Removed? |
|-----------|----------------|------------------|-----------------|
| WORKSTREAM | Scope boundary | No | No |
| TASK | Execution unit | No | No |
| HANDOFF | Context transfer | No | No |
| GATE | Approval bridge | No | No |

**Overlap analysis:** No two primitives serve the same function. No primitive is redundant.

**Composition analysis:** All four are required together:
- WORKSTREAM + TASK = work organization
- HANDOFF = continuity across sessions
- GATE = authority enforcement

Remove any one and a specific failure class becomes possible.

---

## 6. Fifth Primitive Test

**Candidate:** Could a fifth primitive be necessary?

**Test:** Is there a failure class not covered by the four existing primitives?

- Work organization → WORKSTREAM + TASK
- Context transfer → HANDOFF
- Approval → GATE
- Authority → Role semantics (not a primitive)
- Evidence → Attribute of state transitions (not a primitive)
- State → Model category (not a primitive)

**Result:** No failure class requires a fifth primitive.

**Assessment:** FOUR PRIMITIVES ARE SUFFICIENT.

---

## 7. Conclusion

All four primitives are necessary, non-redundant, and non-decomposable. No fifth primitive is required. The framework is minimal with respect to its primitives.

**FREEZE IMPLICATION:** Primitives are stable.
