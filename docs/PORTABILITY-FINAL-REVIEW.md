# Portability Final Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## Test: Replace GitHub

**Replace with:** GitLab, Bitbucket, or no platform.

**PCM statement:** "PCM rules are independent of specific tools" (7.5).

**Validity:** PCM semantics remain valid. Git is not required; any version control or state management works.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace Git

**Replace with:** Mercurial, SVN, or no version control.

**PCM statement:** "PCM rules are independent of specific tools" (7.5).

**Validity:** PCM semantics remain valid. The protocol requires state management, not a specific tool.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace Filesystem

**Replace with:** Database, cloud storage, or in-memory state.

**PCM statement:** "Canonical state exists only in persistent, authoritative storage" (8.1).

**Validity:** PCM semantics remain valid. The requirement is persistence, not a specific mechanism.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace OpenCode

**Replace with:** Claude, Cursor, Copilot, or no AI tool.

**PCM statement:** "PCM rules are independent of specific tools" (7.5).

**Validity:** PCM semantics remain valid. AI tools are actors, not protocol requirements.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace LLM

**Replace with:** Traditional software, human-only, or hybrid.

**PCM statement:** "An execution actor is any entity capable of performing work" (5).

**Validity:** PCM semantics remain valid. LLMs are one type of actor, not required.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace Human

**Replace with:** AI-only, automated system, or hybrid.

**PCM statement:** "An execution actor is any entity capable of performing work" (5).

**Validity:** PCM semantics remain valid. Humans are one type of actor, not required.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace Programming Language

**Replace with:** Any language or no language (non-code work).

**PCM statement:** "PCM governs the relationship between proposed and canonical state" (2).

**Validity:** PCM semantics remain valid. The protocol is language-independent.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace Software Project

**Replace with:** Non-code workflow (procurement, planning, operations).

**PCM statement:** "PCM defines the constitutional protocol for managing work in any context" (1).

**Validity:** PCM semantics remain valid. The protocol is domain-independent.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Test: Replace Non-Code Workflow

**Replace with:** Software project.

**PCM statement:** "PCM defines the constitutional protocol for managing work in any context" (1).

**Validity:** PCM semantics remain valid. The protocol is domain-independent in both directions.

**Hidden assumptions:** None.

**Assessment:** PORTABLE.

---

## Hidden Assumptions Analysis

**Assumed:** Persistent storage exists.
**Status:** Explicitly required (8.1). Not a hidden assumption.

**Assumed:** Actors can communicate.
**Status:** Implicit in HANDOFF semantics. Not hidden — communication is required for transfer.

**Assumed:** State can be distinguished from context.
**Status:** Explicitly required (7.4). Not hidden.

**Result:** No hidden assumptions.

---

## Protocol vs Policy Analysis

**PCM statements that are protocol:**
- Four primitives (WORKSTREAM, TASK, HANDOFF, GATE)
- Six invariants (7.1–7.6)
- State model (canonical, proposed, execution, context)
- Role semantics (AUTHORITY, PROPOSER, OPERATOR, OBSERVER)
- HANDOFF semantics
- GATE semantics

**PCM statements that are policy:**
- None found in core protocol

**PWF statements that are protocol:**
- Mandatory behaviors (task record, lifecycle, handoff, GATE, traceability)

**PWF statements that are policy:**
- Recommended behaviors (checkpoints, next action, observation, evidence)
- Optional behaviors (routing, verification, recovery, observation structure)

**Result:** Clear separation between protocol and policy.

---

## Conclusion

PCM/PWF is:
- Fully portable across tools, platforms, languages, and domains
- Free of hidden assumptions
- Correctly separated into protocol and policy

**FREEZE IMPLICATION:** Portability is demonstrated.
