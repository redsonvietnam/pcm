# Routing Model V1

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Define a minimal routing abstraction that does not make adaptive routing mandatory.

## Routing Abstraction

### Input

- Task requirements
- Actor capabilities
- Authority boundaries
- Resource constraints
- Current state

### Output

- Selected execution actor
- Rationale/evidence (where meaningful)

## Routing Modes

### Manual Routing

**Description:** Human selects actor for each task

**Characteristics:**
- Explicit selection
- Full authority over routing
- Traceable decision

**When to use:**
- Simple environments
- High-stakes decisions
- Limited actor pool

---

### Fixed Routing

**Description:** Predefined rules select actor

**Characteristics:**
- Rule-based selection
- Predictable behavior
- Limited flexibility

**When to use:**
- Stable environments
- Routine tasks
- Known actor capabilities

---

### Dynamic Routing

**Description:** System selects actor based on current conditions

**Characteristics:**
- Adaptive selection
- Optimized for conditions
- Complex implementation

**When to use:**
- Dynamic environments
- Variable task requirements
- Multiple actor capabilities

## Routing Constraints

### PCM Semantic Preservation

Routing must NOT:
- Change PCM invariants
- Alter authority semantics
- Modify state transitions
- Create self-approval paths

Routing MAY:
- Select which actor executes
- Optimize for capability matching
- Balance resource utilization
- Adapt to current conditions

### Authority Boundaries

Routing must respect authority boundaries:
- Selected actor must have required permissions
- Authority delegation must be explicit
- Routing does not grant authority

### Resource Constraints

Routing must respect resource limits:
- Selected actor must have sufficient resources
- Routing does not override resource limits
- Resource constraints are advisory, not mandatory

## Implementation Notes

Routing is optional and pluggable. The protocol functions with manual, fixed, or dynamic routing. Routing algorithm is an implementation detail, not a protocol requirement.