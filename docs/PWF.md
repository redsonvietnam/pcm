# Protocol Workflow Framework (PWF)

**Version:** 0.1.0 (Proposed)  
**Status:** Draft  
**Authority:** Pending External Review  

## 1. Purpose

PWF defines how PCM-governed work is normally executed. It provides the execution framework that sits above PCM, translating protocol invariants into operational methods.

PWF is project-agnostic, tool-agnostic, and model-agnostic at its core. It defines behavior patterns, not specific implementations.

## 2. Scope

PWF applies to executing work within PCM governance. It covers:
- Task lifecycle management
- Execution flow control
- State transitions
- Verification processes
- Recovery mechanisms

## 3. Non-Scope

PWF does not define:
- Specific tools or technologies
- Project-specific workflows
- Runtime implementations
- Environment bindings
- Domain-specific procedures

## 4. Mandatory Behavior

The following behaviors are mandatory for PWF conformance:

### 4.1 Task Packet Structure

Every task must be representable as a Task Packet containing:
- Workstream reference
- Task purpose
- Authority delegation
- Success criteria
- Context requirements
- Evidence requirements

### 4.2 Task Lifecycle

Tasks follow a mandatory lifecycle:
1. **PROPOSED** - Task suggested, pending authority
2. **AUTHORIZED** - Task approved by authority
3. **EXECUTING** - Task actively being worked
4. **VERIFYING** - Task completion being verified
5. **COMPLETED** - Task verified and closed
6. **REJECTED** - Task rejected (with rationale)

### 4.3 Handoff Contract

Handoffs must include:
- Current canonical state reference
- Pending proposals (if any)
- Execution context
- Authority delegation (if applicable)
- Evidence of progress
- Next action recommendation

### 4.4 GATE Integration

PWF must support GATE verification at appropriate points. GATEs prevent:
- Self-approval of work
- Unverified changes becoming canonical
- Silent drift from intended state

## 5. Recommended Behavior

The following behaviors are recommended but not mandatory:

### 5.1 Checkpoints

Regular checkpoints help maintain continuity:
- Progress against success criteria
- Authority alignment
- Context freshness
- Evidence completeness

### 5.2 Observation Lifecycle

Observations should follow:
1. **OBSERVED** - Something noticed
2. **RECORDED** - Observation documented
3. **EVALUATED** - Relevance assessed
4. **ACTIONED** - Response taken (if warranted)
5. **ARCHIVED** - Observation preserved for reference

### 5.3 Next Action Determination

When determining next action:
- Consider current canonical state
- Review pending proposals
- Assess capability requirements
- Evaluate authority boundaries
- Check for blockers or dependencies

## 6. Optional Behavior

The following behaviors are implementation-specific:

### 6.1 Routing/Rerouting

How execution actors are selected or reassigned based on:
- Capability requirements
- Availability
- Workload
- Specialization

### 6.2 Verification Selection

How verification methods are chosen:
- Automated checks
- Manual review
- Peer verification
- Authority approval

### 6.3 Recovery Mechanisms

How work recovers from interruptions:
- State reconstruction
- Context restoration
- Authority re-establishment
- Progress revalidation

## 7. Workstream Execution Loop

The core execution loop:

1. **Receive** - Task Packet arrives
2. **Validate** - Ensure authority and context
3. **Execute** - Perform task actions
4. **Document** - Record evidence and progress
5. **Verify** - Check completion criteria
6. **Handoff** - Transfer context if needed
7. **Close** - Mark task complete or escalate

## 8. Drift Detection and Reconciliation

### 8.1 Drift Indicators
- Proposed state diverging from canonical
- Context stale relative to canonical state
- Authority assumptions without delegation
- Evidence gaps in progress

### 8.2 Reconciliation Process
1. Detect drift through monitoring
2. Assess drift significance
3. Determine reconciliation approach
4. Execute reconciliation
5. Verify alignment restored

## 9. Stop Conditions

Work must stop when:
- Authority revoked or expired
- Success criteria unachievable
- Ethical boundaries crossed
- Resource limits exceeded
- Better alternatives discovered

## 10. Escalation

Escalation occurs when:
- Authority boundary encountered
- Capability requirement exceeds available
- Conflict between invariants
- Recovery mechanism insufficient

Escalation transfers authority or decision-making to higher-level authority.

## 11. Project Independence

PWF remains valid across:
- Software engineering
- Data/ML pipelines
- Media production
- Automation/tooling
- Non-code work

The framework adapts through adapters, not core changes.

## 12. Versioning

PWF versions follow semantic versioning:
- Major: Incompatible changes to mandatory behavior
- Minor: Compatible additions or clarifications
- Patch: Corrections or editorial changes

## 13. Authority

This specification is PROPOSED and pending external Authority Gate review. It does not represent canonical state until approved through proper GATE procedures.