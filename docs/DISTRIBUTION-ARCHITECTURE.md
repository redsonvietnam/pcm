# Distribution Architecture (npx pcm init)

**Version:** 0.2  
**Status:** Proposed  
**Authority:** PCM-GATE-01  

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
2. Source of truth is deterministic — the registry is the only source of truth for available adapters and compatibility
3. Env detection ≠ adapter availability — environment detection and adapter selection are separate concerns
4. Target repo ownership is explicit — four categories: `pcm`, `adapter`, `shared`, `unknown`
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

---

## 4. Design Principles

1. **Registry is the source of truth** — `docs/registry/pcm-adapters.json` is the only authoritative list of adapter availability and compatibility. No adapter exists outside the registry.

2. **Environment detection ≠ adapter availability** — Detecting that an environment has capability C does not mean adapter A for capability C is available. Detection informs; registry decides.

3. **Selection is deterministic** — Given the same repository state and the same registry, `npx pcm init` produces the same adapter selection every time. No randomness, no fuzzy matching, no heuristic.

4. **Target repo ownership is explicit** — Every target repository must belong to exactly one of four ownership categories before `npx pcm init` proceeds.

5. **One-line portability** — A user can run `npx pcm init` on any repository, on any machine, and get a valid result without additional configuration.

6. **Idempotency** — Running `npx pcm init` multiple times on the same repository produces the same result. Bootstrap is not a mutation — it is a canonical application.

---

## 5. Candidate Distribution Models

### 5.1 Centralized CLI

`npx pcm init` as a standalone CLI that bundles all adapter logic internally. Adapters are not files in the target repository — they are baked into the CLI.

**Pros:** Simple to run. No external dependencies.  
**Cons:** Adapter updates require CLI updates. Cannot support adapters the CLI author did not anticipate. Violates adapter boundary.

### 5.2 Registry + Generator

`npx pcm init` as a registry-driven generator. The CLI reads the registry, selects an adapter, and writes adapter files into the target repository.

**Pros:** Adapters are files in the target repo. Updateable without CLI changes. Clear ownership boundary.  
**Cons:** Generator must be correct for every adapter. State management complexity.

### 5.3 Template Repository

`npx pcm init` clones a template repository and customizes it for the target.

**Pros:** Simple mental model. Version control built-in.  
**Cons:** Templates diverge. Customization is ad-hoc. No registry means no deterministic selection.

### 5.4 Hybrid (Registry + Template + CLI)

`npx pcm init` as a registry-driven bootstrap that combines:
- Registry for adapter discovery and compatibility
- Template for structure
- CLI for orchestration

**Pros:** Best of each model. Registry provides determinism, template provides structure, CLI provides UX.  
**Cons:** More complex than any single model. Requires clear layering.

---

## 6. Chosen Architecture

**Model 4 (Hybrid)** is selected as the distribution architecture.

The rationale: Registry provides determinism (Goal 1), template provides structure (Goal 2), CLI provides UX (Goal 3). Together they satisfy all six goals while preserving adapter boundary.

### 6.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    npx pcm init                      │
│                    (CLI Entry)                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐    ┌───────────────────────┐     │
│  │  Environment   │    │     Registry          │     │
│  │  Detection     │◄──►│  pcm-adapters.json    │     │
│  │  (reads env)   │    │  (source of truth)    │     │
│  └───────┬───────┘    └───────────┬───────────┘     │
│          │                        │                 │
│          ▼                        ▼                 │
│  ┌──────────────────────────────────────────────┐   │
│  │         Selection Algorithm                   │   │
│  │  (deterministic: env + registry → adapter)    │   │
│  └──────────────────────┬───────────────────────┘   │
│                         │                           │
│                         ▼                           │
│  ┌──────────────────────────────────────────────┐   │
│  │         Adapter Files                        │   │
│  │  (written to target repo)                    │   │
│  │  pcm/ or .opencode/pcm-pwf/                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

Target Repository (after bootstrap):
├── .opencode/
│   ├── skills/
│   │   └── pcm-pwf/
│   │       └── SKILL.md          (adapter)
│   └── rules/
│       └── pcm-core.mdc          (adapter)
├── pcm/
│   ├── docs/
│   │   ├── PCM.md
│   │   ├── PWF.md
│   │   └── ...
│   └── workstreams/
│       └── ...
└── docs/
    └── ...
```

### 6.2 Bootstrap Sequence

```
User: npx pcm init <repo> [adapter]
  │
  ├── 1. Read registry (docs/registry/pcm-adapters.json)
  │
  ├── 2. Detect environment (env ≠ availability)
  │
  ├── 3. Select adapter (deterministic algorithm)
  │
  ├── 4. Check idempotency (already bootstrapped?)
  │
  ├── 5. Write adapter files to target repo
  │
  └── 6. Return: adapter name, file list, warnings
```

### 6.3 Unknown-Repository Example

Machine C encounters repo Z (never seen before):

```
$ npx pcm init repo-Z

1. Reading registry: docs/registry/pcm-adapters.json
2. Detecting environment:
   - Platform: windows
   - Shell: powershell
   - Git: 2.45.0
   - OpenCode: available (agent detected)
3. Selecting adapter:
   - Registry match: opencode (platform=windows, shell=powershell)
   - Confidence: high
4. Idempotency check:
   - .opencode/skills/pcm-pwf/SKILL.md: NOT FOUND
   - Bootstrap required: YES
5. Writing adapter files:
   - .opencode/skills/pcm-pwf/SKILL.md (adapter)
   - .opencode/rules/pcm-core.mdc (adapter)
6. Done. Adapter: opencode. Files written: 2.
```

---

## 7. Canonical Source of Truth

### 7.1 What Is the Source of Truth

**Registry is the source of truth.** `docs/registry/pcm-adapters.json` is the only authoritative source for:

1. Which adapters exist
2. Which environments each adapter supports
3. Which platform/shell combinations are tested
4. Which adapter is the default fallback

### 7.2 What Is NOT the Source of Truth

The following are NOT sources of truth:

- CLI arguments (they inform, not decide)
- Environment detection results (they inform, not decide)
- User preferences (they inform, not decide)
- Heuristic matching (not used)

### 7.3 Registry Authority

Registry authority is **absolute**. If the registry says adapter X supports platform Y, then adapter X supports platform Y. No other mechanism can override registry authority.

This means: if an adapter exists but the registry does not list it, the adapter does not exist for `npx pcm init`.

---

## 8. Layer Boundaries

The distribution architecture has three layers:

| Layer | Scope | Example |
|-------|-------|---------|
| **Registry** | Source of truth for adapter availability | `pcm-adapters.json` |
| **Detection** | Environment observation (env ≠ availability) | Platform, shell, git version |
| **Selection** | Deterministic adapter selection from registry | Algorithm in Section 16 |

### 8.1 Registry Layer

Registry layer:
- Provides the canonical adapter list
- Provides adapter metadata (platform, shell, tested status)
- Provides fallback adapter
- Does NOT detect environment
- Does NOT select adapters

### 8.2 Detection Layer

Detection layer:
- Observes the environment
- Reports what IS (platform, shell, versions)
- Does NOT match adapters
- Does NOT decide suitability

### 8.3 Selection Layer

Selection layer:
- Reads registry
- Reads detection results
- Applies deterministic algorithm
- Returns exactly one adapter
- Does NOT detect environment
- Does NOT modify registry

---

## 9. One-Line Bootstrap

### 9.1 The Command

```
npx pcm init
```

No arguments. No options. No configuration.

### 9.2 What Happens

1. Registry is read
2. Environment is detected
3. Adapter is selected (deterministic)
4. Adapter files are written
5. Result is printed

### 9.3 What the User Gets

The user gets a repository with adapter files in place. The adapter files provide:
- PCM rules (invariant definitions)
- PWF rules (mandatory behaviors)
- GATE rules (verification requirements)
- HANDOFF rules (handoff requirements)

The user does NOT get:
- New commands
- New tools
- New platforms
- New workflows

The adapter gives the user a place to start following PCM/PWF. It does not replace the user's judgment.

---

## 10. Bootstrap Lifecycle

### 10.1 States

| State | Meaning |
|-------|---------|
| **NOT-BOOTSTRAPPED** | No adapter files in target repo |
| **BOOTSTRAPPING** | `npx pcm init` in progress |
| **BOOTSTRAPPED** | Adapter files present and valid |
| **INVALID** | Adapter files present but corrupted |

### 10.2 Transitions

```
NOT-BOOTSTRAPPED ──[npx pcm init]──► BOOTSTRAPPING
BOOTSTRAPPING ──[success]──► BOOTSTRAPPED
BOOTSTRAPPING ──[failure]──► NOT-BOOTSTRAPPED
BOOTSTRAPPED ──[npx pcm init]──► BOOTSTRAPPED (idempotent)
BOOTSTRAPPED ──[manual corruption]──► INVALID
INVALID ──[npx pcm init]──► BOOTSTRAPPED
```

### 10.3 Idempotency

Running `npx pcm init` on an already-bootstrapped repository:
1. Reads registry
2. Detects environment
3. Selects adapter
4. Checks if adapter files already exist
5. If valid → does nothing (idempotent)
6. If invalid → rewrites adapter files
7. Returns same result as first run

---

## 11. Repository State

### 11.1 What `npx pcm init` Reads

Before bootstrap, `npx pcm init` reads:

1. **Target repository** — Is it a git repo? What branch? What state?
2. **Platform** — What OS? What shell? What architecture?
3. **Existing tools** — Is OpenCode available? Copilot? Codex?
4. **Registry** — `docs/registry/pcm-adapters.json`

### 11.2 What `npx pcm init` Writes

After bootstrap, `npx pcm init` writes:

1. **Adapter files** — Adapter-specific files in the target repo
2. **Registry entry** — The bootstrap event is logged (optional, registry-dependent)
3. **No other files** — `npx pcm init` does not write implementation files, docs, or tests

### 11.3 What `npx pcm init` Does NOT Write

`npx pcm init` does NOT write:
- Implementation code
- Test files
- Documentation beyond adapter rules
- Configuration beyond adapter rules
- New tools or commands

---

## 12. Target-State Ownership

Every target repository must belong to exactly one ownership category before `npx pcm init` proceeds.

### 12.1 Categories

| Category | Meaning | Bootstrap Behavior |
|----------|---------|-------------------|
| **pcm** | Repository owns PCM (e.g., `redsonvietnam/pcm`) | Bootstrap uses PCM as source; no adapter written |
| **adapter** | Repository owns a specific adapter (e.g., `redsonvietnam/pcm-pwf-opencode`) | Bootstrap uses adapter's own rules |
| **shared** | Repository is a shared workspace (not PCM or adapter) | Bootstrap applies generic adapter |
| **unknown** | Repository has no PCM relationship | Bootstrap applies generic adapter; user must confirm |

### 12.2 Ownership Detection

`npx pcm init` detects ownership by:

1. Checking if `docs/PCM.md` exists → **pcm**
2. Checking if `docs/registry/pcm-adapters.json` exists → **pcm**
3. Checking if repo name matches adapter pattern → **adapter**
4. Checking if `.opencode/` or similar tool directories exist → **shared**
5. Otherwise → **unknown**

### 12.3 Ownership Table

```
┌──────────────┬─────────────────┬──────────────────────────────────────┐
│ Category     │ Example Repo    │ Bootstrap Behavior                   │
├──────────────┼─────────────────┼──────────────────────────────────────┤
│ pcm          │ redsonvietnam/pcm │ Use PCM docs; no adapter written  │
│ adapter      │ pcm-pwf-opencode │ Use adapter's own rules            │
│ shared       │ my-project       │ Generic adapter                    │
│ unknown      │ random-repo      │ Generic adapter + user confirmation│
└──────────────┴─────────────────┴──────────────────────────────────────┘
```

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
4. Modify anything

Detection informs. Registry decides.

### 13.3 Detection ≠ Availability

**Critical distinction:** Detecting that OpenCode is installed does NOT mean the OpenCode adapter is available. Detection is an observation; adapter availability is a registry lookup.

Example:

```
Detection: OpenCode is installed (capability: yes)
Registry: OpenCode adapter NOT listed for this platform
Result: OpenCode adapter is NOT available
```

This separation prevents:
- False positives (tool installed but adapter not registered)
- False negatives (adapter available but tool not detected)
- Race conditions (tool version changes between detection and registry read)

---

## 14. Adapter Discovery

### 14.1 How Adapters Are Discovered

Adapters are discovered through the registry ONLY. The registry is the only source of truth for adapter availability.

### 14.2 Discovery Process

1. Read registry
2. Filter adapters by:
   - Platform match (windows/linux/macos)
   - Shell match (powershell/bash/zsh)
   - Tested status (tested/untested)
3. If multiple adapters match → apply selection algorithm (Section 16)
4. If no adapters match → use generic adapter (Section 16)

### 14.3 Discovery ≠ Selection

Discovery finds all candidates. Selection picks exactly one. These are separate steps.

---

## 15. Adapter Registry

### 15.1 Registry Location

`docs/registry/pcm-adapters.json`

### 15.2 Registry Structure

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
      "priority": 1
    },
    {
      "id": "copilot",
      "name": "GitHub Copilot Adapter",
      "repo": "redsonvietnam/pcm-pwf-copilot",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "tested": true,
      "priority": 2
    },
    {
      "id": "codex",
      "name": "Codex Adapter",
      "repo": "redsonvietnam/pcm-pwf-codex",
      "platforms": ["windows", "linux", "macos"],
      "shells": ["powershell", "bash", "zsh"],
      "tested": false,
      "priority": 3
    },
    {
      "id": "generic",
      "name": "Generic Adapter",
      "repo": null,
      "platforms": ["*"],
      "shells": ["*"],
      "tested": true,
      "priority": 999
    }
  ]
}
```

### 15.3 Registry Rules

1. Every adapter MUST be listed in the registry
2. Adapters not in the registry do not exist for `npx pcm init`
3. The `defaultAdapter` is used when no other adapter matches
4. `priority` determines selection order (lower = higher priority)
5. `tested` indicates whether the adapter has been validated on the listed platforms

---

## 16. Generic Adapter

### 16.1 Purpose

The generic adapter is the fallback when:
1. No specific adapter matches the environment
2. The repository is unknown
3. The registry is unavailable (offline mode)

### 16.2 What the Generic Adapter Provides

The generic adapter provides:
- PCM rules (invariant definitions)
- PWF rules (mandatory behaviors)
- GATE rules (verification requirements)
- HANDOFF rules (handoff requirements)
- Basic structure (pcm/docs/, pcm/workstreams/)

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
  2. Copy PCM.md, PWF.md, CONFORMANCE.md
  3. Create basic workstreams/ structure
  4. Do NOT create adapter-specific files
  5. Print: "Generic adapter applied. Configure your tools manually."
```

---

## 17. Deterministic Selection Algorithm

### 17.1 Algorithm

Given: Registry R, Environment E

```
function selectAdapter(R, E):
  candidates = filter(R.adapters, a =>
    a.platforms.includes(E.platform) &&
    a.shells.includes(E.shell)
  )

  if candidates is empty:
    return R.defaultAdapter  // generic

  sort candidates by:
    1. tested DESC (tested adapters first)
    2. priority ASC (lower priority number = higher priority)

  return candidates[0]
```

### 17.2 Determinism Guarantee

Given the same registry R and environment E, the algorithm ALWAYS returns the same adapter. There is no randomness, no heuristic, no fuzzy matching.

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

## 18. OpenCode Integration

### 18.1 How OpenCode Integrates

OpenCode integration is adapter-specific. The OpenCode adapter:
- Reads `.opencode/skills/pcm-pwf/SKILL.md`
- Reads `.opencode/rules/pcm-core.mdc`
- Uses OpenCode's skill and rule system to apply PCM/PWF

### 18.2 What OpenCode Gets

After bootstrap, OpenCode has:
- PCM rules in `.opencode/rules/pcm-core.mdc`
- PWF skill in `.opencode/skills/pcm-pwf/SKILL.md`
- Adapter-specific behavior in those files

### 18.3 What OpenCode Does NOT Get

OpenCode does NOT get:
- New commands beyond `npx pcm init`
- New tools beyond what the adapter provides
- Automatic workflow execution
- Automatic task management

---

## 19. Security / Trust Boundary

### 19.1 What Is Trusted

1. **Registry** — `docs/registry/pcm-adapters.json` is trusted as the source of truth
2. **Adapter files** — Files written by `npx pcm init` are trusted as valid PCM/PWF rules
3. **Target repository** — The target repository is trusted to exist and be writable

### 19.2 What Is NOT Trusted

1. **CLI arguments** — They inform but do not decide
2. **Environment detection** — It observes but does not decide
3. **User preferences** — They inform but do not decide
4. **External sources** — Registry is the only source of truth; external sources are not trusted

### 19.3 Trust Boundary

```
┌─────────────────────────────────────────┐
│              TRUSTED ZONE               │
│                                         │
│  ┌───────────────┐  ┌───────────────┐   │
│  │   Registry    │  │  Adapter      │   │
│  │  (source of   │  │  Files        │   │
│  │   truth)      │  │  (written by  │   │
│  │               │  │   npx pcm     │   │
│  │               │  │   init)       │   │
│  └───────────────┘  └───────────────┘   │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            UNTRUSTED ZONE               │
│                                         │
│  ┌───────────────┐  ┌───────────────┐   │
│  │  CLI Args     │  │  Environment  │   │
│  │  (inform)     │  │  Detection    │   │
│  │               │  │  (observe)    │   │
│  └───────────────┘  └───────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 20. Idempotency

### 20.1 What Is Idempotent

`npx pcm init` is idempotent:
- Running it multiple times produces the same result
- Running it on an already-bootstrapped repo does nothing (if valid)
- Running it on an invalid repo rewrites adapter files

### 20.2 What Is NOT Idempotent

- Modifying adapter files after bootstrap (manual change)
- Deleting adapter files after bootstrap
- Changing registry entries after bootstrap

### 20.3 Idempotency Check

```
function isBootstrapped(repo, adapter):
  return adapter.files.every(f => fileExists(repo, f))
```

If `isBootstrapped` returns true AND files are valid → do nothing.  
If `isBootstrapped` returns false OR files are invalid → rewrite.

---

## 21. Version / Compatibility

### 21.1 Version Numbers

Registry version and adapter version are separate:
- **Registry version** — `1.0` (increments when registry structure changes)
- **Adapter version** — Adapter-specific (increments when adapter logic changes)

### 21.2 Compatibility Matrix

```
┌─────────────┬─────────────┬─────────────┬──────────────┐
│ Registry    │ Adapter     │ Compatible  │ Notes        │
├─────────────┼─────────────┼─────────────┼──────────────┤
│ 1.0         │ opencode 1.0│ Yes         │              │
│ 1.0         │ opencode 0.9│ Yes         │ Fallback     │
│ 1.0         │ copilot 1.0 │ Yes         │              │
│ 1.0         │ codex 0.1   │ No          │ Untested     │
│ 2.0         │ opencode 1.0│ No          │ Incompatible │
└─────────────┴─────────────┴─────────────┴──────────────┘
```

### 21.3 Version Check

`npx pcm init` does NOT enforce version compatibility. If an adapter is incompatible, the bootstrap fails with a clear error message.

---

## 22. Upgrade / Ownership

### 22.1 Who Owns the Registry

The registry is owned by the PCM project (`redsonvietnam/pcm`). Only the PCM project can modify the registry.

### 22.2 Who Owns Adapters

Each adapter is owned by its respective repository:
- OpenCode adapter: `redsonvietnam/pcm-pwf-opencode`
- Copilot adapter: `redsonvietnam/pcm-pwf-copilot`
- Codex adapter: `redsonvietnam/pcm-pwf-codex`
- Generic adapter: Part of `npx pcm init` itself

### 22.3 Upgrade Path

Upgrading `npx pcm init`:
1. Update registry (PCM project)
2. Update adapter (adapter owner)
3. Re-run `npx pcm init` on target repo
4. Adapter files are rewritten (idempotent)

### 22.4 Downgrade Path

Downgrading `npx pcm init`:
1. Not supported by design
2. Manual removal of adapter files is required
3. Re-run `npx pcm init` with older version

---

## 23. Recovery / Uninstall

### 23.1 Recovery

If `npx pcm init` fails:
1. Error message is printed
2. No partial state is left behind (atomic write)
3. User can re-run `npx pcm init` safely

### 23.2 Uninstall

To uninstall PCM from a repository:
1. Delete adapter files (adapter-specific)
2. Delete pcm/ directory (if created)
3. No registry entry needs to be updated

### 23.3 Recovery Table

```
┌─────────────────────┬───────────────────────────────────────┐
│ Failure Mode        │ Recovery Action                       │
├─────────────────────┼───────────────────────────────────────┤
│ Registry not found  │ Check docs/registry/ path             │
│ Adapter not found   │ Check registry; use generic fallback  │
│ Permission denied   │ Check write permissions on target repo│
│ Network error       │ Not required (offline capable)        │
│ Invalid registry    │ Check JSON format                     │
└─────────────────────┴───────────────────────────────────────┘
```

---

## 24. Offline Considerations

### 24.1 What Requires Network

1. `npx` itself (first run, downloads PCM package)
2. Registry updates (fetching latest adapter list)

### 24.2 What Does NOT Require Network

1. `npx pcm init` (after first run)
2. Environment detection
3. Adapter selection
4. Writing adapter files

### 24.3 Offline Mode

When offline:
1. Registry is read from local cache (if available)
2. Environment detection proceeds normally
3. Adapter selection proceeds normally
4. Writing adapter files proceeds normally
5. Result: same as online mode (deterministic)

---

## 25. Portability

### 25.1 What Is Portable

1. Registry format (JSON, standard)
2. Adapter file format (markdown, standard)
3. CLI interface (`npx pcm init`)
4. Selection algorithm (deterministic, no platform-specific logic)

### 25.2 What Is NOT Portable

1. Adapter-specific content (OpenCode-specific, Copilot-specific)
2. Platform-specific paths (windows vs linux)
3. Shell-specific commands (powershell vs bash)

### 25.3 Portability Guarantee

`npx pcm init` produces the same result on:
- Windows + PowerShell
- Linux + Bash
- macOS + Zsh

The adapter selection may differ, but the process is identical.

---

## 26. Failure Modes

### 26.1 Failure Mode Table

```
┌─────────────────────┬──────────────────┬───────────────────────────────────┐
│ Failure             │ Impact           │ Recovery                          │
├─────────────────────┼──────────────────┼───────────────────────────────────┤
│ Registry corrupted  │ No adapter found │ Fix registry; re-run npx pcm init │
│ Target repo read-only│ Cannot write    │ Check permissions                 │
│ No git installed    │ Detection fails  │ Install git                       │
│ No adapter matches  │ Generic fallback │ Use generic adapter               │
│ Registry empty      │ Generic fallback │ Use generic adapter               │
│ Registry missing    │ Fatal error      │ Check docs/registry/ path         │
└─────────────────────┴──────────────────┴───────────────────────────────────┘
```

### 26.2 Error Reporting

`npx pcm init` reports errors as:
1. Clear error message
2. Suggested recovery action
3. Exit code (0 = success, 1 = failure)

---

## 27. Future Extension Points

### 27.1 What May Change

1. **New adapters** — Add to registry
2. **New platforms** — Update adapter platform list
3. **New shells** — Update adapter shell list
4. **New tools** — Create new adapter

### 27.2 What Will NOT Change

1. **Registry format** — JSON is stable
2. **Selection algorithm** — Deterministic is stable
3. **Idempotency** — Repeated runs produce same result
4. **Generic adapter** — Always available as fallback

### 27.3 Extension Process

To add a new adapter:
1. Create adapter repository
2. Add entry to `docs/registry/pcm-adapters.json`
3. Test on target platforms
4. Update registry with `tested: true`

---

## 28. Open Questions

1. Should the registry support version pinning? (Currently: no)
2. Should `npx pcm init` support custom registries? (Currently: no)
3. Should the generic adapter be optional? (Currently: always available)
4. Should adapter files be locked after bootstrap? (Currently: no)
5. Should the registry be per-repository or global? (Currently: global in pcm project)

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
│ Unknown     │ generic     │ fallback     │              │
│ environment │             │              │              │
└─────────────┴─────────────┴──────────────┴──────────────┘
```

## Appendix B: Ownership Table

```
┌──────────────┬──────────────────────┬──────────────────────────────────┐
│ Category     │ Example Repo         │ Bootstrap Behavior               │
├──────────────┼──────────────────────┼──────────────────────────────────┤
│ pcm          │ redsonvietnam/pcm    │ Use PCM docs; no adapter written │
│ adapter      │ pcm-pwf-opencode     │ Use adapter's own rules          │
│ shared       │ my-project           │ Generic adapter                  │
│ unknown      │ random-repo          │ Generic adapter + user confirm   │
└──────────────┴──────────────────────┴──────────────────────────────────┘
```

## Appendix C: Compatibility Matrix

```
┌─────────────┬─────────────┬─────────────┬──────────────┐
│ Registry    │ Adapter     │ Compatible  │ Notes        │
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
│ Registry corrupted  │ No adapter found │ Fix registry; re-run npx pcm init │
│ Target repo read-only│ Cannot write    │ Check permissions                 │
│ No git installed    │ Detection fails  │ Install git                       │
│ No adapter matches  │ Generic fallback │ Use generic adapter               │
│ Registry empty      │ Generic fallback │ Use generic adapter               │
│ Registry missing    │ Fatal error      │ Check docs/registry/ path         │
└─────────────────────┴──────────────────┴───────────────────────────────────┘
```

---

**Authority:** This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.
