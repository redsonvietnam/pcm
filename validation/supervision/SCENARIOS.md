# Supervision Conformance Scenarios

**Project:** redsonvietnam/supervision
**Scope:** 10 conformance scenarios against PCM/PWF v1.0

---

## S1 — Small Task

**Scenario:** Fix a minor bug (e.g., import error).

**PCM Flow:**
1. PROPOSAL: Developer identifies bug
2. EXECUTION: Fix code
3. EVIDENCE: pytest passes
4. GATE: Merge to master
5. CANONICAL: master updated

**Supervision Flow:**
1. Developer identifies bug locally
2. Fix code
3. Run pytest
4. Commit to master
5. master is updated

**Classification:** PASS

**Evidence:** Supervision is a simple tool — this flow works trivially.

---

## S2 — Task Requiring Runtime Execution

**Scenario:** Add a new normalization step to the pipeline.

**PCM Flow:**
1. PROPOSAL: Describe what/why
2. EXECUTION: Implement new step
3. VERIFY: Pipeline runs successfully
4. GATE: Tests pass
5. CANONICAL: Code on master

**Supervision Flow:**
1. Developer decides to add normalization
2. Write code in `ocr.py`
3. Run pipeline on test images
4. pytest passes
5. Commit to master

**Classification:** PASS

**Evidence:** Supervision's pipeline is designed for this kind of extension.

---

## S3 — Task with Implementation Followed by Independent Verification

**Scenario:** Implement OCR improvement, then test it.

**PCM Flow:**
1. PROPOSAL: Improve OCR accuracy
2. EXECUTION: Write code
3. INDEPENDENT VERIFICATION: Run tests
4. GATE: Tests pass
5. CANONICAL: Code + tests on master

**Supervision Flow:**
1. Developer improves OCR logic
2. Write code in `ocr.py`
3. Run `pytest tests/test_pure_functions.py`
4. Tests pass
5. Commit to master

**Classification:** PASS

**Evidence:** Supervision has tests in `tests/test_pure_functions.py`.

---

## S4 — Task with Proposed State Followed by Gate

**Scenario:** Propose a new model configuration, then approve it.

**PCM Flow:**
1. PROPOSAL: New configuration
2. REVIEW: Evaluate proposal
3. GATE: Approve or reject
4. CANONICAL: Configuration updated

**Supervision Flow:**
1. Developer proposes new YOLO model
2. Test locally
3. Decide to keep or revert
4. Update configuration

**Classification:** PASS-WITH-ADAPTER

**Evidence:** Supervision uses local testing as the gate.

**Adapter Note:** No formal gate mechanism — approval is implicit in commit.

---

## S5 — Stale Handoff

**Scenario:** Developer returns after time away, code may have changed.

**PCM Flow:**
1. HANDOFF: Previous session state
2. DRIFT: Code changes
3. DETECTION: Developer notices mismatch
4. RECONCILIATION: Developer updates understanding

**Supervision Flow:**
1. Developer reads README.md
2. Code may have changed locally
3. Developer checks git status
4. Developer updates context

**Classification:** PASS-WITH-ADAPTER

**Evidence:** Supervision has minimal handoff — README.md serves this purpose.

**Adapter Note:** No formal handoff document — developer reads code directly.

---

## S6 — Conflicting Proposals

**Scenario:** Two different approaches to the same problem.

**PCM Flow:**
1. PROPOSAL A: Approach A
2. PROPOSAL B: Approach B
3. DETECTION: Conflict detected
4. RESOLUTION: Choose one

**Supervision Flow:**
1. Developer considers approach A
2. Developer considers approach B
3. Local decision
4. Implement chosen approach

**Classification:** PASS-WITH-ADAPTER

**Evidence:** Supervision is single-developer — conflicts are internal.

**Adapter Note:** No external conflict detection needed.

---

## S7 — Authority Delay

**Scenario:** Proposal made but authority is unavailable.

**PCM Flow:**
1. PROPOSAL: Change proposed
2. WAIT: Authority unavailable
3. RESOLUTION: Authority returns

**Supervision Flow:**
1. Developer decides to make change
2. Developer steps away
3. Developer returns and continues

**Classification:** PASS-WITH-ADAPTER

**Evidence:** Supervision is single-developer — authority delay is trivial.

**Adapter Note:** No formal authority tracking.

---

## S8 — Task Completion Before Canonical Approval

**Scenario:** Code is written but not yet committed.

**PCM Flow:**
1. EXECUTION: Code written
2. TASK COMPLETED: Code is done
3. GATE: Pending commit
4. CANONICAL: After commit

**Supervision Flow:**
1. Developer writes code locally
2. Tests pass
3. Not yet committed
4. After commit, master is updated

**Classification:** PASS

**Evidence:** Supervision uses git — this flow is standard.

---

## S9 — Handoff Between Different Actors/Sessions

**Scenario:** Developer uses different machines or reinstalls.

**PCM Flow:**
1. SESSION A: Work done
2. TRANSFER: Git push/pull
3. SESSION B: Reads code, continues

**Supervision Flow:**
1. Developer works on machine A
2. Git push to remote
3. Developer works on machine B
4. Git pull, continue

**Classification:** PASS

**Evidence:** Supervision uses git for session transfer.

---

## S10 — Recovery After Interrupted Execution

**Scenario:** Pipeline crashes mid-processing.

**PCM Flow:**
1. EXECUTION: Pipeline starts
2. INTERRUPT: Crash
3. HANDOFF: Checkpoint (if any)
4. RECOVERY: Resume from last good state

**Supervision Flow:**
1. Pipeline starts processing
2. Crash (e.g., out of memory)
3. No checkpoint mechanism
4. Developer restarts pipeline

**Classification:** PASS-WITH-ADAPTER

**Evidence:** Supervision has no checkpoint mechanism — restart from beginning.

**Adapter Note:** Supervision processes are restartable but not resumable.
