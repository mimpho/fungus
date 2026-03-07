-- Supabase seed: esp-202 Chroogomphus rutilus
-- Run in Supabase dashboard → SQL Editor
-- Generated: 2026-03-07

INSERT INTO species (
  id,
  scientific_name,
  family,
  edibility,
  forest_types,
  fruiting_months,
  elevation_min_m,
  elevation_max_m,
  common_names,
  description,
  oi_params,
  extra_data
) VALUES (
  'esp-202',
  'Chroogomphus rutilus',
  'Gomphidiaceae',
  'comestible',
  ARRAY['pinar'],
  ARRAY[8, 9, 10, 11],
  200,
  1500,
  ARRAY['Cama de perdiu', 'Gomfidio viscoso', 'Spike cap', 'Gomfidio aleonado'],
  'Seta de pinares con píleo viscoso de color ocre-anaranjado a marrón vinoso, láminas decurrentes gruesas de color gris-liláceo que oscurecen con la edad. Comestible de calidad mediocre, asociada exclusivamente a coníferas. Crece con frecuencia junto a Suillus y otros boletos, de los que puede ser parásita parcial. ATENCIÓN: puede confundirse con Cortinarius orellanus (MORTAL) por el color similar del sombrero y el hábitat compartido en pinares; distinguir siempre por las láminas gruesas decurrentes, esporada negra-grisácea y ausencia de cortina.',
  '{
    "temp_optima_min": 8.0,
    "temp_optima_max": 16.0,
    "humedad_min": 55.0,
    "humedad_optima": 70.0,
    "precip_14dias_min": 20.0,
    "precip_14dias_max": 60.0,
    "requiere_helada": false,
    "requiere_choque_termico": false,
    "dias_hasta_fructificacion": 7
  }'::jsonb,
  '{
    "cap": {
      "forma": "Convexo a umbonado, luego aplanado",
      "color": "Ocre-anaranjado a marrón vinoso, viscoso en húmedo",
      "diametro": "4-10 cm",
      "superficie": "Lisa, viscosa-glutinosa en tiempo húmedo"
    },
    "stem": {
      "forma": "Cilíndrico, a veces fusiforme",
      "color": "Amarillo-anaranjado con tonos violáceos hacia la base",
      "altura": "4-9 cm",
      "diametro": "1-2 cm"
    },
    "flesh": {
      "color": "Amarillo-anaranjada, violácea en la base del pie",
      "textura": "Firme",
      "olor": "Suave, fúngico",
      "sabor": "Suave, algo amargo"
    },
    "sporePrint": "Gris-negruzca",
    "distribucion": ["Europa", "España", "pinares de toda la Península"],
    "synonyms": [
      "Gomphidius rutilus (Schaeff.) O.K. Mill.",
      "Agaricus rutilus Schaeff.",
      "Gomphidius viscidus (L.) Fr."
    ],
    "photos": [
      {
        "url": "assets/images/content/species/esp-202-main.jpg",
        "largeUrl": "assets/images/content/species/esp-202-main-large.jpg"
      },
      {
        "url": "assets/images/content/species/esp-202-foto1.jpg",
        "largeUrl": "assets/images/content/species/esp-202-foto1-large.jpg"
      },
      {
        "url": "assets/images/content/species/esp-202-foto2.jpg",
        "largeUrl": "assets/images/content/species/esp-202-foto2-large.jpg"
      }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  scientific_name  = EXCLUDED.scientific_name,
  family           = EXCLUDED.family,
  edibility        = EXCLUDED.edibility,
  forest_types     = EXCLUDED.forest_types,
  fruiting_months  = EXCLUDED.fruiting_months,
  elevation_min_m  = EXCLUDED.elevation_min_m,
  elevation_max_m  = EXCLUDED.elevation_max_m,
  common_names     = EXCLUDED.common_names,
  description      = EXCLUDED.description,
  oi_params        = EXCLUDED.oi_params,
  extra_data       = EXCLUDED.extra_data;
