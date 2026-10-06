-- 039_zones_catalonia.sql
-- 14 new zones in Catalonia + zone-030 (Pinar de Setcases) moved up towards Vallter.
--
-- Selection and sources: "Zonas nuevas en Cataluña — investigación" (project doc, 2026-10-07).
-- Coordinates checked against EU-DEM 25 m (elevation_m rounded). Forest type = dominant
-- type among the four the UI supports (pinar, hayedo, robledal, encinar).
--
-- Idempotent: ON CONFLICT (id) DO UPDATE. geom is a generated column (from lat/lon).
-- After running: launch the climate backfill so the new zones get history.

BEGIN;

INSERT INTO public.zones (id, name, province, region, lat, lon, elevation_m, forest_type, active, description)
SELECT v.id, v.name, v.province, v.region, v.lat, v.lon, v.elevation_m, v.forest_type, true, v.description
FROM (VALUES
  ('zone-201', 'Pinar de La Molina',              'Girona',    'Cerdanya',       42.3300, 1.9750, 1840, 'pinar',
   'Pino negro entre La Molina y la Collada de Toses. Zona de céps (Boletus edulis, B. pinophilus) y rovellons.'),
  ('zone-202', 'Pinar del Costabona',             'Girona',    'Ripollès',       42.3950, 2.3500, 1700, 'pinar',
   'Pino negro de altura subiendo por la pista d''Espinavell hacia el Costabona. Zona de céps y rovellons.'),
  ('zone-203', 'Pinar de la Vall de Boí',         'Lleida',    'Alta Ribagorça', 42.5050, 0.8450, 1775, 'pinar',
   'Pinares de alta montaña en la Vall de Boí, en dirección a las pistas de Boí-Taüll.'),
  ('zone-204', 'Pinar de Meranges',               'Girona',    'Cerdanya',       42.4650, 1.7600, 1950, 'pinar',
   'Pino negro sobre Meranges, hacia Malniu. Bosque con parcelas de estudio micológico del CTFC.'),
  ('zone-205', 'Robledal de Viladrau',            'Girona',    'Osona',          41.8480, 2.3900, 820,  'robledal',
   'Castañares y bosques caducifolios de la vertiente norte del Montseny, en el entorno de Viladrau.'),
  ('zone-206', 'Robledal del Collsacabra',        'Barcelona', 'Osona',          42.0250, 2.4660, 845,  'robledal',
   'Robledales y hayedos del altiplano del Collsacabra, entre Rupit y Tavertet.'),
  ('zone-207', 'Pinar del Lluçanès',              'Barcelona', 'Lluçanès',       42.0080, 2.0280, 705,  'pinar',
   'Pinares de pino silvestre con roble en el entorno de Prats de Lluçanès.'),
  ('zone-208', 'Pinar del Moianès',               'Barcelona', 'Moianès',        41.8120, 2.0970, 725,  'pinar',
   'Pinares y robledales del altiplano del Moianès, en el entorno de Moià.'),
  ('zone-209', 'Pinar de Castellar del Riu',      'Barcelona', 'Berguedà',       42.1200, 1.8000, 1385, 'pinar',
   'Pinares de pino silvestre del Pla de Puigventós y Castellar del Riu, sobre Berga.'),
  ('zone-210', 'Pinar de Cardona',                'Barcelona', 'Bages',          41.9140, 1.6800, 520,  'pinar',
   'Pinares del entorno de Cardona, tradicionales para llenegues y rovellons.'),
  ('zone-211', 'Encinar de l''Alta Garrotxa',     'Girona',    'Alt Empordà',    42.3200, 2.6800, 760,  'encinar',
   'Encinares y bosques mixtos entre Albanyà y el Bassegoda, en el límite con la Alta Garrotxa.'),
  ('zone-212', 'Encinar de l''Albera',            'Girona',    'Alt Empordà',    42.4370, 2.9750, 505,  'encinar',
   'Encinares y alcornocales de la Albera, en el entorno de Requesens.'),
  ('zone-213', 'Pinar de Boumort',                'Lleida',    'Pallars Jussà',  42.2200, 1.1100, 1555, 'pinar',
   'Pinares de pino silvestre y pinassa de la Serra de Boumort.'),
  ('zone-214', 'Pinar de Coll de Nargó',          'Lleida',    'Alt Urgell',     42.1900, 1.3000, 1165, 'pinar',
   'Pinares sobre Coll de Nargó, zona tradicional de rovellons.')
) AS v(id, name, province, region, lat, lon, elevation_m, forest_type, description)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, province = EXCLUDED.province, region = EXCLUDED.region,
  lat = EXCLUDED.lat, lon = EXCLUDED.lon, elevation_m = EXCLUDED.elevation_m,
  forest_type = EXCLUDED.forest_type, active = EXCLUDED.active,
  description = EXCLUDED.description;

-- zone-030: from 1,650 m near the village to pino negro on the road to Vallter
UPDATE public.zones SET
  lat = 42.4050, lon = 2.2720, elevation_m = 1885,
  description = 'Pino negro de alta montaña en la carretera de Vallter, sobre Setcases. Referencia para céps y rovellons.'
WHERE id = 'zone-030';

-- Its weather history belongs to the old point. The ingest never overwrites an
-- open-meteo row with another open-meteo row, so clear it and let the backfill reload it.
DELETE FROM public.climate_history WHERE zone_id = 'zone-030';
DELETE FROM public.scores_cache    WHERE zone_id = 'zone-030';
DELETE FROM public.weather_cache   WHERE zone_id = 'zone-030';

COMMIT;
