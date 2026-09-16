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

---

## A9: Non-Material Change Preserves Authorization

**Setup:**
- Actor X has authorization for scope S and object O
- A non-material change occurs to S or O (e.g., metadata correction that does not alter decision-relevant substance)

**Action:**
- Actor X attempts to continue acting under the original authorization

**Expected Observable Result:**
- Authorization remains valid for the original scope and object
- Non-material change does not unnecessarily invalidate authorization
- Actor X can continue without requiring re-authorization
- The non-material change does not alter the scope or object for which authorization was granted

**Counterexample:**
- If non-material change invalidates existing authorization, FAIL

**PASS/FAIL:**
- PASS: Non-material change preserves authorization
- FAIL: Non-material change unnecessarily invalidates authorization

---

## A10: Material Scope Expansion Requires Re-Authorization

**Setup:**
- Actor X has authorization for scope S
- Scope is materially expanded to scope S' (S' includes capabilities or boundaries not in S)

**Action:**
- Actor X attempts to act under the original authorization for scope S, but the action falls within S' (the expanded scope)

**Expected Observable Result:**
- Original authorization for S does not cover actions in S' \ S
- Actor X cannot act in the expanded scope without explicit re-authorization
- Material scope expansion does not automatically extend prior authorization
- Re-authorization is required for the expanded scope

**Counterexample:**
- If material scope expansion automatically extends prior authorization, FAIL

**PASS/FAIL:**
- PASS: Material scope expansion requires re-authorization
- FAIL: Material scope expansion automatically extends authorization

---

## A11: Material Change Does Not Silently Preserve Authorization

**Setup:**
- Actor X has authorization for scope S and object O
- Scope S materially changes to S' or object O materially changes to O'

**Action:**
- Actor X attempts to act under the original authorization, but the action relates to the changed scope S' or changed object O'

**Expected Observable Result:**
- Original authorization does not silently cover the changed scope or object
- Actor X cannot act under changed scope/object without explicit re-authorization
- Material change does not silently preserve authorization for changed scope
- The original authorization remains bound to the original (pre-change) scope/object

**Counterexample:**
- If material change silently preserves authorization for changed scope/object, FAIL

**PASS/FAIL:**
- PASS: Material change does not silently preserve authorization for changed scope
- FAIL: Material change silently preserves authorization

---

## A12: Explicit Re-Authorization Restores Authority for New Scope

**Setup:**
- Actor X had authorization for scope S
- Scope materially changed to S'
- Actor X receives explicit re-authorization for scope S'

**Action:**
- Actor X acts under the re-authorization for scope S'

**Expected Observable Result:**
- Re-authorization grants authority only for the newly authorized scope S'
- Re-authorization does not retroactively cover actions under the original scope S that were not re-authorized
- Authority is bounded by the explicit re-authorization terms
- Re-authorization is traceable and documented

**Counterexample:**
- If re-authorization grants authority beyond the explicitly authorized scope, FAIL

**PASS/FAIL:**
- PASS: Re-authorization restores authority only for newly authorized scope
- FAIL: Re-authorization grants authority beyond explicit scope

---

## A13: Re-Authorization Does Not Create Approval/Canonical Authority

**Setup:**
- Actor X receives re-authorization for scope S'

**Action:**
- Actor X attempts to use re-authorization as approval authority or canonical authority

**Expected Observable Result:**
- Re-authorization does not create approval authority (the ability to approve work at a Gate)
- Re-authorization does not create canonical authority (the ability to declare state canonical)
- Re-authorization grants execution authority within the authorized scope only
- Approval and canonical authority require separate, explicit governance mechanisms

**Counterexample:**
- If re-authorization creates approval or canonical authority, FAIL

**PASS/FAIL:**
- PASS: Re-authorization does not create approval/canonical authority
- FAIL: Re-authorization creates approval/canonical authority