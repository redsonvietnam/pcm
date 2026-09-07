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

**What it is:** The authoritative list of known adapters, their declared platform compatibility, and their bundled artifact paths.

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
- What adapter version is installed
- What files were written by the distribution mechanism
- What files are project-owned governance content

**Reconstruction:** Any actor with access to the target repository can determine the installed state without external dependencies.

### 5.4 Separation Rules

| Concern | Semantic Source | Catalog Source | Installed State |
|---------|----------------|----------------|-----------------|
| PCM invariants | Defines | Does not define | Does not define |
| Adapter existence | Does not define | Lists | May contain |
| Adapter trust | Does not define | Does not decide | Policy decides |
| Adapter artifact | Does not define | Points to bundle | Records provenance |
| Governance state | Defines semantics | Does not define | Project-owned |
| File provenance | Does not define | Does not define | Manifest records |

---

## 6. Adapter Distribution Concepts

Four distinct concepts must not be collapsed:

### 6.1 Catalog Entry

**What it is:** A metadata record in the adapter catalog that declares an adapter exists, is compatible with certain environments, and requires certain runtime capabilities.

**Contains:** Adapter ID, name, platforms, shells, capability requirements (`requires`), tested status, priority, bundled artifact path.

**Does NOT contain:** Actual adapter files, trust decisions, installation state.

**Authority:** Discovery only. Makes the adapter findable. Does NOT make it usable.

### 6.2 Adapter Artifact

**What it is:** The actual files that, when written to a target repository, constitute the adapter binding. For the OpenCode adapter: `.opencode/skills/pcm-pwf/SKILL.md` and `.opencode/rules/pcm-core.mdc`.

**Location (MVP):** Bundled inside the `pcm` npm package under `adapters/<adapter-id>/`.

**Authority:** None. Adapter artifacts are implementation files, not authority sources.

### 6.3 Adapter Distribution Source

**What it is:** The mechanism by which adapter artifacts reach the `npx pcm init` process.

**MVP source:** The `pcm` npm package bundles adapter artifacts directly. No external fetch required.

**Future extension:** Independent adapter packages, Git release artifacts, or other distribution mechanisms. The architecture must not foreclose these, but MVP requires only the bundled path.

### 6.4 Target Binding

**What it is:** The adapter artifacts as they exist in the target repository after installation. The files on disk that the target tool (OpenCode, Copilot, etc.) actually reads.

**Location:** Tool-specific paths (e.g., `.opencode/skills/pcm-pwf/SKILL.md`).

**Authority:** None. Binding files are implementation files. They must not violate PCM invariants (per `docs/ADAPTER-MODEL.md`).

---

## 7. Chosen Distribution Model

**MODEL A: Package-Bundled Adapters** is selected for MVP.

### 7.1 Decision

Adapter implementations used by `npx pcm init` are bundled in the PCM npm distribution. All adapters listed in the catalog are `built-in` — their artifacts ship inside the package.

### 7.2 Implications

| Property | Value |
|----------|-------|
| Artifact source | `pcm` npm package, path `adapters/<adapter-id>/` |
| Network dependency | None (after `npm install`) |
| Offline bootstrap | Works |
| Version pinning | Package version controls adapter artifact version |
| Generic adapter | Always available, always trusted, always works |
| Trust evaluation | Package integrity is sufficient for all bundled adapters |

### 7.3 Why NOT Model B (Independently Distributed) for MVP

Model B (independently distributed adapters) requires:
- Artifact retrieval mechanism (network fetch)
- Integrity verification (checksums, signatures)
- Provenance tracking (exact source, version, hash)
- Offline fallback logic
- Complex trust evaluation per adapter

These are valid engineering concerns but add fragility and complexity beyond MVP scope. The architecture must not foreclose Model B — it can be added later by introducing an `artifactSource` field in the catalog.

### 7.4 Future Extension to Model B

The catalog structure supports future extension to independently-distributed adapters by adding:

```json
{
  "artifactSource": {
    "type": "npm",
    "package": "@pcm/adapter-opencode",
    "version": "^1.0.0"
  }
}
```

When `artifactSource` is absent, the adapter is bundled (Model A). When present, the adapter is fetched from the specified source (Model B). This preserves forward compatibility without requiring Model B implementation in MVP.

---

## 8. Architecture Diagram

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
   adapter artifacts [bundled], selection logic)
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
  (lists known adapters,            shell, tools,
   bundled artifact paths,           capabilities)
   capability requirements,         (env ≠ availability
   declared compatibility)           ≠ capability match)
            │                         │
            ▼                         ▼
      ┌─────────────────────────────────┐
      │   CAPABILITY CHECK              │
      │   adapter.requires satisfied    │
      │   by env.capabilities?          │
      └───────────────┬─────────────────┘
                      │
                      ▼
      ┌─────────────────────────────────┐
      │   DETERMINISTIC SELECTION       │
      │   catalog + env + capabilities  │
      │   → adapter                     │
      │   (tested first, then priority) │
      └───────────────┬─────────────────┘
                      │
                      ▼
            ARTIFACT RESOLUTION
      ┌─────────────────────────────────┐
      │   catalog.artifact → package    │
      │   path (bundled, MVP)           │
      │   read files from package       │
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
                    Capability check
```

---

## 9. Layer Boundaries

The distribution architecture has five layers:

| Layer | Scope | Authority |
|-------|-------|-----------|
| **Semantic** | PCM/PWF specification | Defines protocol semantics |
| **Discovery** | Adapter catalog, environment observation | Finds candidates, observes environment |
| **Selection** | Deterministic adapter selection | Picks exactly one adapter |
| **Resolution** | Artifact path resolution | Maps catalog entry to bundled files |
| **Installation** | File writing, manifest creation | Writes to target repository |

### 9.1 Semantic Layer

Semantic layer:
- Provides the canonical PCM/PWF specification
- Defines invariants, primitives, roles, state model
- Does NOT detect environment
- Does NOT select adapters
- Does NOT write files

### 9.2 Discovery Layer

Discovery layer:
- Reads adapter catalog
- Observes the environment
- Reports what IS (platform, shell, versions)
- Does NOT match adapters to environments
- Does NOT decide suitability
- Does NOT write files

### 9.3 Selection Layer

Selection layer:
- Reads catalog
- Reads detection results
- Applies deterministic algorithm
- Returns exactly one adapter
- Does NOT detect environment
- Does NOT modify catalog
- Does NOT write files

### 9.4 Resolution Layer

Resolution layer:
- Takes selected adapter catalog entry
- Resolves artifact path (bundled in package for MVP)
- Reads adapter files from package
- Returns file content for installation
- Does NOT detect environment
- Does NOT select adapters
- Does NOT write files to target

### 9.5 Installation Layer

Installation layer:
- Writes files to target repository
- Creates manifest
- Reports what was written
- Does NOT detect environment
- Does NOT select adapters
- Does NOT resolve artifacts
- Does NOT define semantics

---

## 10. One-Line Bootstrap

### 10.1 The Command

```
npx pcm init
```

No arguments. No options. No configuration. Defaults to the current working repository.

Optional explicit arguments may exist (e.g., `npx pcm init /path/to/repo`), but zero-argument behavior is fully defined: bootstrap the current working directory.

### 10.2 What Happens

1. Package-bundled catalog is read
2. Environment is detected (observation only)
3. Adapter is selected (deterministic)
4. Artifact is resolved (bundled path → file content)
5. Core artifacts are written (PCM/PWF specs)
6. Binding/adapter files are written
7. Manifest is created
8. Result is printed

### 10.3 What the User Gets

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

### 10.4 Minimum Valid PCM Installation

A minimum valid PCM installation requires:

1. **Core specification artifacts** — `pcm/docs/PCM.md`, `pcm/docs/PWF.md` (package-managed)
2. **Binding** — At least one adapter file or explicit declaration of manual governance
3. **Manifest** — `pcm/.pcm-manifest.json` recording what was installed

Without core specification artifacts, adapter files alone do not constitute a PCM-enabled repository.

---

## 11. Bootstrap Lifecycle

### 11.1 States

| State | Meaning |
|-------|---------|
| **NOT-BOOTSTRAPPED** | No core artifacts or adapter files in target repo |
| **BOOTSTRAPPING** | `npx pcm init` in progress |
| **BOOTSTRAPPED** | Core artifacts, binding, and manifest present and valid |
| **PARTIAL** | Some artifacts present but incomplete |
| **INVALID** | Artifacts present but corrupted |

### 11.2 Transitions

```
NOT-BOOTSTRAPPED ──[npx pcm init]──► BOOTSTRAPPING
BOOTSTRAPPING ──[success]──► BOOTSTRAPPED
BOOTSTRAPPING ──[failure]──► NOT-BOOTSTRAPPED
BOOTSTRAPPED ──[npx pcm init]──► BOOTSTRAPPED (idempotent)
BOOTSTRAPPED ──[manual corruption]──► INVALID
INVALID ──[npx pcm init]──► BOOTSTRAPPED
PARTIAL ──[npx pcm init]──► BOOTSTRAPPED
```

### 11.3 Idempotency

Running `npx pcm init` on an already-bootstrapped repository:
1. Reads package-bundled catalog
2. Detects environment
3. Selects adapter
4. Resolves artifact from package
5. Checks if core artifacts and binding already exist
6. If valid → does nothing (idempotent)
7. If invalid → rewrites artifacts
8. Returns same result as first run

---

## 12. Repository State

### 12.1 What `npx pcm init` Reads

Before bootstrap, `npx pcm init` reads:

1. **Target repository** — Is it a git repo? What branch? What state?
2. **Platform** — What OS? What shell? What architecture?
3. **Existing tools** — Is OpenCode available? Copilot? Codex?
4. **Package catalog** — `registry/pcm-adapters.json` (bundled in npm package)
5. **Package adapter artifacts** — `adapters/<adapter-id>/` (bundled in npm package)

### 12.2 What `npx pcm init` Writes

After bootstrap, `npx pcm init` writes:

1. **Core artifacts** — `pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md`
2. **Binding files** — Adapter-specific files (e.g., `.opencode/skills/pcm-pwf/SKILL.md`)
3. **Manifest** — `pcm/.pcm-manifest.json` recording installation state
4. **No governance content** — `npx pcm init` does NOT write `docs/gates/*`, tasks, handoffs, or proposals

### 12.3 What `npx pcm init` Does NOT Write

`npx pcm init` does NOT write:
- Implementation code
- Test files
- Documentation beyond core specs and adapter rules
- Configuration beyond adapter rules
- New tools or commands
- Governance content (`docs/gates/*`, tasks, handoffs, proposals)
- Manufactured canonical history

---

## 13. Target-State Ownership

### 13.1 Four Ownership Categories

| Category | Description | Package-Managed? | Owner |
|----------|-------------|-------------------|-------|
| **Distributed Core** | PCM/PWF specification artifacts shipped with package | Yes | PCM project |
| **Binding / Adapter** | Tool-specific files written by bootstrap | No (adapter-specific) | Adapter author |
| **Tooling State** | Manifest, generated configuration | Yes (generated) | Distribution mechanism |
| **Governance State** | Gates, tasks, handoffs, proposals, canonical decisions | NEVER | Project (user-owned) |

### 13.2 Ownership Rules

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

### 13.3 Ownership Detection

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

## 14. Environment Detection

### 14.1 What Detection Does

Detection observes the environment. It answers:

1. What platform? (windows, linux, macos)
2. What shell? (powershell, bash, zsh)
3. What git version?
4. What tool capabilities are present? (opencode, copilot, codex, cursor, etc.)

The result is an environment record containing: `platform`, `shell`, `gitVersion`, `capabilities` (map of capability names to presence).

### 14.2 What Detection Does NOT Do

Detection does NOT:

1. Select adapters
2. Match platform to adapter
3. Decide suitability
4. Determine trust
5. Modify anything

Detection informs. Catalog lists candidates. Policy decides trust. Selection picks one.

### 14.3 Detection ≠ Availability ≠ Capability Match

**Critical distinction:** Detecting that OpenCode is installed does NOT mean the OpenCode adapter is selectable. Three separate conditions must hold:

1. **Detection:** Tool is observed in the environment (observation)
2. **Availability:** Adapter is listed in the catalog for this platform/shell (discovery)
3. **Capability match:** Adapter's `requires` is satisfied by observed capabilities (compatibility)

Example:

```
Detection: OpenCode is installed (capability: yes)
Catalog: OpenCode adapter listed, requires {"opencode": "*"}
Capability match: YES (opencode present in environment)
Trust policy: OpenCode adapter is trusted
Result: OpenCode adapter is SELECTABLE
```

vs.

```
Detection: OpenCode is NOT installed (capability: no)
Catalog: OpenCode adapter listed, requires {"opencode": "*"}
Capability match: NO (opencode absent from environment)
Trust policy: OpenCode adapter is trusted
Result: OpenCode adapter is NOT SELECTABLE → falls to generic
```

This separation prevents:
- False positives (tool installed but adapter not registered)
- False negatives (adapter available but tool not detected)
- Capability mismatches (adapter registered but required tool absent)
- Trust assumptions (adapter registered ≠ adapter trusted)

---

## 15. Adapter Discovery

### 15.1 How Adapters Are Discovered

Adapters are discovered through the package-bundled catalog. The catalog is the only source for adapter existence and declared compatibility.

### 15.2 Discovery Process

1. Read package-bundled catalog
2. Filter adapters by:
   - Platform match (windows/linux/macos)
   - Shell match (powershell/bash/zsh)
   - Capability match (`requires` satisfied)
   - Tested status (tested/untested)
3. If multiple adapters match → apply selection algorithm (Section 18)
4. If no adapters match → use generic adapter (Section 17)

### 15.3 Discovery ≠ Selection ≠ Trust ≠ Resolution

Discovery finds all candidates that match platform, shell, AND `requires`. Trust policy filters to trusted candidates. Selection picks exactly one. Resolution maps the selection to bundled file content. These are separate steps.

---

## 16. Adapter Catalog

### 16.1 Catalog Location

Bundled in the `pcm` npm package at `registry/pcm-adapters.json`. NOT a repository-local file.

### 16.2 Catalog Structure

```json
{
  "version": "1.0",
  "defaultAdapter": "generic",
  "adapters": [
    {
      "id": "opencode",
      "name": "OpenCode Adapter",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "requires": { "opencode": "*" },
      "tested": true,
      "priority": 1,
      "artifact": "adapters/opencode"
    },
    {
      "id": "copilot",
      "name": "GitHub Copilot Adapter",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "requires": { "copilot": "*" },
      "tested": true,
      "priority": 2,
      "artifact": "adapters/copilot"
    },
    {
      "id": "codex",
      "name": "Codex Adapter",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "requires": { "codex": "*" },
      "tested": false,
      "priority": 3,
      "artifact": "adapters/codex"
    },
    {
      "id": "generic",
      "name": "Generic Adapter",
      "platforms": ["*"],
      "shells": ["*"],
      "requires": null,
      "tested": true,
      "priority": 999,
      "artifact": null
    }
  ]
}
```

### 16.3 Catalog Field Definitions

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `id` | string | yes | Unique adapter identifier |
| `name` | string | yes | Human-readable name |
| `platforms` | string[] | yes | Supported platforms (`["*"]` = all) |
| `shells` | string[] | yes | Supported shells (`["*"]` = all) |
| `requires` | object\|null | yes | Capability/tool requirements (`null` = technology-agnostic, no tool required) |
| `tested` | boolean | yes | Whether adapter has been validated on listed platforms |
| `priority` | number | yes | Selection order (lower = higher priority) |
| `artifact` | string\|null | yes | Relative path to bundled adapter files within package; `null` = generic (no binding files) |

### 16.4 Capability Requirements (`requires`)

The `requires` field declares what runtime capabilities the adapter needs to function. Each key is a capability name; each value MUST be `"*"` in MVP.

**MVP Semantics:**
- `null` — Adapter is technology-agnostic. No specific tool required. (Generic adapter.)
- `{}` (empty object) — Equivalent to `null`. No capabilities required.
- `{ "opencode": "*" }` — Requires OpenCode to be present in the environment.
- `{ "copilot": "*" }` — Requires GitHub Copilot to be present in the environment.

**MVP constraint:** All values MUST be `"*"`. Version constraints (e.g., `">=2.0"`) are NOT supported in MVP. The `capabilitiesSatisfied` function checks capability presence only — it does NOT compare versions.

**Future extension (post-MVP):** Version constraints may be added by changing values from `"*"` to semver strings (e.g., `">=2.0"`). This would require updating `capabilitiesSatisfied` to perform version comparison. The catalog schema and algorithm are forward-compatible with this change, but it is NOT part of MVP scope.

**Capability names** are identifiers for tools/runtimes that environment detection can observe. They are NOT PCM primitives. They are NOT adapter semantic capabilities. They are purely distribution-layer concerns for determining whether an adapter can bind to the observed environment.

**Relationship to ADAPTER-MODEL.md:** The capability contract in `docs/ADAPTER-MODEL.md` defines what semantic capabilities an adapter MUST provide (canonical-state observation, persistence, etc.). The `requires` field in the catalog defines what runtime tools the adapter needs to deliver those capabilities. These are complementary, not overlapping.

### 16.5 Catalog Rules

1. Every adapter MUST be listed in the catalog to be discoverable
2. Adapters not in the catalog are not discoverable by `npx pcm init`
3. The `defaultAdapter` is used when no other adapter matches
4. `priority` determines selection order (lower = higher priority)
5. `tested` indicates whether the adapter has been validated on the listed platforms
6. `artifact` points to the bundled path; `null` means the adapter provides no binding files (generic)
7. `requires` declares capability/tool requirements; `null` means technology-agnostic
8. Catalog entry ≠ trust — catalog lists candidates; policy decides trust
9. Catalog entry ≠ artifact — catalog is metadata; artifact is files
10. Catalog entry ≠ capability — catalog declares requirements; environment provides capabilities

### 16.6 What `repo` Meant and Why It Is Removed

Previous versions of the catalog included a `repo` field (e.g., `"repo": "redsonvietnam/pcm-pwf-opencode"`). This was ambiguous — it could mean source repository, artifact source, or distribution source.

For MVP with bundled adapters, `repo` is not needed. The `artifact` field provides the exact bundled path. The source repository of the adapter is reference metadata, not a distribution mechanism. If future versions need to reference source repositories, they can add a `sourceRepo` field as informational metadata without distribution semantics.

---

## 17. Generic Adapter

### 17.1 Purpose

The generic adapter is the first-class fallback when:
1. No specialized adapter matches the environment's capabilities
2. No specialized adapter matches the platform/shell
3. The repository is unknown
4. No trusted specialized adapter is available
5. The environment has no recognized tool capability

The generic adapter is technology-agnostic. It does NOT require any specific tool, runtime, or capability. Its `requires` is `null` in the catalog.

### 17.2 What the Generic Adapter Provides

The generic adapter provides:
- Core specification artifacts (`pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md`)
- Basic directory structure (`pcm/docs/`, `pcm/workstreams/`)
- Manifest creation

### 17.3 What the Generic Adapter Does NOT Provide

The generic adapter does NOT provide:
- Tool-specific commands
- Platform-specific configuration
- Adapter-specific workflows
- Integration with specific tools
- Binding files (`artifact` is `null` in catalog)

### 17.4 Generic Adapter Behavior

```
When generic adapter is selected:
  1. Create pcm/docs/ directory
  2. Copy PCM.md, PWF.md, CONFORMANCE.md from package
  3. Create pcm/workstreams/ directory
  4. Create pcm/.pcm-manifest.json
  5. Do NOT create adapter-specific files (artifact is null)
  6. Print: "Generic adapter applied. Configure your tools manually."
```

The generic adapter is always available, always trusted, and always safe. It is the safe fallback for any environment. It requires no external trust evaluation, no network access, and no additional dependencies.

### 17.5 Generic Adapter Guarantees

| Guarantee | Value |
|-----------|-------|
| Always available | Yes — bundled in package, no external dependency |
| Always trusted | Yes — package integrity is sufficient |
| Always capable | Yes — requires null, no tool dependency |
| Always works offline | Yes — no network required |
| Never requires trust policy | Yes — built-in trust |
| Provides binding files | No — artifact is null |
| Provides core artifacts | Yes — same as specialized adapters |

---

## 18. Deterministic Selection Algorithm

### 18.1 Algorithm

Given: Catalog C, Environment E, Trust Policy P

```
function selectAdapter(C, E, P):
  candidates = filter(C.adapters, a =>
    a.platforms.includes(E.platform) &&
    a.shells.includes(E.shell) &&
    capabilitiesSatisfied(a.requires, E.capabilities)
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

function capabilitiesSatisfied(requires, envCapabilities):
  if requires is null or empty:
    return true  // technology-agnostic, always satisfied
  for each [capability, versionReq] in requires:
    if capability not in envCapabilities:
      return false
    // MVP: value is always "*", presence check only
    // Future: version comparison against versionReq
  return true
```

### 18.2 Capability Compatibility

A specialized adapter is ONLY selectable if its `requires` is satisfied by the observed environment:

| Adapter | `requires` | Environment has OpenCode? | Environment has Copilot? | Capable? |
|---------|-----------|---------------------------|--------------------------|----------|
| opencode | `{"opencode": "*"}` | YES | — | **YES** |
| opencode | `{"opencode": "*"}` | NO | — | **NO** → falls to generic |
| copilot | `{"copilot": "*"}` | — | YES | **YES** |
| copilot | `{"copilot": "*"}` | — | NO | **NO** → falls to generic |
| generic | `null` | — | — | **YES** → always capable |

**Critical rule:** Selection MUST NEVER choose a specialized adapter solely because platform + shell match. Capability compatibility is a mandatory filter.

### 18.3 Determinism Guarantee

Given the same catalog C, environment E (including capabilities), and trust policy P, the algorithm ALWAYS returns the same adapter. There is no randomness, no heuristic, no fuzzy matching.

### 18.4 Selection Table

```
┌─────────────┬─────────────┬──────────────┬──────────────┬────────────────┐
│ Platform    │ Shell       │ Capability   │ Adapter      │ Confidence     │
├─────────────┼─────────────┼──────────────┼──────────────┼────────────────┤
│ windows     │ powershell  │ opencode     │ opencode     │ high           │
│ windows     │ bash        │ copilot      │ copilot      │ high           │
│ linux       │ bash        │ opencode     │ opencode     │ high           │
│ linux       │ zsh         │ opencode     │ opencode     │ high           │
│ macos       │ zsh         │ opencode     │ opencode     │ high           │
│ macos       │ bash        │ copilot      │ copilot      │ high           │
│ windows     │ powershell  │ (none)       │ generic      │ fallback       │
│ any         │ any         │ any          │ generic      │ fallback       │
└─────────────┴─────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 19. Artifact Resolution

### 19.1 What Artifact Resolution Does

After selection, the resolution layer maps the selected adapter catalog entry to actual file content. For MVP, this means reading bundled files from the npm package.

### 19.2 Resolution Process

```
function resolveArtifact(C, adapterId):
  entry = C.adapters.find(a => a.id === adapterId)

  if entry.artifact is null:
    return null  // generic adapter, no binding files

  artifactPath = join(packageRoot, entry.artifact)
  files = readDir(artifactPath)

  return files.map(f => ({
    path: targetPath(f),  // mapped to target repo layout
    content: readFile(join(artifactPath, f))
  }))
```

### 19.3 Resolution Rules

1. If `artifact` is `null` → no binding files (generic adapter)
2. If `artifact` is a path → read all files from that path in the package
3. File paths are mapped from package layout to target repo layout
4. Resolution is deterministic — same catalog entry → same files
5. Resolution is offline — no network fetch required

### 19.4 Resolution ≠ Trust

Resolution maps a catalog entry to files. It does NOT evaluate trust. Trust is evaluated before resolution in the lifecycle.

---

## 20. Adapter Trust Model

### 20.1 Trust States

An adapter progresses through six trust states:

| State | Meaning | Can Be Used? |
|-------|---------|--------------|
| **DISCOVERABLE** | Adapter can be found in catalog | No — listed but not yet evaluated |
| **DECLARED COMPATIBLE** | Adapter metadata says it supports the environment | No — declared but not yet trusted |
| **TRUST EVALUATED** | Trust policy has been consulted (after capability check passes) | Depends on policy result |
| **ARTIFACT RESOLVED** | Bundled files have been located in package | No — resolved but not yet installed |
| **TRUSTED** | Trust policy permits execution/use | Yes — can be selected and installed |
| **INSTALLED** | Adapter is actually present in target repo | Yes — already in place |

**Capability check** is NOT a trust state. It is a compatibility predicate that runs between DECLARED COMPATIBLE and TRUST EVALUATED. An adapter must pass capability check to be eligible for trust evaluation.

### 20.2 Trust Lifecycle

```
DISCOVERABLE
  │  catalog lists adapter
  ▼
DECLARED COMPATIBLE
  │  platform/shell match confirmed
  │
  ▼  [CAPABILITY CHECK]  adapter.requires satisfied by env.capabilities?
  │                       if NOT satisfied → skip adapter, try next candidate
  │
TRUST EVALUATED
  │  trust policy consulted
  │  if not trusted → fall back to generic
  ▼
ARTIFACT RESOLVED
  │  bundled files located in package
  │  if artifact is null → generic (no binding)
  ▼
TRUSTED
  │  policy permits, artifact available
  ▼
INSTALLED
     files written to target repository
```

### 20.3 Adapter Origin

For MVP, all adapters in the catalog are `built-in` — their artifacts are bundled in the PCM npm package.

| Origin | Meaning | Trust Basis |
|--------|---------|-------------|
| **built-in** | Shipped with PCM distribution | Package integrity |

Future versions may add:
| Origin | Meaning | Trust Basis |
|--------|---------|-------------|
| **independently-distributed** | Separate package/fetch required | Catalog entry + trust policy + integrity verification |
| **repo-local** | Adapter files already in target repository | Project governance |

### 20.4 Trust Rules

1. Catalog entry ≠ trust. A catalog entry makes an adapter discoverable and declares compatibility. It does NOT make the adapter trusted.
2. Trust is determined by policy, not by catalog. The trust policy is a project-level governance decision.
3. The generic adapter is always trusted. It is built-in and requires no external trust evaluation.
4. For MVP, all bundled adapters share package integrity as trust basis. If the package is trusted, its bundled adapters are trusted.
5. Repo-local adapters are trusted by project governance. If the project has adapter files, the project has implicitly trusted them.

### 20.5 Trust Policy (Conceptual)

```json
{
  "trustedAdapters": ["opencode", "copilot", "generic"],
  "trustedOrigins": ["built-in"],
  "requireExplicitTrust": true
}
```

The trust policy is a project-level concern, not a distribution mechanism concern. The distribution mechanism reads the trust policy; it does not define it.

---

## 21. `npx pcm init` Semantics

### 21.1 What Bootstrap Produces

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
- For generic adapter: no binding files

**OPTIONAL TOOLING:**
- `pcm/.pcm-manifest.json` — Installation manifest

### 21.2 What Bootstrap Does NOT Produce

- Governance content (`docs/gates/*`, tasks, handoffs, proposals)
- Manufactured canonical history
- New commands beyond `npx pcm init`
- New tools beyond what the adapter provides

### 21.3 Valid PCM-Enabled State

A repository is PCM-enabled if and only if:

1. Core specification artifacts exist (`pcm/docs/PCM.md`, `pcm/docs/PWF.md`)
2. Binding exists (adapter files OR explicit manual governance declaration)
3. Manifest exists (`pcm/.pcm-manifest.json`)

A repository with only adapter files but no core artifacts is NOT PCM-enabled.

---

## 22. Target-State Ownership

### 22.1 Distributed Core

| Property | Value |
|----------|-------|
| Package-managed? | Yes |
| Owner | PCM project |
| Updated by | `pcm update` |
| Can project modify? | No (revert on update) |
| Contains | PCM/PWF specification artifacts |

### 22.2 Binding / Adapter State

| Property | Value |
|----------|-------|
| Package-managed? | No (adapter-specific) |
| Owner | Adapter author |
| Updated by | `npx pcm init` (idempotent) or adapter update |
| Can project modify? | Yes (but may break adapter) |
| Contains | Tool-specific integration files |

### 22.3 Tooling State

| Property | Value |
|----------|-------|
| Package-managed? | Yes (generated) |
| Owner | Distribution mechanism |
| Updated by | `pcm update` |
| Can project modify? | No (regenerated on update) |
| Contains | Manifest, generated configuration |

### 22.4 Governance State (CRITICAL)

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

## 23. Update Semantics

### 23.1 What `pcm update` May Update

`pcm update` may update only:

1. **Package-managed core artifacts** — `pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md`
2. **Generated tooling** — `pcm/.pcm-manifest.json`
3. **Bundled adapter artifacts** — Adapter files from new package version (if adapter version changed)

### 23.2 What `pcm update` MUST NOT Silently Overwrite

`pcm update` MUST NOT silently overwrite:

1. **Gates** — `docs/gates/*`
2. **Tasks** — Any task records
3. **Handoffs** — Any handoff records
4. **Canonical state** — Any governance content
5. **User-owned adapter configuration** — Adapter files modified by the user
6. **Project-owned governance content** — Any content owned by the project

### 23.3 Conflict Detection

If package-managed files were locally modified, `pcm update` must:

1. **Detect** the local modification
2. **Report** the conflict clearly
3. **NOT silently destroy** user changes
4. **Provide** resolution options (e.g., merge, overwrite, skip)

### 23.4 Update Rules Summary

```
pcm update MAY:
  ✓ Update pcm/docs/PCM.md (if package-managed)
  ✓ Update pcm/docs/PWF.md (if package-managed)
  ✓ Update pcm/docs/CONFORMANCE.md (if package-managed)
  ✓ Update bundled adapter artifacts (if package version changed)
  ✓ Regenerate pcm/.pcm-manifest.json

pcm update MUST NOT:
  ✗ Overwrite docs/gates/*
  ✗ Overwrite pcm/workstreams/*
  ✗ Overwrite tasks, handoffs, proposals
  ✗ Silently destroy local modifications
  ✗ Manufacture governance history
```

---

## 24. Unknown-Repository Lifecycle

### 24.1 Lifecycle Steps

```
OBSERVE
  │  Detect platform, shell, tools, capabilities (observation only)
  │  env ≠ availability ≠ capability match
  ▼
DISCOVER
  │  Read catalog, find candidates
  │  Filter by platform/shell match
  ▼
CAPABILITY CHECK (predicate)
  │  For each candidate: are adapter's requires satisfied?
  │  If NOT satisfied → skip, try next candidate
  │  This is a FILTER, not a lifecycle state
  ▼
EVALUATE TRUST
  │  Check trust policy (only for capable candidates)
  │  Is candidate trusted?
  ▼
NO TRUSTED SPECIALIZED ADAPTER?
  │  Fall back to generic adapter
  │  Generic is always trusted
  ▼
RESOLVE ARTIFACT
  │  Read bundled files from package
  │  If artifact is null → generic (no binding)
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

### 24.2 Environment Detection Must Never Imply Adapter Availability

Language/platform/tool detection is observation only. The following is NOT a valid inference:

```
INVALID: "OpenCode is installed → use OpenCode adapter"
VALID:   "OpenCode is installed → check catalog → check requires → check trust → select adapter"
```

### 24.3 Unknown Repository Example

Machine C encounters repo Z (never seen before):

```
$ npx pcm init repo-Z

1. Reading catalog: registry/pcm-adapters.json (bundled in package)
2. Detecting environment:
   - Platform: windows
   - Shell: powershell
   - Git: 2.45.0
   - Capabilities: { "opencode": "present" } (observation)
3. Discovering adapters:
   - Catalog match: opencode (platform=windows, shell=powershell)
   - Capability match: opencode requires {"opencode": "*"} → SATISFIED
   - Declared compatible: YES
4. Evaluating trust:
   - Trust policy: opencode is trusted
   - Trust state: TRUSTED
5. Selecting adapter:
   - Deterministic selection: opencode (tested=true, priority=1)
6. Resolving artifact:
   - Catalog entry artifact: "adapters/opencode"
   - Reading bundled files from package:
     - adapters/opencode/SKILL.md
     - adapters/opencode/pcm-core.mdc
7. Idempotency check:
   - pcm/.pcm-manifest.json: NOT FOUND
   - Bootstrap required: YES
8. Installing core:
   - pcm/docs/PCM.md (package-managed)
   - pcm/docs/PWF.md (package-managed)
   - pcm/docs/CONFORMANCE.md (package-managed)
9. Binding:
   - .opencode/skills/pcm-pwf/SKILL.md (from bundled artifact)
   - .opencode/rules/pcm-core.mdc (from bundled artifact)
10. Creating manifest:
    - pcm/.pcm-manifest.json
11. Done. Adapter: opencode. Files written: 6.
```

**Capability-absent example:**

```
$ npx pcm init repo-Z  (on machine without OpenCode)

1. Reading catalog: registry/pcm-adapters.json (bundled in package)
2. Detecting environment:
   - Platform: windows
   - Shell: powershell
   - Git: 2.45.0
   - Capabilities: {} (no tools detected)
3. Discovering adapters:
   - Catalog match: opencode (platform=windows, shell=powershell)
   - Capability match: opencode requires {"opencode": "*"} → NOT SATISFIED
   - Catalog match: copilot (platform=windows, shell=powershell)
   - Capability match: copilot requires {"copilot": "*"} → NOT SATISFIED
   - No capable specialized adapter found
4. Falling back to generic adapter
5. Selecting adapter: generic (always capable, always trusted)
6. Resolving artifact: artifact is null (generic, no binding files)
7. Installing core:
   - pcm/docs/PCM.md
   - pcm/docs/PWF.md
   - pcm/docs/CONFORMANCE.md
8. Binding: (none — generic adapter provides no binding files)
9. Creating manifest:
   - pcm/.pcm-manifest.json
10. Done. Adapter: generic. Files written: 4.
11. Print: "Generic adapter applied. Configure your tools manually."
```

---

## 25. Identity / Manifest

### 25.1 Manifest Purpose

The manifest (`pcm/.pcm-manifest.json`) is one authoritative installed-state record. It answers:

- What PCM version is installed
- What distribution version installed it
- What binding/adapter is selected
- What adapter version is installed
- What adapter origin (built-in)
- What files were written by the distribution mechanism
- What initialization state (bootstrapped, partial, invalid)

### 25.2 Manifest Structure

```json
{
  "pcmVersion": "1.0",
  "distributionVersion": "1.0.0",
  "initializedAt": "2026-09-07T00:00:00Z",
  "adapter": {
    "id": "opencode",
    "origin": "built-in",
    "artifactPath": "adapters/opencode",
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

### 25.3 Manifest Rules

1. Manifest is created by `npx pcm init`
2. Manifest is updated by `pcm update`
3. Manifest is NOT project-owned governance content
4. Manifest is inspectable locally (no external dependency)
5. Manifest records file provenance for distribution-managed files
6. Manifest records adapter origin and artifact path
7. Manifest does NOT record governance content (`docs/gates/*`, tasks, handoffs)

---

## 26. Gate State Out of Package Distribution

### 26.1 What Distribution Does NOT Package

Distribution mechanism does NOT package or synthesize:

- `docs/gates/*` — Gate records are project-owned
- `docs/gates/PCM-GATE-01.md` — This file exists in the PCM project but is NOT distributed to target repositories
- Tasks, handoffs, proposals — These are project governance content
- Canonical decisions — These are project governance content
- Manufactured governance history — Distribution does not create fake history

### 26.2 What Distribution DOES Package

Distribution packages only:

- PCM/PWF specification artifacts (core semantics)
- Adapter catalog (discovery)
- Adapter artifacts (bundled binding files)
- Selection logic (deterministic)
- Manifest (installed state)

### 26.3 Separation Rule

```
Distribution installs:
  ✓ Framework (PCM/PWF specs)
  ✓ Binding (adapter files from bundled artifacts)
  ✓ Optional tooling (manifest)

Distribution does NOT install:
  ✗ Governance history
  ✗ Gate records
  ✗ Tasks, handoffs, proposals
  ✗ Canonical decisions
  ✗ Manufactured fake history
```

---

## 27. Preserve Core/Adapter Boundary

### 27.1 What Adapter MUST NOT Do

Based on `docs/ADAPTER-MODEL.md`, an adapter MUST NOT:

- Violate PCM invariants (PCM sections 7.1–7.6)
- Redefine PCM primitives (WORKSTREAM, TASK, HANDOFF, GATE)
- Redefine PCM roles (AUTHORITY, PROPOSER, OPERATOR, OBSERVER)
- Introduce self-approval paths
- Make canonical state ambiguous
- Change core semantics
- Become authority over PCM semantics
- Override GATE decisions

### 27.2 What Adapter MAY Do

An adapter MAY:

- Define specific formats for all capabilities
- Implement specific mechanisms
- Use specific technologies
- Add domain-specific behaviors (clearly separated from core)
- Optimize for specific contexts
- Provide tool-specific commands and workflows

### 27.3 Boundary Enforcement

The distribution mechanism enforces the boundary by:

1. Copying core artifacts verbatim (no adapter modification)
2. Writing adapter files separately (adapter-specific)
3. Recording provenance in manifest (which files are core, which are adapter)
4. Not allowing adapter files to overwrite core artifacts

---

## 28. Offline Considerations

### 28.1 What Requires Network

1. `npx` itself (first run, downloads PCM package)
2. Package installation (first run)

### 28.2 What Does NOT Require Network

1. `npx pcm init` (after package is installed)
2. Environment detection
3. Adapter selection
4. Artifact resolution (bundled in package)
5. Writing adapter files
6. Manifest creation

### 28.3 Offline Mode

When offline (after package installation):
1. Catalog is read from package (local)
2. Environment detection proceeds normally
3. Adapter selection proceeds normally
4. Artifact resolution reads bundled files (local)
5. Writing adapter files proceeds normally
6. Result: same as online mode (deterministic)

---

## 29. Portability

### 29.1 What Is Portable

1. Catalog format (JSON, standard)
2. Adapter file format (markdown, standard)
3. CLI interface (`npx pcm init`)
4. Selection algorithm (deterministic, no platform-specific logic)
5. Manifest format (JSON, standard)
6. Artifact resolution (bundled, no platform-specific logic)

### 29.2 What Is NOT Portable

1. Adapter-specific content (OpenCode-specific, Copilot-specific)
2. Platform-specific paths (windows vs linux)
3. Shell-specific commands (powershell vs bash)

### 29.3 Portability Guarantee

`npx pcm init` produces the same result on:
- Windows + PowerShell
- Linux + Bash
- macOS + Zsh

The adapter selection may differ, but the process is identical.

---

## 30. Failure Modes

### 30.1 Failure Mode Table

```
┌─────────────────────┬──────────────────┬───────────────────────────────────┐
│ Failure             │ Impact           │ Recovery                          │
├─────────────────────┼──────────────────┼───────────────────────────────────┤
│ Catalog corrupted   │ No adapter found │ Reinstall package                 │
│ Target repo read-only│ Cannot write    │ Check permissions                 │
│ No git installed    │ Detection fails  │ Install git (optional)            │
│ No adapter matches  │ Generic fallback │ Use generic adapter               │
│ No capable adapter  │ Generic fallback │ Use generic adapter               │
│ Catalog empty       │ Generic fallback │ Use generic adapter               │
│ Package missing     │ Fatal error      │ npm install pcm                   │
│ Trust policy missing│ Generic fallback │ Use generic adapter               │
│ Artifact missing    │ Generic fallback │ Use generic adapter               │
│ Local modification  │ Conflict report  │ pcm update reports conflict       │
└─────────────────────┴──────────────────┴───────────────────────────────────┘
```

### 30.2 Error Reporting

`npx pcm init` reports errors as:
1. Clear error message
2. Suggested recovery action
3. Exit code (0 = success, 1 = failure)

---

## 31. Future Extension Points

### 31.1 What May Change

1. **New adapters** — Add to catalog with bundled artifacts
2. **New platforms** — Update adapter platform list
3. **New shells** — Update adapter shell list
4. **New tools** — Create new adapter
5. **New trust policies** — Extend trust evaluation
6. **Independent distribution** — Add `artifactSource` field for Model B

### 31.2 What Will NOT Change

1. **Catalog format** — JSON is stable
2. **Selection algorithm** — Deterministic is stable
3. **Idempotency** — Repeated runs produce same result
4. **Generic adapter** — Always available as fallback
5. **Three-source-of-truth separation** — Semantic, catalog, installed state

### 31.3 Extension Process

To add a new adapter:
1. Create adapter files
2. Bundle in package under `adapters/<adapter-id>/`
3. Add entry to package-bundled catalog
4. Test on target platforms
5. Update catalog with `tested: true`
6. Update trust policy to include new adapter

---

## 32. Open Questions

1. Should the catalog support version pinning? (Currently: no)
2. Should `npx pcm init` support custom catalogs? (Currently: no)
3. Should the generic adapter be optional? (Currently: always available)
4. Should adapter files be locked after bootstrap? (Currently: no)
5. Should the trust policy be per-repository or global? (Currently: per-repository)
6. Should the manifest include file checksums? (Currently: no)
7. Should `pcm update` support selective updates? (Currently: all-or-nothing)
8. Should independent distribution (Model B) be deferred to post-MVP? (Currently: yes)

---

## 33. Implementation Readiness

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
| Can implementation determine exact adapter artifact location? | **YES** — `artifact` field in catalog points to bundled path |
| Can implementation resolve adapter artifacts without network? | **YES** — All artifacts bundled in package (MVP) |
| Can implementation distinguish adapter definition from artifact from distribution from trust from binding? | **YES** — Five concepts explicitly separated (Section 6) |
| Can implementation prevent selecting a specialized adapter when required tool is absent? | **YES** — `requires` field declares capability requirements; selection checks `capabilitiesSatisfied` |

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
│ No capable adapter  │ Generic fallback │ Use generic adapter               │
│ Catalog empty       │ Generic fallback │ Use generic adapter               │
│ Package missing     │ Fatal error      │ npm install pcm                   │
│ Trust policy missing│ Generic fallback │ Use generic adapter               │
│ Artifact missing    │ Generic fallback │ Use generic adapter               │
│ Local modification  │ Conflict report  │ pcm update reports conflict       │
└─────────────────────┴──────────────────┴───────────────────────────────────┘
```

## Appendix E: Trust Lifecycle Diagram

```
┌─────────────────┐
│  DISCOVERABLE   │  Adapter listed in catalog
└────────┬────────┘
         │ catalog match
         ▼
┌─────────────────────┐
│ DECLARED COMPATIBLE │  Metadata says env matches
└────────┬────────────┘
         │
         ▼  [CAPABILITY CHECK]  requires satisfied?
         │                       if no → skip adapter
         │
┌─────────────────┐
│ TRUST EVALUATED │  Policy result known
└────────┬────────┘
         │ if trusted
         ▼
┌─────────────────────┐
│ ARTIFACT RESOLVED   │  Bundled files located in package
└────────┬────────────┘
         │ files available
         ▼
┌─────────────────┐
│    TRUSTED      │  Policy permits, artifact ready
└────────┬────────┘
         │ npx pcm init selects
         ▼
┌─────────────────┐
│    INSTALLED    │  Present in target repo
└─────────────────┘
```

## Appendix F: Concept Separation Table

```
┌──────────────────────┬───────────────────────────────────────────────┐
│ Concept              │ Definition                                    │
├──────────────────────┼───────────────────────────────────────────────┤
│ CATALOG ENTRY        │ Metadata record in adapter catalog           │
│                      │ (discovery only)                             │
├──────────────────────┼───────────────────────────────────────────────┤
│ ADAPTER ARTIFACT     │ Actual files that constitute the adapter     │
│                      │ binding (implementation files)               │
├──────────────────────┼───────────────────────────────────────────────┤
│ ADAPTER DISTRIBUTION │ Mechanism by which artifacts reach           │
│ SOURCE               │ npx pcm init (MVP: bundled in package)       │
├──────────────────────┼───────────────────────────────────────────────┤
│ TARGET BINDING       │ Adapter artifacts as they exist in the       │
│                      │ target repository after installation         │
├──────────────────────┼───────────────────────────────────────────────┤
│ TRUST EVALUATION     │ Policy decision about whether an adapter     │
│                      │ may be used (separate from discovery)        │
├──────────────────────┼───────────────────────────────────────────────┤
│ CAPABILITY MATCH     │ Distribution-layer check that adapter's      │
│                      │ requires are satisfied by observed env       │
│                      │ capabilities (separate from trust)           │
└──────────────────────┴───────────────────────────────────────────────┘
```

---

**Authority:** This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.
