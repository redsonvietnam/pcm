# Conformance Test Group C — Handoff

**Version:** 1.0  
**Status:** Structured Tests  

## C1: Handoff Contains Sufficient Reconstruction Information

**Setup:**
- Work is in progress
- Handoff H is created

**Action:**
- Inspect H for required elements

**Expected Observable Result:**
- H contains: canonical state reference, pending proposals, execution context, authority delegation (if applicable), evidence of progress, next action recommendation
- H is sufficient for reconstruction

**Counterexample:**
- If H lacks required elements, FAIL

**PASS/FAIL:**
- PASS: Handoff contains sufficient reconstruction information
- FAIL: Handoff missing required elements

---

## C2: Previous Session Memory Not Required

**Setup:**
- Handoff H exists from Session 1
- Session 2 begins with new actor

**Action:**
- New actor uses H to continue work
- No access to Session 1 memory

**Expected Observable Result:**
- New actor can continue work using H + referenced canonical state
- No Session 1 memory required
- Work is reconstructable

**Counterexample:**
- If Session 1 memory is required, FAIL

**PASS/FAIL:**
- PASS: Previous session memory not required
- FAIL: Session memory required for reconstruction

---

## C3: Referenced Canonical State Is Resolvable

**Setup:**
- Handoff H references canonical state at address A

**Action:**
- Attempt to resolve A

**Expected Observable Result:**
- A is resolvable through applicable persistence mechanism
- Canonical state can be retrieved
- Reference is valid

**Counterexample:**
- If canonical state reference is not resolvable, FAIL

**PASS/FAIL:**
- PASS: Referenced canonical state is resolvable
- FAIL: Canonical state reference not resolvable

---

## C4: Handoff Does Not Silently Transfer Authority

**Setup:**
- Handoff H includes authority delegation for Actor X
- Actor Y receives H

**Action:**
- Actor Y attempts to use delegated authority

**Expected Observable Result:**
- Authority transfer requires explicit governance mechanism
- H does not automatically transfer authority
- Authority delegation is traceable

**Counterexample:**
- If H automatically transfers authority, FAIL

**PASS/FAIL:**
- PASS: Handoff does not silently transfer authority
- FAIL: Handoff automatically transfers authority

---

## C5: New Actor Can Determine System State

**Setup:**
- Handoff H exists
- New actor receives H

**Action:**
- New actor queries system state using H

**Expected Observable Result:**
- New actor can determine: current canonical state, pending proposals, authority scope, execution status, evidence, next action
- All information is retrievable

**Counterexample:**
- If new actor cannot determine system state, FAIL

**PASS/FAIL:**
- PASS: New actor can determine system state
- FAIL: System state not determinable from handoff

---

## C6: Stale Handoff Can Be Detected

**Setup:**
- Handoff H references canonical state at time T1
- Canonical state changes at time T2
- H is used after T2

**Action:**
- Attempt to use H after canonical state has changed

**Expected Observable Result:**
- Divergence between H and current canonical state is detectable
- System flags stale handoff
- H cannot be used without reconciliation

**Counterexample:**
- If stale handoff cannot be detected, FAIL

**PASS/FAIL:**
- PASS: Stale handoff can be detected
- FAIL: Stale handoff cannot be detected

---

## C7: Transmitted Claims Do Not Become Verified Evidence

**Setup:**
- Handoff H contains claim C from the sending actor
- Claim C asserts a factual state (e.g., "tests passed", "review complete")

**Action:**
- Receiver attempts to treat C as verified evidence without independent verification

**Expected Observable Result:**
- C is transmitted context, not verified evidence
- C's provenance is self-reported (from the sending actor)
- Receiver must independently verify C if the decision requires verified evidence
- C does not become canonical state, authority, or approval by virtue of being in H

**Counterexample:**
- If transmitted claims automatically become verified evidence, FAIL

**PASS/FAIL:**
- PASS: Transmitted claims do not become verified evidence
- FAIL: Transmitted claims automatically become verified evidence

---

## C8: Material Established State Must Survive Handoff

**Setup:**
- Work state S is established (verified, completed, or canonical)
- S is relevant to the transferred TASK
- Handoff H is created

**Action:**
- Inspect H for reference to or representation of S

**Expected Observable Result:**
- H preserves S or references it such that the receiver can determine S is established
- S survives the handoff without requiring re-establishment
- Receiver can distinguish established state from pending state

**Counterexample:**
- If material established state is omitted and receiver must re-establish it, FAIL

**PASS/FAIL:**
- PASS: Material established state survives handoff
- FAIL: Material established state lost in handoff

---

## C9: Material Unresolved State Must Survive Handoff

**Setup:**
- Work state U is unresolved, blocked, failed, or unverified
- U is relevant to the transferred TASK
- Handoff H is created

**Action:**
- Inspect H for reference to or representation of U

**Expected Observable Result:**
- H preserves U or references it such that the receiver can determine U is unresolved
- U survives the handoff without being silently dropped
- Receiver can distinguish unresolved state from established state
- Blocked/failed/unverified status is visible

**Counterexample:**
- If material unresolved state is silently omitted, FAIL

**PASS/FAIL:**
- PASS: Material unresolved state survives handoff
- FAIL: Material unresolved state lost in handoff

---

## C10: Receiver Can Determine Next Authorized Action

**Setup:**
- Handoff H is created for transferred TASK T
- TASK T has applicable constraints, acceptance criteria, and established work state

**Action:**
- Receiver uses H to determine the next authorized action for T

**Expected Observable Result:**
- Receiver can determine what action is authorized next
- Receiver can distinguish authorized action from merely technically possible action
- H provides sufficient material work state to determine authorized next step
- Receiver does not need to guess or assume what is required

**Counterexample:**
- If receiver cannot determine next authorized action from H, FAIL

**PASS/FAIL:**
- PASS: Receiver can determine next authorized action
- FAIL: Next authorized action not determinable from handoff

---

## C11: Incidental Context May Be Omitted When Non-Material

**Setup:**
- Handoff H is created
- Context X exists that is incidental to the transferred TASK
- Omission of X cannot reasonably change the next authorized action or cause a materially incorrect inference

**Action:**
- Create H without including X

**Expected Observable Result:**
- H is valid without X
- Omission of non-material context does not invalidate the handoff
- Receiver can continue work without X

**Counterexample:**
- If non-material context omission invalidates the handoff, FAIL

**PASS/FAIL:**
- PASS: Incidental non-material context may be omitted
- FAIL: All context required regardless of materiality

---

## C12: Materiality Is Task-Relative

**Setup:**
- Handoff H is created for TASK T
- Information I is included or excluded from H

**Action:**
- Evaluate materiality of I relative to T, its constraints, acceptance criteria, established work state, and next authorized action

**Expected Observable Result:**
- Materiality of I depends on whether its omission could affect T's continuation
- Materiality is evaluated relative to TASK T and its context, not in absolute terms
- The same information I may be material for one TASK and non-material for another
- Materiality anchors to: TASK, constraints, acceptance/decision criteria, established/unresolved work state, authorized next action

**Counterexample:**
- If materiality is evaluated without reference to TASK context, FAIL

**PASS/FAIL:**
- PASS: Materiality is task-relative
- FAIL: Materiality is task-independent

---

## C13: Receiver Preference Alone Does Not Establish Materiality

**Setup:**
- Handoff H is created for TASK T
- Receiver prefers to receive information I
- I is not material to T's continuation (omission cannot reasonably change the next authorized action)

**Action:**
- Evaluate whether I is material based solely on receiver preference

**Expected Observable Result:**
- Receiver preference alone does not make I material
- Materiality is determined by TASK requirements, not receiver desires
- A HANDOFF that omits non-material I is valid even if receiver prefers to have I
- Materiality is objective relative to TASK, not subjective relative to receiver

**Counterexample:**
- If receiver preference alone establishes materiality, FAIL

**PASS/FAIL:**
- PASS: Receiver preference alone does not establish materiality
- FAIL: Receiver preference establishes materiality

---

## C14: HANDOFF Does Not Transfer Approval or Canonical Status

**Setup:**
- Handoff H contains work product W
- W has some status (proposed, in-progress, completed, etc.)
- Actor Y receives H

**Action:**
- Actor Y attempts to treat W as approved or canonical solely because it was in H

**Expected Observable Result:**
- W's status in H is as transmitted, not as approved or canonical
- H does not confer approval, canonical status, or Gate PASS on any work product
- Approval requires separate AUTHORITY action through appropriate Gate
- Canonical status requires Gate approval with AUTHORITY action
- HANDOFF transfers work state, not approval state

**Counterexample:**
- If HANDOFF confers approval or canonical status on transmitted work, FAIL

**PASS/FAIL:**
- PASS: HANDOFF does not transfer approval or canonical status
- FAIL: HANDOFF transfers approval or canonical status