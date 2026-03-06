# Specs Sync — CLAUDE Code ↔ OpenCode

Propósito
- Definir y documentar el flujo de sincronización de especificaciones, configuración y flujos de trabajo entre CLAUDE Code y OpenCode.
- Servir como fuente de verdad para nuevos proyectos que quieran replicar o extender el approach de doc sincronizado.

Alcance
- Archivos relevantes a sincronizar: docs/conventions.md, docs/backend_architecture.md, memory/pending.md, memory/decisions.md, CHANGELOG.md, CLAUDE.md, AGENTS.md, y las reglas de git de OpenCode.
- Mantener Keep a Changelog arriba (Unreleased) y versiones publicadas en main con tag vX.Y.Z.

Flujo de trabajo recomendado
- Crear branch de doc-sync: chore/docs-sync-vN
- Duplicar/copiar las modificaciones relevantes a CLAUDE.md en OpenCode (mirroring).
- Abrir PR paralelo en CLAUDE y OpenCode con el mismo título.
- En cada merge a main, añadir entrada en Unreleased de CHANGELOG.

Nombres de ramas de doc-sync
- chore/docs-sync-vN
- epic/docs-sync
