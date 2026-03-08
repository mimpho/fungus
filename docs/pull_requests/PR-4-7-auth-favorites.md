## PR Title
Plan 4.7 MVP: Auth & Favorites (Two Tables)

## PR Description
- Objective: Implement authentication and favorites with two tables (zones and species) for 4.7 MVP.
- Scope: JWT-based auth, user profile, and protected favorites endpoints; no sightings in this release.
- Data model: users, favorites_zones, favorites_species with seeds for staging (2 users, 2 zones, 2 species).
- Endpoints: POST/GET/DELETE for favorites per type; register/login/me; protected routes.
- Migrations: create 005_auth_users, 006_favorites_zones, 007_favorites_species; seeds for staging.
- Security: bcrypt, JWT expiry; minimal auditing.
- Frontend: MVP login/logout and favorites list; UI hooks ready for integration.
- Testing: basic auth flows and favorites CRUD; verification in staging.

- Notes: Google login reserved for 4.7.1.
