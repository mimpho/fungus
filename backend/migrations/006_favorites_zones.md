# Migration 006_favorites_zones.md — Crear tabla favorites_zones

Propósito
- Crear la tabla de favoritos para zonas (MVP).

Estructura propuesta
- favorites_zones
  - id: PK
  - user_id: FK → users.id
  - zone_id: FK → zones.id
  - created_at: TIMESTAMP
