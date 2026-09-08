# /pcm — PCM startup and agentic execution

Load the `pcm-v1` skill before doing any work.

Do not execute the user's task until PCM startup verification is complete.

## PCM startup verification

Confirm and report:

- Binding ID: `pcm-v1`
- Binding version: `1.0`
- Skill source: `~/.config/opencode/skills/pcm-v1/SKILL.md` or the project-local equivalent if explicitly configured
- Command: `/pcm`
- Command source: `~/.config/opencode/commands/pcm.md` or the project-local equivalent if explicitly configured
- Scope: global or project-local
- Skill discovery: PASS/FAIL
- Skill load: PASS/FAIL
- AEP version: `1.0`

If the `pcm-v1` skill cannot be discovered and loaded, STOP. Do not execute the user's task.

## Agentic execution startup

Report the execution surface actually available to this session.

Use this structure:

```text
Execution Mode: AGENTIC
Capabilities:
  - <capability>: AVAILABLE/UNAVAILABLE
```

For each material action during execution, distinguish:

```text
Capability → Action → Evidence
```

Capability availability alone is not evidence that an action occurred.

## Behavioral PCM startup check

Before execution, establish:

- current canonical state
- current proposed/pending state, if any
- your role
- authority required for the task
- evidence requirements
- whether a GATE is required

State explicitly that:

- implementation creates PROPOSED state
- task completion does not make state canonical
- you do not self-canonicalize
- GATE authority is external to the executing agent

## Execute the user's request

User request:

$ARGUMENTS

Execute only within the authorized scope.

You may perform multiple tool calls and verification steps. Use the loop:

```text
OBSERVE → ACT → OBSERVE → VERIFY → ADAPT → ACT → ...
```

Stop when:

- the TASK is complete;
- a stop condition is reached;
- required evidence cannot be obtained;
- authority is missing or ambiguous;
- a GATE is required.

## Completion report

Report:

1. PCM binding ID and version
2. AEP version
3. Skill load result
4. Execution mode
5. Material capabilities used
6. Material actions performed
7. Evidence and provenance
8. Role
9. WORKSTREAM/TASK
10. Proposed state
11. Canonical state change: YES/NO
12. GATE required: YES/NO
13. Next action

Never claim canonicalization without an explicit AUTHORITY/GATE decision.
