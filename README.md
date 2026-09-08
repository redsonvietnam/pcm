# pcm

PCM/PWF distribution — deterministic adapter bootstrap for any repository.

## Quick Start

```bash
npx pcm init
```

This will:
1. Detect your platform, shell, and available tools
2. Select the best adapter from the bundled catalog
3. Install PCM/PWF core specs and adapter binding files
4. Create a manifest recording the installation state

## OpenCode PCM Verification

The OpenCode adapter uses one stable binding identity:

- Skill: `pcm-v1` v1.0
- Command: `/pcm`
- Canonical fingerprints: `adapters/opencode/PCM-BINDING.json`

After installing the adapter on a machine, verify the exact global binding with:

```bash
npx pcm verify-opencode
```

This verifies content identity of the canonical files and the installed OpenCode skill/command. It does not claim behavioral conformance; a live OpenCode session must still use `/pcm` and report its PCM startup/completion evidence. See `docs/PCM-VERIFICATION.md`.

## Supported Adapters

| Adapter | Status | Requires |
|---------|--------|----------|
| OpenCode | Tested | `opencode` in PATH |
| GitHub Copilot | Deferred | `copilot` capability |
| Codex | Deferred | `codex` capability |
| Generic | Always available | Nothing |

## Re-run

Running `npx pcm init` again is idempotent — it will skip files that already match and preserve any locally modified binding files.

## License

MIT
