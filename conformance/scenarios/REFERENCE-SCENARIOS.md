# Reference Scenario Suite

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Compact but comprehensive scenario catalog for PCM/PWF conformance testing. Each scenario identifies initial state, actors, roles, proposal, expected transition, expected canonical result, evidence, Gate condition, and failure condition.

## Scenario 1: Happy-Path Task

**Initial State:** Canonical state C0 exists
**Actors:** Actor A (PROPOSER + OPERATOR), Authority X
**Roles:** A proposes and executes, X approves
**Proposal:** P1 changes C0 to C1
**Expected Transition:** PROPOSED → AUTHORIZED → EXECUTING → COMPLETED → GATE → CANONICAL
**Expected Canonical Result:** C1 becomes canonical
**Evidence:** Task record, execution evidence, Gate decision
**Gate Condition:** P1 meets success criteria
**Failure Condition:** P1 does not meet success criteria

---

## Scenario 2: Rejected Proposal

**Initial State:** Canonical state C0 exists
**Actors:** Actor A (PROPOSER), Authority X
**Roles:** A proposes, X rejects
**Proposal:** P1 changes C0 to C1
**Expected Transition:** PROPOSED → GATE → REJECTED
**Expected Canonical Result:** C0 remains canonical
**Evidence:** Task record, Gate decision with rationale
**Gate Condition:** P1 evaluated against criteria
**Failure Condition:** P1 fails evaluation

---

## Scenario 3: Stale Handoff

**Initial State:** Canonical state C0, Handoff H references C0
**Actors:** Actor A (creates H), Actor B (receives H)
**Roles:** A hands off to B
**Proposal:** None
**Expected Transition:** Canonical state changes to C1 after H created
**Expected Canonical Result:** C1 is canonical, H is stale
**Evidence:** Handoff H, canonical state change record
**Gate Condition:** N/A
**Failure Condition:** Stale handoff not detected

---

## Scenario 4: Concurrent Conflict

**Initial State:** Canonical state C0
**Actors:** Actor A, Actor B, Authority X
**Roles:** A and B propose conflicting changes
**Proposal:** P1 (A) and P2 (B) conflict
**Expected Transition:** Both PROPOSED, neither becomes canonical
**Expected Canonical Result:** C0 remains canonical until X resolves
**Evidence:** Both proposals, conflict detection
**Gate Condition:** X must explicitly resolve
**Failure Condition:** One proposal silently wins

---

## Scenario 5: Authority Ambiguity

**Initial State:** Canonical state C0
**Actors:** Actor A, Actor B (conflicting authority claims)
**Roles:** Both claim authority for same scope
**Proposal:** P1 by A
**Expected Transition:** Canonicalization blocked
**Expected Canonical Result:** C0 remains canonical
**Evidence:** Authority claims, ambiguity detection
**Gate Condition:** Authority must be resolved first
**Failure Condition:** Canonicalization proceeds despite ambiguity

---

## Scenario 6: Authority Delay

**Initial State:** Canonical state C0
**Actors:** Actor A (PROPOSER), Authority X (delayed)
**Roles:** A proposes, X is slow to respond
**Proposal:** P1
**Expected Transition:** P1 remains PROPOSED during delay
**Expected Canonical Result:** C0 remains canonical
**Evidence:** Proposal timestamp, delay duration
**Gate Condition:** X must explicitly approve
**Failure Condition:** Delay implies approval

---

## Scenario 7: Single Actor

**Initial State:** Canonical state C0
**Actors:** Actor A (sole actor)
**Roles:** A holds PROPOSER + OPERATOR, authority from governance mechanism
**Proposal:** P1
**Expected Transition:** PROPOSED → AUTHORIZED → EXECUTING → COMPLETED → GATE → CANONICAL
**Expected Canonical Result:** C1 becomes canonical
**Evidence:** Governance mechanism, task record, Gate decision
**Gate Condition:** P1 meets criteria, authority from governance
**Failure Condition:** Sole actor gains authority automatically

---

## Scenario 8: Multi-Actor Handoff

**Initial State:** Canonical state C0
**Actors:** Actor A (starts work), Actor B (continues)
**Roles:** A PROPOSER + OPERATOR, B OPERATOR
**Proposal:** P1
**Expected Transition:** A creates Handoff H, B uses H to continue
**Expected Canonical Result:** C1 becomes canonical after B completes
**Evidence:** Handoff H, B's execution evidence, Gate decision
**Gate Condition:** P1 meets criteria
**Failure Condition:** B cannot reconstruct from H

---

## Scenario 9: Task Completed Before Gate

**Initial State:** Canonical state C0
**Actors:** Actor A (PROPOSER + OPERATOR), Authority X
**Roles:** A proposes and executes
**Proposal:** P1
**Expected Transition:** Task COMPLETED, P1 remains PROPOSED
**Expected Canonical Result:** C0 remains canonical
**Evidence:** Task completion record, proposal status
**Gate Condition:** P1 still requires Gate
**Failure Condition:** Task completion implies approval

---

## Scenario 10: Task Requiring No Gate

**Initial State:** Canonical state C0
**Actors:** Actor A (OPERATOR)
**Roles:** A executes task that does not change canonical state
**Proposal:** None
**Expected Transition:** PROPOSED → AUTHORIZED → EXECUTING → COMPLETED
**Expected Canonical Result:** C0 unchanged (task did not change canonical state)
**Evidence:** Task record
**Gate Condition:** No Gate required
**Failure Condition:** Unnecessary Gate imposed

---

## Scenario 11: Escalation Without Authority Transfer

**Initial State:** Canonical state C0
**Actors:** Actor A (encounters authority boundary), Authority X (higher scope)
**Roles:** A escalates, X has authority
**Proposal:** P1 requires higher authority
**Expected Transition:** A escalates, X decides
**Expected Canonical Result:** C0 or C1 depending on X's decision
**Evidence:** Escalation record, X's decision
**Gate Condition:** X must explicitly decide
**Failure Condition:** Escalation transfers authority

---

## Scenario 12: Explicit Authority Transfer

**Initial State:** Authority X holds authority for scope S
**Actors:** Authority X, Actor Y (receives authority)
**Roles:** X transfers to Y
**Proposal:** None
**Expected Transition:** X delegates to Y via explicit mechanism
**Expected Canonical Result:** Y holds authority for S
**Evidence:** Delegation record, governance mechanism
**Gate Condition:** Delegation follows governance
**Failure Condition:** Authority transferred without governance

---

## Scenario 13: Self-Reported Evidence

**Initial State:** Actor A performs work
**Actors:** Actor A
**Roles:** A is OPERATOR
**Proposal:** None
**Expected Transition:** A produces evidence E
**Expected Canonical Result:** E is classified as self-reported
**Evidence:** E with provenance标记
**Gate Condition:** N/A
**Failure Condition:** E provenance not inspectable

---

## Scenario 14: Independently Produced Evidence

**Initial State:** Actor B observes Actor A's work
**Actors:** Actor A (worker), Actor B (observer)
**Roles:** A OPERATOR, B OBSERVER
**Proposal:** None
**Expected Transition:** B produces evidence E about A's work
**Expected Canonical Result:** E is classified as independently produced
**Evidence:** E with provenance标记
**Gate Condition:** N/A
**Failure Condition:** E provenance not distinguishable

---

## Scenario 15: Automatically Observed Evidence

**Initial State:** Automated system monitors work
**Actors:** Automated system
**Roles:** System is OBSERVER
**Proposal:** None
**Expected Transition:** System produces evidence E
**Expected Canonical Result:** E is classified as automatically observed
**Evidence:** E with provenance标记
**Gate Condition:** N/A
**Failure Condition:** E provenance not distinguishable

---

## Scenario 16: Context/Canonical Conflict

**Initial State:** Canonical state C0, Actor A has context C1 (stale)
**Actors:** Actor A
**Roles:** A is OPERATOR
**Proposal:** None
**Expected Transition:** A's context C1 conflicts with C0
**Expected Canonical Result:** C0 remains canonical, C1 flagged as stale
**Evidence:** Context state, canonical state, divergence detection
**Gate Condition:** N/A
**Failure Condition:** Stale context overrides canonical