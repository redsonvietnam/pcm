# Bamso Conformance Scenarios

**Project:** redsonvietnam/bamso
**Scope:** 10 conformance scenarios against PCM/PWF v1.0

---

## B1 — Small Task

**Scenario:** Fix a minor bug (e.g., lint warning).

**PCM Flow:**
1. PROPOSAL: Developer identifies bug
2. EXECUTION: Fix on dev branch
3. EVIDENCE: `npm run lint` passes
4. GATE: Merge dev → main
5. CANONICAL: main updated

**Bamso Flow:**
1. Developer describes bug in chat
2. Agent fixes code (surgical changes per AGENTS.md)
3. Verify: `npm run lint` + `node scratch/e2e-test.mjs`
4. Merge to main
5. main is updated

**Classification:** PASS

**Evidence:** Bamso workflow-v4.md defines this exact flow (Luồng A).

---

## B2 — Task Requiring Runtime Execution

**Scenario:** Implement a new queue operation (e.g., restore skipped ticket).

**PCM Flow:**
1. PROPOSAL: Describe what/why
2. PLAN: Reference existing stack (CLAUDE.md, decisions.md)
3. EXECUTION: Implement on dev
4. VERIFY: e2e test + manual UI check
5. GATE: Build + tests pass
6. CANONICAL: main updated

**Bamso Flow:**
1. Describe feature (chat or Spec Kit)
2. Agent asks max 3 clarifying questions
3. Agent implements on dev branch
4. Run `node scratch/e2e-test.mjs`
5. `npm run build` + `npm test` pass
6. Merge to main

**Classification:** PASS

**Evidence:** Bamso workflow-v4.md Luồng B defines this flow.

---

## B3 — Task with Implementation Followed by Independent Verification

**Scenario:** Implement PII redaction, then have tests verify it.

**PCM Flow:**
1. PROPOSAL: Implement PII redaction
2. EXECUTION: Write code
3. INDEPENDENT VERIFICATION: Write tests
4. GATE: Tests pass
5. CANONICAL: Code + tests on main

**Bamso Flow:**
1. Implement `redactTicketsForRole` in sse-broker.ts
2. Write 18 unit tests for SSE broker
3. Write e2e test for PII flow
4. `npm test` 67/67 pass
5. Merge to main

**Classification:** PASS

**Evidence:** HANDOFF.md Phiên 5 records this exact sequence.

---

## B4 — Task with Proposed State Followed by Gate

**Scenario:** Propose a new decision, then approve it.

**PCM Flow:**
1. PROPOSAL: New entry in decisions.md
2. REVIEW: Evaluate proposal
3. GATE: Approve or reject
4. CANONICAL: decisions.md updated

**Bamso Flow:**
1. New decision proposed (e.g., DECISION #005)
2. Developer evaluates (weighs alternatives)
3. Decision approved (committed to decisions.md)
4. decisions.md is canonical

**Classification:** PASS-WITH-ADAPTER

**Evidence:** decisions.md has 5 recorded decisions with rationale.

**Adapter Note:** No formal gate mechanism — approval is implicit in commit.

---

## B5 — Stale Handoff

**Scenario:** Session A creates HANDOFF.md. Session B reads it but code has changed.

**PCM Flow:**
1. HANDOFF: Session A writes HANDOFF.md
2. DRIFT: Code changes on main
3. DETECTION: Session B reads HANDOFF.md, notices mismatch
4. RECONCILIATION: Session B updates HANDOFF.md

**Bamso Flow:**
1. HANDOFF.md updated at end of session
2. Code changes on main (other session or manual)
3. New session reads HANDOFF.md, checks actual state
4. HANDOFF.md updated with current state

**Classification:** PASS

**Evidence:** HANDOFF.md explicitly tracks "Trạng thái hiện tại" vs "Việc cần làm".

---

## B6 — Conflicting Proposals

**Scenario:** Two sessions propose different solutions to the same problem.

**PCM Flow:**
1. PROPOSAL A: Solution A
2. PROPOSAL B: Solution B
3. DETECTION: Conflict detected
4. RESOLUTION: Choose one or merge

**Bamso Flow:**
1. Session proposes fix
2. Another session proposes different fix
3. Git merge conflict or manual detection
4. Developer resolves (ad-hoc)

**Classification:** PASS-WITH-ADAPTER

**Evidence:** HANDOFF.md Phiên 2 records a conflict where "fix KHÔNG có trong code" was detected.

**Adapter Note:** No formal conflict resolution mechanism — resolved ad-hoc.

---

## B7 — Authority Delay

**Scenario:** Proposal is made but authority is unavailable to approve.

**PCM Flow:**
1. PROPOSAL: Change proposed
2. WAIT: Authority unavailable
3. RESOLUTION: Authority returns and approves/rejects

**Bamso Flow:**
1. Feature proposed in chat
2. Developer steps away
3. Developer returns and continues

**Classification:** PASS-WITH-ADAPTER

**Evidence:** HANDOFF.md tracks open decisions (Redis production, DEMO_MODE_ENABLED) that are waiting on authority.

**Adapter Note:** No formal authority tracking — delay is implicit.

---

## B8 — Task Completion Before Canonical Approval

**Scenario:** Code is written but not yet merged to main.

**PCM Flow:**
1. EXECUTION: Code written
2. TASK COMPLETED: Code is done
3. GATE: Pending merge
4. CANONICAL: After merge

**Bamso Flow:**
1. Agent writes code on dev
2. Tests pass
3. Merge pending (not yet merged)
4. After merge, main is updated

**Classification:** PASS

**Evidence:** HANDOFF.md Phiên 3 records "Vẫn CHƯA merge" — task completed but not canonical.

---

## B9 — Handoff Between Different Actors/Sessions

**Scenario:** Session A (opencode) does work, Session B (opencode/fes) continues.

**PCM Flow:**
1. SESSION A: Work done, HANDOFF written
2. TRANSFER: HANDOFF passed to Session B
3. SESSION B: Reads HANDOFF, continues work

**Bamso Flow:**
1. Phiên 1 (acc lxn): Audit + findings
2. Phiên 2 (acc skde): Verification + fixes
3. Phiên 3 (opencode): Merge + verification
4. Phiên 4 (opencode/fes): Further fixes
5. Phiên 5 (opencode): Merge + tasks
6. Phiên 6 (opencode): Cookie + lint + CSP + CI

**Classification:** PASS

**Evidence:** HANDOFF.md explicitly tracks session transitions with "Phiên N" format.

---

## B10 — Recovery After Interrupted Execution

**Scenario:** Agent stops mid-task, new session resumes.

**PCM Flow:**
1. EXECUTION: Work starts
2. INTERRUPT: Agent stops
3. HANDOFF: Context captured
4. RECOVERY: New session reads HANDOFF, resumes

**Bamso Flow:**
1. Agent starts work
2. Session ends (timeout or manual stop)
3. HANDOFF.md updated with current state
4. New session reads HANDOFF.md, continues

**Classification:** PASS

**Evidence:** HANDOFF.md is designed for exactly this scenario — "Trạng thái hiện tại" + "Việc cần làm".
