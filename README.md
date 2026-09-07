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
