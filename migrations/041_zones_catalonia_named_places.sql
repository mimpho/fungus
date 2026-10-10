-- 041 — Catalonia: zones named after real places (2026-10-11)
--
-- Zone list built with Marcos from the index of "El secret més ben guardat" (M. Estévez
-- Casabosch, Ara Llibres): each route is a place foragers actually know by that name.
-- Only place names are taken from the book, not its text.
--
-- Part 1: 17 original zones (generic names, approximate points) are moved onto a named
--         place and renamed, plus zone-030 renamed. Part 2: 23 new zones.
-- Points come from the ICGC geocoder (topònims). A few are approximate and marked
-- "-- approx" below: zone_relocate.py / the elevation script check them against the forest.
-- elevation_m, elevation_min_m and elevation_max_m are reset to NULL for moved zones and
-- left NULL for new ones: run backend/scripts/zone_elevation_ranges.py --apply
-- --update-point, then the climate backfill from 2024-10-01 (docs/content-guide.md).
--
-- Idempotent: UPDATE by id, INSERT ... ON CONFLICT (id) DO UPDATE. geom is generated.

BEGIN;

-- ── Part 1: moved and renamed ────────────────────────────────────────────────
UPDATE public.zones z SET
  name = v.name, province = v.province, region = v.region, lat = v.lat, lon = v.lon,
  forest_type = v.forest_type, description = v.description,
  elevation_m = NULL, elevation_min_m = NULL, elevation_max_m = NULL
FROM (VALUES
  ('zone-039', 'La mata de València',          'Lleida',    'Pallars Sobirà', 42.6315, 1.0727, 'pinar',    'Bosque de la Mata de València, en Alt Àneu.'),
  ('zone-041', 'La vall d''Esterri de Cardós', 'Lleida',    'Pallars Sobirà', 42.5927, 1.2617, 'hayedo',   'Valle de Cardós sobre Esterri de Cardós.'),
  ('zone-201', 'La muntanya de Saltèguet',     'Girona',    'Cerdanya',       42.3535, 1.9744, 'pinar',    'Vall de Saltèguet, entre La Molina y Alp. Pino negro y rovellons.'),
  ('zone-204', 'El bosc madur de Guils-Fontanera', 'Girona','Cerdanya',       42.4556, 1.8467, 'pinar',    'Bosque maduro de Guils de Cerdanya, en Fontanera.'),
  ('zone-209', 'La baga de Campllong',         'Barcelona', 'Berguedà',       42.1034, 1.7658, 'pinar',    'Baga de Campllong, en Castellar del Riu.'),
  ('zone-214', 'La muntanya d''Alinyà',        'Lleida',    'Alt Urgell',     42.1602, 1.4309, 'pinar',    'Macizo de Alinyà, en Fígols i Alinyà.'),
  ('zone-035', 'Les obagues del Verd',         'Lleida',    'Solsonès',       42.1976, 1.6155, 'pinar',    'Umbrías de la serra del Verd. -- approx'),
  ('zone-029', 'La serra Cavallera',           'Girona',    'Ripollès',       42.2949, 2.2986, 'hayedo',   'Serra Cavallera, entre Vilallonga de Ter y Ogassa.'),
  ('zone-006', 'El bosc de la Font Groga',     'Barcelona', 'Barcelonès',     41.4314, 2.1217, 'encinar',  'Bosque de la Font Groga, en Collserola (Sant Cugat).'),
  ('zone-045', 'La serra de Llaberia',         'Tarragona', 'Baix Camp',      41.0957, 0.8369, 'pinar',    'Serra de Llaberia.'),
  ('zone-003', 'La Pineda Fosca',              'Barcelona', 'Osona',          41.7679, 2.3978, 'robledal', 'Pineda Fosca, en el Montseny.'),
  ('zone-044', 'Les obagues de la serra del Molló', 'Tarragona', 'Priorat',   41.2103, 0.8847, 'robledal', 'Umbrías de la serra del Molló, entre Porrera y Cornudella.'),
  ('zone-007', 'L''obaga del Negrell',         'Tarragona', 'Montsià',        40.7342, 0.2274, 'pinar',    'Obaga del Negrell, en la Sénia (Ports).'),
  ('zone-043', 'L''obaga d''Alberola',         'Lleida',    'Noguera',        41.9357, 0.6789, 'pinar',    'Obaga d''Alberola, en Os de Balaguer.'),
  ('zone-207', 'Els Munts',                    'Barcelona', 'Lluçanès',       42.0788, 2.1533, 'pinar',    'Els Munts, cerca de Sant Agustí de Lluçanès (parking cercano).'),
  ('zone-208', 'Les obagues del Moianès',      'Barcelona', 'Moianès',        41.8120, 2.0970, 'pinar',    'Umbrías del altiplano del Moianès. -- approx'),
  ('zone-205', 'El coll de Bordoriol',         'Girona',    'Osona',          41.8263, 2.4091, 'robledal', 'Robledales y encinares del coll de Bordoriol, en Viladrau (Montseny).')
) AS v(id, name, province, region, lat, lon, forest_type, description)
WHERE z.id = v.id;

-- Alta vall del Ter: zone-030 already sits there (Setcases, hand-checked); only the name changes
UPDATE public.zones SET name = 'L''alta vall del Ter' WHERE id = 'zone-030';

-- ── Part 2: new zones ────────────────────────────────────────────────────────
INSERT INTO public.zones (id, name, province, region, lat, lon, elevation_m, forest_type, active, description)
SELECT v.id, v.name, v.province, v.region, v.lat, v.lon, NULL, v.forest_type, true, v.description
FROM (VALUES
  ('zone-215', 'El bosc de Baricauba',          'Lleida',    'Val d''Aran',     42.7047, 0.7927, 'pinar',    'Abetal de Baricauba (Montcorbison), sobre Vielha.'),
  ('zone-216', 'El bosc de Virós',              'Lleida',    'Pallars Sobirà',  42.5171, 1.2868, 'pinar',    'Bosque de Virós, en Alins.'),
  ('zone-217', 'Els boscos de la Vall Ferrera', 'Lleida',    'Pallars Sobirà',  42.6219, 1.3296, 'pinar',    'Bosques de la Vall Ferrera, en Alins.'),
  ('zone-218', 'L''obaga de la Culla',          'Lleida',    'Alt Urgell',      42.4205, 1.2691, 'pinar',    'Obaga de la Culla, en Montferrer i Castellbò.'),
  ('zone-219', 'El planell de Piners',          'Lleida',    'Alt Urgell',      42.4231, 1.5226, 'pinar',    'Planell de Piners, junto al Planell de Turbiàs (Les Valls de Valira).'),
  ('zone-220', 'El serrat de Runers',           'Barcelona', 'Berguedà',        42.0872, 1.7501, 'pinar',    'Serrat de Runers, en Capolat.'),
  ('zone-221', 'D''Agullana a la Vajol',        'Girona',    'Alt Empordà',     42.4038, 2.8002, 'encinar',  'Alcornocales y encinares entre Agullana y la Vajol. Point on la Vajol.'),
  ('zone-222', 'La serra de la Tardana',        'Barcelona', 'Anoia',           41.5612, 1.7233, 'pinar',    'Serra de la Tardana, en Piera.'),
  ('zone-223', 'Els suros de l''Ardenya',       'Girona',    'Baix Empordà',    41.7792, 2.9521, 'encinar',  'Alcornocales de l''Ardenya.'),
  ('zone-224', 'Els boscos del coll d''Alforja','Tarragona', 'Baix Camp',       41.2214, 0.9342, 'pinar',    'Bosques del coll d''Alforja.'),
  ('zone-225', 'Els pinastres de Taialà',       'Girona',    'Gironès',         41.9988, 2.7885, 'pinar',    'Pinares de pino rodeno de Taialà, junto a Girona.'),
  ('zone-226', 'Els boscos de Riells i Montsoriu','Girona',  'Selva',           41.7790, 2.5454, 'encinar',  'Bosques de Riells y Montsoriu. Point near Sot de Montsoriu. -- approx'),
  ('zone-227', 'El pla d''en Vidal',            'Barcelona', 'Vallès Oriental', 41.6520, 2.5192, 'encinar',  'Pla d''en Vidal, en Vallgorguina.'),
  ('zone-228', 'Els alzinars del Corredor',     'Barcelona', 'Maresme',         41.6200, 2.5200, 'encinar',  'Encinares del Parc del Corredor. -- approx, check with zone_relocate.py'),
  ('zone-229', 'La serra de la Marina',         'Barcelona', 'Barcelonès',      41.4700, 2.2200, 'pinar',    'Serralada de Marina. -- approx, check with zone_relocate.py'),
  ('zone-230', 'La vall de Sant Iscle',         'Barcelona', 'Maresme',         41.6244, 2.5687, 'encinar',  'Valle de Sant Iscle de Vallalta. -- approx'),
  ('zone-231', 'Els boscos d''Olivella i Olesa de Bonesvalls','Barcelona','Garraf',41.3104, 1.8110, 'pinar', 'Bosques de Olivella y Olesa de Bonesvalls (Garraf). Point on Olivella.'),
  ('zone-232', 'La muntanya Gran del Montgrí',  'Girona',    'Baix Empordà',    42.0500, 3.1500, 'pinar',    'Macizo del Montgrí. -- approx, check with zone_relocate.py'),
  ('zone-233', 'La fageda de Santa Fe',         'Barcelona', 'Vallès Oriental', 41.7800, 2.4500, 'hayedo',   'Hayedo de Santa Fe del Montseny. -- approx, check with zone_relocate.py'),
  ('zone-234', 'El pla de les Vaques',          'Tarragona', 'Alt Camp',        41.2700, 1.0200, 'pinar',    'Pla de les Vaques, a las puertas del altiplano de la Mussara. -- provisional, check with zone_relocate.py'),
  ('zone-235', 'El serrat de la Bandera',       'Barcelona', 'Osona',           41.9358, 2.4269, 'robledal', 'Serrat de la Bandera, en Vilanova de Sau (Guilleries). Robledal mixto con pino rojo y encina.'),
  ('zone-236', 'Sant Daniel',                   'Girona',    'Selva',           41.7105, 2.7649, 'encinar',  'Sant Daniel, en Tordera, entre Blanes y Lloret de Mar.'),
  ('zone-237', 'Els boscos de la baronia de Rialb','Lleida', 'Noguera',         41.9720, 1.1740, 'pinar',    'Bosques de la Baronia de Rialb. -- approx (Trossos de l''Arcenda)')
) AS v(id, name, province, region, lat, lon, forest_type, description)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, province = EXCLUDED.province, region = EXCLUDED.region,
  lat = EXCLUDED.lat, lon = EXCLUDED.lon, forest_type = EXCLUDED.forest_type,
  description = EXCLUDED.description, active = true;

COMMIT;
