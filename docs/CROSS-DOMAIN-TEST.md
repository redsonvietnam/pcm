# Cross-Domain Test

**Version:** 0.1.0  
**Status:** Paper Test  

## Purpose

Test whether PCM/PWF semantics work across fundamentally different domains. The goal is NOT to model private details but to check whether the same core semantics apply.

## Domain A: Software Engineering

### Scenario
A team is building a feature for a web application.

### PCM Application

**WORKSTREAM:** Implement user authentication feature

**TASKS:**
- Design authentication flow
- Implement backend API
- Implement frontend UI
- Write tests
- Deploy to staging

**HANDOFFS:**
- Design → Implementation (design decisions transferred)
- Implementation → Testing (code state transferred)
- Testing → Deployment (verification evidence transferred)

**GATES:**
- Design review (proposed design → approved design)
- Code review (proposed code → approved code)
- Deployment approval (proposed deployment → approved deployment)

**ROLES:**
- AUTHORITY: Product owner (approves feature scope)
- PROPOSER: Developer (proposes implementation)
- OPERATOR: Developer (implements code)
- OBSERVER: QA tester (verifies behavior)

**STATE:**
- Canonical: Approved design, approved code, deployed feature
- Proposed: Design draft, code changes, deployment plan
- Execution: Active development, testing, deployment
- Context: Developer's session, local environment

**Invariants Hold:**
- Developer cannot approve their own code (Agent ≠ Authority)
- Writing code does not approve it (Implementation ≠ Approval)
- Design draft is not approved design (Proposed ≠ Canonical)
- Local environment is not production (Context ≠ Canonical)
- Using Git does not change protocol rules (Protocol ≠ Tooling)

## Domain B: Non-Software Work — Office Move Planning

### Scenario
A company is planning to move to a new office.

### PCM Application

**WORKSTREAM:** Plan and execute office move

**TASKS:**
- Select new office location
- Design floor plan
- Coordinate with moving company
- Notify employees
- Execute move

**HANDOFFS:**
- Location selection → Floor plan design (location decisions transferred)
- Floor plan → Moving coordination (layout transferred)
- Moving coordination → Move execution (logistics transferred)

**GATES:**
- Location approval (proposed location → approved location)
- Floor plan approval (proposed plan → approved plan)
- Move readiness review (proposed move → approved move)

**ROLES:**
- AUTHORITY: CEO (approves major decisions)
- PROPOSER: Office manager (proposes plans)
- OPERATOR: Moving coordinator (executes logistics)
- OBSERVER: HR (monitors employee impact)

**STATE:**
- Canonical: Approved location, approved floor plan, executed move
- Proposed: Location options, floor plan drafts, move schedule
- Execution: Active planning, coordination, moving
- Context: Planning session, site visits

**Invariants Hold:**
- Office manager cannot approve their own proposal (Agent ≠ Authority)
- Creating a plan does not approve it (Implementation ≠ Approval)
- Draft floor plan is not approved floor plan (Proposed ≠ Canonical)
- Site visit notes are not official decisions (Context ≠ Canonical)
- Using spreadsheets does not change protocol rules (Protocol ≠ Tooling)

## Cross-Domain Analysis

### Does any PCM rule need to change because the domain changed?

**Answer:** No. All PCM rules apply identically to both domains.

**Specific checks:**

1. **Four Primitives:** WORKSTREAM, TASK, HANDOFF, GATE work in both domains. No domain-specific primitive needed.

2. **Roles:** AUTHORITY, PROPOSER, OPERATOR, OBSERVER work in both domains. Role holders differ (CEO vs product owner) but role semantics are identical.

3. **Invariants:** All five invariants hold in both domains. No domain-specific invariant needed.

4. **State Model:** Canonical, Proposed, Execution, Context states work in both domains. State storage differs (Git vs spreadsheets) but state semantics are identical.

5. **HANDOFF Semantics:** Handoffs work in both domains. Handoff format differs (code review vs email) but handoff semantics are identical.

6. **GATE Semantics:** Gates work in both domains. Gate mechanism differs (automated vs meeting) but gate semantics are identical.

### What differs between domains?

**Adapter layer only:**
- Tooling (Git vs spreadsheets)
- Communication channels (PRs vs emails)
- Verification methods (automated tests vs walkthroughs)
- Persistence mechanisms (repositories vs shared drives)

**These are adapter concerns, not protocol concerns.**

### Conclusion

PCM/PWF semantics are domain-agnostic. The protocol governs relationships and state management, not implementations. Domain-specific behavior belongs in adapters.

## Implications

1. **PCM does not need domain-specific extensions.** The four primitives and five invariants are sufficient.

2. **PWF does not need domain-specific mandatory behaviors.** The mandatory behaviors (task record, lifecycle, handoff, GATE, traceability) work across domains.

3. **Adapters are the right place for domain specifics.** Each domain needs its own adapter to bind PCM/PWF to its context.

4. **The framework is genuinely project-agnostic.** It does not assume software engineering, Git, or any specific technology.