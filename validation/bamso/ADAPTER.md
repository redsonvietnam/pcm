# Bamso Adapter — PCM/PWF Conformance Binding

**Project:** redsonvietnam/bamso
**Type:** Queue Management System (production software)
**Stack:** Next.js 16 + Prisma + SQLite + SSE
**Branch:** main (production-ready)

---

## 1. PROJECT-SPECIFIC OBSERVATIONS

| Dimension | Bamso Reality |
|-----------|--------------|
| Language | TypeScript |
| Runtime | Node.js (Next.js 16 App Router) |
| State | Prisma ORM → SQLite |
| Real-time | Server-Sent Events (SSE) |
| Auth | JWT (jose) → HttpOnly cookies |
| Roles | ADMIN, STAFF, KIOSK, DISPLAY |
| Testing | npm test (unit) + e2e-test.mjs (integration) |
| Deployment | Single-instance, Windows dev, CI/CD via GitHub Actions |
| AI Tooling | OpenCode, Claude, CodeGraph |

---

## 2. PCM SEMANTIC BINDINGS

### 2.1 Where is canonical state?

**PCM SEMANTIC:** The authoritative version of the project that all actors accept as current.

**BAMSO BINDING:**
- Canonical source code: `main` branch (production-ready)
- Canonical schema: `prisma/schema.prisma` (database structure)
- Canonical behavior: `src/lib/queue-service.ts` (core queue logic)
- Canonical configuration: `.env.example` (environment template)
- Canonical decisions: `decisions.md` (architecture decisions)
- Canonical handoff: `HANDOFF.md` (session continuity)
- Canonical workflow: `docs/workflow-v4.md` (development process)

**Project-Specific:** Bamso uses git branches as state boundary. `main` is canonical. `dev` is experimental.

### 2.2 Where is proposed state?

**PCM SEMANTIC:** Changes under development that have not yet been approved.

**BAMSO BINDING:**
- Proposed code: changes on `dev` branch or feature branches
- Proposed decisions: new entries in `decisions.md` (before merge)
- Proposed changes: entries in HANDOFF.md "Việc cần làm" section
- Spec proposals: Spec Kit documents (Phase 2 tooling)

**Project-Specific:** Bamso uses git branching. PR or direct push to `dev` represents proposed state.

### 2.3 How is task state represented?

**PCM SEMANTIC:** The lifecycle of a unit of work.

**BAMSO BINDING:**
- Task representation: TODO items in HANDOFF.md, issues (if used), or ad-hoc descriptions
- Lifecycle states: In-progress (on dev), Completed (merged + verified), Blocked (waiting on decisions)
- Completion evidence: commit hash + passing tests (`npm test` + `node scratch/e2e-test.mjs`)
- No formal task state machine — tasks are informal units in HANDOFF.md

**Project-Specific:** Bamso uses a lightweight handoff document rather than a formal task tracker.

### 2.4 How is Authority represented?

**PCM SEMANTIC:** The entity with power to approve changes to canonical state.

**BAMSO BINDING:**
- Authority: Human developer (fes/acc/other session actors)
- Authority boundaries: Role-based (ADMIN/STAFF/KIOSK/DISPLAY) for runtime operations
- Authority for code changes: Single developer acts as both PROPOSER and AUTHORITY
- No formal gate mechanism — merge to `main` is the de facto authority action
- `decisions.md` records architectural authority decisions

**Project-Specific:** Bamso has a single-author development model. Authority is informal.

### 2.5 How are proposals submitted?

**PCM SEMANTIC:** The mechanism by which changes are proposed for approval.

**BAMSO BINDING:**
- Code proposals: Branch + commit + optional PR (or direct push)
- Decision proposals: New entry in `decisions.md`
- Workflow proposals: Describe in chat or HANDOFF.md
- Spec proposals: Spec Kit documents (when Phase 2 tooling is active)

**Project-Specific:** Bamso uses git-based workflows. No formal proposal system.

### 2.6 How is a HANDOFF represented?

**PCM SEMANTIC:** Transfer of work context between sessions or actors.

**BAMSO BINDING:**
- Primary mechanism: `HANDOFF.md` — structured document with project state, completed work, next tasks
- Secondary: `decisions.md` (architectural context), `AGENTS.md` (behavioral rules)
- Session continuity: HANDOFF.md is updated at end of each session
- Context reconstruction: New session reads HANDOFF.md + relevant docs

**Project-Specific:** Bamso has a well-structured handoff document. This is a strong implementation of PCM handoff semantics.

### 2.7 How is GATE represented?

**PCM SEMANTIC:** Formal approval point before canonical state changes.

**BAMSO BINDING:**
- Informal gate: Merge `dev` → `main` requires:
  - `npm run build` pass
  - `node scratch/e2e-test.mjs` pass
  - No secrets in diff
  - `codegraph sync .` if many files changed
- No formal Authority Gate record — gate is implicit in merge criteria
- `decisions.md` serves as historical gate record for architectural decisions

**Project-Specific:** Bamso has implicit gates (merge criteria) but no formal PCM-style Authority Gate.

### 2.8 How is evidence collected?

**PCM SEMANTIC:** Observable proof that work was done correctly.

**BAMSO BINDING:**
- Test output: `npm test` (unit), `node scratch/e2e-test.mjs` (integration)
- Build output: `npm run build` (compilation success)
- Lint output: `npm run lint` (code quality)
- Type check: `npm run type-check` (type safety)
- Commit history: git log (traceability)
- HANDOFF.md: Session-level evidence of what was done

**Project-Specific:** Bamso has strong evidence collection via automated tests and build verification.

### 2.9 How is evidence provenance determined?

**PCM SEMANTIC:** Who created the evidence and when.

**BAMSO BINDING:**
- Git commits: Author + timestamp + message
- HANDOFF.md: Session actor + date + changelog
- Test results: Timestamped output (if captured)
- decisions.md: Decision date + rationale

**Project-Specific:** Git provides strong provenance. HANDOFF.md provides session-level provenance.

### 2.10 How is stale state detected?

**PCM SEMANTIC:** Detection when context no longer matches canonical state.

**BAMSO BINDING:**
- HANDOFF.md: "Trạng thái hiện tại" section vs actual code state
- decisions.md: SUPERSEDED status for outdated decisions
- Git diff: Local changes vs remote state
- Build failure: Indicates stale assumptions

**Project-Specific:** Bamso uses explicit status markers (SUPERSEDED,已完成) to track staleness.

### 2.11 How are conflicting proposals detected?

**PCM SEMANTIC:** Detection when two proposals modify the same canonical state.

**BAMSO BINDING:**
- Git merge conflicts: Automatic detection during merge
- Handoff conflicts: Multiple sessions modifying HANDOFF.md
- Decision conflicts: Contradictory entries in decisions.md
- No formal conflict resolution mechanism — resolved ad-hoc

**Project-Specific:** Bamso relies on git for conflict detection. No PCM-style conflict resolution protocol.

### 2.12 How is execution performed?

**PCM SEMANTIC:** The mechanism by which work is actually done.

**BAMSO BINDING:**
- Code execution: Developer + AI agent (OpenCode/Claude) writing code
- Test execution: `npm test` (automated), `e2e-test.mjs` (automated)
- Build execution: `npm run build` (automated)
- Deployment: Manual or CI/CD (GitHub Actions)

**Project-Specific:** Bamso uses a human+AI pair programming model.

### 2.13 How is canonical state observed after a Gate?

**PCM SEMANTIC:** Verification that canonical state reflects the approved change.

**BAMSO BINDING:**
- Post-merge verification: Build + tests pass on `main`
- HANDOFF.md update: Records what was completed
- decisions.md update: Records architectural changes
- Git log: Commit on `main` with passing CI

**Project-Specific:** Bamso verifies canonical state through automated checks and documentation updates.

---

## 3. CONFORMANCE ASSESSMENT

### Capability Coverage

| PCM Capability | Bamso Support | Assessment |
|---------------|--------------|------------|
| Canonical state | git `main` branch | PASS |
| Proposed state | git branches / dev | PASS |
| Task state | HANDOFF.md (informal) | PASS-WITH-ADAPTER |
| Authority | Single developer | PASS-WITH-ADAPTER |
| Proposal submission | git branch/commit | PASS |
| HANDOFF | HANDOFF.md (strong) | PASS |
| GATE | Merge criteria (implicit) | PASS-WITH-ADAPTER |
| Evidence | Tests + build + lint | PASS |
| Evidence provenance | Git + HANDOFF.md | PASS |
| Stale state detection | Status markers + git | PASS |
| Conflict detection | Git merge conflicts | PASS |
| Execution | Human + AI agent | PASS |
| Post-gate observation | Build + tests + docs | PASS |

### Summary

- **PASS:** 8 capabilities
- **PASS-WITH-ADAPTER:** 5 capabilities (task state, authority, gate, conflict detection, execution)
- **FAIL:** 0
- **UNSUPPORTED:** 0

---

## 4. KEY FINDINGS

1. **Bamso already implements many PCM semantics informally.** The HANDOFF.md, decisions.md, and git workflow map closely to PCM primitives.

2. **The main adapter gap is formality.** Bamso uses informal mechanisms where PCM requires formal ones (e.g., implicit gate vs formal Authority Gate).

3. **No semantic conflicts discovered.** Bamso's existing workflow does not contradict any PCM invariant.

4. **The single-author model is valid.** PCM allows a single actor to hold PROPOSER+AUTHORITY. Bamso demonstrates this works in practice.

5. **Evidence collection is strong.** Bamso's test suite and build verification provide concrete evidence of conformance.

6. **Handoff is well-structured.** HANDOFF.md is a strong implementation of PCM handoff semantics.

---

## 5. PROJECT-SPECIFIC vs PCM/SEMANTIC

The following are PROJECT-SPECIFIC and should NOT be generalized:

- Git as the state management tool
- Next.js as the runtime
- SQLite as the database
- SSE as the real-time mechanism
- Single-developer authority model
- HANDOFF.md as the handoff format

The following are PCM/SEMANTIC and should be preserved:

- Clear distinction between canonical and proposed state
- HANDOFF as context transfer mechanism
- Evidence-based verification
- Authority separation (even if informal)
- Stale state detection
- Conflict detection via merge
