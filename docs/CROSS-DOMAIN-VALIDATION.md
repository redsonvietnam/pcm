# Cross-Domain Validation

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Validate PCM/PWF semantics across three structurally different domains to confirm domain-independence.

## Domain A: Software Engineering

### Scenario
Team building a feature for a web application.

### PCM Mapping

| Concept | Mapping |
|---------|---------|
| WORKSTREAM | Implement user authentication feature |
| TASKS | Design flow, implement API, implement UI, write tests, deploy |
| HANDOFFS | Design→Implementation, Implementation→Testing, Testing→Deployment |
| GATES | Design review, code review, deployment approval |
| AUTHORITY | Product owner |
| PROPOSER | Developer |
| OPERATOR | Developer |
| OBSERVER | QA tester |
| Canonical State | Approved design, approved code, deployed feature |
| Proposed State | Design draft, code changes, deployment plan |
| Execution State | Active development, testing, deployment |
| Context State | Developer's session, local environment |

### Differential Analysis

**What Remains Identical:**
- All six invariants hold
- All four primitives function
- All four roles are applicable
- State model works identically

**What Changes:**
- Tooling (Git, IDE, CI/CD)
- Communication channels (PRs, code review)
- Verification methods (automated tests)
- Persistence mechanisms (repository)

**What Belongs to Adapter:**
- Git as state persistence
- PR as handoff format
- Code review as Gate mechanism
- Tests as verification

---

## Domain B: Office Move Planning

### Scenario
Company planning to move to a new office.

### PCM Mapping

| Concept | Mapping |
|---------|---------|
| WORKSTREAM | Plan and execute office move |
| TASKS | Select location, design floor plan, coordinate movers, notify employees, execute move |
| HANDOFFS | Location→Floor plan, Floor plan→Moving coordination, Moving→Execution |
| GATES | Location approval, floor plan approval, move readiness review |
| AUTHORITY | CEO |
| PROPOSER | Office manager |
| OPERATOR | Moving coordinator |
| OBSERVER | HR |
| Canonical State | Approved location, approved floor plan, executed move |
| Proposed State | Location options, floor plan drafts, move schedule |
| Execution State | Active planning, coordination, moving |
| Context State | Planning session, site visits |

### Differential Analysis

**What Remains Identical:**
- All six invariants hold
- All four primitives function
- All four roles are applicable
- State model works identically

**What Changes:**
- Tooling (spreadsheets, email, meetings)
- Communication channels (email, meetings)
- Verification methods (walkthroughs, reviews)
- Persistence mechanisms (shared drives, documents)

**What Belongs to Adapter:**
- Spreadsheets as state storage
- Email as handoff format
- Meetings as Gate mechanism
- Documents as evidence

---

## Domain C: ML/Data Pipeline

### Scenario
Organization building a machine learning model for fraud detection.

### PCM Mapping

| Concept | Mapping |
|---------|---------|
| WORKSTREAM | Build fraud detection model |
| TASKS | Collect data, preprocess, feature engineering, train model, evaluate, deploy |
| HANDOFFS | Data→Preprocessing, Preprocessing→Feature engineering, Feature engineering→Training, Training→Evaluation, Evaluation→Deployment |
| GATES | Data quality review, feature review, model review, deployment approval |
| AUTHORITY | ML director |
| PROPOSER | Data scientist |
| OPERATOR | ML engineer |
| OBSERVER | MLOps engineer |
| Canonical State | Approved data pipeline, approved features, approved model, deployed model |
| Proposed State | Data pipeline draft, feature set draft, model draft, deployment plan |
| Execution State | Active preprocessing, training, evaluation |
| Context State | Notebook session, local environment |

### Differential Analysis

**What Remains Identical:**
- All six invariants hold
- All four primitives function
- All four roles are applicable
- State model works identically

**What Changes:**
- Tooling (Python, Jupyter, MLflow, Kubeflow)
- Communication channels (notebooks, model registry)
- Verification methods (metrics, A/B testing)
- Persistence mechanisms (data lake, model registry)

**What Belongs to Adapter:**
- MLflow as state persistence
- Notebook as handoff format
- Model review as Gate mechanism
- Metrics as evidence

---

## Cross-Domain Summary

### What Remains Identical Across All Domains

1. **Six Invariants** — All hold identically
2. **Four Primitives** — WORKSTREAM, TASK, HANDOFF, GATE function identically
3. **Four Roles** — AUTHORITY, PROPOSER, OPERATOR, OBSERVER are applicable
4. **State Model** — Canonical, Proposed, Execution, Context states work identically
5. **Authority Semantics** — Explicit, resolvable, non-ambiguous
6. **Handoff Semantics** — Reconstruction without session memory
7. **Gate Semantics** — Only mechanism for canonical promotion

### What Changes Across Domains

1. **Tooling** — Domain-specific tools
2. **Communication Channels** — Domain-specific formats
3. **Verification Methods** — Domain-specific criteria
4. **Persistence Mechanisms** — Domain-specific storage

### What Belongs to Adapter

All changes are adapter concerns:
- Tool bindings
- Communication formats
- Verification mechanisms
- Persistence implementations

### Limitations of This Test

1. **Structural similarity** — All three domains are project-based coordination
2. **No adversarial domain** — Did not test domains that actively resist structure
3. **No scale test** — Did not test with massive concurrent actors
4. **No failure domain** — Did not test domains with high failure rates

### Conclusion

PCM/PWF semantics are domain-agnostic across software engineering, organizational workflows, and ML/data pipelines. The protocol governs relationships and state management, not implementations. Domain-specific behavior belongs in adapters.