# Distribution Architecture (npx pcm init)

**Version:** 1.0  
**Status:** Proposed  
**Authority:** PCM-GATE-01  
**Framework Reference:** PCM v1.0, PWF v1.0  

---

## 1. Problem

PCM is a protocol and PWF is a framework. Both are specification documents. For a user to benefit from PCM/PWF in a specific repository, a human executor must understand and interpret these documents, then apply the correct behaviors through tooling, commands, and daily workflows.

This creates three classes of problems:

1. **Manual interpretation error** — The executor must translate abstract protocol semantics into concrete tool configuration. This translation is error-prone and varies per machine, per repo, and per adapter choice.
2. **No standardized bootstrap** — There is no single documented path for `npx pcm init` to prepare a repository for PCM-governed work. Each user invents their own setup process.
3. **Unknown-repository ambiguity** — When `npx pcm init` encounters a repository it has never seen, the bootstrap process must detect environment, select an adapter, and produce a canonical result. The selection logic is currently undefined.

---

## 2. Goals

Define a single, universal distribution architecture that satisfies:

1. `npx pcm init` works identically on Machine A + repo X, Machine B + repo Y, Machine C + repo Z
2. Three sources of truth are explicitly separated and never confused
3. Env detection ≠ adapter availability — environment detection and adapter selection are separate concerns
4. Target repo ownership is explicit — defined by declared relationship, not tool presence
5. One-line portability — `npx pcm init` with no args produces a valid result on any repository
6. Unknown repo lifecycle — `npx pcm init` can encounter a repo it has never seen and produce a deterministic result

---

## 3. Non-Goals

1. Build, package, or publish any adapter
2. Modify target repositories beyond `npx pcm init` bootstrap
3. Define adapter-internal logic (that is adapter scope)
4. Change PCM invariants or primitives
5. Change PWF mandatory behaviors
6. Create new adapter technology beyond what exists (opencode, copilot, codex, etc.)
7. Provide upgrade or rollback paths — bootstrap must be idempotent
8. Manufacture fake canonical governance history

---

## 4. Design Principles

1. **Three sources of truth are separated** — PCM/PWF semantic authority, adapter catalog/discovery, and target installed state are distinct concerns that must never be conflated.

2. **Environment detection ≠ adapter availability** — Detecting that an environment has capability C does not mean adapter A for capability C is available. Detection informs; catalog decides suitability; policy decides trust.

3. **Selection is deterministic** — Given the same repository state and the same catalog, `npx pcm init` produces the same adapter selection every time. No randomness, no fuzzy matching, no heuristic.

4. **Target repo ownership is declared** — Ownership is determined by what the repository declares (e.g., presence of `docs/PCM.md` as canonical source), not by incidental tool presence.

5. **One-line portability** — A user can run `npx pcm init` on any repository, on any machine, and get a valid result without additional configuration.

6. **Idempotency** — Running `npx pcm init` multiple times on the same repository produces the same result. Bootstrap is not a mutation — it is a canonical application.

7. **Gate state is never package-managed** — `docs/gates/*`, tasks, handoffs, proposals, and canonical governance state are project-owned and must never be overwritten by distribution.

---

## 5. Three Sources of Truth

The architecture distinguishes three independent sources of truth. Each has a distinct scope and authority boundary.

### 5.1 PCM/PWF Semantic Source

**What it is:** The canonical specification of PCM and PWF.

**Location:** `docs/PCM.md` and `docs/PWF.md` in the `redsonvietnam/pcm` repository.

**Authority:** Defines protocol/framework semantics. All adapter behavior, distribution behavior, and tool behavior must conform to these semantics.

**Distribution mechanism does NOT become authority over PCM semantics.** The distribution mechanism reads and distributes these specifications. It does not interpret, extend, or override them.

### 5.2 Adapter Catalog / Discovery Source

**What it is:** The authoritative list of known adapters, their declared platform compatibility, and their distribution sources.

**Location:** Bundled with the `pcm` npm package as `registry/pcm-adapters.json`.

**Authority:** Controls adapter discoverability and declared compatibility. A catalog entry does NOT:
- Create PCM authority
- Imply trust
- Override project governance
- Replace AUTHORITY decisions

**Scope limitation:** The catalog answers "what adapters exist and what they claim to support." It does NOT answer "which adapter should be used in this project" (that is a governance decision) or "is this adapter trustworthy" (that is a policy decision).

### 5.3 Target Installed State

**What it is:** What is actually installed in the target repository after bootstrap.

**Location:** Files written by `npx pcm init` in the target repository.

**Authority:** Inspectable and reconstructable locally. The installed state must be able to answer:
- What PCM version is installed
- What distribution version installed it
- What binding/adapter is selected
- What files were written by the distribution mechanism
- What files are project-owned governance content

**Reconstruction:** Any actor with access to the target repository can determine the installed state without external dependencies.

### 5.4 Separation Rules

| Concern | Semantic Source | Catalog Source | Installed State |
|---------|----------------|----------------|-----------------|
| PCM invariants | Defines | Does not define | Does not define |
| Adapter existence | Does not define | Lists | May contain |
| Adapter trust | Does not define | Does not decide | Policy decides |
| Governance state | Defines semantics | Does not define | Project-owned |
| File provenance | Does not define | Does not define | Manifest records |

---

## 6. Candidate Distribution Models

### 6.1 Centralized CLI

`npx pcm init` as a standalone CLI that bundles all adapter logic internally. Adapters are not files in the target repository — they are baked into the CLI.

**Pros:** Simple to run. No external dependencies.  
**Cons:** Adapter updates require CLI updates. Cannot support adapters the CLI author did not anticipate. Violates adapter boundary.

### 6.2 Package-Bundled Artifacts

`npx pcm init` as a package-bundled installer. The npm package contains:
- PCM/PWF specification artifacts (exact copies)
- Adapter catalog
- Adapter file templates
- Selection logic

**Pros:** Deterministic. Offline-capable. Version-pinned. Least fragile.  
**Cons:** Adapter updates require package updates.

### 6.3 Registry + Generator

`npx pcm init` as a registry-driven generator. The CLI reads an external registry, selects an adapter, and writes adapter files into the target repository.

**Pros:** Adapters are files in the target repo. Updateable without CLI changes.  
**Cons:** Requires network. External registry is a single point of failure. Generator must be correct for every adapter.

### 6.4 Template Repository

`npx pcm init` clones a template repository and customizes it for the target.

**Pros:** Simple mental model. Version control built-in.  
**Cons:** Templates diverge. Customization is ad-hoc. No registry means no deterministic selection.

### 6.5 Hybrid (Package + Template + CLI)

`npx pcm init` as a package-bundled bootstrap that combines:
- Package-bundled PCM/PWF artifacts and catalog
- Template for structure
- CLI for orchestration

**Pros:** Deterministic (package), structured (template), usable (CLI).  
**Cons:** More complex than any single model. Requires clear layering.

---

## 7. Chosen Architecture

**Model 5 (Hybrid — Package + Template + CLI)** is selected as the distribution architecture.

The rationale: Package provides determinism and offline capability (Goals 1, 5), template provides structure (Goal 2), CLI provides UX (Goal 3). Together they satisfy all six goals while preserving adapter boundary and source-of-truth separation.

### 7.1 Core Distribution Source (R1 Finding #3)

**Chosen model: Package-bundled exact artifacts.**

`npx pcm init` obtains PCM/PWF specification artifacts from the installed npm package. The package contains exact copies of:

- `docs/PCM.md` (canonical PCM specification)
- `docs/PWF.md` (canonical PWF specification)
- `docs/CONFORMANCE.md` (conformance criteria)
- `docs/ADAPTER-MODEL.md` (adapter capability contract)

**Why package-bundled:**
- Least fragile — no network dependency for core artifacts
- Deterministic — same package version produces same artifacts
- Version-pinned — package version controls which PCM/PWF version is installed
- Offline-capable — works without network after first `npm install`
- Audit-friendly — package-lock.json records exact version used

**Why NOT external registry:**
- External registry is a single point of failure
- Network dependency breaks offline capability
- Registry availability ≠ artifact correctness
- Version drift between registry and local state

**Why NOT Git release artifacts:**
- Git clone is heavier than npm install
- Git availability is not guaranteed on all machines
- Release artifact format is less standardized than npm

### 7.2 Adapter Catalog Source (R1 Finding #4)

**Chosen model: Package-bundled catalog.**

The adapter catalog (`registry/pcm-adapters.json`) is bundled with the `pcm` npm package. It is NOT a repository-local file.

**Why package-bundled:**
- No repository-local registry to manage
- Version-pinned — catalog version matches package version
- Deterministic — same package version produces same catalog
- No external service dependency

**Why NOT repository-local registry:**
- Repository-local registry would require each project to manage its own adapter list
- Creates divergence between projects
- Requires governance to maintain
- Not necessary for MVP

**Why NOT external service:**
- Single point of failure
- Network dependency
- Availability ≠ correctness
- Privacy concerns

### 7.3 Architecture Diagram

```
PCM/PWF CANONICAL SEMANTIC SOURCE
  docs/PCM.md, docs/PWF.md
  (defines protocol/framework semantics)
  (distribution mechanism does NOT become authority)
            │
            ▼
DISTRIBUTION ARTIFACT
  pcm npm package v1.0
  (contains: PCM/PWF specs, adapter catalog,
   adapter templates, selection logic)
            │
            ▼
CLI / BOOTSTRAP
  npx pcm init
  (orchestrates bootstrap process)
            │
            ├─────────────────────────┐
            ▼                         ▼
ADAPTER CATALOG / DISCOVERY     ENVIRONMENT DETECTION
  registry/pcm-adapters.json      (observes: platform,
  (lists known adapters,            shell, tools)
   declared compatibility)         (env ≠ availability)
            │                         │
            ▼                         ▼
      ┌─────────────────────────────────┐
      │   DETERMINISTIC SELECTION       │
      │   catalog + env → adapter       │
      │   (tested first, then priority) │
      └───────────────┬─────────────────┘
                      │
                      ▼
            TARGET INSTALLATION
  ┌─────────────────────────────────────────────┐
  │  CORE (package-managed)                     │
  │  ├── pcm/docs/PCM.md                        │
  │  ├── pcm/docs/PWF.md                        │
  │  └── pcm/docs/CONFORMANCE.md                │
  │                                             │
  │  BINDING (adapter-specific)                 │
  │  ├── .opencode/skills/pcm-pwf/SKILL.md     │
  │  └── .opencode/rules/pcm-core.mdc          │
  │                                             │
  │  OPTIONAL TOOLING (generated)               │
  │  └── pcm/.pcm-manifest.json                 │
  │                                             │
  │  PROJECT-OWNED (NEVER package-managed)      │
  │  ├── docs/gates/*                           │
  │  ├── pcm/workstreams/*                      │
  │  └── any governance content                 │
  └─────────────────────────────────────────────┘

AUTHORITY          DISCOVERY           EXECUTION
(defines semantics) (finds candidates) (performs work)
PCM/PWF specs       Catalog lookup     CLI writes files
GATE decisions      Env detection      Adapter selection
Project governance  Trust policy       Bootstrap process
```

---

## 8. Layer Boundaries

The distribution architecture has four layers:

| Layer | Scope | Authority |
|-------|-------|-----------|
| **Semantic** | PCM/PWF specification | Defines protocol semantics |
| **Discovery** | Adapter catalog, environment observation | Finds candidates, observes environment |
| **Selection** | Deterministic adapter selection | Picks exactly one adapter |
| **Installation** | File writing, manifest creation | Writes to target repository |

### 8.1 Semantic Layer

Semantic layer:
- Provides the canonical PCM/PWF specification
- Defines invariants, primitives, roles, state model
- Does NOT detect environment
- Does NOT select adapters
- Does NOT write files

### 8.2 Discovery Layer

Discovery layer:
- Reads adapter catalog
- Observes the environment
- Reports what IS (platform, shell, versions)
- Does NOT match adapters to environments
- Does NOT decide suitability
- Does NOT write files

### 8.3 Selection Layer

Selection layer:
- Reads catalog
- Reads detection results
- Applies deterministic algorithm
- Returns exactly one adapter
- Does NOT detect environment
- Does NOT modify catalog
- Does NOT write files

### 8.4 Installation Layer

Installation layer:
- Writes files to target repository
- Creates manifest
- Reports what was written
- Does NOT detect environment
- Does NOT select adapters
- Does NOT define semantics

---

## 9. One-Line Bootstrap

### 9.1 The Command

```
npx pcm init
```

No arguments. No options. No configuration. Defaults to the current working repository.

Optional explicit arguments may exist (e.g., `npx pcm init /path/to/repo`), but zero-argument behavior is fully defined: bootstrap the current working directory.

### 9.2 What Happens

1. Package-bundled catalog is read
2. Environment is detected (observation only)
3. Adapter is selected (deterministic)
4. Core artifacts are written (PCM/PWF specs)
5. Binding/adapter files are written
6. Manifest is created
7. Result is printed

### 9.3 What the User Gets

A valid PCM-enabled repository with three layers:

**CORE (package-managed):**
- `pcm/docs/PCM.md` — Canonical PCM specification
- `pcm/docs/PWF.md` — Canonical PWF specification
- `pcm/docs/CONFORMANCE.md` — Conformance criteria

**BINDING (adapter-specific):**
- Adapter files for the selected tool (e.g., OpenCode skill/rules)

**OPTIONAL TOOLING (generated):**
- `pcm/.pcm-manifest.json` — Installation manifest

The user does NOT get:
- New commands beyond `npx pcm init`
- New tools beyond what the adapter provides
- Automatic workflow execution
- Automatic task management
- Manufactured governance history

A repository must not be considered PCM-enabled merely because an adapter file exists. PCM-enablement requires core artifacts AND binding AND (optionally) tooling.

### 9.4 Minimum Valid PCM Installation

A minimum valid PCM installation requires:

1. **Core specification artifacts** — `pcm/docs/PCM.md`, `pcm/docs/PWF.md` (package-managed)
2. **Binding** — At least one adapter file or explicit declaration of manual governance
3. **Manifest** — `pcm/.pcm-manifest.json` recording what was installed

Without core specification artifacts, adapter files alone do not constitute a PCM-enabled repository.

---

## 10. Bootstrap Lifecycle

### 10.1 States

| State | Meaning |
|-------|---------|
| **NOT-BOOTSTRAPPED** | No core artifacts or adapter files in target repo |
| **BOOTSTRAPPING** | `npx pcm init` in progress |
| **BOOTSTRAPPED** | Core artifacts, binding, and manifest present and valid |
| **PARTIAL** | Some artifacts present but incomplete |
| **INVALID** | Artifacts present but corrupted |

### 10.2 Transitions

```
NOT-BOOTSTRAPPED ──[npx pcm init]──► BOOTSTRAPPING
BOOTSTRAPPING ──[success]──► BOOTSTRAPPED
BOOTSTRAPPING ──[failure]──► NOT-BOOTSTRAPPED
BOOTSTRAPPED ──[npx pcm init]──► BOOTSTRAPPED (idempotent)
BOOTSTRAPPED ──[manual corruption]──► INVALID
INVALID ──[npx pcm init]──► BOOTSTRAPPED
PARTIAL ──[npx pcm init]──► BOOTSTRAPPED
```

### 10.3 Idempotency

Running `npx pcm init` on an already-bootstrapped repository:
1. Reads package-bundled catalog
2. Detects environment
3. Selects adapter
4. Checks if core artifacts and binding already exist
5. If valid → does nothing (idempotent)
6. If invalid → rewrites artifacts
7. Returns same result as first run

---

## 11. Repository State

### 11.1 What `npx pcm init` Reads

Before bootstrap, `npx pcm init` reads:

1. **Target repository** — Is it a git repo? What branch? What state?
2. **Platform** — What OS? What shell? What architecture?
3. **Existing tools** — Is OpenCode available? Copilot? Codex?
4. **Package catalog** — `registry/pcm-adapters.json` (bundled in npm package)

### 11.2 What `npx pcm init` Writes

After bootstrap, `npx pcm init` writes:

1. **Core artifacts** — `pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md`
2. **Binding files** — Adapter-specific files (e.g., `.opencode/skills/pcm-pwf/SKILL.md`)
3. **Manifest** — `pcm/.pcm-manifest.json` recording installation state
4. **No governance content** — `npx pcm init` does NOT write `docs/gates/*`, tasks, handoffs, or proposals

### 11.3 What `npx pcm init` Does NOT Write

`npx pcm init` does NOT write:
- Implementation code
- Test files
- Documentation beyond core specs and adapter rules
- Configuration beyond adapter rules
- New tools or commands
- Governance content (`docs/gates/*`, tasks, handoffs, proposals)
- Manufactured canonical history

---

## 12. Target-State Ownership

### 12.1 Four Ownership Categories

| Category | Description | Package-Managed? | Owner |
|----------|-------------|-------------------|-------|
| **Distributed Core** | PCM/PWF specification artifacts shipped with package | Yes | PCM project |
| **Binding / Adapter** | Tool-specific files written by bootstrap | No (adapter-specific) | Adapter author |
| **Tooling State** | Manifest, generated configuration | Yes (generated) | Distribution mechanism |
| **Governance State** | Gates, tasks, handoffs, proposals, canonical decisions | NEVER | Project (user-owned) |

### 12.2 Ownership Rules

**Distributed Core:**
- Package-managed — updated by `pcm update`
- Owned by PCM project
- Cannot be modified by adapter
- Cannot be modified by project (revert on update)

**Binding / Adapter:**
- Not package-managed — adapter-specific lifecycle
- Owned by adapter author
- Can be overwritten by `npx pcm init` (idempotent)
- Cannot violate PCM invariants (adapter boundary)

**Tooling State:**
- Generated by distribution mechanism
- Updated by `pcm update`
- Can be regenerated from core + binding
- Does not contain governance content

**Governance State (CRITICAL):**
- NEVER package-managed
- NEVER overwritten by `npx pcm init` or `pcm update`
- Project-owned — user-controlled
- Includes: `docs/gates/*`, `pcm/workstreams/*`, tasks, handoffs, proposals, canonical decisions
- Must survive distribution updates intact

### 12.3 Ownership Detection (R1 Finding #11)

Ownership is determined by **declared relationship**, not incidental tool presence.

| Test | Result | Ownership |
|------|--------|-----------|
| `docs/PCM.md` exists AND contains canonical PCM content | Declares PCM relationship | **pcm** |
| `docs/registry/pcm-adapters.json` exists | Declares adapter catalog | **pcm** |
| Repository name matches adapter pattern (e.g., `pcm-pwf-*`) | Declares adapter role | **adapter** |
| `pcm/.pcm-manifest.json` exists | Declares prior bootstrap | **bootstrapped** |
| None of the above | No declared relationship | **unknown** |

**What does NOT determine ownership:**
- `.opencode/` exists → does NOT mean "shared"
- `.cursor/` exists → does NOT mean "shared"
- Any tool directory exists → does NOT mean "shared"

Tool presence is environment observation, not repository ownership declaration.

---

## 13. Environment Detection

### 13.1 What Detection Does

Detection observes the environment. It answers:

1. What platform? (windows, linux, macos)
2. What shell? (powershell, bash, zsh)
3. What git version?
4. What tool is available? (opencode, copilot, codex, cursor, etc.)

### 13.2 What Detection Does NOT Do

Detection does NOT:

1. Select adapters
2. Match platform to adapter
3. Decide suitability
4. Determine trust
5. Modify anything

Detection informs. Catalog lists candidates. Policy decides trust. Selection picks one.

### 13.3 Detection ≠ Availability

**Critical distinction:** Detecting that OpenCode is installed does NOT mean the OpenCode adapter is available. Detection is an observation; adapter availability is a catalog lookup; adapter trust is a policy decision.

Example:

```
Detection: OpenCode is installed (capability: yes)
Catalog: OpenCode adapter listed for this platform
Trust policy: OpenCode adapter is trusted
Result: OpenCode adapter is AVAILABLE and TRUSTED
```

vs.

```
Detection: OpenCode is installed (capability: yes)
Catalog: OpenCode adapter listed for this platform
Trust policy: OpenCode adapter is NOT trusted
Result: OpenCode adapter is AVAILABLE but NOT TRUSTED
```

This separation prevents:
- False positives (tool installed but adapter not registered)
- False negatives (adapter available but tool not detected)
- Trust assumptions (adapter registered ≠ adapter trusted)

---

## 14. Adapter Discovery

### 14.1 How Adapters Are Discovered

Adapters are discovered through the package-bundled catalog. The catalog is the only source for adapter existence and declared compatibility.

### 14.2 Discovery Process

1. Read package-bundled catalog
2. Filter adapters by:
   - Platform match (windows/linux/macos)
   - Shell match (powershell/bash/zsh)
   - Tested status (tested/untested)
3. If multiple adapters match → apply selection algorithm (Section 17)
4. If no adapters match → use generic adapter (Section 16)

### 14.3 Discovery ≠ Selection ≠ Trust

Discovery finds all candidates. Trust policy filters to trusted candidates. Selection picks exactly one. These are separate steps.

---

## 15. Adapter Catalog

### 15.1 Catalog Location

Bundled in the `pcm` npm package at `registry/pcm-adapters.json`. NOT a repository-local file.

### 15.2 Catalog Structure

```json
{
  "version": "1.0",
  "defaultAdapter": "generic",
  "adapters": [
    {
      "id": "opencode",
      "name": "OpenCode Adapter",
      "repo": "redsonvietnam/pcm-pwf-opencode",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "tested": true,
      "priority": 1,
      "origin": "independently-distributed"
    },
    {
      "id": "copilot",
      "name": "GitHub Copilot Adapter",
      "repo": "redsonvietnam/pcm-pwf-copilot",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "tested": true,
      "priority": 2,
      "origin": "independently-distributed"
    },
    {
      "id": "codex",
      "name": "Codex Adapter",
      "repo": "redsonvietnam/pcm-pwf-codex",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "tested": false,
      "priority": 3,
      "origin": "independently-distributed"
    },
    {
      "id": "generic",
      "name": "Generic Adapter",
      "repo": null,
      "platforms": ["*"],
      "shells": ["*"],
      "tested": true,
      "priority": 999,
      "origin": "built-in"
    }
  ]
}
```

### 15.3 Catalog Rules

1. Every adapter MUST be listed in the catalog to be discoverable
2. Adapters not in the catalog are not discoverable by `npx pcm init`
3. The `defaultAdapter` is used when no other adapter matches
4. `priority` determines selection order (lower = higher priority)
5. `tested` indicates whether the adapter has been validated on the listed platforms
6. `origin` indicates how the adapter is distributed (built-in, independently-distributed, repo-local)
7. Catalog entry ≠ trust — catalog lists candidates; policy decides trust

---

## 16. Generic Adapter

### 16.1 Purpose

The generic adapter is the first-class fallback when:
1. No specific adapter matches the environment
2. The repository is unknown
3. The catalog is unavailable (should not happen with package-bundled catalog)

### 16.2 What the Generic Adapter Provides

The generic adapter provides:
- Core specification artifacts (`pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md`)
- Basic directory structure (`pcm/docs/`, `pcm/workstreams/`)
- Manifest creation

### 16.3 What the Generic Adapter Does NOT Provide

The generic adapter does NOT provide:
- Tool-specific commands
- Platform-specific configuration
- Adapter-specific workflows
- Integration with specific tools

### 16.4 Generic Adapter Behavior

```
When generic adapter is selected:
  1. Create pcm/docs/ directory
  2. Copy PCM.md, PWF.md, CONFORMANCE.md from package
  3. Create pcm/workstreams/ directory
  4. Create pcm/.pcm-manifest.json
  5. Do NOT create adapter-specific files
  6. Print: "Generic adapter applied. Configure your tools manually."
```

The generic adapter is always available and always safe. It is the safe fallback for any environment.

---

## 17. Deterministic Selection Algorithm

### 17.1 Algorithm

Given: Catalog C, Environment E, Trust Policy P

```
function selectAdapter(C, E, P):
  candidates = filter(C.adapters, a =>
    a.platforms.includes(E.platform) &&
    a.shells.includes(E.shell)
  )

  trusted = filter(candidates, a =>
    P.isTrusted(a.id)
  )

  if trusted is empty:
    return C.defaultAdapter  // generic

  sort trusted by:
    1. tested DESC (tested adapters first)
    2. priority ASC (lower priority number = higher priority)

  return trusted[0]
```

### 17.2 Determinism Guarantee

Given the same catalog C, environment E, and trust policy P, the algorithm ALWAYS returns the same adapter. There is no randomness, no heuristic, no fuzzy matching.

### 17.3 Selection Table

```
┌─────────────┬─────────────┬──────────────┬────────────────┐
│ Platform    │ Shell       │ Adapter      │ Confidence     │
├─────────────┼─────────────┼──────────────┼────────────────┤
│ windows     │ powershell  │ opencode     │ high           │
│ windows     │ bash        │ copilot      │ high           │
│ linux       │ bash        │ opencode     │ high           │
│ linux       │ zsh         │ opencode     │ high           │
│ macos       │ zsh         │ opencode     │ high           │
│ macos       │ bash        │ copilot      │ high           │
│ any         │ any         │ generic      │ fallback       │
└─────────────┴─────────────┴──────────────┴────────────────┘
```

---

## 18. Adapter Trust Model (R1 Finding #6)

### 18.1 Trust States

An adapter progresses through four trust states:

| State | Meaning | Can Be Used? |
|-------|---------|--------------|
| **DISCOVERABLE** | Adapter can be found in catalog | No — listed but not yet evaluated |
| **DECLARED COMPATIBLE** | Adapter metadata says it supports the environment | No — declared but not yet trusted |
| **TRUSTED** | Trust policy permits execution/use | Yes — can be selected |
| **INSTALLED** | Adapter is actually present in target repo | Yes — already in place |

### 18.2 Trust Transitions

```
DISCOVERABLE ──[catalog match]──► DECLARED COMPATIBLE
DECLARED COMPATIBLE ──[policy allows]──► TRUSTED
TRUSTED ──[npx pcm init selects]──► INSTALLED
```

### 18.3 Adapter Origin

| Origin | Meaning | Trust Basis |
|--------|---------|-------------|
| **built-in** | Shipped with PCM distribution (e.g., generic) | Package integrity |
| **independently-distributed** | Separate repository/package (e.g., opencode adapter) | Catalog entry + trust policy |
| **repo-local** | Adapter files already in target repository | Project governance |

### 18.4 Trust Rules

1. Catalog entry ≠ trust. A catalog entry makes an adapter discoverable and declares compatibility. It does NOT make the adapter trusted.
2. Trust is determined by policy, not by catalog. The trust policy is a project-level governance decision.
3. The generic adapter is always trusted. It is built-in and requires no external trust evaluation.
4. Independently-distributed adapters require explicit trust. The trust policy must list which adapters are trusted.
5. Repo-local adapters are trusted by project governance. If the project has adapter files, the project has implicitly trusted them.

### 18.5 Trust Policy (Conceptual)

```json
{
  "trustedAdapters": ["opencode", "copilot", "generic"],
  "trustedOrigins": ["built-in", "independently-distributed"],
  "requireExplicitTrust": true
}
```

The trust policy is a project-level concern, not a distribution mechanism concern. The distribution mechanism reads the trust policy; it does not define it.

---

## 19. `npx pcm init` Semantics (R1 Finding #7)

### 19.1 What Bootstrap Produces

A valid bootstrap produces three layers:

```
CORE + BINDING + OPTIONAL TOOLING
```

**CORE:**
- `pcm/docs/PCM.md` — Canonical PCM specification (package-managed)
- `pcm/docs/PWF.md` — Canonical PWF specification (package-managed)
- `pcm/docs/CONFORMANCE.md` — Conformance criteria (package-managed)

**BINDING:**
- Adapter-specific files (e.g., `.opencode/skills/pcm-pwf/SKILL.md`)
- Tool integration rules (e.g., `.opencode/rules/pcm-core.mdc`)

**OPTIONAL TOOLING:**
- `pcm/.pcm-manifest.json` — Installation manifest

### 19.2 What Bootstrap Does NOT Produce

- Governance content (`docs/gates/*`, tasks, handoffs, proposals)
- Manufactured canonical history
- New commands beyond `npx pcm init`
- New tools beyond what the adapter provides

### 19.3 Valid PCM-Enabled State

A repository is PCM-enabled if and only if:

1. Core specification artifacts exist (`pcm/docs/PCM.md`, `pcm/docs/PWF.md`)
2. Binding exists (adapter files OR explicit manual governance declaration)
3. Manifest exists (`pcm/.pcm-manifest.json`)

A repository with only adapter files but no core artifacts is NOT PCM-enabled.

---

## 20. Target-State Ownership (R1 Finding #8)

### 20.1 Distributed Core

| Property | Value |
|----------|-------|
| Package-managed? | Yes |
| Owner | PCM project |
| Updated by | `pcm update` |
| Can project modify? | No (revert on update) |
| Contains | PCM/PWF specification artifacts |

### 20.2 Binding / Adapter State

| Property | Value |
|----------|-------|
| Package-managed? | No (adapter-specific) |
| Owner | Adapter author |
| Updated by | `npx pcm init` (idempotent) or adapter update |
| Can project modify? | Yes (but may break adapter) |
| Contains | Tool-specific integration files |

### 20.3 Tooling State

| Property | Value |
|----------|-------|
| Package-managed? | Yes (generated) |
| Owner | Distribution mechanism |
| Updated by | `pcm update` |
| Can project modify? | No (regenerated on update) |
| Contains | Manifest, generated configuration |

### 20.4 Governance State (CRITICAL)

| Property | Value |
|----------|-------|
| Package-managed? | NEVER |
| Owner | Project (user-owned) |
| Updated by | Project governance only |
| Can distribution modify? | NEVER |
| Contains | `docs/gates/*`, tasks, handoffs, proposals, canonical decisions |

**Distribution mechanism MUST NEVER:**
- Overwrite `docs/gates/*`
- Overwrite `pcm/workstreams/*`
- Overwrite tasks, handoffs, or proposals
- Manufacture canonical governance history
- Silently modify governance content

---

## 21. Update Semantics (R1 Finding #9)

### 21.1 What `pcm update` May Update

`pcm update` may update only:

1. **Package-managed core artifacts** — `pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md`
2. **Generated tooling** — `pcm/.pcm-manifest.json`

### 21.2 What `pcm update` MUST NOT Silently Overwrite

`pcm update` MUST NOT silently overwrite:

1. **Gates** — `docs/gates/*`
2. **Tasks** — Any task records
3. **Handoffs** — Any handoff records
4. **Canonical state** — Any governance content
5. **User-owned adapter configuration** — Adapter files modified by the user
6. **Project-owned governance content** — Any content owned by the project

### 21.3 Conflict Detection

If package-managed files were locally modified, `pcm update` must:

1. **Detect** the local modification
2. **Report** the conflict clearly
3. **NOT silently destroy** user changes
4. **Provide** resolution options (e.g., merge, overwrite, skip)

### 21.4 Update Rules Summary

```
pcm update MAY:
  ✓ Update pcm/docs/PCM.md (if package-managed)
  ✓ Update pcm/docs/PWF.md (if package-managed)
  ✓ Update pcm/docs/CONFORMANCE.md (if package-managed)
  ✓ Regenerate pcm/.pcm-manifest.json

pcm update MUST NOT:
  ✗ Overwrite docs/gates/*
  ✗ Overwrite pcm/workstreams/*
  ✗ Overwrite tasks, handoffs, proposals
  ✗ Silently destroy local modifications
  ✗ Manufacture governance history
```

---

## 22. Unknown-Repository Lifecycle (R1 Finding #10)

### 22.1 Lifecycle Steps

```
OBSERVE
  │  Detect platform, shell, tools (observation only)
  │  env ≠ availability
  ▼
DISCOVER
  │  Read catalog, find candidates
  │  Filter by platform/shell match
  ▼
EVALUATE TRUST
  │  Check trust policy
  │  Is candidate trusted?
  ▼
NO TRUSTED SPECIALIZED ADAPTER?
  │  Fall back to generic adapter
  │  Generic is always trusted
  ▼
GENERIC ADAPTER
  │  Select generic adapter
  │  Always available, always safe
  ▼
INSTALL CORE
  │  Write pcm/docs/PCM.md
  │  Write pcm/docs/PWF.md
  │  Write pcm/docs/CONFORMANCE.md
  ▼
BIND
  │  Write adapter files (generic: none)
  │  Write manifest
  ▼
VALID PCM-ENABLED REPOSITORY
     Core + Binding + Manifest
     Ready for governance
```

### 22.2 Environment Detection Must Never Imply Adapter Availability

Language/platform/tool detection is observation only. The following is NOT a valid inference:

```
INVALID: "OpenCode is installed → use OpenCode adapter"
VALID:   "OpenCode is installed → check catalog → check trust → select adapter"
```

### 22.3 Unknown Repository Example

Machine C encounters repo Z (never seen before):

```
$ npx pcm init repo-Z

1. Reading catalog: registry/pcm-adapters.json (bundled in package)
2. Detecting environment:
   - Platform: windows
   - Shell: powershell
   - Git: 2.45.0
   - OpenCode: available (observation)
3. Discovering adapters:
   - Catalog match: opencode (platform=windows, shell=powershell)
   - Declared compatible: YES
4. Evaluating trust:
   - Trust policy: opencode is trusted
   - Trust state: TRUSTED
5. Selecting adapter:
   - Deterministic selection: opencode (tested=true, priority=1)
6. Idempotency check:
   - pcm/.pcm-manifest.json: NOT FOUND
   - Bootstrap required: YES
7. Installing core:
   - pcm/docs/PCM.md (package-managed)
   - pcm/docs/PWF.md (package-managed)
   - pcm/docs/CONFORMANCE.md (package-managed)
8. Binding:
   - .opencode/skills/pcm-pwf/SKILL.md (adapter)
   - .opencode/rules/pcm-core.mdc (adapter)
9. Creating manifest:
   - pcm/.pcm-manifest.json
10. Done. Adapter: opencode. Files written: 6.
```

---

## 23. Identity / Manifest (R1 Finding #12)

### 23.1 Manifest Purpose

The manifest (`pcm/.pcm-manifest.json`) is one authoritative installed-state record. It answers:

- What PCM version is installed
- What distribution version installed it
- What binding/adapter is selected
- What adapter origin (built-in, independently-distributed, repo-local)
- What files were written by the distribution mechanism
- What initialization state (bootstrapped, partial, invalid)

### 23.2 Manifest Structure

```json
{
  "pcmVersion": "1.0",
  "distributionVersion": "1.0.0",
  "initializedAt": "2026-09-07T00:00:00Z",
  "adapter": {
    "id": "opencode",
    "origin": "independently-distributed",
    "version": "1.0.0"
  },
  "core": {
    "pcm": "pcm/docs/PCM.md",
    "pwf": "pcm/docs/PWF.md",
    "conformance": "pcm/docs/CONFORMANCE.md"
  },
  "binding": [
    ".opencode/skills/pcm-pwf/SKILL.md",
    ".opencode/rules/pcm-core.mdc"
  ],
  "managedFiles": [
    "pcm/docs/PCM.md",
    "pcm/docs/PWF.md",
    "pcm/docs/CONFORMANCE.md",
    ".opencode/skills/pcm-pwf/SKILL.md",
    ".opencode/rules/pcm-core.mdc",
    "pcm/.pcm-manifest.json"
  ],
  "state": "bootstrapped"
}
```

### 23.3 Manifest Rules

1. Manifest is created by `npx pcm init`
2. Manifest is updated by `pcm update`
3. Manifest is NOT project-owned governance content
4. Manifest is inspectable locally (no external dependency)
5. Manifest records file provenance for distribution-managed files
6. Manifest does NOT record governance content (`docs/gates/*`, tasks, handoffs)

---

## 24. Gate State Out of Package Distribution (R1 Finding #13)

### 24.1 What Distribution Does NOT Package

Distribution mechanism does NOT package or synthesize:

- `docs/gates/*` — Gate records are project-owned
- `docs/gates/PCM-GATE-01.md` — This file exists in the PCM project but is NOT distributed to target repositories
- Tasks, handoffs, proposals — These are project governance content
- Canonical decisions — These are project governance content
- Manufactured governance history — Distribution does not create fake history

### 24.2 What Distribution DOES Package

Distribution packages only:

- PCM/PWF specification artifacts (core semantics)
- Adapter catalog (discovery)
- Adapter templates (binding)
- Selection logic (deterministic)
- Manifest (installed state)

### 24.3 Separation Rule

```
Distribution installs:
  ✓ Framework (PCM/PWF specs)
  ✓ Binding (adapter files)
  ✓ Optional tooling (manifest)

Distribution does NOT install:
  ✗ Governance history
  ✗ Gate records
  ✗ Tasks, handoffs, proposals
  ✗ Canonical decisions
  ✗ Manufactured fake history
```

---

## 25. Preserve Core/Adapter Boundary (R1 Finding #14)

### 25.1 What Adapter MUST NOT Do

Based on `docs/ADAPTER-MODEL.md`, an adapter MUST NOT:

- Violate PCM invariants (PCM sections 7.1–7.6)
- Redefine PCM primitives (WORKSTREAM, TASK, HANDOFF, GATE)
- Redefine PCM roles (AUTHORITY, PROPOSER, OPERATOR, OBSERVER)
- Introduce self-approval paths
- Make canonical state ambiguous
- Change core semantics
- Become authority over PCM semantics
- Override GATE decisions

### 25.2 What Adapter MAY Do

An adapter MAY:

- Define specific formats for all capabilities
- Implement specific mechanisms
- Use specific technologies
- Add domain-specific behaviors (clearly separated from core)
- Optimize for specific contexts
- Provide tool-specific commands and workflows

### 25.3 Boundary Enforcement

The distribution mechanism enforces the boundary by:

1. Copying core artifacts verbatim (no adapter modification)
2. Writing adapter files separately (adapter-specific)
3. Recording provenance in manifest (which files are core, which are adapter)
4. Not allowing adapter files to overwrite core artifacts

---

## 26. Offline Considerations

### 26.1 What Requires Network

1. `npx` itself (first run, downloads PCM package)
2. Package installation (first run)

### 26.2 What Does NOT Require Network

1. `npx pcm init` (after package is installed)
2. Environment detection
3. Adapter selection
4. Writing adapter files
5. Manifest creation

### 26.3 Offline Mode

When offline (after package installation):
1. Catalog is read from package (local)
2. Environment detection proceeds normally
3. Adapter selection proceeds normally
4. Writing adapter files proceeds normally
5. Result: same as online mode (deterministic)

---

## 27. Portability

### 27.1 What Is Portable

1. Catalog format (JSON, standard)
2. Adapter file format (markdown, standard)
3. CLI interface (`npx pcm init`)
4. Selection algorithm (deterministic, no platform-specific logic)
5. Manifest format (JSON, standard)

### 27.2 What Is NOT Portable

1. Adapter-specific content (OpenCode-specific, Copilot-specific)
2. Platform-specific paths (windows vs linux)
3. Shell-specific commands (powershell vs bash)

### 27.3 Portability Guarantee

`npx pcm init` produces the same result on:
- Windows + PowerShell
- Linux + Bash
- macOS + Zsh

The adapter selection may differ, but the process is identical.

---

## 28. Failure Modes

### 28.1 Failure Mode Table

```
┌─────────────────────┬──────────────────┬───────────────────────────────────┐
│ Failure             │ Impact           │ Recovery                          │
├─────────────────────┼──────────────────┼───────────────────────────────────┤
│ Catalog corrupted   │ No adapter found │ Reinstall package                 │
│ Target repo read-only│ Cannot write    │ Check permissions                 │
│ No git installed    │ Detection fails  │ Install git (optional)            │
│ No adapter matches  │ Generic fallback │ Use generic adapter               │
│ Catalog empty       │ Generic fallback │ Use generic adapter               │
│ Package missing     │ Fatal error      │ npm install pcm                   │
│ Trust policy missing│ Generic fallback │ Use generic adapter               │
│ Local modification  │ Conflict report  │ pcm update reports conflict       │
└─────────────────────┴──────────────────┴───────────────────────────────────┘
```

### 28.2 Error Reporting

`npx pcm init` reports errors as:
1. Clear error message
2. Suggested recovery action
3. Exit code (0 = success, 1 = failure)

---

## 29. Future Extension Points

### 29.1 What May Change

1. **New adapters** — Add to catalog
2. **New platforms** — Update adapter platform list
3. **New shells** — Update adapter shell list
4. **New tools** — Create new adapter
5. **New trust policies** — Extend trust evaluation

### 29.2 What Will NOT Change

1. **Catalog format** — JSON is stable
2. **Selection algorithm** — Deterministic is stable
3. **Idempotency** — Repeated runs produce same result
4. **Generic adapter** — Always available as fallback
5. **Three-source-of-truth separation** — Semantic, catalog, installed state

### 29.3 Extension Process

To add a new adapter:
1. Create adapter repository
2. Add entry to package-bundled catalog
3. Test on target platforms
4. Update catalog with `tested: true`
5. Update trust policy to include new adapter

---

## 30. Open Questions

1. Should the catalog support version pinning? (Currently: no)
2. Should `npx pcm init` support custom catalogs? (Currently: no)
3. Should the generic adapter be optional? (Currently: always available)
4. Should adapter files be locked after bootstrap? (Currently: no)
5. Should the trust policy be per-repository or global? (Currently: per-repository)
6. Should the manifest include file checksums? (Currently: no)
7. Should `pcm update` support selective updates? (Currently: all-or-nothing)

---

## 31. Implementation Readiness (R1 Finding #17)

### Readiness Checklist

| Question | Answer |
|----------|--------|
| Can implementation determine where core artifacts come from? | **YES** — Package-bundled in npm package |
| Can implementation determine how adapters are discovered? | **YES** — Package-bundled catalog at `registry/pcm-adapters.json` |
| Can implementation distinguish discovery from trust? | **YES** — Discovery (catalog) ≠ Trust (policy) ≠ Selection (algorithm) |
| Can implementation determine minimum valid installation? | **YES** — Core specs + binding + manifest |
| Can implementation determine which files it owns? | **YES** — Manifest records `managedFiles` |
| Can implementation avoid overwriting governance state? | **YES** — Governance state is NEVER package-managed; update detects conflicts |
| Can implementation bootstrap an unknown repo using generic fallback? | **YES** — Generic adapter is always trusted, always available |
| Can implementation reproduce installed state deterministically? | **YES** — Same package version + same catalog + same env = same result |
| Can implementation identify the installed distribution/binding version? | **YES** — Manifest records `distributionVersion`, `adapter.id`, `adapter.version` |

### Readiness Result

**ALL ANSWERS ARE YES.**

The architecture is **IMPLEMENTATION-READY**.

---

## Appendix A: Adapter Decision Table

```
┌─────────────┬─────────────┬──────────────┬──────────────┐
│ Condition   │ Adapter     │ Confidence   │ Notes        │
├─────────────┼─────────────┼──────────────┼──────────────┤
│ OpenCode +  │ opencode    │ high         │              │
│ Windows     │             │              │              │
├─────────────┼─────────────┼──────────────┼──────────────┤
│ Copilot +   │ copilot     │ high         │              │
│ Windows     │             │              │              │
├─────────────┼─────────────┼──────────────┼──────────────┤
│ OpenCode +  │ opencode    │ high         │              │
│ Linux       │             │              │              │
├─────────────┼─────────────┼──────────────┼──────────────┤
│ OpenCode +  │ opencode    │ high         │              │
│ macOS       │             │              │              │
├─────────────┼─────────────┼──────────────┼──────────────┤
│ Unknown     │ generic     │ fallback     │ Always       │
│ environment │             │              │ trusted      │
└─────────────┴─────────────┴──────────────┴──────────────┘
```

## Appendix B: Ownership Table

```
┌──────────────┬──────────────────────┬──────────────────────────────────┐
│ Category     │ Example Repo         │ Bootstrap Behavior               │
├──────────────┼──────────────────────┼──────────────────────────────────┤
│ pcm          │ redsonvietnam/pcm    │ Use PCM docs; no adapter written │
│ adapter      │ pcm-pwf-opencode     │ Use adapter's own rules          │
│ bootstrapped │ any (with manifest)  │ Re-run init; check idempotency   │
│ unknown      │ random-repo          │ Generic adapter                  │
└──────────────┴──────────────────────┴──────────────────────────────────┘
```

## Appendix C: Compatibility Matrix

```
┌─────────────┬─────────────┬─────────────┬──────────────┐
│ Package     │ Adapter     │ Compatible  │ Notes        │
├─────────────┼─────────────┼─────────────┼──────────────┤
│ 1.0         │ opencode 1.0│ Yes         │              │
│ 1.0         │ opencode 0.9│ Yes         │ Fallback     │
│ 1.0         │ copilot 1.0 │ Yes         │              │
│ 1.0         │ codex 0.1   │ No          │ Untested     │
│ 2.0         │ opencode 1.0│ No          │ Incompatible │
└─────────────┴─────────────┴─────────────┴──────────────┘
```

## Appendix D: Failure/Recovery Table

```
┌─────────────────────┬──────────────────┬───────────────────────────────────┐
│ Failure             │ Impact           │ Recovery                          │
├─────────────────────┼──────────────────┼───────────────────────────────────┤
│ Catalog corrupted   │ No adapter found │ Reinstall package                 │
│ Target repo read-only│ Cannot write    │ Check permissions                 │
│ No git installed    │ Detection fails  │ Install git (optional)            │
│ No adapter matches  │ Generic fallback │ Use generic adapter               │
│ Catalog empty       │ Generic fallback │ Use generic adapter               │
│ Package missing     │ Fatal error      │ npm install pcm                   │
│ Trust policy missing│ Generic fallback │ Use generic adapter               │
│ Local modification  │ Conflict report  │ pcm update reports conflict       │
└─────────────────────┴──────────────────┴───────────────────────────────────┘
```

## Appendix E: Trust State Diagram

```
┌─────────────────┐
│  DISCOVERABLE   │  Adapter listed in catalog
└────────┬────────┘
         │ catalog match
         ▼
┌─────────────────────┐
│ DECLARED COMPATIBLE │  Metadata says env matches
└────────┬────────────┘
         │ policy allows
         ▼
┌─────────────────┐
│    TRUSTED      │  Policy permits use
└────────┬────────┘
         │ npx pcm init selects
         ▼
┌─────────────────┐
│    INSTALLED    │  Present in target repo
└─────────────────┘
```

---

**Authority:** This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.
