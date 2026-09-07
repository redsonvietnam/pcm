# PWF Final Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## Mandatory Behaviors

### 4.1 Task Record

**Classification:** MANDATORY

**Required for conformance:** Yes.

**Failure if removed:** No mechanism to track what work exists. Tasks become invisible. No evidence of what was done.

**Challenge:** Could this be optional for simple projects?

**Defense:** Even a single task needs a record for reconstruction. Without it, HANDOFF cannot reference what was done.

**Assessment:** GENUINELY MANDATORY. Retain.

### 4.2 Task Lifecycle

**Classification:** MANDATORY

**Required for conformance:** Yes.

**Failure if removed:** No distinction between proposed, executing, and completed work. State transitions become ambiguous.

**Challenge:** Is the 5-state lifecycle too prescriptive?

**Defense:** The five states (PROPOSED, AUTHORIZED, EXECUTING, COMPLETED, REJECTED) are minimal. Additional states are permitted but not required.

**Assessment:** GENUINELY MANDATORY. The lifecycle is minimal. Retain.

### 4.3 Handoff

**Classification:** MANDATORY

**Required for conformance:** Yes.

**Failure if removed:** Work cannot survive session or actor boundaries. The protocol becomes session-dependent.

**Challenge:** Is this a PCM primitive rather than PWF behavior?

**Defense:** PWF requires HANDOFF to conform to PCM semantics. This is not redundant — it ensures PWF implementations implement HANDOFF correctly.

**Assessment:** GENUINELY MANDATORY. Retain.

### 4.4 GATE Support

**Classification:** MANDATORY

**Required for conformance:** Yes.

**Failure if removed:** No mechanism for proposed state to become canonical. The core invariant (Proposed ≠ Canonical) becomes unenforceable.

**Challenge:** Is this a PCM primitive rather than PWF behavior?

**Defense:** PWF requires GATE to conform to PCM semantics. This ensures PWF implementations implement GATE correctly.

**Assessment:** GENUINELY MANDATORY. Retain.

### 4.5 State Traceability

**Classification:** MANDATORY

**Required for conformance:** Yes.

**Failure if removed:** Actors cannot determine current state. Decisions are made without information. Drift becomes undetectable.

**Challenge:** Is this too vague?

**Defense:** The requirement is that information be retrievable, not that a specific implementation exist. This is appropriately abstract.

**Assessment:** GENUINELY MANDATORY. Retain.

---

## Recommended Behaviors

### 6.1 Checkpoints

**Classification:** RECOMMENDED

**Failure if removed:** Continuity is harder to maintain. But work can still be reconstructed from HANDOFF + canonical state.

**Challenge:** Should this be mandatory?

**Defense:** Checkpoints are useful but not essential. HANDOFF provides the core continuity mechanism. Checkpoints are an optimization.

**Assessment:** APPROPRIATELY RECOMMENDED. Retain as recommended.

### 6.2 Next Action Determination

**Classification:** RECOMMENDED

**Failure if removed:** Actors may not know what to do next. But they can determine it from current state.

**Challenge:** Should this be mandatory?

**Defense:** Next action is a decision, not a protocol requirement. The protocol provides the information; the actor decides.

**Assessment:** APPROPRIATELY RECOMMENDED. Retain as recommended.

### 6.3 Observation Principle

**Classification:** RECOMMENDED

**Failure if removed:** Actors may act without sufficient observation. But the protocol does not require a specific observation structure.

**Challenge:** Should this be mandatory?

**Defense:** The principle is important but the implementation is adapter-specific. Making it mandatory would require specifying observation mechanisms.

**Assessment:** APPROPRIATELY RECOMMENDED. Retain as recommended.

### 6.4 Evidence Collection

**Classification:** RECOMMENDED

**Failure if removed:** Evidence may not support decisions. But the protocol requires evidence for GATE decisions (PCM 12).

**Challenge:** Should this be mandatory?

**Defense:** Evidence collection is important but the specific mechanisms are adapter-specific. Making it mandatory would require specifying collection methods.

**Assessment:** APPROPRIATELY RECOMMENDED. Retain as recommended.

---

## Optional Behaviors

### 7.1 Routing

**Classification:** OPTIONAL

**Failure if removed:** Actor selection is manual. But the protocol works with manual routing.

**Challenge:** Should routing be mandatory?

**Defense:** Routing is implementation-specific. The protocol works with one actor, static routing, or dynamic routing.

**Assessment:** APPROPRIATELY OPTIONAL. Retain as optional.

### 7.2 Verification Selection

**Classification:** OPTIONAL

**Failure if removed:** Verification methods are not specified. But the protocol requires GATE verification (PCM 10).

**Challenge:** Should verification selection be mandatory?

**Defense:** The protocol requires verification; the selection mechanism is adapter-specific.

**Assessment:** APPROPRIATELY OPTIONAL. Retain as optional.

### 7.3 Recovery

**Classification:** OPTIONAL

**Failure if removed:** No defined recovery mechanism. But HANDOFF provides the core recovery capability.

**Challenge:** Should recovery be mandatory?

**Defense:** Recovery mechanisms are adapter-specific. HANDOFF is the core recovery tool.

**Assessment:** APPROPRIATELY OPTIONAL. Retain as optional.

### 7.4 Observation Structure

**Classification:** OPTIONAL

**Failure if removed:** No defined observation lifecycle. But the observation principle (6.3) provides guidance.

**Challenge:** Should observation structure be mandatory?

**Defense:** Observation structure is adapter-specific. The principle is recommended; the structure is optional.

**Assessment:** APPROPRIATELY OPTIONAL. Retain as optional.

---

## Other PWF Behaviors

### 8. Drift/Reconciliation

**Classification:** SEMANTIC REQUIREMENT (not behavior)

**Failure if removed:** Stale claims cannot be invalidated. Drift becomes undetectable.

**Challenge:** Is this a behavior or a semantic property?

**Defense:** Drift is a property of state relationship, not a behavior. The semantic requirement is that stale claims can be invalidated.

**Assessment:** CORRECTLY CLASSIFIED. Retain as semantic requirement.

### 9. Stop Conditions

**Classification:** MANDATORY (implicit)

**Failure if removed:** Work continues when it should stop. Authority violations, ethical breaches, and resource exhaustion are not handled.

**Challenge:** Should this be explicitly mandatory?

**Defense:** Stop conditions are derived from authority semantics and ethical requirements. They are implicit in the protocol.

**Assessment:** CORRECTLY CLASSIFIED. Retain as implicit mandatory.

### 10. Escalation

**Classification:** SEMANTIC REQUIREMENT (not behavior)

**Failure if removed:** Authority boundaries cannot be surfaced. Conflicts remain hidden.

**Challenge:** Is this a behavior or a semantic property?

**Defense:** Escalation is the act of surfacing a decision beyond current authority boundary. It is a semantic requirement, not a behavior.

**Assessment:** CORRECTLY CLASSIFIED. Retain as semantic requirement.

### 11. Single-Actor Validity

**Classification:** DESIGN PRINCIPLE

**Failure if removed:** Protocol requires multiple actors to be meaningful. Single-actor use becomes invalid.

**Challenge:** Should this be explicit?

**Defense:** Single-actor validity is explicitly stated. It is a design principle, not a behavior.

**Assessment:** CORRECTLY CLASSIFIED. Retain as design principle.

---

## Classification Summary

| Behavior | Classification | Status |
|----------|---------------|--------|
| Task Record | MANDATORY | Retain |
| Task Lifecycle | MANDATORY | Retain |
| Handoff | MANDATORY | Retain |
| GATE Support | MANDATORY | Retain |
| State Traceability | MANDATORY | Retain |
| Checkpoints | RECOMMENDED | Retain |
| Next Action | RECOMMENDED | Retain |
| Observation Principle | RECOMMENDED | Retain |
| Evidence Collection | RECOMMENDED | Retain |
| Routing | OPTIONAL | Retain |
| Verification Selection | OPTIONAL | Retain |
| Recovery | OPTIONAL | Retain |
| Observation Structure | OPTIONAL | Retain |
| Drift/Reconciliation | SEMANTIC | Retain |
| Stop Conditions | MANDATORY (implicit) | Retain |
| Escalation | SEMANTIC | Retain |
| Single-Actor | DESIGN PRINCIPLE | Retain |

---

## Conclusion

PWF behaviors are:
- Correctly classified (mandatory/recommended/optional)
- Genuinely necessary where classified mandatory
- Appropriately flexible where classified optional
- Free of unnecessary complexity

**FREEZE IMPLICATION:** PWF behaviors are stable.
