# Plan 4.7 MVP — Auth & Favorites (Two Tables)

Objective
- Implement authentication (JWT) and favorites management by user for zones and species using two dedicated tables. MVP-focused, no sightings.
- Provide protected endpoints and a minimal login/logout + favorites management experience.
- Maintain compatibility with existing flow; do not break existing APIs.
- Social login (Google) reserved for 4.7.1.

Scope (MVP)
- Auth: register, login, me; protected routes
- Favorites: two tables (zones, species) with add/list/delete endpoints
- Migrations: create users, favorites_zones, favorites_species
- Frontend MVP: login/logout, profile with favorites
- Security & observability: bcrypt, JWT expiration, basic login auditing

Data Model (MVP)
- users
  - id: PK, UUID
  - email: unique
  - password_hash
  - first_name
  - last_name
  - birth_date: DATE (optional; age derived in UI)
  - created_at
  - google_id: optional (future Google login)
- favorites_zones
  - id: PK
  - user_id: FK → users.id
  - zone_id: FK → zones.id
  - created_at
- favorites_species
  - id: PK
  - user_id: FK → users.id
  - species_id: FK → species.id
  - created_at

Notes
- Birth date is optional; age can be derived in UI when needed.
- Seeds should provide 2 test users and 2 zones / 2 species for staging.

Endpoints (MVP; secured)
- Auth
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - GET  /api/v1/auth/me
- Favorites
  - Zones
    - POST   /api/v1/favorites/zones  (zone_id)
    - GET    /api/v1/favorites/zones
    - DELETE /api/v1/favorites/zones/{id}
  - Species
    - POST   /api/v1/favorites/species  (species_id)
    - GET    /api/v1/favorites/species
    - DELETE /api/v1/favorites/species/{id}

Seed & Migration plan
- 005_auth_users.py
- 006_favorites_zones.py
- 007_favorites_species.py
- 008_seeds_auth_favorites.md (optional)

Security
- bcrypt for password hashing
- JWT with expiration; refresh tokens optional later
- Protected endpoints for favorites and user data

Frontend MVP
- Login/Registration flow; session handling
- Profile with Favorites; add/remove in zones/species
- Basic UI integration to show favorites

Testing (MVP)
- Auth: register/login/me; token verification
- Protection: unauthorized access denied
- Favorites: create/list/delete for zones and species

Deployment
- Staging for migrations/seeds; prod after validation
- Verify auth/favorites endpoints in prod

Documentation
- Single source of truth in docs/plan/v4-7-auth-favorites.md
- Update docs/deploy.md with 4.7 notes
- Update CLAUDE.md/README.md with 4.7 status
- Update memory/pending.md after prod verification

Risks & Mitigations
- Migration failures: modular steps and local/stage tests
- API contracts: stable interfaces; versioning if needed
- Security: standard practices; token expiry; avoid exposing secrets
- Complexity: keep MVP scope tight; plan for 4.7.1 improvements

Checklist
- Birth_date optional; UI age derivation (postpone if needed)
- Create docs/plan/v4-7-auth-favorites.md
- Create docs/deploy_4_7_notes.md
- Create 005/006/007 migration templates (MD or code)
- Create schemas for Auth and Favorites
- Seeds for staging (2 users, 2 zones, 2 species)

Notes
- If you want payload examples for login/registration and favorites, I can add them.
