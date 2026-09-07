# PCM/PWF OpenCode Skill — Design Note

**Version:** 0.1.0  
**Status:** Design Note — Not Ready as Operational Skill  
**Authority:** Pending External Review  

## Purpose

This is a design note for a future OpenCode skill that would bind PCM/PWF to OpenCode execution. It is NOT an operational skill. The semantic boundary is still unstable, so this document records design intent rather than implementation.

## Why This Is a Design Note

The framework semantics are still PROPOSED and may change. Creating an operational skill now would:
- Prematurely lock the framework into OpenCode-specific patterns
- Risk diverging from PCM/PWF core as it evolves
- Create an adapter that may not match the final protocol

This design note records what the skill WOULD do, so that when the framework stabilizes, the skill can be implemented quickly.

## Skill Intent

When the framework stabilizes, this skill would:

### 1. Load PCM/PWF
- Reference canonical PCM/PWF from `docs/PCM.md` and `docs/PWF.md`
- Not redefine PCM/PWF semantics
- Treat docs as the source of truth

### 2. Construct a Task
- Create task records following PWF 4.1
- Include workstream reference, purpose, authority scope, success criteria, evidence requirements
- Not assume a specific task format

### 3. Observe State
- Read current canonical state
- Read proposed state
- Determine differences
- Not assume state is in a specific format

### 4. Produce Evidence
- Record evidence with provenance (PCM 12)
- Distinguish self-reported, independent, and automatic evidence
- Not assume evidence format

### 5. Create Handoff
- Create handoffs following PCM 9 semantics
- Include canonical state reference, pending proposals, execution context, authority delegation, evidence, next action
- Not assume handoff format

### 6. Stop for Gate
- Detect when GATE verification is required
- Stop execution
- Not proceed without AUTHORITY action
- Not self-approve

### 7. Avoid Self-Approval
- Never mark own work as canonical
- Never assume AUTHORITY
- Always require explicit AUTHORITY delegation

## What the Skill Must NOT Do

- Redefine PCM semantics
- Redefine PWF semantics
- Introduce self-approval paths
- Make OpenCode requirements part of PCM core
- Assume specific state formats
- Assume specific task formats

## Implementation Readiness

**Status:** Not ready for implementation.

**Reason:** PCM/PWF semantics are still PROPOSED. The skill should be implemented only after:
1. PCM/PWF is approved by external Authority Gate
2. Semantic boundary is stable
3. Adapter model is validated

**Next Step:** When PCM/PWF stabilizes, implement this skill as an adapter, not as a core component.