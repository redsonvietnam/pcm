# Machine Baseline Protocol (MBP)

**Version:** 0.1 (Proposed Companion Specification)  
**Status:** Proposed  
**Relationship:** Companion to PCM/PWF; not part of PCM core

## 1. Purpose

MBP defines a lightweight, tool-agnostic way to record and compare **machine-local working state** when the same project is operated from multiple machines.

Typical examples include:
- local agent/tool bindings
- local configuration that is intentionally outside a repository
- runtime/toolchain versions
- machine-specific scripts or wrappers
- capabilities and environment facts
- verification fingerprints for selected local files

MBP exists because repository synchronization does not automatically synchronize machine-local context.

## 2. Relationship to PCM/PWF

MBP does not redefine PCM or PWF and does not introduce a new PCM primitive.

The conceptual separation is:

- **PCM:** governance semantics
- **PWF:** operational execution framework
- **MBP:** machine-local context/checkpoint representation
- **Git branch/relay:** an optional persistent checkpoint anchor

The following distinctions remain absolute:

- Machine Baseline != Canonical State
- Machine Context != Authority
- Relay != Canonical State
- Checkpoint != Approval
- Fingerprint != Proof of behavioral equivalence

MBP records machine context; it never grants authority or promotes project state to canonical state.

## 3. Scope

MBP covers machine-local state that is relevant to reproducing or understanding work on a project.

MBP does **not** require machines to be identical.

The goal is **predictability and reconstructability**, not machine equality.

## 4. Baseline Model

A Machine Baseline is a named snapshot of the locally relevant state of one machine at a point in time.

A baseline should identify at least:

- machine identity or stable label (for example `home`, `office`, `lab`)
- timestamp or checkpoint identifier
- project/repository identity
- repository commit/reference used by the machine
- relevant toolchain versions
- relevant local bindings/configuration
- selected capabilities or constraints
- verification status
- optional fingerprints for local files
- notes on intentionally machine-specific differences

## 5. Three-State Separation

MBP encourages separating machine information into three categories.

### 5.1 Canonical-sync

State that should normally be shared through the project's canonical persistence mechanism, such as Git.

Examples:
- source code
- tests
- repository configuration
- committed workflow definitions
- versioned project contracts

### 5.2 Machine-specific

State that is intentionally allowed to differ between machines.

Examples:
- absolute paths
- hardware-dependent settings
- credentials and secrets
- local caches
- OS-specific integrations
- manually installed tools

Machine-specific does not mean irrelevant. It means the difference is intentional and should be visible when it affects execution.

### 5.3 Machine-verified

State that may differ, but whose presence or capability is important enough to verify.

Examples:
- required runtime versions
- local agent skill/binding version
- required command availability
- wrapper scripts
- local certificates or trust configuration, when appropriate

## 6. Repository Anchor

A repository relay branch or tag MAY be used as a persistent anchor for a Machine Baseline.

Recommended convention:

`relay/<machine>-<yyyymmdd>-<purpose>`

Examples:

- `relay/home-20260909-machine-baseline`
- `relay/office-20260910-production-e2e`

The relay is an **anchor**, not the machine state itself. Local state that cannot or should not be committed remains outside the repository and is represented by the baseline manifest and/or fingerprints.

## 7. Baseline Manifest

The baseline manifest is the reconstructable description of machine state.

Recommended properties:

```yaml
version: 0.1
machine:
  id: home
  platform: windows
checkpoint:
  id: home-20260909-machine-baseline
  created_at: 2026-09-09T00:00:00+07:00
project:
  repository: owner/project
  ref: main
  commit: <sha>
components:
  - name: opencode-pcm-binding
    source: owner/pcm
    ref: <ref>
    commit: <sha>
    status: verified
  - name: node
    version: <version>
    status: verified
local_state:
  - name: <local item>
    classification: machine-specific
    fingerprint: <optional sha256>
verification:
  status: passed
  evidence: <reference>
notes:
  - <intentional difference or constraint>
```

The manifest should contain **references and fingerprints, not secrets**.

## 8. Fingerprints

Fingerprints MAY be recorded for selected local files or directories when exact-content identity matters.

A fingerprint establishes content identity for the measured object. It does not prove:
- behavioral equivalence
- runtime equivalence
- security equivalence
- successful operation

Behavior still requires explicit verification.

## 9. Checkpoint Lifecycle

A practical lifecycle is:

1. `CURRENT` — machine is being used
2. `VERIFY` — relevant state is inspected
3. `CHECKPOINT` — baseline is recorded and optionally anchored in Git
4. `SUPERSEDED` — a newer baseline replaces it

Baselines are historical records and should not be rewritten silently.

## 10. Multi-Machine Handoff

When moving work between machines:

1. Identify the source machine baseline.
2. Resolve the repository anchor commit.
3. Compare the destination machine against the baseline.
4. Reconcile only the differences relevant to the task.
5. Re-verify the destination machine.
6. Create a new destination baseline when the new state is worth preserving.

The objective is not to force `HOME == OFFICE`. The objective is to make differences explicit and actionable.

## 11. Security and Privacy

Machine baselines must not contain:

- passwords
- API keys
- authentication tokens
- private certificates or private keys
- personal secrets
- sensitive production data

Use placeholders, references, or fingerprints instead.

## 12. PCM Conformance

MBP is compatible with PCM when used with the following discipline:

- Baseline records are context/evidence, not canonical authority.
- Creating a baseline does not approve implementation.
- A relay checkpoint does not promote proposed state.
- HANDOFFs may reference baselines to improve reconstructability.
- GATE decisions remain governed by PCM.

## 13. Reuse Across Repositories

MBP is intentionally project-agnostic.

A repository may adopt MBP without adopting a particular Git hosting provider, programming language, agent, editor, or operating system.

A project MAY define additional baseline fields, but project-specific additions should remain clearly separated from the portable MBP core.

## 14. Versioning

MBP uses semantic versioning for this companion specification:
- Major: incompatible changes to the baseline model or semantics
- Minor: compatible additions
- Patch: corrections or editorial changes

## 15. Authority

This document is a proposed companion specification. It does not change PCM/PWF semantics and does not become canonical PCM merely by being stored in the PCM repository.
