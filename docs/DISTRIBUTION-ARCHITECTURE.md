# Distribution Architecture

**Date:** 2026-09-07
**Workstream:** PCM-DISTRIBUTION-ARCHITECTURE-01
**Status:** Design — NO IMPLEMENTATION

---

## 1. Problem

PCM/PWF v1.0 is canonical but exists only as a Git repository. To be useful outside this repository, it must be installable into arbitrary target repositories through a single command.

Target developer experience:

```
npx pcm init
```

The command must work in Node, Python, Go, Rust, PHP, and non-code repositories — without requiring the target repository to have any specific runtime.

---

## 2. Goals

1. One-line bootstrap into any repository
2. PCM/PWF core remains runtime/language agnostic
3. Project-specific bindings remain outside PCM core
4. Generic adapter is first-class
5. OpenCode is optional, not required
6. Idempotent installation
7. Safe for repeated invocation
8. No silent side effects on target repository

---

## 3. Non-Goals

- Modify PCM/PWF semantics
- Modify conformance rules
- Implement project-specific adapters
- Modify external projects
- Provide a universal runtime for all adapters
- Replace Git or any VCS

---

## 4. Design Principles

1. **Core/Binding Separation:** PCM/PWF core is pure specification. Distribution adds tooling. Adapters add project-specific bindings.
2. **Generic First:** Every command works with a generic fallback before any adapter is detected.
3. **Detect, Don't Assume:** The installer probes the target repository. It never assumes language, runtime, or tooling.
4. **Minimal Footprint:** Install only what is necessary. Prefer specification files over executable tooling.
5. **Idempotent:** Running `pcm init` multiple times produces the same state as running it once.
6. **Safe:** Never overwrite user files, execute project scripts, or modify application source code without explicit policy.

---

## 5. Candidate Distribution Models

### A. Git Clone/Copy Model

**Mechanism:** User clones or copies PCM files into target repository.

| Dimension | Assessment |
|-----------|-----------|
| Runtime dependency | None |
| Offline capability | Full |
| Upgrade difficulty | Manual re-clone |
| Version management | Manual |
| Adapter detection | None |
| One-line UX | No — requires manual steps |

**Verdict:** Insufficient UX. No detection, no upgrade path.

---

### B. npm Package + CLI

**Mechanism:** `npx pcm init` downloads and runs a Node.js CLI that bootstraps PCM.

| Dimension | Assessment |
|-----------|-----------|
| Runtime dependency | Node.js + npm |
| Offline capability | npm cache only |
| Upgrade difficulty | Easy (`npx pcm update`) |
| Version management | npm semver |
| Adapter detection | CLI can probe filesystem |
| One-line UX | Yes |

**Verdict:** Best UX. Node.js is the only runtime dependency.

---

### C. Standalone Binary

**Mechanism:** Single compiled binary (Rust, Go) that bootstraps PCM.

| Dimension | Assessment |
|-----------|-----------|
| Runtime dependency | None |
| Offline capability | Full (if vendored) |
| Upgrade difficulty | Replace binary |
| Version management | Binary version |
| Adapter detection | Binary can probe filesystem |
| One-line UX | Requires separate download |

**Verdict:** Best runtime independence. Worst initial UX (no `npx` equivalent).

---

### D. Package Manager + Bootstrap Script

**Mechanism:** Shell script downloads PCM files. No runtime required.

| Dimension | Assessment |
|-----------|-----------|
| Runtime dependency | Shell (bash/powershell) |
| Offline capability | None (unless vendored) |
| Upgrade difficulty | Re-run script |
| Version management | Script version |
| Adapter detection | Limited |
| One-line UX | Yes (`curl | sh`) |

**Verdict:** Good portability. Poor upgrade story. Security concerns with pipe-to-shell.

---

### E. Hybrid Model

**Mechanism:** npm package is the primary distribution channel. Shell script is the fallback for non-Node environments.

| Dimension | Assessment |
|-----------|-----------|
| Runtime dependency | npm (primary) or shell (fallback) |
| Offline capability | npm cache / vendored |
| Upgrade difficulty | Easy |
| Version management | npm semver |
| Adapter detection | Full |
| One-line UX | Yes |

**Verdict:** Best balance. Primary UX via npm. Fallback for non-Node.

---

## 6. Chosen Architecture

**Hybrid Model (E).**

Primary distribution: npm package `pcm` providing `npx pcm init`.
Fallback distribution: shell-based bootstrap for non-Node environments.

### Why npm as Primary

1. `npx pcm init` is the target UX
2. npm provides version management, caching, and upgrade paths
3. npm is available on Linux, macOS, Windows
4. Node.js is widely installed in development environments

### Why Shell as Fallback

1. Not all environments have Node.js
2. Shell script can copy files without runtime
3. Provides path for non-Node projects (Python, Go, Rust)

### Why Not Binary

1. Requires separate distribution channel per OS/arch
2. No `npx` equivalent
3. Overkill for file-copying operations

---

## 7. Layer Boundaries

```
┌─────────────────────────────────────────┐
│           PCM/PWF v1.0 Core            │
│  (specifications, invariants, roles)    │
│  Pure documentation — no executable     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Distribution / CLI              │
│  (npm package, shell script)            │
│  Provides: pcm init, pcm update         │
│  Language: Node.js (primary), Shell     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Bootstrap Engine                │
│  Detects: language, Git, OpenCode       │
│  Selects: adapter or generic fallback   │
│  Writes: target repository files        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Adapter / Binding               │
│  (generic or project-specific)          │
│  Defines: persistence, verification     │
│  Format: PCM adapter specification      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Target Repository               │
│  (user's project)                       │
│  Receives: PCM files + adapter config   │
└─────────────────────────────────────────┘
```

### What Belongs in Each Layer

| Layer | Contents | Who Modifies |
|-------|----------|-------------|
| PCM/PWF Core | Specifications, invariants, primitives, roles | Authority Gate only |
| Distribution/CLI | npm package, shell script, versioning | PCM maintainers |
| Bootstrap Engine | Detection logic, file writer, idempotency | PCM maintainers |
| Adapter/Binding | Generic fallback + project-specific adapters | PCM maintainers (generic) / Users (project-specific) |
| Target Repository | User's project files | Users |

---

## 8. One-Line Bootstrap

### Primary: `npx pcm init`

**Prerequisites:** Node.js ≥ 18, npm ≥ 9

**Behavior:**
1. Download `pcm` package temporarily (no global install)
2. Detect target repository environment
3. Select adapter (generic or detected)
4. Write PCM files to target repository
5. Report success with next steps

### Fallback: Shell Bootstrap

```bash
curl -sSL https://raw.githubusercontent.com/redsonvietnam/pcm/main/scripts/pcm-init.sh | bash
```

**Prerequisites:** Shell (bash or POSIX sh)

**Behavior:**
1. Download PCM specification files
2. Copy to target repository
3. Write generic adapter configuration
4. Report success

### Runtime Dependency Decision

| Environment | Runtime Required | Entry Point |
|------------|-----------------|-------------|
| Node.js available | Node.js ≥ 18 | `npx pcm init` |
| No Node.js | Shell (bash) | `curl | bash` |
| Windows no bash | PowerShell | `irm pcm.ps1 \| iex` |
| No internet | Manual copy | Clone + run locally |

**OpenCode is never required.** PCM works without OpenCode. The CLI detects OpenCode and optionally installs skill bindings.

---

## 9. Bootstrap Lifecycle

```
pcm init
    │
    ├─► 1. Detect environment
    │      ├─ Git repo?
    │      ├─ Language/runtime?
    │      ├─ Package manager?
    │      ├─ OpenCode?
    │      ├─ Existing PCM?
    │      └─ Conflicting files?
    │
    ├─► 2. Select adapter
    │      ├─ Detected adapter → use it
    │      └─ No adapter detected → use generic fallback
    │
    ├─► 3. Check idempotency
    │      ├─ Fresh install → proceed
    │      ├─ Already initialized → update if needed
    │      └─ Conflicting state → report, don't overwrite
    │
    ├─► 4. Write files
    │      ├─ PCM/PWF specifications (docs/)
    │      ├─ Adapter configuration (pcm-adapter.json)
    │      ├─ Conformance scenarios (conformance/)
    │      ├─ Gate records directory (docs/gates/)
    │      └─ OpenCode skill (if detected)
    │
    └─► 5. Report
           ├─ What was installed
           ├─ What adapter was selected
           ├─ Next steps
           └─ Version installed
```

---

## 10. Repository State

### After `pcm init` — Core Artifacts

```
target-repo/
├── docs/
│   ├── pcm/
│   │   ├── PCM.md                    # PCM specification
│   │   ├── PWF.md                    # PWF specification
│   │   ├── CONFORMANCE.md            # Conformance specification
│   │   ├── ADAPTER-MODEL.md          # Adapter capability contract
│   │   ├── ADOPTION-BOUNDARY.md      # Stable/unstable boundary
│   │   ├── CHANGE-CONTROL.md         # Versioning policy
│   │   └── gates/                    # Gate records directory
│   │       └── .gitkeep
├── pcm-adapter.json                  # Adapter configuration
├── pcm-version.json                  # Installed version metadata
└── .pcm/                             # PCM internal state
    └── version                       # Exact installed version
```

### Core Artifacts vs Project Binding Artifacts

| Category | Files | Who Owns |
|----------|-------|----------|
| Core Artifacts | PCM.md, PWF.md, CONFORMANCE.md, ADAPTER-MODEL.md, ADOPTION-BOUNDARY.md, CHANGE-CONTROL.md | PCM maintainers |
| Project Binding Artifacts | pcm-adapter.json, .pcm/, docs/gates/ | Users + Bootstrap Engine |
| OpenCode Artifacts | .opencode/skills/pcm-pwf/ | Bootstrap Engine (if OpenCode detected) |

### pcm-adapter.json — Generic Fallback

```json
{
  "pcmVersion": "1.0.0",
  "adapterType": "generic",
  "adapterVersion": "1.0.0",
  "capabilities": {
    "canonicalState": "filesystem",
    "proposedState": "filesystem",
    "persistence": "filesystem",
    "taskRepresentation": "markdown",
    "execution": "manual",
    "verification": "manual",
    "evidence": "filesystem",
    "handoff": "markdown",
    "authority": "manual"
  },
  "detection": {
    "language": "unknown",
    "packageManager": "none",
    "vcs": "git",
    "openCode": false
  }
}
```

### pcm-version.json

```json
{
  "pcmVersion": "1.0.0",
  "installedAt": "2026-09-07T00:00:00Z",
  "installedBy": "pcm-cli",
  "baseline": "d8e09fa",
  "classification": "stability-graduation"
}
```

---

## 11. Adapter Discovery

### Detection Order

1. **Explicit:** `pcm-adapter.json` exists → use it
2. **Detected:** Environment probes suggest an adapter → select it
3. **Generic Fallback:** No adapter detected → use generic

### Detection Probes

| Probe | Detects | Adapter Hint |
|-------|---------|-------------|
| `.opencode/` exists | OpenCode environment | opencode adapter |
| `package.json` exists | Node.js project | node adapter |
| `pyproject.toml` exists | Python project | python adapter |
| `go.mod` exists | Go project | go adapter |
| `Cargo.toml` exists | Rust project | rust adapter |
| `composer.json` exists | PHP project | php adapter |
| `.git/` exists | Git repository | git adapter |
| None match | Unknown | generic fallback |

### Generic Fallback — First-Class

The generic fallback is not a degraded mode. It is a fully supported adapter that:

- Uses filesystem for persistence
- Uses markdown for task representation
- Uses manual verification
- Works in any environment with a filesystem
- Requires no runtime beyond shell/filesystem

### Adapter Compatibility Declaration

```json
{
  "adapterType": "node",
  "adapterVersion": "1.0.0",
  "pcmVersionRequired": ">=1.0.0",
  "pcmVersionTested": "1.0.0",
  "capabilities": { ... }
}
```

The bootstrap engine checks `pcmVersionRequired` against installed PCM version before applying an adapter.

---

## 12. OpenCode Integration

### What Is Installed Universally

- PCM/PWF specifications (docs/pcm/)
- Adapter configuration (pcm-adapter.json)
- Version metadata (pcm-version.json)

### What Is Installed Only When OpenCode Is Detected

- OpenCode skill binding (.opencode/skills/pcm-pwf/SKILL.md)

### Skill Integration Strategy

| Strategy | Assessment |
|----------|-----------|
| Generated at init time | Best — reflects installed version |
| Linked from npm package | fragile — path dependency |
| Referenced by URL | unreliable — network dependency |

**Chosen:** Generate at init time. The skill file is written to `.opencode/skills/pcm-pwf/SKILL.md` during `pcm init` if OpenCode is detected.

### Upgrade Behavior

When `pcm update` runs:
- If OpenCode is detected → regenerate skill file
- If OpenCode was removed → leave skill file (user manages)
- If OpenCode was added → install skill file

---

## 13. Security / Trust Boundary

### What `pcm init` MUST NOT Do

| Action | Reason |
|--------|--------|
| Execute arbitrary project scripts | Security risk |
| Alter application source code | Outside scope |
| Overwrite user files without policy | Data loss risk |
| Install project dependencies | Autonomy violation |
| Grant Authority | Governance violation |
| Modify canonical project state | Governance shortcut |

### What `pcm init` MAY Do

| Action | Condition |
|--------|-----------|
| Create docs/pcm/ directory | Fresh install only |
| Create pcm-adapter.json | Fresh install only |
| Create pcm-version.json | Fresh install only |
| Create .pcm/ directory | Fresh install only |
| Create .opencode/skills/pcm-pwf/ | OpenCode detected |
| Update pcm-version.json | Upgrade only |
| Update pcm-adapter.json | Explicit user action |

### Conflict Resolution

When `pcm init` encounters conflicting files:

1. **File exists with same content** → Skip (idempotent)
2. **File exists with different content** → Report conflict, do not overwrite
3. **Directory exists** → Check contents, report status
4. **User force flag** → Overwrite with backup

---

## 14. Idempotency

### Expected Behavior

```
$ pcm init
✅ PCM/PWF v1.0 initialized

$ pcm init
✅ PCM/PWF v1.0 already initialized (no changes)

$ pcm init
✅ PCM/PWF v1.0 already initialized (no changes)
```

### Implementation Rules

1. Check `pcm-version.json` before writing
2. If exists and same version → report, don't write
3. If exists and different version → upgrade path
4. If not exists → fresh install
5. Never delete user files
6. Never overwrite files with identical content

---

## 15. Version / Compatibility

### Version Representation

```
PCM/PWF v1.0.0
     │
     ├── Major: PCM semantic changes (Authority Gate required)
     ├── Minor: Conformance/PWF changes
     ├── Patch: Editorial changes
     └── Stability Graduation: 0.x → 1.0.0
```

### Version Matrix

| Installed PCM | Adapter Required | Compatible |
|--------------|-----------------|-----------|
| 1.0.x | >=1.0.0, <2.0.0 | Yes |
| 1.1.x | >=1.0.0, <2.0.0 | Yes |
| 2.0.x | >=2.0.0, <3.0.0 | No (breaking) |

### pcm-version.json Fields

```json
{
  "pcmVersion": "1.0.0",
  "installedAt": "ISO-8601",
  "installedBy": "pcm-cli|shell|manual",
  "baseline": "git-commit-hash",
  "classification": "stability-graduation",
  "adapter": "generic|node|python|...",
  "adapterVersion": "1.0.0"
}
```

---

## 16. Upgrade

### `pcm update`

**Behavior:**
1. Read `pcm-version.json`
2. Check latest available version
3. Compare compatibility
4. If compatible → upgrade files
5. If incompatible → report, require explicit flag
6. Preserve local adapter configuration
7. Preserve gate records
8. Preserve user modifications

### Upgrade Categories

| Category | What Changes | What Is Preserved |
|----------|-------------|-------------------|
| Patch upgrade | Specification wording | Everything else |
| Minor upgrade | New conformance criteria, new PWF recommendations | Adapter config, gate records |
| Major upgrade | PCM semantic changes | Nothing guaranteed (migration required) |

### Protected Local Modifications

The following are NEVER overwritten during upgrade:

- `pcm-adapter.json` (user's adapter choice)
- `docs/gates/*` (gate records)
- User-created content in `docs/pcm/`
- `.pcm/` internal state

---

## 17. Recovery / Uninstall

### `pcm uninstall`

**What It MAY Remove:**
- `pcm-version.json`
- `.pcm/` directory
- PCM specification files from `docs/pcm/`
- OpenCode skill binding

**What It Must NEVER Remove:**
- User-created gate records
- User-created documentation
- Application source code
- Project configuration files
- Git history

### Recovery

If `pcm init` fails mid-installation:

1. Check `pcm-version.json` for partial state
2. Report what was installed and what was not
3. Offer `pcm init --repair` to complete installation
4. Offer `pcm uninstall` to clean up

---

## 18. Offline Considerations

### Internet Availability Matrix

| State | npm bootstrap | Shell bootstrap | Manual |
|-------|--------------|----------------|--------|
| Full internet | Yes | Yes | Yes |
| npm cache available | Yes | No | Yes |
| No internet | No (unless vendored) | No | Yes (clone locally) |
| Air-gapped | No | No | Yes (manual copy) |

### Offline Strategy

1. **Primary:** npm cache provides offline capability for repeat installations
2. **Fallback:** Manual copy from local clone
3. **Not required:** Fully offline bootstrap is an optional capability, not a requirement
4. **Future:** `pcm pack` command could create a portable bundle

---

## 19. Portability

### Three Dimensions of Portability

| Dimension | What It Means | Distribution Impact |
|-----------|--------------|-------------------|
| Actor-Memory | Actors survive session boundaries | Not affected by distribution |
| State-Access | Canonical state is accessible | Distribution provides initial state |
| Framework-Distribution | PCM can be installed anywhere | This document |

### Distribution Portability

The distribution is portable when:

1. `npx pcm init` works on any machine with Node.js
2. Shell bootstrap works on any machine with bash
3. Manual copy works on any machine with filesystem
4. No hard-coded paths
5. No hard-coded project names
6. No dependency on this specific repository

### What Is NOT Portable

- The npm package requires npm registry access (or cache)
- The shell script requires internet (or manual download)
- The CLI is written in Node.js (but the output is runtime-agnostic)

---

## 20. Failure Modes

| Failure | Cause | Detection | Recovery |
|---------|-------|-----------|----------|
| No Node.js | Missing runtime | `pcm init` checks | Use shell fallback |
| No internet | Network failure | npm/curl fails | Use manual copy |
| Partial install | Crash mid-write | `pcm-version.json` missing | `pcm init --repair` |
| Conflicting files | Existing PCM | File exists check | Report, don't overwrite |
| Version mismatch | Old adapter | Compatibility check | `pcm update` |
| Permission denied | OS restrictions | Write fails | Report, suggest sudo |
| Corrupt download | Network issue | Checksum fails | Retry download |

---

## 21. Future Extension Points

| Extension | Trigger | Mechanism |
|-----------|---------|-----------|
| Language-specific adapters | Detection | Adapter registry |
| IDE integrations | Detection | Skill/plugin generation |
| CI/CD integration | Detection | Config file generation |
| Multi-repo orchestration | User request | Workspace configuration |
| Cloud-hosted PCM | User request | Remote adapter |
| Visual dashboard | User request | Web adapter |

---

## 22. Open Questions

1. **Adapter registry:** Should there be a central registry of adapters, or should adapters be independently distributed?
2. **Paid adapters:** Should the architecture support commercial adapters?
3. **Telemetry:** Should `pcm init` report anonymous usage statistics?
4. **Authentication:** Should `pcm init` support authenticated registries for private adapters?
5. **Workspace support:** Should `pcm init` support monorepo/workspace configurations?
6. **Migration from manual:** Should there be a `pcm adopt` command for repositories that already have manual PCM-like practices?

---

## Summary

| Dimension | Decision |
|-----------|---------|
| Distribution model | Hybrid (npm primary, shell fallback) |
| One-line command | `npx pcm init` |
| Runtime dependency | Node.js ≥ 18 (primary) or Shell (fallback) |
| Core/binding boundary | Specifications in docs/pcm/, adapter in pcm-adapter.json |
| Adapter strategy | Generic fallback first, detection-based selection |
| Security model | No silent side effects, no script execution, no file overwrites |
| Upgrade strategy | `pcm update` with compatibility checks |
| Offline stance | Optional capability, not requirement |
| OpenCode | Optional, detected, not required |
| Idempotency | Full — safe to run repeatedly |

**Status:** DISTRIBUTION-ARCHITECTURE-DESIGNED
**Implementation:** NOT YET
