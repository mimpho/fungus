# Epic: v5 Auth & Favorites MVP

Summary
- Move Auth and Favorites MVP into the v5 epic branch.
- MVP: two tables for favorites and JWT-based authentication.
- Seeds for staging included in 4.7 planning will be adapted to v5.

Rationale
- Align with roadmap: 5.x handles Auth; 6.x Apps moves; i18n remains on 4.x (4.7).

Changes in this epic branch
- Placeholder migrations: 005_auth_users.py, 006_favorites_zones.py, 007_favorites_species.py (real Alembic heads to be added)
- Backend/router plan for auth and favorites MVP
- Documentation scaffolds updated in docs/

Migration plan
- 005_auth_users.py (Users table)
- 006_favorites_zones.py (Favorites zones)
- 007_favorites_species.py (Favorites species)
- Seeds for staging (optional in 4.7 context)

Endpoints (MVP; secured)
- Auth: POST /api/v1/auth/register, POST /api/v1/auth/login, GET /api/v1/auth/me
- Favorites: POST/GET/DELETE for zones and species

Security
- bcrypt for password hashing
- JWT with expiration; refresh tokens optional later
- Protected endpoints for favorites

Testing (MVP)
- Auth: register/login/me; token validation
- Protected routes require token
- Favorites: CRUD for zones and species

Deployment
- Staging for migrations/seeds; production after validation
- Verify auth and favorites endpoints in prod

Notes
- Google login reserved for 4.7.1

Definition of Done
- All MVP endpoints implemented and tested locally
- Migrations exist (005/006/007) and seeds ready for staging
- Documentation updated to reflect the MVP scope and contracts
