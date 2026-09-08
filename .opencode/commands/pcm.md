# /pcm — PCM startup and execution

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

If the `pcm-v1` skill cannot be discovered and loaded, STOP. Do not execute the user's task.

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

## Completion report

Report:

1. PCM binding ID and version
2. Skill load result
3. role
4. WORKSTREAM/TASK
5. changes made
6. evidence and provenance
7. proposed state
8. canonical state change: YES/NO
9. GATE required: YES/NO
10. next action

Never claim canonicalization without an explicit AUTHORITY/GATE decision.
