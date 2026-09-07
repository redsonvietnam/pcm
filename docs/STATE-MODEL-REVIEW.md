# State Model Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## 1. State Categories

### 1.1 Canonical State

**Definition:** Authoritative, persistent representation of project state.

**Who may cause change:** AUTHORITY through GATE approval.

**Evidence required:** GATE record with AUTHORITY decision.

**Trigger:** GATE approval action.

**Can it happen implicitly?** No. Canonical state changes only through explicit AUTHORITY action.

**Can stale context cause it?** No. Context state is never canonical (7.4).

**Can concurrent proposals conflict?** Yes, but resolution requires explicit AUTHORITY action (7.6).

**Can completed task change canonical without GATE?** No. Task COMPLETED ≠ approval (7.2).

### 1.2 Proposed State

**Definition:** Suggested changes to canonical state. Always provisional.

**Who may cause change:** PROPOSER role.

**Evidence required:** Proposal record with purpose and scope.

**Trigger:** PROPOSER action.

**Can it happen implicitly?** No. Proposals require explicit action.

**Can stale context cause it?** No. Context is not canonical (7.4).

**Can concurrent proposals conflict?** Yes. Multiple conflicting proposals may exist simultaneously.

**Can completed task change canonical without GATE?** No. Proposed state remains proposed until GATE.

### 1.3 Execution State

**Definition:** Runtime context of active work. Temporary.

**Who may cause change:** OPERATOR role.

**Evidence required:** Task execution evidence.

**Trigger:** Task execution start.

**Can it happen implicitly?** No. Execution requires explicit task assignment.

**Can stale context cause it?** Possibly — stale assumptions during execution. But execution state is not canonical.

**Can concurrent proposals conflict?** No — execution state is not canonical.

**Can completed task change canonical without GATE?** No. Execution state is discarded after completion.

### 1.4 Context State

**Definition:** Session-specific information, memory, or working context.

**Who may cause change:** Any actor during session.

**Evidence required:** None — context is session-local.

**Trigger:** Session activity.

**Can it happen implicitly?** Yes — context accumulates during session.

**Can stale context cause it?** Yes — this is the core risk context represents.

**Can concurrent proposals conflict?** No — context is not canonical.

**Can completed task change canonical without GATE?** No. Context is never canonical.

---

## 2. State-Transition Matrix

| From → To | Trigger | Who | Evidence | Implicit? | Stale Risk? | Conflict Risk? |
|-----------|---------|-----|----------|-----------|-------------|----------------|
| Canonical → Proposed | New proposal | PROPOSER | Proposal record | No | No | Yes |
| Proposed → Canonical | GATE approval | AUTHORITY | GATE record | No | No | No |
| Proposed → Rejected | GATE rejection | AUTHORITY | GATE record | No | No | No |
| Proposed → Stale | Canonical changed | System | Diff evidence | Yes | Yes | No |
| Execution → Completed | Task done | OPERATOR | Task evidence | No | No | No |
| Execution → Blocked | External factor | System | Block evidence | Yes | Yes | No |
| Context → Stale | Time/session end | System | Timestamp | Yes | Yes | No |
| Any → Handoff | Actor transfer | Any | HANDOFF record | No | No | No |

---

## 3. Critical Transitions

### 3.1 Proposed → Canonical (GATE)

**Only path:** GATE with AUTHORITY approval.

**Cannot be bypassed by:**
- Time passing
- Task completion
- Actor effort
- Implementation quality
- Number of reviews

**This is the most important transition in the protocol.**

### 3.2 Canonical → Proposed

**Trigger:** New proposal to modify current canonical state.

**Important:** This creates a new proposed state. The canonical state remains until GATE approves the proposal.

### 3.3 Context → Stale

**Trigger:** Canonical state changes while context remains unchanged.

**Detection:** Actor compares context with canonical state.

**Resolution:** Re-read canonical state, update context.

---

## 4. Illegal Transitions

| Transition | Why Illegal |
|-----------|-------------|
| Context → Canonical | Context is never canonical (7.4) |
| Execution → Canonical | Execution ≠ approval (7.2) |
| Proposed → Canonical (no GATE) | Only GATE promotes (7.3) |
| Any → Canonical (self-approval) | Agent ≠ authority (7.1) |

---

## 5. State Completeness

**Question:** Are four states sufficient?

**Analysis:**
- Canonical: Covers authoritative state
- Proposed: Covers under-review state
- Execution: Covers active work
- Context: Covers session-specific information

**Missing states?**
- BLOCKED: Permitted as additional state (PWF 4.2), not required as core
- REJECTED: Covered by proposed state lifecycle (PWF 4.2)
- SUSPENDED: Permitted as additional state, not required as core

**Result:** Four core states are sufficient. Additional states are policy.

---

## 6. State Ambiguity

**Question:** Can a state be interpreted multiple ways?

**Analysis:**
- Canonical: Unambiguous — authoritative persistent state
- Proposed: Unambiguous — under review, not yet canonical
- Execution: Unambiguous — active work, temporary
- Context: Unambiguous — session-specific, not canonical

**Result:** No ambiguity in state definitions.

---

## 7. Conclusion

The state model is:
- Complete (covers all necessary states)
- Non-contradictory
- Free of illegal transitions
- Sufficient with four core states
- Clear in definitions

**FREEZE IMPLICATION:** State model is stable.
