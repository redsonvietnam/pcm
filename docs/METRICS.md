# Framework Metrics

**Version:** 1.0  
**Status:** Observability Metrics  

## Purpose

Define a small set of useful metrics to detect framework growth and ceremony. These are observability metrics, not invariants.

## Metrics

### 1. Mandatory PWF Fields

**Current Count:** 5 (workstream reference, task purpose, authority delegation scope, success criteria, evidence requirements)

**Purpose:** Track task record complexity

**Threshold:** None defined yet

---

### 2. Mandatory Transitions

**Current Count:** 5 (PROPOSED → AUTHORIZED → EXECUTING → COMPLETED, plus REJECTED)

**Purpose:** Track lifecycle complexity

**Threshold:** None defined yet

---

### 3. Required Gate Points

**Current Count:** 1 (only when canonical state changes)

**Purpose:** Track Gate overhead

**Threshold:** None defined yet

---

### 4. Manual Coordination Actions

**Current Count:** Variable (depends on implementation)

**Purpose:** Track coordination overhead

**Threshold:** None defined yet

---

### 5. Actor Handoffs

**Current Count:** Variable (depends on implementation)

**Purpose:** Track handoff frequency

**Threshold:** None defined yet

---

### 6. Unresolved Proposals

**Current Count:** Variable (depends on implementation)

**Purpose:** Track proposal backlog

**Threshold:** None defined yet

---

### 7. Time/State Distance Between Handoff and Resumed Execution

**Current Count:** Variable (depends on implementation)

**Purpose:** Track reconstruction efficiency

**Threshold:** None defined yet

---

### 8. Conformance Criteria Passing

**Current Count:** 34 (10 PCM-Core + 4 PWF + 2 Adapter + 18 test groups)

**Purpose:** Track conformance coverage

**Threshold:** None defined yet

## Implementation Notes

These metrics are for observability, not enforcement. They help detect framework growth and ceremony over time. Thresholds should be defined based on evidence from real implementations, not arbitrary targets.