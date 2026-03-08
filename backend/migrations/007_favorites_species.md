# Migration 007_favorites_species.md
## Crear tabla favorites_species

- Propósito
- Crear la tabla de favoritos para especies (MVP).

- Estructura propuesta
- favorites_species
  - id: PK
  - user_id: FK → users.id
  - species_id: FK → species.id
  - created_at: TIMESTAMP
