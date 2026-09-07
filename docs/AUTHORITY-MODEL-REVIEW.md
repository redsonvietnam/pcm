# Authority Model Review

**Date:** 2026-09-07
**Workstream:** PCM-FINALIZATION-01

---

## 1. Initial Authority

**Test:** Where does authority come from in a new project?

**PCM definition:** Authority derives from explicit delegation (11.1).

**Analysis:** Initial authority must come from an external source — organizational policy, project charter, or human decision to start work. PCM does not need to define the source; it only requires that the source be explicit.

**Edge case:** Solo developer starting a new project. Authority derives from the act of creation and the governance mechanism (e.g., "I am the authority for this project").

**Result:** PCM correctly requires explicit delegation. The source is implementation-specific.

---

## 2. Delegated Authority

**Test:** How does authority flow from one actor to another?

**PCM definition:** Authority transfers only through explicit HANDOFF with AUTHORITY delegation (11.3).

**Analysis:** Delegation must be explicit. Implicit delegation (e.g., "I'm going on vacation, you handle it") is insufficient without HANDOFF.

**Edge case:** Delegation without HANDOFF. PCM says this is insufficient. The receiving actor has no evidence of authority.

**Result:** PCM correctly requires explicit delegation through HANDOFF.

---

## 3. Authority Transfer

**Test:** How does authority move between actors?

**PCM definition:** Through explicit HANDOFF with AUTHORITY delegation (11.3).

**Analysis:** Transfer requires both HANDOFF (context) and explicit delegation (authority). Context alone is insufficient.

**Edge case:** HANDOFF without authority delegation. The receiving actor has context but not authority. This is correct — context ≠ authority.

**Result:** PCM correctly separates context transfer from authority transfer.

---

## 4. Authority Expiration

**Test:** What happens when authority expires?

**PCM definition:** Authority is bounded by delegation terms, including expiration if defined (11.2).

**Analysis:** Expiration is a delegation term, not a PCM primitive. PCM requires that boundaries be defined; the specifics are adapter-level.

**Edge case:** No expiration defined. Authority persists indefinitely. This is valid — PCM does not require expiration.

**Result:** PCM correctly makes expiration a delegation term, not a protocol requirement.

---

## 5. Authority Revocation

**Test:** How is authority revoked?

**PCM definition:** Implicit in authority boundaries (11.2) and stop conditions (PWF 9).

**Analysis:** Revocation is the inverse of delegation. If authority was explicitly delegated, it can be explicitly revoked. PCM does not define the mechanism; it requires that revocation be possible.

**Edge case:** Revocation without notification. The actor may continue working under expired authority. PCM says stale claims can be invalidated by actual state (PWF 8.2).

**Result:** PCM correctly requires revocation capability without defining the mechanism.

---

## 6. Contested Authority

**Test:** What happens when authority is disputed?

**PCM definition:** Contested state remains as-is; escalation to higher authority scope is the resolution (11.4).

**Analysis:** PCM correctly prevents silent resolution. The contested state does not change. Escalation surfaces the decision beyond the current scope.

**Edge case:** No higher authority exists. The conflict remains unresolved. This is correct — unresolved conflicts remain unresolved.

**Result:** PCM correctly handles contested authority without requiring a higher authority.

---

## 7. Authority Latency

**Test:** What does delayed authority response mean?

**PCM definition:** Authority latency never implies approval (7.6, 11.4).

**Analysis:** Delay is not approval. A proposal that sits unreviewed remains proposed. This prevents "timeout approval" patterns.

**Edge case:** Infinite delay. The proposal remains proposed indefinitely. This is correct — it does not auto-promote.

**Result:** PCM correctly prevents latency from implying approval.

---

## 8. Multiple Authorities

**Test:** Can multiple authorities exist?

**PCM definition:** Authority is bounded by workstream scope (11.2).

**Analysis:** Multiple authorities can exist for different scopes. Within a scope, authority is singular (or must be explicitly shared). PCM does not prohibit multiple authorities; it requires that boundaries be defined.

**Edge case:** Two authorities for the same scope. PCM says contested authority remains as-is (11.4). This is correct — the conflict must be explicitly resolved.

**Result:** PCM correctly handles multiple authorities through scope boundaries.

---

## 9. Nested Authority Scopes

**Test:** Can authority nest?

**PCM definition:** Authority is bounded by workstream scope (11.2).

**Analysis:** A workstream can contain sub-workstreams, each with their own authority. Parent authority can delegate to child scope. This is valid — scope nesting is natural.

**Edge case:** Child authority contradicts parent. PCM says contested authority remains as-is (11.4). The conflict must be explicitly resolved.

**Result:** PCM correctly supports nested scopes through delegation.

---

## 10. Single Actor

**Test:** Does the model work with one actor?

**PCM definition:** Single-actor validity (PWF 11). Actor may hold PROPOSER + OPERATOR. Authority must derive from governance, not from being sole actor.

**Analysis:** A single actor can propose, execute, and approve. But authority must be explicit — "I am the authority" is a governance declaration, not an execution capability.

**Edge case:** Single actor forgets they are authority. PCM requires explicit governance mechanism. This is correct — authority must be traceable.

**Result:** PCM correctly handles single-actor operation.

---

## 11. Multi-Actor

**Test:** Does the model work with many actors?

**PCM definition:** Multiple actors can hold different roles. Authority boundaries must be defined.

**Analysis:** Multi-actor operation is the default case. Authority, delegation, and handoff semantics all apply naturally.

**Edge case:** Actor disagreement. PCM says contested authority remains as-is (11.4). Escalation resolves.

**Result:** PCM correctly handles multi-actor operation.

---

## 12. What PCM MUST Define vs What Implementation Policy May Define

**MUST define (currently defined):**
- Authority derives from explicit delegation ✓
- Authority is bounded by scope ✓
- Authority transfers through HANDOFF ✓
- Authority latency ≠ approval ✓
- Contested authority remains as-is ✓

**Implementation policy may define:**
- Specific delegation mechanisms
- Expiration terms
- Revocation procedures
- Escalation paths
- Authority source (organizational context)

**Result:** PCM defines the semantic requirements. Implementations define the mechanics.

---

## 13. Does "Authority = Human"?

**Test:** Must authority be held by a human?

**PCM definition:** "An execution actor is any entity capable of performing work under PCM governance" (5). PCM does not define what an actor IS.

**Analysis:** PCM does not require authority to be held by a human. Authority can be held by an organization, a committee, a governance mechanism, or a human. The requirement is that authority be explicit and traceable.

**Result:** PCM correctly does not assume authority = human.

---

## 14. Does "Execution Capability = Authority"?

**Test:** Can an actor gain authority by being able to execute?

**PCM definition:** "Execution capability alone does not create canonical decision authority" (7.1).

**Analysis:** This is explicitly prohibited. The ability to write code, run tests, or perform work does not create authority to approve that work.

**Result:** PCM correctly prevents execution capability from creating authority.

---

## 15. Conclusion

The authority model is:
- Complete (covers all authority lifecycle aspects)
- Non-contradictory
- Free of hidden assumptions
- Correctly separates semantics from mechanics
- Valid for single and multi-actor operation

**FREEZE IMPLICATION:** Authority semantics are stable.
