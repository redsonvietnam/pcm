# Supervision Adapter — PCM/PWF Conformance Binding

**Project:** redsonvietnam/supervision
**Type:** ANPR Pipeline (Automatic Number Plate Recognition)
**Stack:** Python + YOLO + EasyOCR + Gradio
**Branch:** master

---

## 1. PROJECT-SPECIFIC OBSERVATIONS

| Dimension | Supervision Reality |
|-----------|-------------------|
| Language | Python |
| Runtime | Python 3.x |
| State | File system (JSONL output) |
| Real-time | None (batch processing) |
| Auth | None (local tool) |
| Roles | Single user |
| Testing | pytest |
| Deployment | Local CLI + Gradio web UI |
| AI Tooling | None visible |

---

## 2. PCM SEMANTIC BINDINGS

### 2.1 Where is canonical state?

**PCM SEMANTIC:** The authoritative version of the project that all actors accept as current.

**SUPERVISION BINDING:**
- Canonical source code: `master` branch
- Canonical pipeline: `src/anpr/pipeline.py`
- Canonical models: YOLO + EasyOCR (pre-trained)
- Canonical configuration: `pyproject.toml` (dependencies)

**Project-Specific:** Supervision uses a simple git-based model. No formal canonical state tracking.

### 2.2 Where is proposed state?

**PCM SEMANTIC:** Changes under development that have not yet been approved.

**SUPERVISION BINDING:**
- Proposed code: changes on feature branches (if used) or uncommitted local changes
- Proposed configuration: local modifications to pipeline parameters
- No formal proposal mechanism

**Project-Specific:** Supervision is a single-developer tool with minimal workflow.

### 2.3 How is task state represented?

**PCM SEMANTIC:** The lifecycle of a unit of work.

**SUPERVISION BINDING:**
- Task representation: Ad-hoc (no formal task tracking)
- Lifecycle states: Not tracked
- Completion evidence: pytest pass, pipeline runs successfully
- No formal task state machine

**Project-Specific:** Supervision has minimal task tracking — it's a personal tool.

### 2.4 How is Authority represented?

**PCM SEMANTIC:** The entity with power to approve changes to canonical state.

**SUPERVISION BINDING:**
- Authority: Single developer
- Authority boundaries: None (full control)
- No formal gate mechanism

**Project-Specific:** Supervision has a single-author model with no formal authority.

### 2.5 How are proposals submitted?

**PCM SEMANTIC:** The mechanism by which changes are proposed for approval.

**SUPERVISION BINDING:**
- Proposals: Ad-hoc (local development)
- No formal proposal mechanism

**Project-Specific:** Supervision is developed locally with no formal proposal process.

### 2.6 How is a HANDOFF represented?

**PCM SEMANTIC:** Transfer of work context between sessions or actors.

**SUPERVISION BINDING:**
- Primary mechanism: README.md (project description)
- No formal handoff document
- Context reconstruction: Read README + code

**Project-Specific:** Supervision has minimal handoff — it's a simple personal tool.

### 2.7 How is GATE represented?

**PCM SEMANTIC:** Formal approval point before canonical state changes.

**SUPERVISION BINDING:**
- Informal gate: pytest pass, pipeline runs
- No formal Authority Gate

**Project-Specific:** Supervision has no formal gate — tests are the only verification.

### 2.8 How is evidence collected?

**PCM SEMANTIC:** Observable proof that work was done correctly.

**SUPERVISION BINDING:**
- Test output: pytest
- Pipeline output: JSONL predictions, visualizations
- No formal evidence collection

**Project-Specific:** Supervision has basic evidence via test output and pipeline results.

### 2.9 How is evidence provenance determined?

**PCM SEMANTIC:** Who created the evidence and when.

**SUPERVISION BINDING:**
- Git commits: Author + timestamp
- No formal provenance tracking

**Project-Specific:** Supervision has minimal provenance — git history only.

### 2.10 How is stale state detected?

**PCM SEMANTIC:** Detection when context no longer matches canonical state.

**SUPERVISION BINDING:**
- Stale state: Not explicitly tracked
- Detection: Build/test failure

**Project-Specific:** Supervision has no formal stale state detection.

### 2.11 How are conflicting proposals detected?

**PCM SEMANTIC:** Detection when two proposals modify the same canonical state.

**SUPERVISION BINDING:**
- Conflict detection: Git merge conflicts (if branching used)
- No formal conflict resolution

**Project-Specific:** Supervision has minimal conflict detection — single developer.

### 2.12 How is execution performed?

**PCM SEMANTIC:** The mechanism by which work is actually done.

**SUPERVISION BINDING:**
- Code execution: Developer writing Python
- Pipeline execution: CLI command or Gradio UI
- Test execution: pytest

**Project-Specific:** Supervision is a single-developer tool.

### 2.13 How is canonical state observed after a Gate?

**PCM SEMANTIC:** Verification that canonical state reflects the approved change.

**SUPERVISION BINDING:**
- Post-merge verification: pytest pass, pipeline runs
- No formal canonical state observation

**Project-Specific:** Supervision verifies through tests and pipeline execution.

---

## 3. CONFORMANCE ASSESSMENT

### Capability Coverage

| PCM Capability | Supervision Support | Assessment |
|---------------|--------------------|-----------| 
| Canonical state | git master branch | PASS |
| Proposed state | Local changes | PASS-WITH-ADAPTER |
| Task state | Not tracked | UNSUPPORTED BY CURRENT PROJECT |
| Authority | Single developer | PASS-WITH-ADAPTER |
| Proposal submission | Ad-hoc | PASS-WITH-ADAPTER |
| HANDOFF | README.md (minimal) | PASS-WITH-ADAPTER |
| GATE | pytest pass | PASS-WITH-ADAPTER |
| Evidence | pytest + pipeline output | PASS |
| Evidence provenance | Git history | PASS-WITH-ADAPTER |
| Stale state detection | Build failure | PASS-WITH-ADAPTER |
| Conflict detection | Git merge conflicts | PASS-WITH-ADAPTER |
| Execution | Developer + CLI | PASS |
| Post-gate observation | Tests + pipeline | PASS |

### Summary

- **PASS:** 4 capabilities
- **PASS-WITH-ADAPTER:** 7 capabilities
- **UNSUPPORTED BY CURRENT PROJECT:** 1 (task state)
- **FAIL:** 0
- **FRAMEWORK GAP:** 0

---

## 4. KEY FINDINGS

1. **Supervision is a minimal tool.** It has simple workflow needs compared to Bamso.

2. **Many PCM semantics are overkill for Supervision.** A personal tool doesn't need formal authority gates or task state machines.

3. **The core PCM primitives still apply.** Even in a minimal tool, there is canonical state (master), proposed state (local changes), and evidence (tests).

4. **No semantic conflicts discovered.** Supervision's simple workflow does not contradict any PCM invariant.

5. **The adapter gap is formality.** Supervision could adopt more formal mechanisms if needed, but doesn't require them.

6. **Task state is the main gap.** Supervision doesn't track task lifecycle — it's a personal tool with minimal workflow.

---

## 5. PROJECT-SPECIFIC vs PCM/SEMANTIC

The following are PROJECT-SPECIFIC and should NOT be generalized:

- Python as the language
- YOLO + EasyOCR as the models
- File system as the state store
- CLI + Gradio as the interface
- Single-developer model
- No formal workflow

The following are PCM/SEMANTIC and should be preserved:

- Clear distinction between canonical and proposed state
- Evidence-based verification (tests + pipeline output)
- Git as the version control tool
- Authority in the single developer
