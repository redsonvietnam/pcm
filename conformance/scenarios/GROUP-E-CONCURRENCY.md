# Conformance Test Group E — Concurrency

**Version:** 1.0  
**Status:** Structured Tests  

## E1: Two Non-Conflicting Proposals

**Setup:**
- Proposal A for scope S1
- Proposal B for scope S2 (different scope)

**Action:**
- Both proposals submitted

**Expected Observable Result:**
- Both may remain PROPOSED
- Neither is automatically rejected
- Both await GATE + AUTHORITY independently

**Counterexample:**
- If non-conflicting proposals cannot coexist, FAIL

**PASS/FAIL:**
- PASS: Non-conflicting proposals may coexist
- FAIL: Non-conflicting proposals cannot coexist

---

## E2: Two Conflicting Proposals

**Setup:**
- Proposal X for canonical state C
- Proposal Y for canonical state C (conflicting with X)

**Action:**
- Both proposals submitted

**Expected Observable Result:**
- Neither X nor Y becomes canonical silently
- Both remain PROPOSED
- AUTHORITY must explicitly resolve

**Counterexample:**
- If one proposal silently wins, FAIL

**PASS/FAIL:**
- PASS: Conflicting proposals cannot silently resolve
- FAIL: One proposal silently wins

---

## E3: Creation Order Does Not Determine Canonicality

**Setup:**
- Proposal A created at time T1
- Proposal B created at time T2 (T2 > T1)

**Action:**
- Check whether A has priority due to earlier creation

**Expected Observable Result:**
- Neither A nor B has priority due to creation order
- Both await GATE + AUTHORITY
- Creation order is not a resolution mechanism

**Counterexample:**
- If earlier creation gives priority, FAIL

**PASS/FAIL:**
- PASS: Creation order does not determine canonicality
- FAIL: Earlier creation gives priority

---

## E4: Implementation Order Does Not Determine Canonicality

**Setup:**
- Proposal A is implemented
- Proposal B is implemented later

**Action:**
- Check whether implementation gives A priority

**Expected Observable Result:**
- Implementation does not give A priority
- Both await GATE + AUTHORITY
- Implementation order is not a resolution mechanism

**Counterexample:**
- If implementation gives priority, FAIL

**PASS/FAIL:**
- PASS: Implementation order does not determine canonicality
- FAIL: Implementation gives priority

---

## E5: Authority Delay Does Not Imply Approval

**Setup:**
- Proposal P is submitted
- Authority is delayed in responding

**Action:**
- Wait for authority response
- Check whether delay implies approval

**Expected Observable Result:**
- Delay does not imply approval
- P remains PROPOSED during delay
- Authority latency never implies implicit approval

**Counterexample:**
- If delay implies approval, FAIL

**PASS/FAIL:**
- PASS: Authority delay does not imply approval
- FAIL: Delay implies approval

---

## E6: Authority Explicitly Resolves Conflict

**Setup:**
- Conflicting proposals X and Y exist
- Authority decides in favor of X

**Action:**
- Authority executes GATE for X

**Expected Observable Result:**
- X becomes canonical only through GATE + AUTHORITY
- Y remains PROPOSED or is rejected
- Resolution is explicit and traceable

**Counterexample:**
- If resolution occurs without GATE + AUTHORITY, FAIL

**PASS/FAIL:**
- PASS: Authority explicitly resolves conflict through Gate
- FAIL: Resolution occurs without Gate + Authority