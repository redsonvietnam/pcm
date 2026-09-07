# Conformance Test Group F — Task / PWF

**Version:** 1.0  
**Status:** Structured Tests  

## F1: Task Representable With Required Semantics

**Setup:**
- Task T exists

**Action:**
- Represent T as a record

**Expected Observable Result:**
- T contains: workstream reference, task purpose, authority delegation scope, success criteria, evidence requirements
- T is representable in structured form

**Counterexample:**
- If T cannot be represented with required semantics, FAIL

**PASS/FAIL:**
- PASS: Task representable with required semantics
- FAIL: Task cannot be represented

---

## F2: Task Lifecycle Transitions Are Explicit

**Setup:**
- Task T progresses through states

**Action:**
- Track state transitions

**Expected Observable Result:**
- Each transition has a defined trigger
- Transitions are explicit and traceable
- No implicit state changes

**Counterexample:**
- If state transitions are implicit, FAIL

**PASS/FAIL:**
- PASS: Task lifecycle transitions are explicit
- FAIL: Transitions are implicit

---

## F3: Task COMPLETED ≠ Approval

**Setup:**
- Task T reaches COMPLETED state
- Associated proposal P exists

**Action:**
- Check whether T completion implies P approval

**Expected Observable Result:**
- T completion does not imply P approval
- P remains PROPOSED / PENDING GATE
- P requires separate GATE + AUTHORITY

**Counterexample:**
- If T completion implies P approval, FAIL

**PASS/FAIL:**
- PASS: Task COMPLETED does not imply approval
- FAIL: Task completion implies approval

---

## F4: Task Without Canonical-State Change Completes Without Unnecessary Gate

**Setup:**
- Task T does not change canonical state
- T reaches COMPLETED state

**Action:**
- Check whether GATE is required

**Expected Observable Result:**
- T completes without GATE
- No unnecessary GATE is imposed
- GATE is only required when canonical state changes

**Counterexample:**
- If GATE is required for non-canonical-state-changing tasks, FAIL

**PASS/FAIL:**
- PASS: Task without canonical-state change completes without unnecessary Gate
- FAIL: Unnecessary Gate imposed

---

## F5: Task Changing Canonical State Requires Appropriate Gate

**Setup:**
- Task T changes canonical state
- T reaches COMPLETED state

**Action:**
- Check whether GATE is required

**Expected Observable Result:**
- T requires GATE + AUTHORITY before canonical promotion
- GATE is appropriate for the scope of change
- No bypass of GATE

**Counterexample:**
- If canonical-state-changing task bypasses GATE, FAIL

**PASS/FAIL:**
- PASS: Task changing canonical state requires appropriate Gate
- FAIL: Canonical-state-changing task bypasses Gate

---

## F6: Handoff Between Actors Preserves Reconstructability

**Setup:**
- Actor X hands off to Actor Y
- Handoff H is created

**Action:**
- Actor Y uses H to continue work

**Expected Observable Result:**
- Actor Y can continue work using H
- Reconstruction is possible
- Context memory from X is not required

**Counterexample:**
- If handoff does not preserve reconstructability, FAIL

**PASS/FAIL:**
- PASS: Handoff between actors preserves reconstructability
- FAIL: Handoff does not preserve reconstructability

---

## F7: Single-Actor Mode Remains Valid

**Setup:**
- Only one actor exists

**Action:**
- Actor performs work using PCM/PWF

**Expected Observable Result:**
- All invariants hold
- Protocol functions correctly
- Single actor may hold multiple execution roles

**Counterexample:**
- If protocol fails with single actor, FAIL

**PASS/FAIL:**
- PASS: Single-actor mode remains valid
- FAIL: Protocol fails with single actor

---

## F8: Static Routing Remains Valid

**Setup:**
- Routing is static (predefined)

**Action:**
- Tasks are routed according to static rules

**Expected Observable Result:**
- Static routing works correctly
- No requirement for dynamic routing
- Protocol functions with static routing

**Counterexample:**
- If static routing fails, FAIL

**PASS/FAIL:**
- PASS: Static routing remains valid
- FAIL: Static routing fails

---

## F9: Dynamic Routing Is Optional

**Setup:**
- Dynamic routing is not configured

**Action:**
- Tasks are routed without dynamic routing

**Expected Observable Result:**
- Protocol functions without dynamic routing
- Dynamic routing is optional, not required
- No semantic requirement for dynamic routing

**Counterexample:**
- If protocol requires dynamic routing, FAIL

**PASS/FAIL:**
- PASS: Dynamic routing is optional
- FAIL: Protocol requires dynamic routing

---

## F10: Recovery Reconstructs State Without Private Session Memory

**Setup:**
- Actor X experiences interruption
- Recovery is initiated

**Action:**
- Recover state from persistent storage + handoffs

**Expected Observable Result:**
- Relevant state is reconstructable
- Private session memory is not required
- Recovery uses persistent state and handoffs

**Counterexample:**
- If recovery requires private session memory, FAIL

**PASS/FAIL:**
- PASS: Recovery reconstructs state without private session memory
- FAIL: Recovery requires private session memory