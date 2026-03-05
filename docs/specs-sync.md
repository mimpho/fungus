# Specs Sync — CLAUDE Code ↔ OpenCode

Propósito
- Definir y documentar el flujo de sincronización de especificaciones, configuración y flujos de trabajo entre CLAUDE Code y OpenCode.
- Servir como fuente de verdad para nuevos proyectos que quieran replicar o extender el approach de doc sincronizado.

Alcance
- Archivos relevantes a sincronizar: docs/conventions.md, docs/backend_architecture.md, memory/pending.md, memory/decisions.md, CHANGELOG.md, CLAUDE.md, AGENTS.md, y las reglas de git de OpenCode.
- Mantener el Keep a Changelog en Unreleased y las versiones en main (tag vX.Y.Z).

Flujo de trabajo recomendado
- Crear rama de doc-sync: chore/docs-sync-vN
- Hacer dos commits mínimos: 1) CLAUDE.md; 2) docs/specs-sync.md (la versión de OpenCode puede estar en .opencode si se quiere mantener separado)
- Abrir PR paralelo en CLAUDE y OpenCode con el mismo título: "docs: sincronización CLAUDE ↔ OpenCode".
- En cada merge a main, añadir entrada en Unreleased del CHANGELOG para el cambio de flujo de doc-sync.

Nombres de ramas (ejemplos)
- epic/docs-sync
- chore/docs-sync-v1
- feat/docs-sync-opencode

Notas finales
- Este doc es el espejo de la convención de organización y debe mantenerse actualizado al ritmo de cambios de flujo de trabajo.
