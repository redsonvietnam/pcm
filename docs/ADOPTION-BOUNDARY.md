# Adoption Boundary

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## Purpose

This document defines what must remain stable so that adapters can later be created without changing PCM/PWF semantics.

---

## What Must Remain Stable

### PCM Primitives

- WORKSTREAM: Bounded unit of work with purpose, authority scope, completion criteria
- TASK: Specific action contributing to workstream purpose
- HANDOFF: Transfer of context, authority, responsibility between actors
- GATE: Verification point where proposed state becomes canonical

### PCM Invariants

- 7.1 Agent ≠ Authority
- 7.2 Implementation ≠ Approval
- 7.3 Proposed State ≠ Canonical State
- 7.4 Context ≠ Canonical State
- 7.5 Protocol ≠ Tooling
- 7.6 Concurrent Conflict ≠ Silent Resolution

### PCM State Model

- Canonical State: Authoritative persistent state
- Proposed State: Provisional changes under review
- Execution State: Temporary runtime context
- Context State: Session-specific information

### PCM Role Semantics

- AUTHORITY: Decision-making power over canonical state
- PROPOSER: Suggests changes to canonical state
- OPERATOR: Executes tasks
- OBSERVER: Monitors without modification power

### PWF Mandatory Behaviors

- Task Record: Minimal unit of work tracking
- Task Lifecycle: PROPOSED → AUTHORIZED → EXECUTING → COMPLETED/REJECTED
- Handoff: Conforms to PCM HANDOFF semantics
- GATE Support: Conforms to PCM GATE semantics
- State Traceability: Information must be retrievable

---

## What Adapters May Define

- Specific persistence mechanisms
- Specific task formats and structures
- Specific verification methods
- Specific communication channels
- Specific routing mechanisms
- Specific observation structures
- Specific recovery mechanisms
- Domain-specific behaviors
- Tool-specific bindings
- Project-specific workflows

---

## Contract Between PCM/PWF and Future Adapters

**PCM/PWF guarantees:**
- Core semantics will not change without Authority Gate
- Primitives will not be removed or redefined
- Invariants will not be weakened
- State model will not be altered
- Role semantics will not be redefined

**Adapters guarantee:**
- Core semantics are preserved
- No project-specific behavior leaks into PCM/PWF core
- Conformance is demonstrable
- Evidence is collectable

---

## What This Document Does NOT Contain

- Bamso-specific rules
- Next.js-specific rules
- GitHub-specific rules
- OpenCode-specific semantics
- Project-specific commands
- Domain-specific procedures
- Tool-specific bindings

---

## Conclusion

The adoption boundary is:
- Clear in what must remain stable
- Clear in what adapters may define
- Free of project-specific content
- Appropriate for future adapter creation

**FREEZE IMPLICATION:** Adoption boundary is defined.
