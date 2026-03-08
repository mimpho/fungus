# Migration 005_auth_users.md — Crear tabla users

Propósito
- Crear la tabla de usuarios para 4.7 MVP (auth).

Estructura propuesta
- users
  - id: UUID, PK
  - email: VARCHAR UNIQUE
  - password_hash: VARCHAR
  - first_name: VARCHAR
  - last_name: VARCHAR
  - birth_date: DATE (opcional)
  - created_at: TIMESTAMP
  - google_id: VARCHAR (opcional, para futuro Google login)

Notas
- Indices: unique(email)
- Considerar seeds de prueba
