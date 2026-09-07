# Protocol for Canonical Management (PCM)

**Version:** 0.1.0 (Proposed)  
**Status:** Draft  
**Authority:** Pending External Review  

## 1. Purpose

PCM defines the constitutional protocol for managing work in any context. It establishes invariants, primitives, and role semantics that remain valid regardless of the tools, environments, or specific implementations used.

PCM is not a workflow manual. It is the minimal set of rules that ensure work remains coherent, traceable, and authoritative across different execution contexts.

## 2. Scope

PCM applies to any coordinated work that requires:
- Traceable decisions
- Clear authority boundaries
- Recovery from interruptions
- Verification of completion
- Separation of proposed and canonical state

## 3. Non-Scope

PCM does not define:
- Specific tools or technologies
- Workflow steps or procedures
- Implementation details
- Runtime behaviors
- Environment-specific bindings

## 4. Core Primitives

PCM defines four core primitives:

### 4.1 WORKSTREAM
A bounded unit of work with a defined purpose, authority, and completion criteria.

### 4.2 TASK
A specific action or set of actions within a workstream that contributes to the workstream's purpose.

### 4.3 HANDOFF
The transfer of context, authority, and responsibility between execution actors.

### 4.4 GATE
A verification point where proposed state is evaluated against criteria before becoming canonical.

## 5. Role Semantics

PCM defines contextual roles, not permanent positions:

### 5.1 AUTHORITY
The entity with decision-making power over canonical state. Authority cannot be self-assumed.

### 5.2 PROPOSER
The entity that suggests changes to canonical state. Proposals require AUTHORITY approval.

### 5.3 OPERATOR
The entity that executes tasks. Operators work under AUTHORITY delegation.

### 5.4 OBSERVER
The entity that monitors and reports on work state without modification power.

## 6. Invariants

The following invariants are absolute and cannot be violated:

### 6.1 Agent != Authority
An execution actor (agent) cannot assume AUTHORITY over canonical state. AUTHORITY must be explicitly delegated.

### 6.2 Implementation != Approval
Executing a task does not constitute approval of its outcome. AUTHORITY approval is separate from execution.

### 6.3 Proposed State != Canonical State
Proposed changes are not canonical until approved through a GATE. Proposed state is always provisional.

### 6.4 Context != Canonical State
Session context, memory, or working state is not canonical. Canonical state exists only in persistent, authoritative storage.

### 6.5 Protocol != Tooling
PCM rules are independent of specific tools. Tooling changes do not alter protocol semantics.

## 7. State Model

PCM distinguishes between:

### 7.1 Canonical State
The authoritative, persistent representation of project state. Only AUTHORITY can modify canonical state.

### 7.2 Proposed State
Suggested changes to canonical state. Proposed state is always provisional and requires GATE approval.

### 7.3 Execution State
Runtime context of active work. Execution state is temporary and not canonical.

### 7.4 Context State
Session-specific information, memory, or working context. Context state is not canonical.

## 8. HANDOFF Semantics

A HANDOFF must include:
- Current canonical state reference
- Pending proposals (if any)
- Execution context
- Authority delegation (if applicable)
- Evidence of progress
- Next action recommendation

HANDOFFs are reconstructable: another actor should be able to continue work from the HANDOFF alone.

## 9. GATE Semantics

A GATE is a verification point where:
1. Proposed state is evaluated against defined criteria
2. AUTHORITY reviews and decides
3. Approved state becomes canonical
4. Rejected state is documented with rationale

GATEs prevent:
- Self-approval of work
- Silent drift from canonical state
- Unverified changes becoming permanent

## 10. Authority Semantics

### 10.1 Authority Source
Authority derives from explicit delegation, not from execution capability or role assumption.

### 10.2 Authority Boundaries
Authority is bounded by:
- Workstream scope
- Delegation terms
- Expiration (if defined)

### 10.3 Authority Transfer
Authority transfers only through explicit HANDOFF with AUTHORITY delegation.

## 11. Executor/Capability Principle

Execution actors are defined by:
- MODEL: Capabilities and limitations
- TOOLS: Available instruments
- CONTEXT: Working environment
- PERSISTENCE: State retention mechanism
- PERMISSIONS: Authorized actions
- RESOURCE LIMITS: Constraints
- ROLE: Current contextual assignment

This model supports different execution actors without requiring specific implementations.

## 12. Relationship Between Protocol and Implementation

### 12.1 Protocol Independence
PCM rules remain valid regardless of implementation. Changing tools, environments, or actors does not alter PCM semantics.

### 12.2 Implementation Conformance
Implementations demonstrate conformance by adhering to PCM invariants, not by adopting specific implementations.

### 12.3 Adapter Boundary
Project-specific behavior belongs in adapters, not in PCM core. Adapters bind PCM to specific contexts while preserving core semantics.

## 13. Applicability Test

PCM remains valid if work were performed:
- Without GitHub
- Without any specific tool
- Without any specific language
- Without any specific framework

The protocol governs relationships and state management, not implementations.

## 14. Versioning

PCM versions follow semantic versioning:
- Major: Incompatible changes to invariants or primitives
- Minor: Compatible additions or clarifications
- Patch: Corrections or editorial changes

## 15. Authority

This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.