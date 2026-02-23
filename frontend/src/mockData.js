// mockData.js - Datos mockeados para MicoMapa
// Simula respuestas de la API sin necesidad de backend

export const mockZonas = [
  {
    id: 'zona-001',
    nombre: 'Pinar de Urbión',
    provincia: 'Soria',
    comarca: 'Pinares',
    latitud: 41.9847,
    longitud: -2.8547,
    altitud: 1850,
    tipo_bosque: 'pinar',
    ph_suelo: 5.8,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Pinus sylvestris', 'Pinus uncinata'],
    orientacion: 'norte'
  },
  {
    id: 'zona-002',
    nombre: 'Hayedo del Ripollès',
    provincia: 'Girona',
    comarca: 'Ripollès',
    latitud: 42.2547,
    longitud: 2.1234,
    altitud: 1200,
    tipo_bosque: 'hayedo',
    ph_suelo: 5.2,
    tipo_suelo: 'arcilloso',
    drenaje: 'moderado',
    especies_arboreas: ['Fagus sylvatica', 'Quercus petraea'],
    orientacion: 'nordeste'
  },
  {
    id: 'zona-003',
    nombre: 'Robledal del Montseny',
    provincia: 'Barcelona',
    comarca: 'Osona',
    latitud: 41.7684,
    longitud: 2.4153,
    altitud: 980,
    tipo_bosque: 'robledal',
    ph_suelo: 6.1,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Quercus ilex', 'Quercus robur'],
    orientacion: 'este'
  },
  {
    id: 'zona-004',
    nombre: 'Pinar de Lleida',
    provincia: 'Lleida',
    comarca: 'Alt Urgell',
    latitud: 42.3568,
    longitud: 1.4626,
    altitud: 1450,
    tipo_bosque: 'pinar',
    ph_suelo: 5.5,
    tipo_suelo: 'arenoso',
    drenaje: 'excelente',
    especies_arboreas: ['Pinus sylvestris', 'Pinus nigra'],
    orientacion: 'sur'
  },
  {
    id: 'zona-005',
    nombre: 'Hayedo de la Garrotxa',
    provincia: 'Girona',
    comarca: 'Garrotxa',
    latitud: 42.1547,
    longitud: 2.5234,
    altitud: 850,
    tipo_bosque: 'hayedo',
    ph_suelo: 5.0,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Fagus sylvatica'],
    orientacion: 'norte'
  },
  {
    id: 'zona-006',
    nombre: 'Bosque Mixto del Berguedà',
    provincia: 'Barcelona',
    comarca: 'Berguedà',
    latitud: 42.1234,
    longitud: 1.8765,
    altitud: 1100,
    tipo_bosque: 'mixto',
    ph_suelo: 5.7,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Pinus sylvestris', 'Fagus sylvatica', 'Quercus ilex'],
    orientacion: 'noroeste'
  },
  {
    id: 'zona-007',
    nombre: 'Encinar del Priorat',
    provincia: 'Tarragona',
    comarca: 'Priorat',
    latitud: 41.1234,
    longitud: 0.7865,
    altitud: 650,
    tipo_bosque: 'encinar',
    ph_suelo: 6.8,
    tipo_suelo: 'arcilloso',
    drenaje: 'moderado',
    especies_arboreas: ['Quercus ilex'],
    orientacion: 'sur'
  },
  {
    id: 'zona-008',
    nombre: 'Pinar de Solsonès',
    provincia: 'Lleida',
    comarca: 'Solsonès',
    latitud: 41.9934,
    longitud: 1.5187,
    altitud: 1320,
    tipo_bosque: 'pinar',
    ph_suelo: 5.9,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Pinus sylvestris', 'Pinus nigra'],
    orientacion: 'este'
  },
  {
    id: 'zona-009',
    nombre: 'Robledal de Els Ports',
    provincia: 'Tarragona',
    comarca: 'Baix Ebre',
    latitud: 40.7845,
    longitud: 0.2341,
    altitud: 890,
    tipo_bosque: 'robledal',
    ph_suelo: 6.3,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Quercus faginea', 'Quercus ilex'],
    orientacion: 'oeste'
  },
  {
    id: 'zona-010',
    nombre: 'Hayedo del Cadi',
    provincia: 'Girona',
    comarca: 'Cerdanya',
    latitud: 42.3112,
    longitud: 1.8765,
    altitud: 1650,
    tipo_bosque: 'hayedo',
    ph_suelo: 5.1,
    tipo_suelo: 'franco',
    drenaje: 'bueno',
    especies_arboreas: ['Fagus sylvatica'],
    orientacion: 'norte'
  }
];

export const mockEspecies = [
  {
    id: 'esp-001',
    nombre_cientifico: 'Boletus edulis',
    nombres_comunes: ['Boleto', 'Hongo calabaza', 'Cep'],
    familia: 'Boletaceae',
    comestibilidad: 'excelente',
    imagen_url: null,
    descripcion: 'Uno de los hongos más apreciados gastronómicamente. Sombrero marrón de hasta 30cm, poros blancos que se vuelven amarillos. Excelente sabor y textura. Común en pinares y hayedos de montaña.',
    temp_optima_min: 12.0,
    temp_optima_max: 18.0,
    humedad_min: 70.0,
    humedad_optima: 80.0,
    precip_14dias_min: 30.0,
    precip_14dias_max: 80.0,
    ph_suelo_min: 5.5,
    ph_suelo_max: 6.5,
    temp_suelo_optima_min: 12.0,
    temp_suelo_optima_max: 16.0,
    tipos_bosque: ['pinar', 'hayedo', 'robledal', 'mixto'],
    altitud_min: 600,
    altitud_max: 2000,
    meses_fructificacion: [8, 9, 10, 11],
    requiere_helada: false,
    requiere_choque_termico: true,
    dias_hasta_fructificacion: 7
  },
  {
    id: 'esp-002',
    nombre_cientifico: 'Lactarius deliciosus',
    nombres_comunes: ['Níscalo', 'Rovellón', 'Rebollón'],
    familia: 'Russulaceae',
    comestibilidad: 'excelente',
    imagen_url: null,
    descripcion: 'Sombrero naranja con zonas concéntricas más oscuras. Exuda látex anaranjado al corte que se vuelve verde. Muy apreciado en la gastronomía mediterránea. Crece exclusivamente bajo pinos.',
    temp_optima_min: 10.0,
    temp_optima_max: 16.0,
    humedad_min: 65.0,
    humedad_optima: 75.0,
    precip_14dias_min: 20.0,
    precip_14dias_max: 60.0,
    ph_suelo_min: 5.0,
    ph_suelo_max: 6.0,
    temp_suelo_optima_min: 10.0,
    temp_suelo_optima_max: 14.0,
    tipos_bosque: ['pinar'],
    altitud_min: 400,
    altitud_max: 1800,
    meses_fructificacion: [9, 10, 11, 12],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 5
  },
  {
    id: 'esp-003',
    nombre_cientifico: 'Cantharellus cibarius',
    nombres_comunes: ['Rebozuelo', 'Chantarela', 'Angula de monte'],
    familia: 'Cantharellaceae',
    comestibilidad: 'excelente',
    imagen_url: null,
    descripcion: 'Color amarillo huevo uniforme. Forma de embudo con pliegues en lugar de láminas. Olor característico a albaricoque. Excelente seta comestible muy valorada. Crece en hayedos y robledales húmedos.',
    temp_optima_min: 14.0,
    temp_optima_max: 20.0,
    humedad_min: 75.0,
    humedad_optima: 85.0,
    precip_14dias_min: 40.0,
    precip_14dias_max: 100.0,
    ph_suelo_min: 4.5,
    ph_suelo_max: 5.5,
    temp_suelo_optima_min: 14.0,
    temp_suelo_optima_max: 18.0,
    tipos_bosque: ['hayedo', 'robledal', 'mixto'],
    altitud_min: 500,
    altitud_max: 1600,
    meses_fructificacion: [6, 7, 8, 9, 10],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 10
  },
  {
    id: 'esp-004',
    nombre_cientifico: 'Amanita caesarea',
    nombres_comunes: ['Oronja', 'Amanita de los césares'],
    familia: 'Amanitaceae',
    comestibilidad: 'excelente',
    imagen_url: null,
    descripcion: 'Sombrero naranja brillante, láminas y pie amarillos. Volva blanca prominente en la base. Considerada una de las mejores setas comestibles. Muy apreciada desde la época romana. Crece en robledales y encinares.',
    temp_optima_min: 16.0,
    temp_optima_max: 24.0,
    humedad_min: 70.0,
    humedad_optima: 80.0,
    precip_14dias_min: 35.0,
    precip_14dias_max: 90.0,
    ph_suelo_min: 5.5,
    ph_suelo_max: 6.5,
    temp_suelo_optima_min: 16.0,
    temp_suelo_optima_max: 20.0,
    tipos_bosque: ['robledal', 'encinar'],
    altitud_min: 300,
    altitud_max: 1200,
    meses_fructificacion: [7, 8, 9, 10],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 8
  },
  {
    id: 'esp-005',
    nombre_cientifico: 'Amanita muscaria',
    nombres_comunes: ['Matamoscas', 'Falsa oronja', 'Reig bord'],
    familia: 'Amanitaceae',
    comestibilidad: 'toxico',
    imagen_url: null,
    descripcion: 'Sombrero rojo con escamas blancas características. MUY TÓXICA. Contiene muscimol y ácido iboténico que causan síndrome neurológico con alucinaciones, convulsiones y delirio. Aunque raramente mortal, puede causar intoxicación grave. Nunca debe consumirse.',
    temp_optima_min: 10.0,
    temp_optima_max: 18.0,
    humedad_min: 65.0,
    humedad_optima: 75.0,
    precip_14dias_min: 25.0,
    precip_14dias_max: 70.0,
    ph_suelo_min: 4.5,
    ph_suelo_max: 6.0,
    temp_suelo_optima_min: 10.0,
    temp_suelo_optima_max: 15.0,
    tipos_bosque: ['pinar', 'hayedo', 'abedul'],
    altitud_min: 400,
    altitud_max: 2000,
    meses_fructificacion: [8, 9, 10, 11],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: null
  },
  {
    id: 'esp-006',
    nombre_cientifico: 'Amanita phalloides',
    nombres_comunes: ['Oronja verde', 'Canaleja', 'Cicuta verde'],
    familia: 'Amanitaceae',
    comestibilidad: 'mortal',
    imagen_url: null,
    descripcion: 'EXTREMADAMENTE MORTAL. La seta más peligrosa de Europa, responsable del 90% de muertes por setas. Sombrero verdoso, láminas blancas, volva sacciforme. Contiene amatoxinas que causan fallo hepático y renal irreversible. 50g pueden matar a un adulto. Los síntomas tardan 6-24h en aparecer. Mortalidad del 50% incluso con tratamiento. NUNCA CONSUMIR.',
    temp_optima_min: 12.0,
    temp_optima_max: 20.0,
    humedad_min: 70.0,
    humedad_optima: 80.0,
    precip_14dias_min: 30.0,
    precip_14dias_max: 80.0,
    ph_suelo_min: 5.0,
    ph_suelo_max: 6.5,
    temp_suelo_optima_min: 12.0,
    temp_suelo_optima_max: 18.0,
    tipos_bosque: ['robledal', 'hayedo', 'encinar', 'castaño'],
    altitud_min: 200,
    altitud_max: 1400,
    meses_fructificacion: [8, 9, 10, 11],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: null
  },
  {
    id: 'esp-007',
    nombre_cientifico: 'Macrolepiota procera',
    nombres_comunes: ['Parasol', 'Galamperna', 'Apagador', 'Cogomella'],
    familia: 'Agaricaceae',
    comestibilidad: 'bueno',
    imagen_url: null,
    descripcion: 'Sombrero grande (hasta 40cm) con escamas pardas sobre fondo blanquecino. Anillo doble móvil característico en el pie. Excelente comestible cuando está bien desarrollada. Solo se consume el sombrero, el pie es muy fibroso. Crece en prados, claros de bosque y bordes de camino.',
    temp_optima_min: 14.0,
    temp_optima_max: 22.0,
    humedad_min: 65.0,
    humedad_optima: 75.0,
    precip_14dias_min: 25.0,
    precip_14dias_max: 70.0,
    ph_suelo_min: 5.5,
    ph_suelo_max: 7.0,
    temp_suelo_optima_min: 14.0,
    temp_suelo_optima_max: 20.0,
    tipos_bosque: ['pinar', 'robledal', 'mixto', 'prados'],
    altitud_min: 200,
    altitud_max: 1600,
    meses_fructificacion: [8, 9, 10, 11],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 7
  },
  {
    id: 'esp-008',
    nombre_cientifico: 'Tricholoma terreum',
    nombres_comunes: ['Negrilla', 'Ratón', 'Fredolic'],
    familia: 'Tricholomataceae',
    comestibilidad: 'bueno',
    imagen_url: null,
    descripcion: 'Sombrero gris oscuro con fibras radiales. Láminas blancas o grisáceas. Crece en grupos bajo pinos. Buena seta comestible muy común en pinares de montaña durante el otoño e invierno. Se confunde fácilmente con otras Tricholomas grises.',
    temp_optima_min: 8.0,
    temp_optima_max: 15.0,
    humedad_min: 65.0,
    humedad_optima: 75.0,
    precip_14dias_min: 20.0,
    precip_14dias_max: 60.0,
    ph_suelo_min: 5.0,
    ph_suelo_max: 6.5,
    temp_suelo_optima_min: 8.0,
    temp_suelo_optima_max: 14.0,
    tipos_bosque: ['pinar'],
    altitud_min: 400,
    altitud_max: 1800,
    meses_fructificacion: [10, 11, 12, 1],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 10
  },
  {
    id: 'esp-009',
    nombre_cientifico: 'Pleurotus ostreatus',
    nombres_comunes: ['Seta de ostra', 'Orellana', 'Gírgola'],
    familia: 'Pleurotaceae',
    comestibilidad: 'bueno',
    imagen_url: null,
    descripcion: 'Crece en grupos sobre madera muerta de planifolios. Sombrero en forma de concha u ostra, gris azulado a marrón. Láminas blancas decurrentes. Excelente comestible, cultivada comercialmente. Se encuentra en troncos, tocones y ramas muertas durante todo el año en climas templados.',
    temp_optima_min: 8.0,
    temp_optima_max: 18.0,
    humedad_min: 70.0,
    humedad_optima: 85.0,
    precip_14dias_min: 30.0,
    precip_14dias_max: 90.0,
    ph_suelo_min: 5.0,
    ph_suelo_max: 7.0,
    temp_suelo_optima_min: 10.0,
    temp_suelo_optima_max: 16.0,
    tipos_bosque: ['robledal', 'hayedo', 'mixto', 'chopera'],
    altitud_min: 0,
    altitud_max: 1400,
    meses_fructificacion: [1, 2, 3, 10, 11, 12],
    requiere_helada: false,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 12
  },
  {
    id: 'esp-010',
    nombre_cientifico: 'Hygrophorus latitabundus',
    nombres_comunes: ['Babosa blanca', 'Higròfor blanquinós'],
    familia: 'Hygrophoraceae',
    comestibilidad: 'comestible',
    imagen_url: null,
    descripcion: 'Sombrero viscoso blanquecino con tintes ocráceos. Láminas espaciadas y decurrentes. Crece en pinares durante el otoño e invierno. Comestible de interés medio. La viscosidad desaparece con la cocción. Común después de las primeras heladas.',
    temp_optima_min: 6.0,
    temp_optima_max: 14.0,
    humedad_min: 70.0,
    humedad_optima: 80.0,
    precip_14dias_min: 25.0,
    precip_14dias_max: 70.0,
    ph_suelo_min: 4.5,
    ph_suelo_max: 6.0,
    temp_suelo_optima_min: 6.0,
    temp_suelo_optima_max: 12.0,
    tipos_bosque: ['pinar'],
    altitud_min: 600,
    altitud_max: 1800,
    meses_fructificacion: [10, 11, 12, 1],
    requiere_helada: true,
    requiere_choque_termico: false,
    dias_hasta_fructificacion: 8
  }
];

export const mockMejoresOportunidades = [
  {
    zona_id: 'zona-001',
    zona_nombre: 'Pinar de Urbión',
    provincia: 'Soria',
    latitud: 41.9847,
    longitud: -2.8547,
    especie_id: 'esp-001',
    nombre_cientifico: 'Boletus edulis',
    nombres_comunes: ['Boleto', 'Hongo calabaza'],
    comestibilidad: 'excelente',
    score_total: 92.5,
    probabilidad: 'excelente',
    dias_estimados_fructificacion: 5
  },
  {
    zona_id: 'zona-002',
    zona_nombre: 'Hayedo del Ripollès',
    provincia: 'Girona',
    latitud: 42.2547,
    longitud: 2.1234,
    especie_id: 'esp-003',
    nombre_cientifico: 'Cantharellus cibarius',
    nombres_comunes: ['Rebozuelo', 'Chantarela'],
    comestibilidad: 'excelente',
    score_total: 88.3,
    probabilidad: 'excelente',
    dias_estimados_fructificacion: 7
  },
  {
    zona_id: 'zona-004',
    zona_nombre: 'Pinar de Lleida',
    provincia: 'Lleida',
    latitud: 42.3568,
    longitud: 1.4626,
    especie_id: 'esp-002',
    nombre_cientifico: 'Lactarius deliciosus',
    nombres_comunes: ['Níscalo', 'Rovellón'],
    comestibilidad: 'excelente',
    score_total: 85.7,
    probabilidad: 'muy_alta',
    dias_estimados_fructificacion: 4
  },
  {
    zona_id: 'zona-003',
    zona_nombre: 'Robledal del Montseny',
    provincia: 'Barcelona',
    latitud: 41.7684,
    longitud: 2.4153,
    especie_id: 'esp-004',
    nombre_cientifico: 'Amanita caesarea',
    nombres_comunes: ['Oronja'],
    comestibilidad: 'excelente',
    score_total: 82.1,
    probabilidad: 'muy_alta',
    dias_estimados_fructificacion: 8
  },
  {
    zona_id: 'zona-005',
    zona_nombre: 'Hayedo de la Garrotxa',
    provincia: 'Girona',
    latitud: 42.1547,
    longitud: 2.5234,
    especie_id: 'esp-001',
    nombre_cientifico: 'Boletus edulis',
    nombres_comunes: ['Boleto'],
    comestibilidad: 'excelente',
    score_total: 79.4,
    probabilidad: 'muy_alta',
    dias_estimados_fructificacion: 6
  },
  {
    zona_id: 'zona-006',
    zona_nombre: 'Bosque Mixto del Berguedà',
    provincia: 'Barcelona',
    latitud: 42.1234,
    longitud: 1.8765,
    especie_id: 'esp-007',
    nombre_cientifico: 'Macrolepiota procera',
    nombres_comunes: ['Parasol'],
    comestibilidad: 'bueno',
    score_total: 76.8,
    probabilidad: 'alta',
    dias_estimados_fructificacion: null
  },
  {
    zona_id: 'zona-008',
    zona_nombre: 'Pinar de Solsonès',
    provincia: 'Lleida',
    latitud: 41.9934,
    longitud: 1.5187,
    especie_id: 'esp-008',
    nombre_cientifico: 'Tricholoma terreum',
    nombres_comunes: ['Negrilla'],
    comestibilidad: 'bueno',
    score_total: 74.2,
    probabilidad: 'alta',
    dias_estimados_fructificacion: 10
  },
  {
    zona_id: 'zona-010',
    zona_nombre: 'Hayedo del Cadi',
    provincia: 'Girona',
    latitud: 42.3112,
    longitud: 1.8765,
    especie_id: 'esp-003',
    nombre_cientifico: 'Cantharellus cibarius',
    nombres_comunes: ['Rebozuelo'],
    comestibilidad: 'excelente',
    score_total: 72.5,
    probabilidad: 'alta',
    dias_estimados_fructificacion: 12
  },
  {
    zona_id: 'zona-001',
    zona_nombre: 'Pinar de Urbión',
    provincia: 'Soria',
    latitud: 41.9847,
    longitud: -2.8547,
    especie_id: 'esp-002',
    nombre_cientifico: 'Lactarius deliciosus',
    nombres_comunes: ['Níscalo'],
    comestibilidad: 'excelente',
    score_total: 71.3,
    probabilidad: 'alta',
    dias_estimados_fructificacion: 5
  },
  {
    zona_id: 'zona-009',
    zona_nombre: 'Robledal de Els Ports',
    provincia: 'Tarragona',
    latitud: 40.7845,
    longitud: 0.2341,
    especie_id: 'esp-009',
    nombre_cientifico: 'Pleurotus ostreatus',
    nombres_comunes: ['Seta de ostra'],
    comestibilidad: 'bueno',
    score_total: 68.9,
    probabilidad: 'moderada',
    dias_estimados_fructificacion: null
  }
];

export const mockClimaZonas = {
  'zona-001': {
    fecha: '2026-02-16',
    temp_min: 8.5,
    temp_max: 16.3,
    temp_media: 12.4,
    temp_suelo_estimada: 11.8,
    precipitacion_total: 5.2,
    precip_ultimos_7_dias: 28.5,
    precip_ultimos_14_dias: 52.3,
    humedad_media: 78.0,
    dias_desde_ultima_lluvia: 1
  },
  'zona-002': {
    fecha: '2026-02-16',
    temp_min: 10.2,
    temp_max: 18.7,
    temp_media: 14.5,
    temp_suelo_estimada: 13.9,
    precipitacion_total: 12.8,
    precip_ultimos_7_dias: 45.2,
    precip_ultimos_14_dias: 68.7,
    humedad_media: 82.5,
    dias_desde_ultima_lluvia: 0
  },
  'zona-003': {
    fecha: '2026-02-16',
    temp_min: 11.5,
    temp_max: 19.8,
    temp_media: 15.7,
    temp_suelo_estimada: 15.1,
    precipitacion_total: 3.5,
    precip_ultimos_7_dias: 22.8,
    precip_ultimos_14_dias: 41.2,
    humedad_media: 72.0,
    dias_desde_ultima_lluvia: 2
  },
  'zona-004': {
    fecha: '2026-02-16',
    temp_min: 7.8,
    temp_max: 15.2,
    temp_media: 11.5,
    temp_suelo_estimada: 11.0,
    precipitacion_total: 8.3,
    precip_ultimos_7_dias: 35.7,
    precip_ultimos_14_dias: 58.9,
    humedad_media: 75.5,
    dias_desde_ultima_lluvia: 0
  },
  'zona-005': {
    fecha: '2026-02-16',
    temp_min: 9.3,
    temp_max: 17.5,
    temp_media: 13.4,
    temp_suelo_estimada: 12.8,
    precipitacion_total: 6.7,
    precip_ultimos_7_dias: 31.2,
    precip_ultimos_14_dias: 55.8,
    humedad_media: 80.0,
    dias_desde_ultima_lluvia: 1
  }
};

export const mockScoresZonas = {
  'zona-001': [
    {
      zona_id: 'zona-001',
      zona_nombre: 'Pinar de Urbión',
      especie_id: 'esp-001',
      especie_nombre: 'Boletus edulis',
      fecha: '2026-02-16',
      score_total: 92.5,
      score_temperatura: 95.0,
      score_precipitacion: 88.0,
      score_humedad: 92.0,
      score_suelo: 97.0,
      score_fenologia: 85.0,
      probabilidad: 'excelente',
      dias_estimados_fructificacion: 5,
      factores_positivos: [
        'Temperatura óptima (12.4°C)',
        'Precipitación ideal (52.3mm)',
        'Humedad excelente (78%)',
        'Choque térmico detectado (7.8°C)',
        'pH del suelo óptimo (5.8)'
      ],
      factores_negativos: []
    },
    {
      zona_id: 'zona-001',
      zona_nombre: 'Pinar de Urbión',
      especie_id: 'esp-002',
      especie_nombre: 'Lactarius deliciosus',
      fecha: '2026-02-16',
      score_total: 71.3,
      score_temperatura: 78.0,
      score_precipitacion: 72.0,
      score_humedad: 70.0,
      score_suelo: 65.0,
      score_fenologia: 70.0,
      probabilidad: 'alta',
      dias_estimados_fructificacion: 5,
      factores_positivos: [
        'Tipo de bosque ideal (pinar)',
        'Precipitación adecuada'
      ],
      factores_negativos: [
        'Temperatura algo alta para óptimo',
        'Humedad en el límite bajo'
      ]
    },
    {
      zona_id: 'zona-001',
      zona_nombre: 'Pinar de Urbión',
      especie_id: 'esp-008',
      especie_nombre: 'Tricholoma terreum',
      fecha: '2026-02-16',
      score_total: 65.8,
      score_temperatura: 62.0,
      score_precipitacion: 68.0,
      score_humedad: 75.0,
      score_suelo: 60.0,
      score_fenologia: 65.0,
      probabilidad: 'moderada',
      dias_estimados_fructificacion: null,
      factores_positivos: [
        'Humedad favorable'
      ],
      factores_negativos: [
        'Temperatura superior a óptimo',
        'Fuera de temporada pico'
      ]
    }
  ],
  'zona-002': [
    {
      zona_id: 'zona-002',
      zona_nombre: 'Hayedo del Ripollès',
      especie_id: 'esp-003',
      especie_nombre: 'Cantharellus cibarius',
      fecha: '2026-02-16',
      score_total: 88.3,
      score_temperatura: 92.0,
      score_precipitacion: 95.0,
      score_humedad: 88.0,
      score_suelo: 82.0,
      score_fenologia: 75.0,
      probabilidad: 'excelente',
      dias_estimados_fructificacion: 7,
      factores_positivos: [
        'Temperatura ideal (14.5°C)',
        'Precipitación abundante (68.7mm)',
        'Humedad alta (82.5%)',
        'Tipo de bosque perfecto (hayedo)',
        'pH del suelo óptimo (5.2)'
      ],
      factores_negativos: [
        'Aún temprano en la temporada'
      ]
    },
    {
      zona_id: 'zona-002',
      zona_nombre: 'Hayedo del Ripollès',
      especie_id: 'esp-001',
      especie_nombre: 'Boletus edulis',
      fecha: '2026-02-16',
      score_total: 79.4,
      score_temperatura: 85.0,
      score_precipitacion: 82.0,
      score_humedad: 85.0,
      score_suelo: 75.0,
      score_fenologia: 65.0,
      probabilidad: 'muy_alta',
      dias_estimados_fructificacion: 6,
      factores_positivos: [
        'Condiciones climáticas favorables',
        'Humedad excelente'
      ],
      factores_negativos: [
        'pH algo bajo para óptimo',
        'Temporada inicial'
      ]
    }
  ],
  'zona-003': [
    {
      zona_id: 'zona-003',
      zona_nombre: 'Robledal del Montseny',
      especie_id: 'esp-004',
      especie_nombre: 'Amanita caesarea',
      fecha: '2026-02-16',
      score_total: 82.1,
      score_temperatura: 88.0,
      score_precipitacion: 75.0,
      score_humedad: 78.0,
      score_suelo: 92.0,
      score_fenologia: 70.0,
      probabilidad: 'muy_alta',
      dias_estimados_fructificacion: 8,
      factores_positivos: [
        'Temperatura favorable (15.7°C)',
        'Suelo y hábitat ideal',
        'pH del suelo óptimo (6.1)'
      ],
      factores_negativos: [
        'Precipitación algo baja',
        'Temporada temprana'
      ]
    }
  ]
};

export const mockHallazgos = [
  {
    id: 'hall-001',
    usuario_id: 'user-001',
    zona_id: 'zona-001',
    especie_id: 'esp-001',
    fecha: '2026-02-15T10:30:00',
    latitud: 41.9850,
    longitud: -2.8550,
    abundancia: 'abundante',
    estado: 'maduro',
    calidad: 'excelente',
    notas: 'Encontrados bajo pinos cerca del arroyo',
    fecha_creacion: '2026-02-15T11:00:00'
  },
  {
    id: 'hall-002',
    usuario_id: 'user-002',
    zona_id: 'zona-002',
    especie_id: 'esp-003',
    fecha: '2026-02-14T09:15:00',
    latitud: 42.2550,
    longitud: 2.1240,
    abundancia: 'moderada',
    estado: 'joven',
    calidad: 'buena',
    notas: 'Grupo disperso en zona húmeda del hayedo',
    fecha_creacion: '2026-02-14T10:30:00'
  },
  {
    id: 'hall-003',
    usuario_id: 'user-003',
    zona_id: 'zona-004',
    especie_id: 'esp-002',
    fecha: '2026-02-13T16:45:00',
    latitud: 42.3570,
    longitud: 1.4630,
    abundancia: 'muy_abundante',
    estado: 'maduro',
    calidad: 'excelente',
    notas: 'Cosecha excepcional después de las lluvias',
    fecha_creacion: '2026-02-13T17:15:00'
  }
];

export const mockEstadisticas = {
  zonas_activas: 10,
  especies_catalogadas: 10,
  oportunidades_excelentes: 4,
  precision_ia: 89,
  hallazgos_ultimo_mes: 47,
  usuarios_activos: 156
};

// Funciones helper para simular delays de red
export const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockAPIService = {
  // Zonas
  async getZonas(params = {}) {
    await delay(400);
    let zonas = [...mockZonas];
    
    if (params.provincia) {
      zonas = zonas.filter(z => z.provincia === params.provincia);
    }
    
    if (params.tipo_bosque) {
      zonas = zonas.filter(z => z.tipo_bosque === params.tipo_bosque);
    }
    
    if (params.limit) {
      zonas = zonas.slice(0, params.limit);
    }
    
    return zonas;
  },

  async getZona(zonaId) {
    await delay(300);
    return mockZonas.find(z => z.id === zonaId) || null;
  },

  async getClimaZona(zonaId, fecha = null) {
    await delay(350);
    return mockClimaZonas[zonaId] || {
      fecha: fecha || '2026-02-16',
      temp_min: 10.0,
      temp_max: 18.0,
      temp_media: 14.0,
      temp_suelo_estimada: 13.5,
      precipitacion_total: 5.0,
      precip_ultimos_7_dias: 30.0,
      precip_ultimos_14_dias: 50.0,
      humedad_media: 75.0,
      dias_desde_ultima_lluvia: 1
    };
  },

  async getScoresZona(zonaId, params = {}) {
    await delay(400);
    let scores = mockScoresZonas[zonaId] || [];
    
    if (params.min_score) {
      scores = scores.filter(s => s.score_total >= params.min_score);
    }
    
    return scores;
  },

  // Especies
  async getEspecies(params = {}) {
    await delay(350);
    let especies = [...mockEspecies];
    
    if (params.comestibilidad) {
      especies = especies.filter(e => e.comestibilidad === params.comestibilidad);
    }
    
    if (params.limit) {
      especies = especies.slice(0, params.limit);
    }
    
    return especies;
  },

  async getEspecie(especieId) {
    await delay(300);
    return mockEspecies.find(e => e.id === especieId) || null;
  },

  async getMejoresZonasEspecie(especieId, params = {}) {
    await delay(400);
    // Simular búsqueda de mejores zonas para una especie
    return mockMejoresOportunidades
      .filter(o => o.especie_id === especieId)
      .filter(o => !params.provincia || o.provincia === params.provincia)
      .slice(0, params.limit || 10);
  },

  // Búsqueda
  async buscar(params = {}) {
    await delay(450);
    let resultados = [...mockMejoresOportunidades];
    
    if (params.provincia) {
      resultados = resultados.filter(r => r.provincia === params.provincia);
    }
    
    if (params.min_score) {
      resultados = resultados.filter(r => r.score_total >= params.min_score);
    }
    
    if (params.limit) {
      resultados = resultados.slice(0, params.limit);
    }
    
    return resultados;
  },

  // Hallazgos
  async getHallazgos(params = {}) {
    await delay(350);
    let hallazgos = [...mockHallazgos];
    
    if (params.zona_id) {
      hallazgos = hallazgos.filter(h => h.zona_id === params.zona_id);
    }
    
    if (params.especie_id) {
      hallazgos = hallazgos.filter(h => h.especie_id === params.especie_id);
    }
    
    if (params.limit) {
      hallazgos = hallazgos.slice(0, params.limit);
    }
    
    return hallazgos;
  },

  async crearHallazgo(hallazgo) {
    await delay(500);
    const nuevoHallazgo = {
      id: `hall-${Date.now()}`,
      ...hallazgo,
      fecha_creacion: new Date().toISOString()
    };
    mockHallazgos.push(nuevoHallazgo);
    return nuevoHallazgo;
  },

  // Estadísticas
  async getEstadisticas() {
    await delay(300);
    return mockEstadisticas;
  },

  async getEstadisticasZona(zonaId) {
    await delay(400);
    const clima = mockClimaZonas[zonaId] || {};
    const scores = mockScoresZonas[zonaId] || [];
    
    return {
      zona_id: zonaId,
      clima_ultimo_mes: {
        temp_media_mes: clima.temp_media || 14.0,
        precip_total_mes: 85.5,
        humedad_media_mes: clima.humedad_media || 75.0,
        dias_lluvia_mes: 12
      },
      especies_mas_probables: scores.slice(0, 5),
      hallazgos_ultimo_mes: mockHallazgos.filter(h => h.zona_id === zonaId).length
    };
  },

  // Health check
  async health() {
    await delay(100);
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0-mock'
    };
  }
};

export default mockAPIService;
