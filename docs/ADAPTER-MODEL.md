# Adapter Model V1

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Define the capability contract for adapters: what semantic capabilities an adapter must provide to bind PCM/PWF to a specific context.

## Capability Contract

### 1. Canonical-State Observation

**Required Semantic Capability:**
- Observe current canonical state
- Determine what is "actually true"

**Optional Implementation Feature:**
- Specific state format
- Specific observation mechanism
- Real-time vs batch observation

---

### 2. Proposed-State Observation

**Required Semantic Capability:**
- Observe proposed state
- Determine what changes are pending

**Optional Implementation Feature:**
- Specific proposal format
- Specific observation mechanism
- Proposal metadata

---

### 3. Persistence

**Required Semantic Capability:**
- Store canonical state
- Store proposed state
- Persist across sessions

**Optional Implementation Feature:**
- Specific storage technology
- Specific serialization format
- Specific persistence mechanism

---

### 4. Task Representation

**Required Semantic Capability:**
- Represent tasks with required semantics
- Track task lifecycle

**Optional Implementation Feature:**
- Specific task format
- Specific lifecycle states
- Specific task metadata

---

### 5. Execution

**Required Semantic Capability:**
- Execute tasks
- Track execution state

**Optional Implementation Feature:**
- Specific execution mechanism
- Specific runtime
- Specific execution environment

---

### 6. Verification

**Required Semantic Capability:**
- Implement GATE verification
- Evaluate proposals against criteria
- Record GATE decisions

**Optional Implementation Feature:**
- Specific verification method
- Specific criteria format
- Specific decision recording

---

### 7. Evidence Retrieval

**Required Semantic Capability:**
- Record evidence
- Track evidence provenance
- Retrieve evidence for decisions

**Optional Implementation Feature:**
- Specific evidence format
- Specific provenance tracking
- Specific retrieval mechanism

---

### 8. Handoff Transfer

**Required Semantic Capability:**
- Create handoffs with required semantics
- Transfer handoffs between actors
- Reconstruct context from handoffs

**Optional Implementation Feature:**
- Specific handoff format
- Specific transfer mechanism
- Specific reconstruction mechanism

---

### 9. Authority Communication/Delegation

**Required Semantic Capability:**
- Communicate authority decisions
- Delegate authority through explicit governance
- Track authority status

**Optional Implementation Feature:**
- Specific communication format
- Specific delegation mechanism
- Specific authority tracking

---

### 10. Actor Capability Description

**Required Semantic Capability:**
- Describe actor capabilities
- Describe actor permissions
- Describe actor resource limits

**Optional Implementation Feature:**
- Specific capability format
- Specific permission model
- Specific resource tracking

---

## Adapter Boundaries

### What an Adapter MUST NOT Do
- Violate PCM invariants
- Redefine PCM primitives
- Redefine PCM roles
- Introduce self-approval paths
- Make canonical state ambiguous
- Change core semantics

### What an Adapter MAY Do
- Define specific formats for all capabilities
- Implement specific mechanisms
- Use specific technologies
- Add domain-specific behaviors (clearly separated from core)
- Optimize for specific contexts

## Implementation Notes

Adapters are technology-specific bindings. They must preserve PCM/PWF semantics while providing domain-appropriate implementations. The capability contract defines WHAT an adapter must provide, not HOW to implement it.