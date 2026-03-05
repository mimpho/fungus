# OpenCode — Specs Sync

Propósito
- Establecer el flujo de sincronización de documentación entre CLAUDE.md y OpenCode, con enfoque en keep a changelog y versiones.

Alcance
- Documentos relevantes: docs/conventions.md, docs/backend_architecture.md, memory/pending.md, memory/decisions.md, CHANGELOG.md.
- Mapea secciones entre CLAUDE.md y OpenCode para reflejar cambios de flujo y configuración.

Flujo recomendado (OpenCode)
- Crear branch chore/docs-sync-vN
- Duplicar la información relevante de CLAUDE.md para OpenCode (mirroring)
- Abrir PR en OpenCode con el título: "docs: sincronización CLAUDE ↔ OpenCode"
- Incluir una nota de Keep a Changelog en Unreleased cuando haya cambios visibles para usuarios

Nombres de ramas
- chore/docs-sync-vN
- epic/docs-sync
