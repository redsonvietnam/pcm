# Adapter Model

**Version:** 0.1.0  
**Status:** Design Candidates  

## Purpose

Define the conceptual adapter boundary: what information a project/tool/runtime provides so that generic PWF can operate without knowing project internals.

This is NOT an API specification. These are design candidates justified by the conformance work.

## Adapter Responsibilities

An adapter binds PCM/PWF to a specific context. The adapter is responsible for:

### 1. State Observation
**What the adapter provides:**
- Ability to observe current canonical state
- Ability to observe proposed state
- Ability to observe differences between canonical and proposed

**Why:** PCM requires that actors can determine what is actually true (PCM 8.1, PWF 4.5).

### 2. State Persistence
**What the adapter provides:**
- Mechanism to store canonical state
- Mechanism to store proposed state
- Mechanism to persist across sessions

**Why:** PCM requires that canonical state survives session boundaries (PCM 7.4).

### 3. Task Execution
**What the adapter provides:**
- Mechanism to represent tasks
- Mechanism to execute tasks
- Mechanism to track task lifecycle

**Why:** PWF requires task records and lifecycle (PWF 4.1, 4.2).

### 4. Verification
**What the adapter provides:**
- Mechanism to implement GATEs
- Mechanism to evaluate proposals against criteria
- Mechanism to record GATE decisions

**Why:** PCM requires GATE verification for state promotion (PCM 10).

### 5. Evidence Collection
**What the adapter provides:**
- Mechanism to record evidence
- Mechanism to track evidence provenance
- Mechanism to retrieve evidence for decisions

**Why:** PCM requires evidence provenance to be inspectable (PCM 12).

### 6. Actor Capability Description
**What the adapter provides:**
- Description of actor capabilities
- Description of actor permissions
- Description of actor resource limits

**Why:** PCM requires that authority is explicit and capability-based (PCM 5, 11).

### 7. Handoff Format
**What the adapter provides:**
- Format for handoff documents
- Mechanism to transfer handoffs between actors
- Mechanism to reconstruct context from handoffs

**Why:** PCM requires handoffs to be reconstructable (PCM 9).

### 8. Communication Channels
**What the adapter provides:**
- Mechanism for actors to communicate
- Mechanism for AUTHORITY to communicate decisions
- Mechanism for PROPOSER to submit proposals

**Why:** PCM requires explicit communication for authority and proposals.

## Adapter Boundaries

### What an Adapter MUST NOT Do
- Violate PCM invariants
- Redefine PCM primitives
- Redefine PCM roles
- Introduce self-approval paths
- Make canonical state ambiguous

### What an Adapter MAY Do
- Define task record formats
- Define handoff formats
- Define GATE mechanisms
- Define verification methods
- Define persistence mechanisms
- Define communication channels
- Add domain-specific behaviors (clearly separated from core)

## Adapter Examples (Conceptual)

### GitHub Adapter
- State observation: GitHub API, repository state
- State persistence: Git repository
- Task execution: Issues, Pull Requests
- Verification: Code review, CI/CD
- Evidence: Commit history, review comments
- Actor capabilities: GitHub permissions
- Handoff: PR description, review comments
- Communication: Issues, PRs, comments

### Spreadsheet Adapter
- State observation: Spreadsheet cells
- State persistence: Spreadsheet files
- Task execution: Task rows
- Verification: Review meetings
- Evidence: Meeting notes, email records
- Actor capabilities: Access permissions
- Handoff: Email with context
- Communication: Email, meetings

### OpenCode Adapter
- State observation: File system, task state
- State persistence: Files, task records
- Task execution: Skills, tasks
- Verification: Skill execution, task completion
- Evidence: Task logs, skill output
- Actor capabilities: Skill permissions
- Handoff: Task handoff documents
- Communication: Task assignments

## Implementation Notes

These are design candidates, not mandatory API names. An adapter implementation may:
- Use different names
- Combine responsibilities
- Split responsibilities differently
- Use any technology

The key requirement is that the adapter provides the capabilities listed above in a way that preserves PCM/PWF semantics.