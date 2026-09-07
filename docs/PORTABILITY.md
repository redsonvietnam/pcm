# Portability / Independence Test

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Explicitly test whether PCM/PWF concepts survive replacement of specific tools, platforms, and technologies.

## Test Methodology

For each technology, ask:
1. Does PCM core survive without this technology?
2. Does PWF mandatory behavior survive without this technology?
3. What must the binding provide?
4. Which assumptions, if any, are currently hidden?

## Technology Tests

### GitHub

**Test:** Do PCM/PWF concepts work without GitHub?

**Analysis:**
- PCM primitives do not require GitHub
- PCM invariants hold without GitHub
- PWF mandatory behaviors do not require GitHub

**What Binding Must Provide:**
- State persistence mechanism
- Handoff format
- Gate mechanism
- Evidence collection

**Hidden Assumptions:**
- None identified

**Conclusion:** GitHub is an adapter concern, not core.

---

### Git

**Test:** Do PCM/PWF concepts work without Git?

**Analysis:**
- PCM primitives do not require version control
- PCM state model does not require commits
- PWF mandatory behaviors do not require Git

**What Binding Must Provide:**
- State persistence mechanism
- State snapshot capability
- History/audit trail

**Hidden Assumptions:**
- None identified

**Conclusion:** Git is an adapter concern, not core.

---

### Filesystem

**Test:** Do PCM/PWF concepts work without a filesystem?

**Analysis:**
- PCM primitives do not require file storage
- PCM state model requires persistent state, but not files
- PWF mandatory behaviors require state persistence

**What Binding Must Provide:**
- State persistence mechanism
- State retrieval mechanism

**Hidden Assumptions:**
- None identified

**Conclusion:** Filesystem is an adapter concern, not core.

---

### OpenCode

**Test:** Do PCM/PWF concepts work without OpenCode?

**Analysis:**
- PCM primitives do not require OpenCode
- PCM roles do not require OpenCode actors
- PCM invariants hold without OpenCode
- PWF mandatory behaviors do not require OpenCode

**What Binding Must Provide:**
- Actor capability model
- Task execution mechanism
- State observation mechanism

**Hidden Assumptions:**
- None identified

**Conclusion:** OpenCode is an adapter concern, not core.

---

### LLMs

**Test:** Do PCM/PWF concepts work without LLMs?

**Analysis:**
- PCM primitives do not require AI
- PCM roles do not require AI actors
- PCM invariants hold without AI
- PWF mandatory behaviors do not require AI

**What Binding Must Provide:**
- Actor capability model (if using AI)
- Reasoning capability (if required)

**Hidden Assumptions:**
- None identified

**Conclusion:** LLMs are an adapter concern, not core.

---

### Human-Only Execution

**Test:** Do PCM/PWF concepts work with only human actors?

**Analysis:**
- PCM primitives work with human actors
- PCM roles work with human actors
- PCM invariants hold with human actors
- PWF mandatory behaviors work with human actors

**What Binding Must Provide:**
- Manual state persistence
- Manual handoff mechanism
- Manual Gate mechanism

**Hidden Assumptions:**
- None identified

**Conclusion:** Human operation is fully supported.

---

### Code-Based Work

**Test:** Do PCM/PWF concepts work for code-based work?

**Analysis:**
- PCM primitives work for code
- PCM roles work for code
- PCM invariants hold for code
- PWF mandatory behaviors work for code

**What Binding Must Provide:**
- Code as implementation
- Tests as verification
- Build as execution

**Hidden Assumptions:**
- None identified

**Conclusion:** Code-based work is fully supported.

---

### Non-Code Work

**Test:** Do PCM/PWF concepts work for non-code work?

**Analysis:**
- PCM primitives work for non-code
- PCM roles work for non-code
- PCM invariants hold for non-code
- PWF mandatory behaviors work for non-code

**What Binding Must Provide:**
- Domain-specific task formats
- Domain-specific verification methods
- Domain-specific persistence

**Hidden Assumptions:**
- None identified

**Conclusion:** Non-code work is fully supported.

## Classification

### TRUE CORE (survives all technology replacement)
- WORKSTREAM, TASK, HANDOFF, GATE primitives
- AUTHORITY, PROPOSER, OPERATOR, OBSERVER roles
- Six invariants
- State distinctions (Canonical, Proposed, Execution, Context)
- HANDOFF semantics
- GATE semantics
- Authority semantics

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

## Limitations

1. **Structural assumption** — Test assumes project-based coordination
2. **No adversarial test** — Did not test domains that resist structure
3. **No scale test** — Did not test with massive concurrent actors
4. **Conceptual only** — Did not implement adapters for all technologies

## Conclusion

PCM/PWF is genuinely portable. The core semantics survive complete replacement of all specific technologies. The framework is technology-agnostic at its core, with adapter behavior providing technology-specific bindings.

The key insight is that **persistent state** is required but **how** that state is persisted is an adapter concern. PCM requires that canonical state exists and is authoritative, but it does not require a specific storage mechanism.