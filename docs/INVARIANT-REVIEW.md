# Invariant Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## 7.1 Agent ≠ Authority

**Protected property:** Execution capability cannot create canonical decision authority.

**Failure prevented:** An actor that writes code cannot thereby approve that code as canonical.

**Observable conformance test:** An operator who completes a task cannot promote proposed state to canonical without explicit authority delegation.

**Edge cases:**
- Single actor: Authority must derive from governance, not from being sole actor
- AI agent: Execution by AI does not create authority
- Emergency: Even urgent work requires authority source

**Ambiguity:** None. The rule is clear: execution ≠ authority.

**Interactions:** Supports 7.2 (Implementation ≠ Approval) and 7.3 (Proposed ≠ Canonical).

**Assessment:** CLEAN. No overlap, no contradiction.

---

## 7.2 Implementation ≠ Approval

**Protected property:** Completed work is not thereby approved work.

**Failure prevented:** A task marked COMPLETED does not automatically become canonical.

**Observable conformance test:** Task COMPLETED does not trigger canonical state change without GATE.

**Edge cases:**
- Task COMPLETED + no GATE: Proposed state remains proposed
- Task COMPLETED + GATE approved: Proposed state becomes canonical
- Task COMPLETED + GATE rejected: Proposed state remains proposed

**Ambiguity:** None. The distinction between task completion and approval is explicit.

**Interactions:** Supports 7.1 (Agent ≠ Authority) and 7.3 (Proposed ≠ Canonical).

**Assessment:** CLEAN. No overlap, no contradiction.

---

## 7.3 Proposed State ≠ Canonical State

**Protected property:** Unreviewed changes never become permanent.

**Failure prevented:** Drafts, experiments, or partial work becoming authoritative.

**Observable conformance test:** Proposed state requires GATE approval to become canonical. No amount of time, effort, or implementation converts it automatically.

**Edge cases:**
- Multiple conflicting proposals: Both remain proposed until GATE selects
- Stale proposals: Remain proposed, do not auto-promote
- Authority delay: Delay does not imply approval

**Ambiguity:** None. The distinction is fundamental to the protocol.

**Interactions:** Supports 7.2 (Implementation ≠ Approval) and 7.6 (Concurrent Conflict ≠ Silent Resolution).

**Assessment:** CLEAN. No overlap, no contradiction.

---

## 7.4 Context ≠ Canonical State

**Protected property:** Session-specific information never overrides persistent truth.

**Failure prevented:** Working memory, cached assumptions, or stale context becoming authoritative.

**Observable conformance test:** Context state (session memory, working assumptions) is never treated as canonical. Canonical state exists only in persistent storage.

**Edge cases:**
- Session restart: Context is lost, canonical state persists
- Actor change: New actor uses HANDOFF + canonical state, not previous context
- Context drift: Stale context cannot silently override canonical

**Ambiguity:** Minimal. The distinction between context and canonical is clear.

**Interactions:** Supports 7.3 (Proposed ≠ Canonical) and HANDOFF semantics.

**Assessment:** CLEAN. No overlap, no contradiction.

---

## 7.5 Protocol ≠ Tooling

**Protected property:** Tool changes do not alter protocol semantics.

**Failure prevented:** Switching from Git to Mercurial, or from OpenCode to Claude, changing what PCM requires.

**Observable conformance test:** PCM rules remain valid regardless of which tools are used.

**Edge cases:**
- Tool failure: Protocol continues to define requirements
- Tool upgrade: Protocol semantics unchanged
- Tool replacement: Protocol semantics unchanged

**Ambiguity:** None. The separation is explicit.

**Interactions:** Supports the overall design goal of protocol independence.

**Assessment:** CLEAN. No overlap, no contradiction.

---

## 7.6 Concurrent Conflict ≠ Silent Resolution

**Protected property:** Conflicting proposals cannot resolve through timing or preference.

**Failure prevented:** Two actors propose changes, one gets merged first, conflict is ignored.

**Observable conformance test:** When conflicting proposals exist, AUTHORITY must explicitly resolve. Neither proposal becomes canonical by being first, last, or implemented.

**Edge cases:**
- Authority latency: Delay does not imply approval
- Unresolved conflicts: Remain unresolved until explicitly resolved
- Merge conflicts: Git detects, AUTHORITY resolves

**Ambiguity:** None. The rule is explicit about what cannot happen.

**Interactions:** Supports 7.3 (Proposed ≠ Canonical) and GATE semantics.

**Assessment:** CLEAN. No overlap, no contradiction.

---

## 8. Overlap Analysis

| Invariant A | Invariant B | Overlap? |
|-------------|-------------|----------|
| 7.1 Agent ≠ Authority | 7.2 Implementation ≠ Approval | No — different properties |
| 7.1 Agent ≠ Authority | 7.3 Proposed ≠ Canonical | No — different properties |
| 7.2 Implementation ≠ Approval | 7.3 Proposed ≠ Canonical | No — different properties |
| 7.3 Proposed ≠ Canonical | 7.4 Context ≠ Canonical | No — different properties |
| 7.5 Protocol ≠ Tooling | All others | No — orthogonal dimension |
| 7.6 Concurrent Conflict | 7.3 Proposed ≠ Canonical | No — 7.6 is about conflict resolution, 7.3 is about state distinction |

**Result:** No overlapping invariants. Each protects a distinct property.

---

## 9. Hidden Assumptions

**Assumed:** Authority is explicitly delegated.
**Status:** Explicitly stated in 7.1 and 11.1.

**Assumed:** Canonical state exists in persistent storage.
**Status:** Explicitly stated in 8.1 and 7.4.

**Assumed:** GATE is the only mechanism for state promotion.
**Status:** Explicitly stated in 4.4 and 8.

**Result:** No hidden assumptions. All assumptions are explicit.

---

## 10. Rules That Are Really Policy

**Candidate:** Are any invariants actually policy recommendations?

**Test:** Does removing any invariant create a specific failure class?

- 7.1: Remove → execution creates authority (failure)
- 7.2: Remove → completed work auto-approves (failure)
- 7.3: Remove → proposed auto-promotes (failure)
- 7.4: Remove → context overrides canonical (failure)
- 7.5: Remove → tool changes alter protocol (failure)
- 7.6: Remove → conflicts resolve silently (failure)

**Result:** All invariants prevent specific failures. None are policy.

---

## 11. Conclusion

All six invariants are:
- Non-overlapping
- Non-contradictory
- Free of hidden assumptions
- Genuinely invariant (not policy)
- Each preventing a specific failure class

**FREEZE IMPLICATION:** Invariants are stable.
