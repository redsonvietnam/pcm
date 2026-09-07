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