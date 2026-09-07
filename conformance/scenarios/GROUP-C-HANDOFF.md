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