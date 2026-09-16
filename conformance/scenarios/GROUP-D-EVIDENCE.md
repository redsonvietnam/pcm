# Conformance Test Group D — Evidence

**Version:** 1.0  
**Status:** Structured Tests  

## D1: Evidence Provenance Is Inspectable

**Setup:**
- Evidence E exists for a decision

**Action:**
- Query provenance of E

**Expected Observable Result:**
- Provenance of E is determinable
- Can distinguish: self-reported, independently produced, automatically observed
- Provenance is not hidden

**Counterexample:**
- If provenance is not inspectable, FAIL

**PASS/FAIL:**
- PASS: Evidence provenance is inspectable
- FAIL: Evidence provenance not inspectable

---

## D2: Self-Reported Evidence Distinguishable

**Setup:**
- Actor X performs work
- Actor X produces evidence E1 about their own work

**Action:**
- Classify E1

**Expected Observable Result:**
- E1 is classified as self-reported
- E1 is distinguishable from independent evidence
- Self-reported status does not invalidate E1

**Counterexample:**
- If self-reported evidence cannot be distinguished, FAIL

**PASS/FAIL:**
- PASS: Self-reported evidence distinguishable
- FAIL: Self-reported evidence not distinguishable

---

## D3: Automatically Observed Evidence Distinguishable

**Setup:**
- Automated system produces evidence E2

**Action:**
- Classify E2

**Expected Observable Result:**
- E2 is classified as automatically observed
- E2 is distinguishable from self-reported and independent evidence
- Strength depends on observation mechanism reliability

**Counterexample:**
- If automatically observed evidence cannot be distinguished, FAIL

**PASS/FAIL:**
- PASS: Automatically observed evidence distinguishable
- FAIL: Automatically observed evidence not distinguishable

---

## D4: Authority Can Distinguish Evidence Provenance

**Setup:**
- Multiple evidence items exist with different provenance
- Authority evaluates a Gate

**Action:**
- Authority reviews evidence

**Expected Observable Result:**
- Authority can distinguish provenance of each evidence item
- Authority can weigh evidence based on provenance
- Evidence provenance supports informed decision-making

**Counterexample:**
- If Authority cannot distinguish evidence provenance, FAIL

**PASS/FAIL:**
- PASS: Authority can distinguish evidence provenance
- FAIL: Authority cannot distinguish evidence provenance

---

## D5: GATE Evidence Is Bound to Evaluated Proposal and Criteria

**Setup:**
- Proposal P1 exists
- Decision criteria C1 exist
- Evidence E1 is produced supporting P1
- GATE evaluates P1 against C1 and PASSes

**Action — Material Change:**
- P1 is materially changed to P2 (or C1 materially changes to C2)
- Attempt to reuse E1 as sufficient evidence for canonicalization of P2/C2

**Expected Observable Result — Material Change:**
- E1 remains historical evidence of the earlier evaluation of P1/C1
- E1 is NOT sufficient evidence for canonicalization of P2/C2
- P2/C2 requires new GATE re-evaluation before canonicalization
- The earlier PASS does not transfer to the changed proposal

**Action — Non-Material Change:**
- P1 undergoes a non-decision-relevant metadata change (e.g., whitespace, formatting, typo correction that does not alter decision-relevant substance)
- Evaluate whether E1 remains valid

**Expected Observable Result — Non-Material Change:**
- E1 remains valid evidence for the evaluated proposal
- Non-decision-relevant metadata changes alone do not automatically invalidate existing GATE evidence

**Counterexample:**
- If material change to P1/C2 does not require re-evaluation, FAIL
- If non-material metadata change automatically invalidates evidence, FAIL

**PASS/FAIL:**
- PASS: GATE evidence is bound to evaluated proposal and criteria; material changes require re-evaluation; non-material changes do not automatically invalidate evidence
- FAIL: GATE evidence transfers across material changes, or non-material changes automatically invalidate evidence