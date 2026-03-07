# Git Workflow

## Branch Types

| Pattern | Target | Example |
|---|---|---|
| `epic/<name>` | `main` | `epic/v4-backend` |
| `feat/vX-Y-<name>` | epic branch | `feat/v4-3-api-integration` |
| `fix/vX-Y-<name>` | epic branch | `fix/v4-1-weather-cache` |
| `chore/vX-Y-<name>` | epic branch | `chore/v4-2-update-deps` |
| `chore/<name>` | `main` | `chore/update-readme` |

## Integration

- **Feature → Epic**: Squash merge
- **Epic → Main**: Merge commit (`--no-ff`)
- **Pull updates**: Rebase (never merge)

## Commit Format

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

## Never Do

- Never rebase `epic/*` or `main`
- Never force push to `epic/*` or `main`
- Never push secrets or API keys

## Changelog

Use [Keep a Changelog](https://keepachangelog.com) format:

```
## [Unreleased]
### Añadido
### Cambiado
### Eliminado

## [4.2.0] - YYYY-MM-DD
## [4.1.0] - YYYY-MM-DD
```

- **Unreleased** at the top for upcoming changes
- **Newest version first** — most recent release above older ones
- Add to Unreleased section BEFORE committing (when making the change), not after
