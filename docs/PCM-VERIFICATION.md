# PCM OpenCode Verification Protocol

**Version:** 1.0
**Status:** Proposed operational protocol
**Scope:** OpenCode adapter verification

## 1. Purpose

This protocol answers three different questions:

1. Is the expected PCM OpenCode binding installed on this machine?
2. Did the current OpenCode session actually load that binding?
3. Did the session behave according to PCM/PWF while using an agentic execution surface?

These questions require different evidence.

## 2. Binding Identity

The OpenCode binding has one stable identity:

- Binding ID: `pcm-v1`
- Binding version: `1.0`
- Skill: `adapters/opencode/SKILL.md`
- Command: `adapters/opencode/commands/pcm.md`
- Agentic Execution Profile: `docs/AEP.md` v1.0

The authoritative distribution also publishes `adapters/opencode/PCM-BINDING.json` with SHA-256 fingerprints for the skill and command.

A machine is artifact-compatible only when its installed files match those canonical fingerprints exactly.

## 3. Verification Levels

### Level A — Discovery

OpenCode must be able to discover the `pcm-v1` skill and `/pcm` command.

### Level B — Artifact Identity

The installed skill and command must match the canonical SHA-256 fingerprints.

Run:

```text
npx pcm verify-opencode
```

A PASS means the verifier found the expected global binding at:

```text
~/.config/opencode/skills/pcm-v1/SKILL.md
~/.config/opencode/commands/pcm.md
```

Project-local copies, when present, are checked too.

### Level C — Session Load

The OpenCode session must explicitly load `pcm-v1` before task execution.

The `/pcm` command requires the agent to report the binding ID, version, source, scope, AEP version, discovery result, and load result.

### Level D — Agentic Execution

The session reports the material execution surface and capabilities actually available to it.

For material work, distinguish:

```text
Capability → Action → Evidence
```

A capability being available is not evidence that an action occurred.

AEP permits multiple tool calls and verification loops while the actor remains within TASK scope.

### Level E — Behavioral Conformance

The session must demonstrate observable PCM behavior, including:

- canonical vs proposed state separation
- explicit role and authority
- evidence provenance
- TASK/WORKSTREAM identification
- GATE handling where required
- refusal of self-canonicalization

A sentence such as “I am using PCM” is not sufficient evidence by itself.

## 4. Machine Parity

HOME and OFFICE should be considered PCM-binding compatible only when both machines resolve to the same canonical binding identity and exact fingerprints.

Recommended status:

- `PASS` — canonical skill and command fingerprints match
- `PASS-WITH-WARNINGS` — fingerprints match but legacy binding artifacts remain
- `FAIL` — binding is missing or differs from canonical fingerprints

The verifier never claims behavioral equivalence from a fingerprint alone.

## 5. Version Drift

A future binding update changes the canonical fingerprint and should be promoted as a new binding revision through the normal authority process.

Do not silently edit the machine-local copy to “make it pass”. Update it from the canonical distribution and re-run verification.

## 6. Recommended Workflow

```text
Canonical PCM repository
        |
        +--> adapters/opencode/SKILL.md
        |
        +--> adapters/opencode/commands/pcm.md
        |
        +--> docs/AEP.md
        |
        +--> PCM-BINDING.json
        |
        +--> HOME install
        |       |
        |       +--> npx pcm verify-opencode
        |       +--> /pcm session check
        |
        +--> OFFICE install
                |
                +--> npx pcm verify-opencode
                +--> /pcm session check
```

## 7. Security Boundary

The verifier checks file identity and AEP presence. It does not inspect or store secrets and does not prove machine security, runtime equivalence, or model behavior.

PCM governance remains defined by `core/PCM.md`, `core/PWF.md`, and `docs/CONFORMANCE.md`.
