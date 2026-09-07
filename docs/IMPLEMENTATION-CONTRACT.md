# Implementation Contract (npx pcm init)

**Version:** 1.0
**Status:** Proposed
**Authority:** PCM-GATE-01
**Architecture Reference:** Distribution Architecture v1.0
**Framework Reference:** PCM v1.0, PWF v1.0

---

## Purpose

Convert the frozen Distribution Architecture into an implementation-ready contract. This document defines concrete, unambiguous specifications for every component an executor needs to implement `npx pcm init` without inventing missing semantics.

This document does NOT reopen architecture decisions. It clarifies implementation contracts only.

---

## 1. CLI Contract

### 1.1 Command Syntax

```
npx pcm init [target]
```

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `target` | No | `process.cwd()` | Absolute or relative path to target repository |

### 1.2 Supported Syntax (MVP)

```
npx pcm init                    # bootstrap current working directory
npx pcm init /path/to/repo      # bootstrap explicit path
npx pcm init ./relative/path    # bootstrap relative path
npx pcm init ../sibling/repo    # bootstrap relative path
```

### 1.3 Unsupported Arguments/Options (MVP)

The following are NOT supported in MVP:

```
npx pcm init --adapter=opencode     # NO — selection is deterministic
npx pcm init --force                # NO — idempotent, no force needed
npx pcm init --dry-run              # NO — not in MVP
npx pcm init --verbose              # NO — not in MVP
npx pcm init --config=path          # NO — no custom catalog
npx pcm init --trust-policy=path    # NO — not in MVP
npx pcm init init                   # NO — no subcommands
npx pcm update                      # NO — separate command, not in MVP
```

### 1.4 Target Resolution

```
1. If target argument is provided:
   a. Resolve to absolute path
   b. If path does not exist → EXIT 1, error "Target path does not exist: <path>"
   c. If path exists but is not a directory → EXIT 1, error "Target is not a directory: <path>"
2. If no target argument:
   a. Use process.cwd()
3. Verify target is writable:
   a. Attempt to stat the target directory
   b. If not writable → EXIT 1, error "Target directory is not writable: <path>"
```

### 1.5 Exit Codes

| Code | Meaning | When |
|------|---------|------|
| `0` | Success | Bootstrap completed (idempotent or first-time) |
| `1` | Error | Any failure: invalid target, missing package, write error, catalog error |

### 1.6 stdout/stderr Expectations

**stdout (success):**

```
PCM initialized successfully.
Adapter: <adapter-id>
Files written: <count>
Target: <absolute-path>
```

When generic adapter is selected, append:

```
Generic adapter applied. Configure your tools manually.
```

**stderr (error):**

```
Error: <clear error message>
Recovery: <suggested action>
```

### 1.7 Deterministic Result Reporting

For the same target + same environment + same package version, the output MUST be identical across runs (modulo timestamps). The adapter name, file count, and target path are deterministic. Only `initializedAt` in the manifest is non-deterministic.

---

## 2. Package Layout Contract

### 2.1 Expected npm Package Structure

```
pcm/
├── bin/
│   └── pcm.js                    # CLI entrypoint (#!/usr/bin/env node)
├── src/
│   ├── cli.js                    # CLI argument parsing
│   ├── detect.js                 # Environment detection
│   ├── catalog.js                # Catalog loading and validation
│   ├── select.js                 # Deterministic selection algorithm
│   ├── resolve.js                # Artifact resolution
│   ├── install.js                # Core + binding file writing
│   ├── manifest.js               # Manifest creation/update
│   └── idempotency.js            # Idempotency checks
├── registry/
│   └── pcm-adapters.json         # Adapter catalog (bundled)
├── adapters/
│   ├── opencode/
│   │   ├── SKILL.md              # OpenCode skill binding
│   │   └── pcm-core.mdc          # OpenCode rules binding
│   ├── copilot/
│   │   └── ...                   # Copilot adapter files
│   └── codex/
│       └── ...                   # Codex adapter files
├── core/
│   ├── PCM.md                    # Canonical PCM specification
│   ├── PWF.md                    # Canonical PWF specification
│   └── CONFORMANCE.md            # Conformance criteria
├── package.json
└── README.md
```

### 2.2 Path Responsibilities

| Component | Package Path | Target Path |
|-----------|-------------|-------------|
| CLI entrypoint | `bin/pcm.js` | N/A (not installed) |
| Catalog | `registry/pcm-adapters.json` | N/A (read from package) |
| Core specs | `core/PCM.md` | `pcm/docs/PCM.md` |
| Core specs | `core/PWF.md` | `pcm/docs/PWF.md` |
| Core specs | `core/CONFORMANCE.md` | `pcm/docs/CONFORMANCE.md` |
| Adapter artifacts | `adapters/<adapter-id>/*` | Tool-specific (e.g., `.opencode/skills/pcm-pwf/SKILL.md`) |
| Manifest | N/A (generated) | `pcm/.pcm-manifest.json` |

### 2.3 package.json Requirements

```json
{
  "name": "pcm",
  "version": "1.0.0",
  "bin": {
    "pcm": "bin/pcm.js"
  },
  "files": [
    "bin/",
    "src/",
    "registry/",
    "adapters/",
    "core/"
  ]
}
```

The `files` array ensures all required components are included in the published package. No external runtime dependencies are required for MVP.

---

## 3. Catalog Contract

### 3.1 Schema (MVP)

```json
{
  "version": "1.0",
  "defaultAdapter": "generic",
  "adapters": [
    {
      "id": "<string, required>",
      "name": "<string, required>",
      "platforms": ["<string, required>"],
      "shells": ["<string, required>"],
      "requires": { "<string>": "*" } | null,
      "tested": "<boolean, required>",
      "priority": "<number, required>",
      "artifact": "<string|null, required>"
    }
  ]
}
```

### 3.2 Field Validation Rules

| Field | Type | Validation |
|-------|------|------------|
| `version` | string | Must be `"1.0"` for MVP |
| `defaultAdapter` | string | Must reference an adapter in the `adapters` array |
| `adapters` | array | Must contain at least one entry |
| `adapters[].id` | string | Unique within catalog. Pattern: `^[a-z][a-z0-9-]*$` |
| `adapters[].name` | string | Non-empty |
| `adapters[].platforms` | string[] | Non-empty. Values: `"windows"`, `"linux"`, `"macos"`, or `"*"` |
| `adapters[].shells` | string[] | Non-empty. Values: `"powershell"`, `"bash"`, `"zsh"`, or `"*"` |
| `adapters[].requires` | object\|null | Keys: capability names. Values: MUST be `"*"` (MVP). `null` = technology-agnostic |
| `adapters[].tested` | boolean | — |
| `adapters[].priority` | number | Positive integer. Lower = higher priority |
| `adapters[].artifact` | string\|null | Relative path within package. `null` = generic (no binding files) |

### 3.3 MVP Constraint: `requires` Values

All values in the `requires` object MUST be the literal string `"*"`. No version constraints (`">=2.0"`, `"^1.0.0"`, etc.) are permitted in MVP.

Validation rule:

```
for each adapter in catalog:
  if adapter.requires is not null:
    for each [capability, version] in adapter.requires:
      if version !== "*":
        REJECT catalog: "MVP requires '*' for capability '<capability>' in adapter '<adapter.id>'"
```

### 3.4 Catalog Validation

On startup, the CLI MUST validate the catalog:

1. Parse JSON — if invalid → EXIT 1
2. Check `version` is `"1.0"` — if not → EXIT 1
3. Check `defaultAdapter` references a valid adapter — if not → EXIT 1
4. Check all `requires` values are `"*"` — if not → EXIT 1
5. Check all `artifact` paths point to existing directories in package — if not → EXIT 1
6. Check `adapters` array is non-empty — if empty → EXIT 1

### 3.5 Catalog Content (MVP)

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

---

## 4. Environment Record Contract

### 4.1 Structure

```json
{
  "platform": "<windows|linux|macos>",
  "shell": "<powershell|bash|zsh>",
  "gitVersion": "<string|null>",
  "capabilities": {
    "<capability-name>": "present"
  }
}
```

### 4.2 Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `platform` | string | One of: `"windows"`, `"linux"`, `"macos"` |
| `shell` | string | One of: `"powershell"`, `"bash"`, `"zsh"` |
| `gitVersion` | string\|null | Git version string (e.g., `"2.45.0"`), or `null` if git not installed |
| `capabilities` | object | Map of capability names to presence indicators |

### 4.3 Capabilities

Each key in `capabilities` is a tool/capability name that the environment detection can observe. Each value is the string `"present"`.

MVP capability names:

| Name | Detection Method |
|------|-----------------|
| `opencode` | Check if `opencode` command exists in PATH |
| `copilot` | Check if GitHub Copilot CLI or extension is present |
| `codex` | Check if `codex` command exists in PATH |

Detection is best-effort. If a tool cannot be detected, it is omitted from `capabilities`. An empty `capabilities` object is valid.

### 4.4 Critical Distinction

The `capabilities` object represents **distribution-layer tool presence** (can the adapter bind to this tool?). It is NOT the same as the **adapter semantic capabilities** defined in `docs/ADAPTER-MODEL.md` (what the adapter provides to PCM/PWF).

These are complementary, non-overlapping concepts:

| Concept | Layer | Meaning |
|---------|-------|---------|
| `capabilities` (distribution) | Discovery | Tool is installed on this machine |
| Adapter capabilities (ADAPTER-MODEL.md) | Adapter | What semantic capabilities the adapter provides |

---

## 5. Detection Contract

### 5.1 What Detection May Observe

| Observation | Method | Required? |
|-------------|--------|-----------|
| Platform | `process.platform` (Node.js) | Yes |
| Shell | `process.env.SHELL` or `process.env.COMSPEC` | Yes |
| Git version | `git --version` | No (optional) |
| OpenCode presence | `which opencode` / `where opencode` | No (optional) |
| Copilot presence | Check for copilot CLI/extension | No (optional) |
| Codex presence | `which codex` / `where codex` | No (optional) |

### 5.2 What Detection MUST NOT Do

1. **Select adapters** — detection is observation only
2. **Decide trust** — trust is a separate policy concern
3. **Decide suitability** — suitability is determined by selection algorithm
4. **Write target files** — detection produces a record, not actions
5. **Define PCM semantics** — detection is distribution-layer, not protocol-layer

### 5.3 Platform Detection Mapping

| `process.platform` | Result |
|-------------------|--------|
| `"win32"` | `"windows"` |
| `"linux"` | `"linux"` |
| `"darwin"` | `"macos"` |
| Other | EXIT 1, error "Unsupported platform: <platform>" |

### 5.4 Shell Detection Mapping

| Environment Variable | Value |
|---------------------|-------|
| `COMSPEC` contains `powershell` or `pwsh` | `"powershell"` |
| `SHELL` contains `bash` | `"bash"` |
| `SHELL` contains `zsh` | `"zsh"` |
| Default (unable to determine) | `"bash"` |

### 5.5 Capability Detection

For each known capability name:

1. Execute platform-appropriate check (e.g., `which <tool>` on Unix, `where <tool>` on Windows)
2. If check succeeds → add `"<name>": "present"` to `capabilities`
3. If check fails → omit from `capabilities`
4. If check is inconclusive → omit from `capabilities`

Detection MUST NOT throw on failed capability check. Missing capabilities are a normal condition, not an error.

---

## 6. Selection Contract

### 6.1 Algorithm (Deterministic)

```
function select(catalog, environment, trustPolicy):

  // Step 1: Filter by platform
  byPlatform = catalog.adapters.filter(a =>
    a.platforms.includes(environment.platform) ||
    a.platforms.includes("*")
  )

  // Step 2: Filter by shell
  byShell = byPlatform.filter(a =>
    a.shells.includes(environment.shell) ||
    a.shells.includes("*")
  )

  // Step 3: Filter by capabilities (requires check)
  byCapability = byShell.filter(a =>
    capabilitiesSatisfied(a.requires, environment.capabilities)
  )

  // Step 4: Filter by trust
  trusted = byCapability.filter(a =>
    trustPolicy.isTrusted(a.id)
  )

  // Step 5: Fallback if empty
  if trusted is empty:
    return catalog.adapters.find(a => a.id === catalog.defaultAdapter)

  // Step 6: Sort
  trusted.sort((a, b) =>
    // tested adapters first
    (b.tested - a.tested) ||
    // lower priority number = higher priority
    (a.priority - b.priority)
  )

  // Step 7: Select first
  return trusted[0]
```

### 6.2 `capabilitiesSatisfied` Function

```
function capabilitiesSatisfied(requires, envCapabilities):
  if requires is null:
    return true
  if requires is empty object:
    return true
  for each capability in requires:
    if capability not in envCapabilities:
      return false
    // MVP: value is always "*", presence check only
  return true
```

### 6.3 Ranking Rules

When multiple adapters pass all filters, ranking is deterministic:

1. **tested DESC** — adapters with `tested: true` rank above `tested: false`
2. **priority ASC** — lower priority number = higher rank

Tiebreaking: if two adapters have identical `tested` and `priority`, the one appearing first in the catalog array wins (stable sort).

### 6.4 Generic Fallback

Generic adapter (`id: "generic"`) is returned when:

- No adapter passes capability check, OR
- No adapter passes trust check, OR
- Catalog has no adapters matching platform/shell

Generic adapter has `requires: null`, so `capabilitiesSatisfied` always returns `true` for generic. Generic is always trusted (see Section 7). Generic can never lose to a specialized adapter on capability grounds — it has no capability requirements.

---

## 7. Trust Contract

### 7.1 MVP Trust Model

For MVP, trust is simple:

1. **Generic adapter** — Always trusted. Built-in. No trust evaluation needed.
2. **All bundled adapters** — Trusted by package integrity. If the npm package is trusted, all adapters bundled within it are trusted.

### 7.2 Trust Policy Implementation

The `trustPolicy.isTrusted(adapterId)` function for MVP:

```
function isTrusted(adapterId):
  // Generic is always trusted
  if adapterId === "generic":
    return true

  // All bundled adapters are trusted by package integrity
  // If we got here, the package was installed successfully
  // and the adapter is in the bundled catalog
  return true
```

### 7.3 No Repository Trust Config Required (MVP)

MVP does NOT require any repository-level trust configuration file. Trust is determined by:

1. Package integrity (npm install succeeded)
2. Adapter is in the bundled catalog
3. Generic is always trusted

### 7.4 Future Trust Extensions

Future versions may add:

- Repository-level `.pcm-trust.json` configuration
- Per-adapter trust evaluation
- Signature verification for independently-distributed adapters
- Trust policy inheritance

These are explicitly OUT OF SCOPE for MVP.

---

## 8. Artifact Resolution Contract

### 8.1 Input/Output

**Input:** Selected adapter catalog entry

**Output:** Ordered list of `{ sourcePath, targetPath, content }` records, or `null` for generic adapter.

### 8.2 Resolution Algorithm

```
function resolveArtifact(adapterEntry, packageRoot):
  // Generic adapter: no binding files
  if adapterEntry.artifact is null:
    return null

  // Specialized adapter: resolve bundled files
  sourceDir = join(packageRoot, adapterEntry.artifact)

  // Verify source directory exists
  if not exists(sourceDir):
    return null  // fall back to generic behavior

  // Recursively read all files
  files = readDirRecursive(sourceDir)

  // Sort for deterministic ordering
  files.sort()

  // Map to target paths
  return files.map(f => ({
    sourcePath: join(sourceDir, f),
    targetPath: mapToTargetPath(f, adapterEntry.id),
    content: readFile(join(sourceDir, f))
  }))
```

### 8.3 Path Mapping Rules

| Source Pattern | Target Pattern |
|---------------|----------------|
| `adapters/opencode/SKILL.md` | `.opencode/skills/pcm-pwf/SKILL.md` |
| `adapters/opencode/pcm-core.mdc` | `.opencode/rules/pcm-core.mdc` |
| `adapters/copilot/*` | `.github/copilot-instructions.md` (or similar) |

The mapping is defined per adapter in the catalog or by convention. For MVP, the mapping is hardcoded per adapter.

### 8.4 Path Traversal Restrictions

1. All source paths MUST be within `adapterEntry.artifact` directory
2. No `..` segments in resolved paths
3. No absolute paths in source or target
4. If path traversal is detected → skip file, log warning, continue

### 8.5 Illegal Path Rejection

Reject and skip any file where:

- `sourcePath` resolves outside `packageRoot`
- `targetPath` contains `..` segments
- `targetPath` is an absolute path
- `targetPath` targets a governance path (e.g., `docs/gates/*`)

### 8.6 Deterministic Ordering

Files are sorted alphabetically by their relative path within the artifact directory. This ensures the same adapter always produces the same file list in the same order.

### 8.7 Generic Adapter Resolution

When `adapterEntry.artifact` is `null`:

- Return `null` (no binding files)
- This is NOT an error
- Installation proceeds with core files only

---

## 9. Core Installation Contract

### 9.1 Managed Core Files

| Source (package) | Target (repository) |
|------------------|---------------------|
| `core/PCM.md` | `pcm/docs/PCM.md` |
| `core/PWF.md` | `pcm/docs/PWF.md` |
| `core/CONFORMANCE.md` | `pcm/docs/CONFORMANCE.md` |

### 9.2 Distribution Expectation

Core files are distributed **verbatim**. The content in `core/PCM.md` in the package is written byte-for-byte to `pcm/docs/PCM.md` in the target. No modification, no interpolation, no templating.

### 9.3 Directory Creation

Before writing any file, create parent directories if they do not exist:

```
createDirectories([
  "pcm/docs/",
  "pcm/workstreams/",
])
```

Directory creation is idempotent. Creating an existing directory is not an error.

### 9.4 Behavior on Pre-Existing Files

| Scenario | Behavior |
|----------|----------|
| File does not exist | Create file |
| File exists with identical content | Skip write (idempotent) |
| File exists with different content | Overwrite with package content |
| File exists but is read-only | EXIT 1, error "Cannot write: <path> (file is read-only)" |

### 9.5 Behavior on Partial Installation

If installation is interrupted mid-write:

1. The manifest will NOT exist or will be incomplete
2. On next `npx pcm init`, the full installation proceeds
3. Partial files are overwritten with correct content
4. No special recovery logic needed — `npx pcm init` is idempotent

### 9.6 Governance Protection

`npx pcm init` MUST NOT write to:

- `docs/gates/*`
- `pcm/workstreams/*`
- Any file listed in an existing manifest's `managedFiles` that is a governance file

If a target path resolves to a governance path → skip file, log warning.

---

## 10. Manifest Contract

### 10.1 Schema

```json
{
  "pcmVersion": "<string>",
  "distributionVersion": "<string>",
  "initializedAt": "<ISO 8601 timestamp>",
  "adapter": {
    "id": "<string>",
    "origin": "built-in",
    "artifactPath": "<string|null>",
    "version": "<string>"
  },
  "core": {
    "pcm": "pcm/docs/PCM.md",
    "pwf": "pcm/docs/PWF.md",
    "conformance": "pcm/docs/CONFORMANCE.md"
  },
  "binding": ["<string>"],
  "managedFiles": ["<string>"],
  "state": "<bootstrapped|partial|invalid>"
}
```

### 10.2 Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `pcmVersion` | string | Version of PCM specification installed (from package) |
| `distributionVersion` | string | Version of `pcm` npm package |
| `initializedAt` | string | ISO 8601 timestamp of first initialization |
| `adapter.id` | string | Selected adapter ID |
| `adapter.origin` | string | Always `"built-in"` for MVP |
| `adapter.artifactPath` | string\|null | Bundled artifact path, `null` for generic |
| `adapter.version` | string | Adapter version (from package metadata) |
| `core.pcm` | string | Path to installed PCM spec |
| `core.pwf` | string | Path to installed PWF spec |
| `core.conformance` | string | Path to installed conformance criteria |
| `binding` | string[] | Paths to adapter binding files (empty for generic) |
| `managedFiles` | string[] | All files written by distribution mechanism |
| `state` | string | Installation state |

### 10.3 State Values

| Value | Meaning |
|-------|---------|
| `"bootstrapped"` | Core artifacts, binding, and manifest present and valid |
| `"partial"` | Some artifacts present but incomplete |
| `"invalid"` | Artifacts present but corrupted |

### 10.4 Timestamp

- `initializedAt` is set on first initialization
- On repeat init (idempotent), `initializedAt` is preserved from the existing manifest
- On new init (overwrite), `initializedAt` is set to current time

### 10.5 Deterministic vs Non-Deterministic

| Field | Deterministic? |
|-------|---------------|
| `pcmVersion` | Yes |
| `distributionVersion` | Yes |
| `initializedAt` | No (timestamp) |
| `adapter.*` | Yes |
| `core.*` | Yes |
| `binding` | Yes |
| `managedFiles` | Yes |
| `state` | Yes |

### 10.6 Manifest as Package-Managed

The manifest is **generated** by the distribution mechanism. It is:

- Created by `npx pcm init`
- Updated by `pcm update` (future)
- NOT project-owned governance content
- OVERWRITTEN on re-init (it records what the distribution wrote)
- NOT silently overwritten if user manually modified it — detect and report conflict

---

## 11. Ownership Contract

### 11.1 Ownership Categories

| Category | Files | Package-Managed? | Owner |
|----------|-------|-------------------|-------|
| Distributed Core | `pcm/docs/PCM.md`, `pcm/docs/PWF.md`, `pcm/docs/CONFORMANCE.md` | Yes | PCM project |
| Binding / Adapter | `.opencode/skills/*`, `.opencode/rules/*`, etc. | No (adapter-specific) | Adapter author |
| Tooling State | `pcm/.pcm-manifest.json` | Yes (generated) | Distribution mechanism |
| Governance State | `docs/gates/*`, `pcm/workstreams/*` | NEVER | Project (user-owned) |

### 11.2 Executable Rules

```
function writeOrSkip(targetPath, content, ownership):

  if ownership === "governance":
    REJECT: "Refusing to write governance file: <path>"
    return

  if not exists(targetPath):
    createDirectories(dirname(targetPath))
    writeFile(targetPath, content)
    return

  existing = readFile(targetPath)

  if existing === content:
    return  // idempotent, no write needed

  if ownership === "core" or ownership === "tooling":
    writeFile(targetPath, content)  // overwrite
    return

  if ownership === "binding":
    writeFile(targetPath, content)  // overwrite (adapter-specific)
    return
```

### 11.3 Conflict Scenarios

| Scenario | Behavior |
|----------|----------|
| Target path does not exist | Create file |
| File exists with identical content | Skip write |
| File exists with different content, core/tooling | Overwrite |
| File exists with different content, binding | Overwrite |
| File exists, governance path | Refuse to write |
| File is read-only | EXIT 1 |
| Directory does not exist | Create directory tree |
| Existing manifest exists | Read, validate, update or overwrite |

### 11.4 Governance File Detection

A file is governance if:

- It matches `docs/gates/*`
- It matches `pcm/workstreams/*`
- It is listed in an existing manifest's `managedFiles` AND is under a governance path

---

## 12. Idempotency Contract

### 12.1 First Init

**Observable behavior:**

1. Manifest does not exist → create it
2. Core files do not exist → create them
3. Binding files do not exist → create them
4. All directories created
5. Output: "PCM initialized successfully. Adapter: <id>. Files written: <count>."

### 12.2 Repeat Init (Same Package Version)

**Observable behavior:**

1. Manifest exists and is valid → check if same adapter
2. Core files exist with identical content → skip write
3. Binding files exist with identical content → skip write
4. Manifest updated with current timestamp (if changed)
5. Output: "PCM initialized successfully. Adapter: <id>. Files written: 0." (or same count if manifest was rewritten)

### 12.3 Partial Init

**Observable behavior:**

1. Manifest exists but `state` is `"partial"` or missing fields
2. All core files written (even if some exist)
3. All binding files written (even if some exist)
4. Manifest overwritten with complete state
5. Output: "PCM initialized successfully. Adapter: <id>. Files written: <count>."

### 12.4 Invalid Installation

**Observable behavior:**

1. Manifest exists but references files that do not exist
2. OR core files are corrupted (empty, wrong content)
3. All files overwritten with correct content
4. Manifest overwritten with correct state
5. Output: "PCM initialized successfully. Adapter: <id>. Files written: <count>."

### 12.5 Manual Modification

**Observable behavior:**

1. User modified a managed file (core or binding)
2. On re-init, file is overwritten with package content
3. Output: "PCM initialized successfully. Adapter: <id>. Files written: <count>."
4. WARNING printed: "Overwrote locally modified file: <path>"

### 12.6 Different Package Version

**Observable behavior:**

1. Manifest exists with `distributionVersion: "1.0.0"`
2. Running package is version `"1.1.0"`
3. All files overwritten with new package content
4. Manifest updated with new version
5. Output: "PCM initialized successfully. Adapter: <id>. Files written: <count>."
6. INFO printed: "Updated from distribution v1.0.0 to v1.1.0"

---

## 13. Failure / Recovery Contract

### 13.1 Preflight Checks

Before any file writes, verify:

1. Target directory exists and is writable
2. Package catalog is valid JSON
3. Package catalog schema is valid
4. All adapter artifact directories exist in package
5. Core artifact files exist in package

If any preflight fails → EXIT 1 before writing any files.

### 13.2 Atomicity Expectations

MVP does NOT guarantee atomic writes. If the process is interrupted:

1. Some files may be written, others not
2. Manifest may be missing or incomplete
3. Next `npx pcm init` will repair the installation

### 13.3 Rollback Expectations

MVP does NOT implement rollback. On failure:

1. Report the error
2. Report which files were written before failure
3. Advise user to re-run `npx pcm init` to repair

### 13.4 Error Reporting

Every error produces:

```
Error: <clear description of what failed>
Recovery: <specific action the user can take>
```

### 13.5 Failed Init Must Not Claim Success

If ANY step fails:

1. Exit code MUST be `1`
2. stdout MUST NOT include "PCM initialized successfully"
3. Manifest MUST NOT be written with `state: "bootstrapped"`
4. If manifest was partially written, it MUST reflect actual state

---

## 14. Portability Contract

### 14.1 Platform-Neutral Behavior

The distribution layer MUST remain generic across:

| Platform | Supported |
|----------|-----------|
| Windows (PowerShell) | Yes |
| Linux (Bash) | Yes |
| macOS (Zsh) | Yes |

### 14.2 No Language Assumptions

The target repository may be:

- Node.js / JavaScript / TypeScript
- Python
- Go
- Rust
- PHP
- Ruby
- Java
- .NET
- Non-code repository

The distribution layer MUST NOT assume:
- `package.json` exists
- `node_modules/` exists
- Any specific build tool exists
- Any specific language runtime exists

### 14.3 No Shell-Specific Target Semantics

Target file paths use forward slashes (`/`) universally. Path separators are normalized to the target platform's convention during file writing.

### 14.4 No Node-Specific Target Semantics

The CLI runs on Node.js, but the target repository does not require Node.js. The distribution layer writes standard files (markdown, JSON) that are readable by any tool.

---

## 15. Test Contract

### 15.1 Minimum Test Matrix

| # | Scenario | Expected Result | Verification |
|---|----------|-----------------|--------------|
| A | Empty/unknown repo, no tools | Generic adapter | Check manifest `adapter.id === "generic"`, no binding files |
| B | Unknown repo, OpenCode present, trusted | OpenCode adapter | Check manifest `adapter.id === "opencode"`, binding files exist |
| C | Unknown repo, OpenCode absent | Generic adapter | Check manifest `adapter.id === "generic"`, no binding files |
| D | Unknown repo, OpenCode + Copilot present | Deterministic: opencode (priority 1) | Check manifest `adapter.id === "opencode"` |
| E | Existing valid installation | Idempotent: same result | Check files unchanged, manifest unchanged |
| F | Partial installation | Recovery: full installation | Check all files written, manifest valid |
| G | Modified managed core file | Overwrite with package content | Check file content matches package |
| H | Governance files present | Untouched | Check `docs/gates/*` unchanged |
| I | Windows + PowerShell | Same process, platform-specific paths | Check files written correctly |
| J | Linux + Bash | Same process, platform-specific paths | Check files written correctly |
| K | macOS + Zsh | Same process, platform-specific paths | Check files written correctly |

### 15.2 Test Verification Method

Tests MUST verify actual filesystem results, not just printed messages:

1. After `npx pcm init`, read target files and compare content
2. Read manifest and validate schema
3. Check governance files are byte-identical to pre-init state
4. Check binding files exist (or don't exist for generic)
5. Check directory structure matches expected layout

### 15.3 Determinism Tests

For each test case, run `npx pcm init` twice on the same target and verify:

1. Same adapter selected
2. Same files written
3. Same manifest content (except `initializedAt` if first run)
4. Same stdout output

---

## 16. Implementation Boundary

### 16.1 Four Layers

| Layer | Scope | What It Does | What It Must NOT Do |
|-------|-------|-------------|---------------------|
| **Core Semantics** | PCM/PWF specification | Defines protocol invariants, primitives, roles | Detect environment, select adapters, write files |
| **Distribution** | Package + CLI + bootstrap | Reads catalog, detects env, selects adapter, writes files | Redefine PCM invariants, override governance |
| **Adapter** | Bundled binding artifacts | Provides tool-specific integration files | Violate PCM invariants, redefine primitives |
| **Target Project** | Governance/application state | Project-owned governance, tasks, handoffs | Be overwritten by distribution |

### 16.2 Layer Separation Rules

1. **Core → Distribution:** Distribution reads core specs verbatim. Distribution does NOT interpret, extend, or override core semantics.
2. **Distribution → Adapter:** Distribution reads adapter artifacts from bundled paths. Distribution does NOT modify adapter content.
3. **Adapter → Core:** Adapter files reference core specs. Adapter does NOT redefine core semantics.
4. **Distribution → Target:** Distribution writes core + binding + tooling. Distribution does NOT write governance content.
5. **Target → Distribution:** Target may modify managed files. Distribution detects conflicts on re-init.

### 16.3 No Semantic Leakage

The implementation MUST NOT:

- Move PCM invariants into the distribution layer
- Move trust evaluation into the catalog
- Move capability detection into the selection algorithm
- Move governance protection into the adapter
- Move adapter file writing into the core semantics

Each layer operates within its defined scope.

---

## 17. Implementation Readiness Checklist

| # | Question | Answer |
|---|----------|--------|
| 1 | CLI entrypoint defined? | **YES** — `npx pcm init [target]`, default CWD, exit codes 0/1 |
| 2 | Package layout defined? | **YES** — `bin/`, `src/`, `registry/`, `adapters/`, `core/` |
| 3 | Catalog schema defined? | **YES** — JSON with version, defaultAdapter, adapters[] with id/name/platforms/shells/requires/tested/priority/artifact |
| 4 | Environment record defined? | **YES** — `{ platform, shell, gitVersion, capabilities }` |
| 5 | Capability matching defined? | **YES** — `capabilitiesSatisfied()` checks presence only, values MUST be `"*"` |
| 6 | Trust evaluation defined? | **YES** — `isTrusted()` returns `true` for all bundled adapters + generic |
| 7 | Selection ranking defined? | **YES** — tested DESC, priority ASC, catalog order tiebreak |
| 8 | Artifact resolution defined? | **YES** — `null` for generic, recursive read + path mapping for specialized |
| 9 | Core installation defined? | **YES** — verbatim write of 3 core files, directory creation, governance protection |
| 10 | Manifest defined? | **YES** — JSON schema with pcmVersion, distributionVersion, adapter, core, binding, managedFiles, state |
| 11 | Ownership rules executable? | **YES** — governance → refuse, core/tooling → overwrite, binding → overwrite |
| 12 | Idempotency behavior defined? | **YES** — first/repeat/partial/invalid/manual-modification/different-version all specified |
| 13 | Failure behavior defined? | **YES** — preflight checks, no atomicity, no rollback, exit 1 on error, no false success |
| 14 | Portability defined? | **YES** — platform-neutral, no language assumptions, forward-slash paths |
| 15 | Minimum test matrix defined? | **YES** — 11 scenarios (A–K), filesystem verification, determinism tests |

**ALL ANSWERS ARE YES.**

The architecture is **IMPLEMENTATION-CONTRACT-READY**.

---

**Authority:** This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.
