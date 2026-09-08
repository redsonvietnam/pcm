# Agentic Execution Profile (AEP)

**Version:** 1.0  
**Status:** Proposed operational profile  
**Relationship:** Companion to PCM/PWF; not part of PCM core

## 1. Purpose

AEP defines how a tool-enabled AI actor may perform multi-step work while remaining governed by PCM/PWF.

AEP exists to make agentic execution operational rather than implicit. It standardizes the distinction between:

- capability available to an actor
- action actually performed by an actor
- evidence produced by an action
- authority granted to an actor

AEP does not grant authority and does not redefine PCM semantics.

## 2. Execution Model

An agentic session may iterate through the following loop:

```text
OBSERVE → ACT → OBSERVE → VERIFY → ADAPT → ACT → ...
```

The loop may continue for multiple tool calls and multiple verification steps while the work remains within the authorized TASK scope.

The actor MUST stop when:

- the TASK is complete;
- a stop condition is reached;
- required evidence cannot be obtained;
- authority is missing or ambiguous;
- a GATE is required.

## 3. Capability vs Action vs Evidence

AEP requires three distinct records when materially relevant:

### 3.1 Capability

A capability is something the execution surface exposes to the actor.

Examples:

- GitHub read/write access
- filesystem access
- web access
- shell execution

Capability alone is not evidence that an action occurred.

### 3.2 Action

An action is an operation actually performed during the session.

Examples:

- fetched a repository file
- created a branch
- changed a file
- opened a pull request
- ran a verification command

### 3.3 Evidence

Evidence is an observable result supporting a claim.

Examples:

- returned file content
- created commit SHA
- compare result
- test output
- workflow result

Evidence MUST retain provenance according to PCM rules.

## 4. Session Contract

A conforming AEP session SHOULD produce these checkpoints:

### Startup

```yaml
execution:
  mode: agentic
  actor: <actor id>
  binding: pcm-v1
  binding_version: 1.0
capabilities:
  - name: <capability>
    status: available
```

The session MUST also establish PCM role, authority, canonical state, proposed state, and Gate conditions before material execution.

### During Execution

For each material action:

```yaml
- action: <operation>
  capability: <capability>
  evidence: <reference>
  provenance: self-reported|independent|automatic
```

Not every low-level implementation detail needs to be recorded; record actions that materially affect reconstruction, authority, or verification.

### Completion

```yaml
completion:
  task_state: completed|blocked|stopped
  proposed_state: <reference>
  canonical_state_changed: false
  gate_required: true|false
```

AEP completion MUST NOT imply canonicalization.

## 5. Behavioral Conformance

AEP conformance is observable.

A session is not conformant merely because the actor says that it is running in agentic mode or using PCM.

A conforming session demonstrates that it:

- distinguishes capability from authority;
- distinguishes action from capability availability;
- records or exposes material evidence;
- distinguishes canonical and proposed state;
- respects TASK/WORKSTREAM scope;
- stops at required GATEs;
- does not self-canonicalize.

## 6. Tool Surface Independence

AEP does not require a particular provider or tool implementation.

The same profile may be applied to:

- OpenCode
- ChatGPT agentic execution
- Codex
- other tool-enabled actors

Adapter bindings may translate AEP requirements into tool-specific commands, skills, prompts, APIs, or reports.

## 7. Governance Boundary

AEP MUST NOT:

- create a new PCM primitive;
- grant AUTHORITY based on tool access;
- treat agentic execution as approval;
- replace GATE semantics;
- treat machine-local context as canonical state.

The governing relationship remains:

```text
PCM  = governance semantics
PWF  = execution workflow semantics
AEP  = agent/tool execution profile
MBP  = machine-local context/checkpoint representation
```

## 8. Reconstructability

When an agentic session transfers work, the HANDOFF SHOULD preserve enough execution-surface context to explain material actions, including:

- actor/binding identity
- material capabilities used
- material actions performed
- resulting evidence
- unresolved proposals
- next action

The purpose is reconstruction, not exhaustive telemetry.

## 9. Security

AEP records should not contain:

- passwords
- API keys
- authentication tokens
- private keys
- sensitive production data

Use references, classifications, or redacted summaries where needed.

## 10. Versioning

AEP uses semantic versioning for this profile:

- Major: incompatible changes to the execution profile
- Minor: compatible additions
- Patch: corrections or editorial changes

AEP version changes do not by themselves change PCM semantics.
