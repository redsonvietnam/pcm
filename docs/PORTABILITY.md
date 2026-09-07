# Portability / Independence Test

**Version:** 0.1.0  
**Status:** Analysis  

## Purpose

Explicitly test whether PCM/PWF concepts survive replacement of specific tools, platforms, and technologies. The goal is to identify TRUE CORE, PWF POLICY, and ADAPTER BOUNDARY.

## Test Methodology

For each technology, ask:
1. Does PCM core survive without this technology?
2. Does PWF mandatory behavior survive without this technology?
3. What adapter behavior is needed to bind PCM/PWF to this technology?

## Technology Tests

### GitHub

**Test:** Do PCM/PWF concepts work without GitHub?

**Analysis:**
- PCM primitives (WORKSTREAM, TASK, HANDOFF, GATE) do not require GitHub
- PCM roles (AUTHORITY, PROPOSER, OPERATOR, OBSERVER) do not require GitHub
- PCM invariants hold without GitHub
- PWF mandatory behaviors do not require GitHub

**Adapter needed:** GitHub adapter would provide:
- Issue/PR as task record format
- Branch/merge as state management
- Code review as GATE mechanism
- Repository as persistent state

**Conclusion:** GitHub is an adapter concern, not core.

### Git

**Test:** Do PCM/PWF concepts work without Git?

**Analysis:**
- PCM primitives do not require version control
- PCM state model does not require commits
- PWF mandatory behaviors do not require Git

**Adapter needed:** Git adapter would provide:
- Commits as state snapshots
- Branches as parallel state
- History as audit trail

**Conclusion:** Git is an adapter concern, not core.

### Local Filesystem

**Test:** Do PCM/PWF concepts work without a filesystem?

**Analysis:**
- PCM primitives do not require file storage
- PCM state model requires persistent state, but not files specifically
- PWF mandatory behaviors require state persistence, but not files

**Adapter needed:** Filesystem adapter would provide:
- Files as state storage
- Directories as organization
- File formats as serialization

**Conclusion:** Filesystem is an adapter concern, not core.

### OpenCode

**Test:** Do PCM/PWF concepts work without OpenCode?

**Analysis:**
- PCM primitives do not require OpenCode
- PCM roles do not require OpenCode actors
- PCM invariants hold without OpenCode
- PWF mandatory behaviors do not require OpenCode

**Adapter needed:** OpenCode adapter would provide:
- Skills as behavior definition
- Tasks as execution units
- Sessions as context management

**Conclusion:** OpenCode is an adapter concern, not core.

### LLMs

**Test:** Do PCM/PWF concepts work without LLMs?

**Analysis:**
- PCM primitives do not require AI
- PCM roles do not require AI actors
- PCM invariants hold without AI
- PWF mandatory behaviors do not require AI

**Adapter needed:** LLM adapter would provide:
- Model capabilities as actor model
- Prompt as task specification
- Response as evidence

**Conclusion:** LLMs are an adapter concern, not core.

### Human Operators

**Test:** Do PCM/PWF concepts work with only human actors?

**Analysis:**
- PCM primitives work with human actors
- PCM roles work with human actors
- PCM invariants hold with human actors
- PWF mandatory behaviors work with human actors

**Adapter needed:** Human adapter would provide:
- Meetings as GATE mechanism
- Documents as state storage
- Email as handoff mechanism

**Conclusion:** Human operation is fully supported.

### Programming Languages

**Test:** Do PCM/PWF concepts work without specific programming languages?

**Analysis:**
- PCM primitives do not require code
- PCM state model does not require code
- PWF mandatory behaviors do not require code

**Adapter needed:** Language adapter would provide:
- Code as implementation
- Tests as verification
- Build as execution

**Conclusion:** Programming languages are an adapter concern, not core.

### Repositories

**Test:** Do PCM/PWF concepts work without repositories?

**Analysis:**
- PCM primitives do not require repositories
- PCM state model requires persistent state, but not repositories specifically
- PWF mandatory behaviors require state persistence

**Adapter needed:** Repository adapter would provide:
- Repository as state container
- Collaboration features as coordination

**Conclusion:** Repositories are an adapter concern, not core.

## Classification

### TRUE CORE (survives all technology replacement)
- WORKSTREAM, TASK, HANDOFF, GATE primitives
- AUTHORITY, PROPOSER, OPERATOR, OBSERVER roles
- Five invariants
- Concurrent conflict resolution
- Evidence provenance
- State distinctions (Canonical, Proposed, Execution, Context)
- HANDOFF semantics
- GATE semantics

### PWF POLICY (recommended but not required)
- Task lifecycle states
- Checkpoints
- Next action determination
- Observation principle
- Evidence collection guidelines

### ADAPTER BOUNDARY (technology-specific)
- Task record format
- State storage mechanism
- GATE implementation
- Handoff format
- Verification methods
- Communication channels
- Persistence mechanisms

## Conclusion

PCM/PWF is genuinely portable. The core semantics survive complete replacement of all specific technologies. The framework is technology-agnostic at its core, with adapter behavior providing technology-specific bindings.

The key insight is that **persistent state** is required but **how** that state is persisted is an adapter concern. PCM requires that canonical state exists and is authoritative, but it does not require a specific storage mechanism.