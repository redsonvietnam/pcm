# Conformance Test Scenarios

**Version:** 0.1.0  
**Status:** Declarative — Not implementation-bound  

## Purpose

These scenarios describe behavior to test for PCM/PWF conformance. They are declarative: they describe WHAT must be observable, not HOW to implement tests.

An implementation may use any technology to verify these scenarios. The scenarios themselves are technology-neutral.

## Scenario Categories

### PCM-Core Scenarios

**PCM-01: Authority Separation**
- Setup: Actor A performs work
- Test: Actor A cannot mark their own work as canonical without a separate AUTHORITY action
- Pass: Canonical state unchanged until AUTHORITY acts
- Fail: Work becomes canonical immediately upon completion

**PCM-02: Implementation-Approval Separation**
- Setup: Task is completed by an operator
- Test: Task completion does not trigger canonical state promotion
- Pass: Canonical state unchanged until GATE approval
- Fail: Task completion automatically promotes to canonical

**PCM-03: Proposed-Canonical Separation**
- Setup: Proposal exists for canonical state change
- Test: Proposal remains provisional until GATE approval
- Pass: Canonical state unchanged until GATE
- Fail: Proposal becomes canonical without GATE

**PCM-04: Concurrent Conflict**
- Setup: Actor A submits Proposal X, Actor B submits conflicting Proposal Y
- Test: Neither X nor Y becomes canonical without explicit AUTHORITY resolution
- Pass: Both proposals remain provisional; AUTHORITY resolves
- Fail: One proposal silently wins (e.g., last-write-wins)

**PCM-05: Context-Canonical Separation**
- Setup: Actor has session context that differs from canonical state
- Test: Session context cannot override canonical state
- Pass: Canonical state remains authoritative
- Fail: Session context treated as truth

**PCM-06: Stale State Detection**
- Setup: Actor's context is stale relative to canonical state
- Test: Divergence is detectable
- Pass: Stale state flagged or detectable
- Fail: Stale state used without detection

**PCM-07: Authority Explicitness**
- Setup: Any state
- Test: It is possible to determine who has AUTHORITY for a given scope
- Pass: Authority is resolvable
- Fail: Authority is ambiguous or implicit

**PCM-08: Protocol Independence**
- Setup: Implementation uses Tool X
- Test: Core semantics function without Tool X
- Pass: Protocol valid across tool changes
- Fail: Protocol breaks when tool changes

**PCM-09: Evidence Provenance**
- Setup: Evidence exists for a decision
- Test: Provenance is inspectable (self-reported, independent, or automatic)
- Pass: Provenance distinguishable
- Fail: All evidence treated identically

**PCM-10: Handoff Reconstruction**
- Setup: HANDOFF exists for work in progress
- Test: Different actor can continue work from HANDOFF alone
- Pass: Work reconstructable from HANDOFF
- Fail: HANDOFF requires session memory

### PWF Scenarios

**PWF-01: Task Record**
- Setup: Task exists
- Test: Task is representable as a record with required fields
- Pass: Structured record exists
- Fail: Task cannot be represented in structured form

**PWF-02: Task Lifecycle**
- Setup: Task progresses through states
- Test: State transitions are explicit and traceable
- Pass: Each transition has a defined trigger
- Fail: State changes are implicit

**PWF-03: GATE Support**
- Setup: Proposed state exists
- Test: GATE verification is the only path to canonical
- Pass: GATE required for promotion
- Fail: Promotion without GATE

**PWF-04: State Traceability**
- Setup: Work in progress
- Test: Actor can determine canonical state, proposals, authority, evidence
- Pass: All information retrievable
- Fail: Information not retrievable

**PWF-05: Single-Actor Validity**
- Setup: Only one actor available
- Test: Protocol functions with single actor
- Pass: All invariants hold with one actor
- Fail: Protocol requires multiple actors

### Adapter Scenarios

**ADP-01: Domain Appropriateness**
- Setup: Adapter for specific domain
- Test: Adapter behaviors appropriate for domain
- Pass: Domain-specific rules separated from core
- Fail: Domain rules embedded in core

**ADP-02: Core Preservation**
- Setup: Adapter active
- Test: Adapter behaviors do not violate PCM invariants
- Pass: Invariants preserved
- Fail: Adapter violates invariant

## Implementation Notes

These scenarios are not automated tests. They are declarative specifications of behavior to verify.

An implementation may:
- Create automated tests based on these scenarios
- Perform manual verification
- Use any testing methodology

The key requirement is that each scenario's pass/fail criteria are observable and verifiable.