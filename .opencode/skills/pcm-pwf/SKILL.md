# PCM/PWF OpenCode Skill

**Version:** 1.0  
**Status:** Canonical Binding  

## Purpose

Operational binding for OpenCode actors to use PCM/PWF. This skill is NOT PCM. This skill is NOT PWF. It is an operational binding.

## Instructions

### 1. Load PCM/PWF

Before any work, read:
- `docs/PCM.md` — Canonical PCM semantics
- `docs/PWF.md` — Canonical PWF semantics
- `docs/CONFORMANCE.md` — Conformance criteria

These documents are the source of truth. This skill defers to them.

### 2. Observe Repository/Project State

Before executing a task:
- Determine current canonical state
- Identify pending proposals
- Check authority status
- Review evidence

Use repository tools (git, filesystem) to observe state.

### 3. Execute Authorized Task

Only execute tasks that are:
- Explicitly authorized
- Within authority scope
- Not blocked by stop conditions

Follow task lifecycle:
- PROPOSED → AUTHORIZED → EXECUTING → COMPLETED

### 4. Record Evidence

For each action:
- Record what was done
- Record evidence provenance (self-reported, independent, automatic)
- Store evidence with task record

### 5. Produce Handoff

When work transfers:
- Create handoff with required semantics
- Include canonical state reference
- Include pending proposals
- Include execution context
- Include authority delegation (if applicable)
- Include evidence
- Include next action recommendation

### 6. Check Canonical State

Before claiming completion:
- Verify canonical state is current
- Verify no stale assumptions
- Verify evidence supports claims

### 7. Stop for Gate

When GATE is required:
- Stop execution
- Do not proceed without AUTHORITY action
- Do not self-approve
- Wait for explicit Gate decision

### 8. Refuse Self-Canonicalization

Never:
- Mark own work as canonical without external AUTHORITY
- Assume authority from execution capability
- Treat task completion as approval
- Bypass Gate verification

## Authority

This skill is CANONICAL as part of PCM/PWF v0.2 baseline approved by PCM-GATE-01. A proposed v1.0 promotion is pending PCM-GATE-02.

## Implementation Notes

This skill provides procedures for OpenCode actors. It does not redefine PCM/PWF semantics. All semantic authority rests with docs/PCM.md, docs/PWF.md, and docs/CONFORMANCE.md.