# Conformance Test Group A — Authority

**Version:** 1.0  
**Status:** Structured Tests  

## A1: Execution Capability ≠ Authority

**Setup:**
- Actor X has execution capability (can perform tasks)
- No explicit authority delegation exists for Actor X

**Action:**
- Actor X completes a task
- Actor X attempts to mark the task's output as canonical

**Expected Observable Result:**
- Canonical state remains unchanged
- Actor X's attempt is rejected or blocked
- System requires explicit authority delegation before canonical promotion

**Counterexample:**
- If Actor X can mark their own work as canonical solely because they performed the execution, FAIL

**PASS/FAIL:**
- PASS: Canonical state unchanged until explicit authority acts
- FAIL: Execution capability alone enables canonical promotion

---

## A2: Implementation ≠ Approval

**Setup:**
- Task T is assigned to Actor X
- Actor X has authority to execute task T

**Action:**
- Actor X completes task T
- System checks whether task completion triggers approval

**Expected Observable Result:**
- Task T state moves to COMPLETED
- Associated proposed state remains PROPOSED / PENDING GATE
- No automatic canonical promotion occurs

**Counterexample:**
- If task completion automatically triggers canonical state promotion, FAIL

**PASS/FAIL:**
- PASS: Task completion does not trigger approval or canonical promotion
- FAIL: Task completion automatically promotes to canonical

---

## A3: PROPOSER Cannot Silently Canonicalize

**Setup:**
- Actor X holds PROPOSER role
- Actor X submits a proposal for canonical state change
- Actor X does NOT hold AUTHORITY role

**Action:**
- Actor X attempts to apply their own proposal to canonical state

**Expected Observable Result:**
- Proposal remains in PROPOSED state
- Canonical state unchanged
- System requires GATE + AUTHORITY approval

**Counterexample:**
- If PROPOSER can apply their own proposal to canonical state, FAIL

**PASS/FAIL:**
- PASS: PROPOSER cannot silently canonicalize
- FAIL: PROPOSER can bypass GATE/Authority

---

## A4: Single Actor ≠ Automatic Authority

**Setup:**
- Only one actor exists in the system
- No explicit authority delegation mechanism is configured

**Action:**
- The sole actor completes a task
- The sole actor attempts to mark output as canonical

**Expected Observable Result:**
- Canonical state remains unchanged
- System requires explicit governance mechanism for authority
- Being the sole actor does not grant authority

**Counterexample:**
- If the sole actor can canonicalize because no other actor exists, FAIL

**PASS/FAIL:**
- PASS: Single actor does not gain authority merely by being alone
- FAIL: Sole actor automatically gains authority

---

## A5: Authority Must Be Explicit/Resolvable

**Setup:**
- System has multiple actors and tasks

**Action:**
- Query the system for authority status

**Expected Observable Result:**
- System can answer: "Who has AUTHORITY for scope S?"
- Authority is explicit, not ambiguous
- Authority source is traceable

**Counterexample:**
- If authority is implicitly assumed from role, capability, or proximity, FAIL

**PASS/FAIL:**
- PASS: Authority is explicit and resolvable
- FAIL: Authority is ambiguous or implicit

---

## A6: Authority Ambiguity Blocks Silent Canonicalization

**Setup:**
- Two actors have conflicting authority claims for the same scope
- Authority resolution is pending

**Action:**
- Attempt to canonicalize state in the contested scope

**Expected Observable Result:**
- Canonicalization is blocked
- Contested state remains as-is
- No silent resolution occurs

**Counterexample:**
- If contested state can be canonicalized during authority ambiguity, FAIL

**PASS/FAIL:**
- PASS: Authority ambiguity blocks silent canonicalization
- FAIL: Canonicalization proceeds despite ambiguous authority

---

## A7: Escalation ≠ Authority Transfer

**Setup:**
- Actor X encounters authority boundary
- Actor X escalates the decision

**Action:**
- Escalation occurs
- Check whether authority is transferred

**Expected Observable Result:**
- Escalation surfaces the decision beyond current boundary
- Authority is NOT transferred by escalation alone
- Authority transfer requires explicit governance mechanism

**Counterexample:**
- If escalation automatically transfers authority, FAIL

**PASS/FAIL:**
- PASS: Escalation does not itself transfer authority
- FAIL: Escalation implicitly transfers authority

---

## A8: Authority Transfer Requires Explicit Governance

**Setup:**
- Actor X holds authority for scope S
- Actor X wants to transfer authority to Actor Y

**Action:**
- Actor X attempts to transfer authority to Actor Y

**Expected Observable Result:**
- Authority transfer requires explicit governance mechanism
- Transfer is traceable and documented
- Transfer follows defined protocol (e.g., HANDOFF with authority delegation)

**Counterexample:**
- If authority can be transferred without explicit governance mechanism, FAIL

**PASS/FAIL:**
- PASS: Authority transfer requires explicit governance/delegation
- FAIL: Authority transfer occurs without governance mechanism