# PCM/PWF Conformance Specification

**Version:** 0.2.0 (Proposed)  
**Status:** Draft — Hardened  
**Authority:** Pending External Review  

## 1. Purpose

This document defines how implementations or adapters demonstrate conformance to PCM and PWF. Conformance is based on observable behavior, not internal claims.

## 2. Conformance Levels

### 2.1 PCM-Core-Conformant
Demonstrates adherence to all PCM invariants and primitives. This is the minimum conformance level.

### 2.2 PWF-Conformant
Demonstrates adherence to PCM-Core plus PWF mandatory behaviors.

### 2.3 Adapter-Conformant
Demonstrates adherence to PWF-Conformant plus adapter-specific behaviors for a particular domain or tool.

## 3. PCM-Core Conformance Criteria

For each criterion, the test describes what must be observable. The counterexample describes behavior that would violate conformance.

### 3.1 Authority Integrity

**Test:** Execution capability does not create canonical decision authority. An actor that executes work does not thereby obtain AUTHORITY over that work's canonical outcome.

**Counterexample:** If an implementation allows an operator to mark their own work as canonical solely because they are the sole actor or because they performed the execution, it does not conform. AUTHORITY must derive from an explicit governance mechanism separate from execution capability.

### 3.2 Implementation-Approval Separation

**Test:** Completing a task does not automatically approve its outcome. AUTHORITY approval is a distinct action from task completion.

**Counterexample:** If task completion automatically triggers canonical state promotion, it does not conform.

### 3.3 Proposed-Canonical Separation

**Test:** Proposed changes are held in provisional state and require GATE approval before becoming canonical.

**Counterexample:** If a proposal becomes canonical without explicit AUTHORITY action through a GATE, it does not conform.

### 3.4 Concurrent Conflict Resolution

**Test:** When conflicting proposals exist for the same canonical state, neither becomes canonical by virtue of being first, last, or implemented. AUTHORITY must explicitly resolve the conflict.

**Counterexample:** If the implementation silently resolves conflicting proposals by picking one (e.g., "last write wins"), it does not conform.

### 3.5 Context-Canonical Separation

**Test:** Session context, memory, or working state cannot override canonical state. Canonical state is the source of truth.

**Counterexample:** If an implementation treats session memory as authoritative when it conflicts with persistent state, it does not conform.

### 3.6 Stale State Detection

**Test:** When an actor's context diverges from canonical state, the divergence is detectable. Stale claims can be invalidated by actual state.

**Counterexample:** If an implementation allows an actor to proceed with stale assumptions that contradict canonical state without any detection mechanism, it does not conform.

### 3.7 Authority Explicitness

**Test:** Authority is explicit, resolvable, and non-ambiguous for the decision/scope being governed. At any point, it is possible to determine who has AUTHORITY for a given scope.

**Counterexample:** If authority is implicitly assumed from role, capability, or proximity to work, it does not conform.

### 3.8 Protocol Independence

**Test:** Core semantics do not require a specific tool, model, repository, or platform. The protocol functions across different implementations.

**Counterexample:** If core semantics break when a specific tool is removed, it does not conform.

### 3.9 Evidence Provenance

**Test:** Evidence provenance is inspectable. It is possible to determine whether evidence is self-reported, independently produced, or automatically observed.

**Counterexample:** If all evidence is treated identically regardless of provenance, or if provenance is not inspectable, it does not conform.

### 3.10 Handoff Reconstruction

**Test:** A HANDOFF contains sufficient information to reconstruct the relevant work context together with the referenced canonical state. The canonical reference is resolvable through the applicable persistence mechanism. Context memory from previous sessions is not required.

**Counterexample:** If a HANDOFF requires memory of previous sessions to be useful, or if the canonical state reference is not resolvable, it does not conform.

## 4. PWF Conformance Criteria

PWF-Conformant implementations must also satisfy:

### 4.1 Task Record

**Test:** Every task is representable as a record containing workstream reference, task purpose, authority delegation scope, success criteria, and evidence requirements.

**Counterexample:** If tasks cannot be represented in a structured form, it does not conform.

### 4.2 Task Lifecycle

**Test:** Tasks follow a lifecycle with at minimum PROPOSED, AUTHORIZED, EXECUTING, COMPLETED, and REJECTED states. State transitions are explicit. Task COMPLETED does not imply GATE approval, canonical-state promotion, or implementation approval.

**Counterexample:** If tasks have no defined lifecycle, state transitions are implicit, or task completion automatically triggers canonical state promotion, it does not conform.

### 4.3 GATE Support

**Test:** GATE verification is supported at appropriate points. The GATE is the only mechanism for proposed-to-canonical promotion.

**Counterexample:** If proposed state can become canonical without GATE verification, it does not conform.

### 4.4 State Traceability

**Test:** At any point, an actor can determine current canonical state, pending proposals, delegated authority, and evidence of progress.

**Counterexample:** If this information is not retrievable, it does not conform.

## 5. Adapter Conformance Criteria

Adapter-Conformant implementations must also satisfy:

### 5.1 Domain Appropriateness

**Test:** The adapter's behaviors are appropriate for its domain. Domain-specific rules are clearly separated from core semantics.

**Counterexample:** If domain-specific rules are embedded in PCM or PWF core, it does not conform.

### 5.2 Core Preservation

**Test:** Adapter-specific behaviors do not violate PCM invariants or PWF mandatory behaviors.

**Counterexample:** If an adapter introduces behavior that violates a PCM invariant, it does not conform.

## 6. Conformance Assessment

### 6.1 Evidence Requirements
- Observable behavior supporting each criterion
- Test results documenting pass/fail
- Exceptions or limitations noted

### 6.2 Conformance Statement
- Declares conformance level (PCM-Core, PWF, or Adapter)
- Lists criteria evaluated
- Notes exceptions or limitations

### 6.3 Limitations
Conformance does not guarantee:
- Correctness of implementation
- Suitability for specific purposes
- Complete coverage of all scenarios
- Future compatibility

## 7. Versioning

Conformance specifications follow PCM versioning:
- Major: Changes to conformance requirements
- Minor: Additions or clarifications
- Patch: Corrections or editorial changes

## 8. Authority

This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.