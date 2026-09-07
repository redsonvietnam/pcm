# PCM/PWF Conformance Specification

**Version:** 0.1.0 (Proposed)  
**Status:** Draft  
**Authority:** Pending External Review  

## 1. Purpose

This document defines how implementations or adapters demonstrate conformance to PCM and PWF. Conformance is based on observable behavior, not internal claims.

## 2. Scope

Conformance applies to:
- Software tools implementing PCM/PWF
- Adapters binding PCM/PWF to specific environments
- Workflows following PCM/PWF principles
- Documentation describing PCM/PWF usage

## 3. Conformance Levels

### 3.1 PCM Core Conformance
Demonstrates adherence to PCM invariants and primitives.

### 3.2 PWF Mandatory Conformance
Demonstrates adherence to PWF mandatory behaviors.

### 3.3 PWF Extended Conformance
Demonstrates adherence to PWF recommended behaviors.

## 4. Observable Conformance Criteria

### 4.1 Authority Integrity

**Criterion:** Implementation cannot self-approve.

**Observable Test:**
- Implementation never marks its own work as canonical without external AUTHORITY approval
- Implementation provides mechanism for AUTHORITY delegation
- Implementation distinguishes between PROPOSER and AUTHORITY roles

**Evidence Required:**
- Authorization logs showing external approval
- Role separation in access controls
- Self-approval prevention mechanisms

### 4.2 State Management

**Criterion:** Proposed state requires GATE before becoming canonical.

**Observable Test:**
- Proposed changes are held in provisional state
- GATE verification occurs before canonical promotion
- Rejected proposals are documented with rationale

**Evidence Required:**
- State transition logs
- GATE decision records
- Proposal rejection documentation

### 4.3 Context Reconstruction

**Criterion:** Handoff supports context reconstruction.

**Observable Test:**
- Another actor can continue work from HANDOFF alone
- HANDOFF includes all necessary context elements
- Context is reconstructable without memory of previous sessions

**Evidence Required:**
- HANDOFF completeness checks
- Work continuation from HANDOFFs
- Context reconstruction tests

### 4.4 Stale State Detection

**Criterion:** Stale claims can be invalidated by actual state.

**Observable Test:**
- Implementation detects when context diverges from canonical
- Stale assumptions are flagged
- Reconciliation mechanisms exist

**Evidence Required:**
- Drift detection logs
- Stale claim invalidation records
- Reconciliation process documentation

### 4.5 Observation Independence

**Criterion:** Observations do not automatically become authorized work.

**Observable Test:**
- Observations are recorded separately from authorization
- Observations require evaluation before action
- Authorization is explicit, not implicit

**Evidence Required:**
- Observation lifecycle logs
- Authorization decision records
- Separation of observation and action

### 4.6 Capability Routing

**Criterion:** Routing can change when capability requirements change.

**Observable Test:**
- Routing decisions consider capability requirements
- Capability mismatches trigger re-routing
- Routing changes are documented

**Evidence Required:**
- Routing decision logs
- Capability requirement documentation
- Re-routing records

### 4.7 Tool Independence

**Criterion:** Core semantics do not depend on a specific tool/model/repo.

**Observable Test:**
- Implementation works across different tools
- Core semantics remain valid without specific dependencies
- Tool changes do not alter protocol behavior

**Evidence Required:**
- Cross-tool testing results
- Dependency analysis
- Protocol behavior consistency

### 4.8 Adapter Isolation

**Criterion:** Adapter-specific behavior stays outside core semantics.

**Observable Test:**
- Core semantics are separable from adapter behavior
- Adapter changes do not affect core invariants
- Adapter-specific features are clearly marked

**Evidence Required:**
- Core/adapter separation analysis
- Adapter behavior documentation
- Core invariant preservation tests

## 5. Conformance Assessment Process

### 5.1 Evidence Collection
- Gather observable behavior evidence
- Document test results
- Record implementation specifics

### 5.2 Criteria Evaluation
- Assess each conformance criterion
- Identify gaps or failures
- Document exceptions

### 5.3 Conformance Statement
- Declare conformance level
- List applicable criteria
- Note any exceptions or limitations

## 6. Conformance Limitations

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