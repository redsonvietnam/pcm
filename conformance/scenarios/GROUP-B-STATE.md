# Conformance Test Group B — State

**Version:** 1.0  
**Status:** Structured Tests  

## B1: Proposed State Remains Non-Canonical Before Gate

**Setup:**
- Proposal P exists for canonical state change
- No GATE has been executed for P

**Action:**
- Query canonical state
- Query proposed state

**Expected Observable Result:**
- Canonical state does not include changes from P
- P remains in PROPOSED state
- No implicit promotion occurs

**Counterexample:**
- If proposed state is treated as canonical before GATE, FAIL

**PASS/FAIL:**
- PASS: Proposed state remains non-canonical before Gate
- FAIL: Proposed state treated as canonical prematurely

---

## B2: Only Gate + Authority Can Promote Proposed State

**Setup:**
- Proposal P exists for canonical state change
- GATE criteria are defined

**Action:**
- Execute GATE verification
- AUTHORITY approves P

**Expected Observable Result:**
- P becomes canonical only after GATE + AUTHORITY approval
- GATE and AUTHORITY are both required
- No single mechanism suffices alone

**Counterexample:**
- If proposed state becomes canonical without both GATE and AUTHORITY, FAIL

**PASS/FAIL:**
- PASS: Only Gate + Authority can promote proposed state to canonical
- FAIL: Promotion occurs without complete Gate + Authority

---

## B3: Task Completion ≠ Canonical Promotion

**Setup:**
- Task T is associated with proposal P
- Task T reaches COMPLETED state

**Action:**
- Check whether task completion promotes P to canonical

**Expected Observable Result:**
- P remains in PROPOSED state after T completes
- Task completion does not trigger canonical promotion
- P requires separate GATE + AUTHORITY approval

**Counterexample:**
- If task completion automatically promotes associated proposal, FAIL

**PASS/FAIL:**
- PASS: Task completion does not automatically promote canonical state
- FAIL: Task completion triggers canonical promotion

---

## B4: Execution State ≠ Canonical State

**Setup:**
- Task T is EXECUTING
- Execution state contains intermediate work products

**Action:**
- Query canonical state
- Query execution state

**Expected Observable Result:**
- Canonical state does not include execution state contents
- Execution state is temporary and not authoritative
- Execution state may be lost without affecting canonical state

**Counterexample:**
- If execution state is treated as canonical, FAIL

**PASS/FAIL:**
- PASS: Execution state is not canonical state
- FAIL: Execution state treated as canonical

---

## B5: Context State ≠ Canonical State

**Setup:**
- Actor X has session context C
- C contains working state, memory, local environment

**Action:**
- Query canonical state
- Compare with context state C

**Expected Observable Result:**
- Canonical state is independent of C
- C does not override canonical state
- Different actors may have different context states for same work

**Counterexample:**
- If context state overrides canonical state, FAIL

**PASS/FAIL:**
- PASS: Context state is not canonical state
- FAIL: Context state overrides canonical

---

## B6: Stale Context Cannot Silently Override Canonical

**Setup:**
- Actor X has context C that is stale
- Canonical state has changed since C was created

**Action:**
- Actor X attempts to use stale context C for decision

**Expected Observable Result:**
- Stale context is detectable
- System flags divergence between C and canonical state
- Decision cannot proceed without fresh canonical state

**Counterexample:**
- If stale context can override canonical state without detection, FAIL

**PASS/FAIL:**
- PASS: Stale context cannot silently override canonical state
- FAIL: Stale context overrides canonical without detection

---

## B7: Multiple Proposals May Coexist

**Setup:**
- Proposal A exists for scope S
- Proposal B exists for scope S (non-conflicting)

**Action:**
- Both proposals remain in PROPOSED state

**Expected Observable Result:**
- Both A and B coexist as PROPOSED
- Neither is automatically rejected
- Both await GATE + AUTHORITY

**Counterexample:**
- If non-conflicting proposals cannot coexist, FAIL

**PASS/FAIL:**
- PASS: Multiple non-conflicting proposals may coexist
- FAIL: Non-conflicting proposals cannot coexist

---

## B8: Conflicting Proposals Cannot Silently Resolve

**Setup:**
- Proposal X exists for canonical state C
- Proposal Y exists for canonical state C (conflicting with X)
- Neither has been approved

**Action:**
- Wait for resolution
- Check whether one proposal silently wins

**Expected Observable Result:**
- Neither X nor Y becomes canonical silently
- AUTHORITY must explicitly resolve the conflict
- Creation order does not determine outcome
- Implementation order does not determine outcome

**Counterexample:**
- If conflicting proposals silently resolve (e.g., last-write-wins), FAIL

**PASS/FAIL:**
- PASS: Conflicting proposals cannot silently resolve
- FAIL: One proposal silently wins