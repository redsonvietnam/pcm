# Non-Code Conformance — Operations/Procurement Scenario

**Date:** 2026-09-07
**Workstream:** PCM-VALIDATION-01

---

## Scenario: Office Supply Procurement

**Context:** A small office needs to procure new laptops for 5 employees.

---

## WORKSTREAM

**Definition:** The procurement project from need identification to delivery.

**PCM Representation:**
- Workstream: "Laptop Procurement Q3 2026"
- Scope: 5 laptops for new employees
- Timeline: 2 weeks
- Budget: $5,000

---

## TASK

**Definition:** Individual steps within the procurement workstream.

**PCM Representation:**
1. Task: "Get quotes from 3 vendors"
2. Task: "Compare specifications and prices"
3. Task: "Get manager approval"
4. Task: "Place order"
5. Task: "Track delivery"
6. Task: "Set up laptops"

---

## HANDOFF

**Definition:** Transfer of procurement context between people or sessions.

**PCM Representation:**
- Procurement officer creates document with:
  - Current status: "Quotes received, pending approval"
  - Vendors contacted: Dell, HP, Lenovo
  - Price comparison: $950, $1,100, $900
  - Recommendation: Lenovo (best value)
  - Pending: Manager approval

---

## GATE

**Definition:** Approval point before spending money.

**PCM Representation:**
- Gate: Manager review and approval
- Evidence: Email approval or signed form
- Authority: Manager has spending authority
- Gate record: "Approved 2026-09-05, $4,500 for 5 Lenovo laptops"

---

## ROLES

**Definition:** People involved in procurement.

**PCM Representation:**
- Requestor: Employee who identified need
- Procurement officer: Handles vendor contact and comparison
- Manager: Approves spending
- Finance: Processes payment
- IT: Sets up laptops

---

## STATE

**Definition:** Current status of procurement.

**PCM Representation:**
- Canonical state: Approved order with vendor
- Proposed state: Alternative vendor options
- Task state: "Order placed, pending delivery"
- Stale state: Old quotes that are no longer valid

---

## Cross-Domain Comparison

| Dimension | Software (Bamso) | ML Pipeline (Supervision) | Procurement |
|-----------|-----------------|--------------------------|-------------|
| Canonical state | main branch | master branch | Approved order |
| Proposed state | dev branch | local changes | Alternative options |
| Task state | HANDOFF.md | Not tracked | Procurement document |
| Authority | Developer | Developer | Manager |
| HANDOFF | HANDOFF.md | README.md | Procurement document |
| GATE | Merge criteria | pytest pass | Manager approval |
| Evidence | Tests + build | Tests + output | Email approval |
| Conflict detection | Git merge | Single developer | Vendor comparison |

---

## Key Observations

1. **PCM primitives are domain-independent.** They work for software, ML pipelines, and procurement.

2. **The semantic meaning is identical.** "Canonical state" means the same thing in all three domains.

3. **The binding is different.** Each domain implements the primitives differently.

4. **Formality varies.** Software needs more formality than procurement, but both satisfy PCM semantics.

5. **No hidden software assumptions.** The procurement scenario does not require git, tests, or code.

---

## Conclusion

**The non-code scenario confirms that PCM semantics are not software-specific.**

The framework can be applied to any domain where:
- There is a distinction between proposed and canonical state
- Work is transferred between sessions or actors
- Authority is required to approve changes
- Evidence of correct operation is needed

**This validation supports the claim that PCM is implementation-independent.**
