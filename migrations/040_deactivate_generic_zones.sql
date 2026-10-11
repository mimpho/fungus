-- 040 — Deactivate generic and duplicate zones; fix two forest types (2026-10-10)
--
-- The original 200 zones came from early mock data. Many are not a place but a forest type
-- plus a province, comarca, valley or municipality ("Pinar de Lleida", "Liébana"), with
-- approximate coordinates: their climate is fetched at a point that is not their forest
-- (median 229 m between stored altitude and terrain; some points land in the sea). Decided
-- with Marcos: keep only real, named places. Deactivated, not deleted: climate history and
-- follows stay, and any zone can be switched back on.
--
-- Idempotent: safe to re-run.

-- Generic names (province, comarca, valley, municipality) and two wrong ones
UPDATE zones SET active = false WHERE id IN (
  'zone-002', -- Hayedo del Ripollès (comarca)
  'zone-004', -- Pinar de Lleida (province)
  'zone-005', -- Hayedo de la Garrotxa (comarca)
  'zone-025', -- Pinar de Cuenca (province)
  'zone-033', -- Pinar de la Cerdanya (comarca)
  'zone-034', -- Hayedo del Berguedà (comarca)
  'zone-042', -- Robledal del Solsonès (comarca)
  'zone-046', -- Encinar de la Conca de Barberà (comarca)
  'zone-055', -- Ribeira Sacra luguesa (comarca)
  'zone-068', -- Liébana (comarca)
  'zone-070', -- Valle de Cabuérniga (valley)
  'zone-072', -- Miera (municipality)
  'zone-073', -- Valderredible (municipality)
  'zone-074', -- Campoo de Suso (comarca)
  'zone-075', -- Pas-Miera (valleys)
  'zone-076', -- Asón-Gama (valleys)
  'zone-077', -- Nansa (valley)
  'zone-098', -- Sierra de Cameros (comarca)
  'zone-103', -- Valle de Iregua (valley)
  'zone-116', -- Encinar de Aliste (comarca)
  'zone-118', -- Hayedo de Palencia (province)
  'zone-130', -- Robledal de Cinco Villas (comarca)
  'zone-135', -- Pinar del Maestrazgo (comarca)
  'zone-138', -- Degaña (municipality)
  'zone-141', -- Teverga (municipality)
  'zone-142', -- Robledal de Tineo (municipality)
  'zone-144', -- Hayedo del Narcea (comarca)
  'zone-145', -- Robledal de Llanes (municipality)
  'zone-146', -- Pinar de Mieres (municipality)
  'zone-149', -- Robledal de los Guájares (comarca)
  'zone-153', -- Sierra Morena cordobesa (province-wide)
  'zone-156', -- Hayedo de la Tejera (no beech forest in Cazorla)
  'zone-179', -- Robledal de Las Hurdes (comarca)
  'zone-181', -- Encinar de Jerez de los Caballeros (municipality)
  'zone-183', -- Encinar de Olivenza (municipality)
  'zone-185', -- Robledal del Turia (river basin)
  'zone-186', -- Pinar de la Serranía (comarca)
  'zone-196', -- Sierra del Noroeste murciano (comarca)
  'zone-197', -- Encinar de Sierra Morena, Murcia (Sierra Morena is not in Murcia)
  'zone-198', -- Pinar de Moratalla (municipality)
  'zone-199', -- Robledal de Caravaca (municipality)
  'zone-200', -- Encinar de Calasparra (municipality)
  -- Duplicates and places that are not a forest
  'zone-100', -- Sierra de la Demanda riojana (= zone-022)
  'zone-166', -- Hayedo de Cantalojas (= Tejera Negra, zone-014)
  'zone-184', -- Pinar de Penyagolosa sur (= zone-192)
  'zone-113', -- Hayedo de La Uña (a village)
  'zone-170'  -- Robledal de Calera (a municipality)
);

-- Wrong forest type: Font Roja is a holm-oak forest (carrascal), Sierra de San Pedro a cork-oak one
UPDATE zones SET name = 'Carrascal de la Font Roja', forest_type = 'encinar' WHERE id = 'zone-189';
UPDATE zones SET name = 'Alcornocal de la Sierra de San Pedro', forest_type = 'encinar' WHERE id = 'zone-182';
