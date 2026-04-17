// i18n — UI translations for ES / CA / EN
// Ported from web i18n system. Keep in sync manually.
// Keys added here must also be added to all three language objects.

import { Lang } from './constants'

export interface Translations {
  // Navigation
  dashboard: string
  zones: string
  species: string
  map: string
  profile: string

  // Score labels
  excellent: string
  veryGood: string
  good: string
  poor: string

  // Dashboard
  topZones: string
  conditionsToday: string
  noData: string
  loading: string

  // Zone
  conditions: string
  temperature: string
  humidity: string
  rainfall: string
  wind: string
  soilTemp: string
  updatedAt: string
  inSeasonSpecies: string

  // Species
  allSpecies: string
  filterByFamily: string
  filterByEdibility: string
  searchSpecies: string

  // Edibility labels
  excelente: string
  bueno: string
  comestible: string
  precaucion: string
  toxico: string
  mortal: string

  // Safety
  safetyWarning: string
  lethalWarning: string

  // Auth
  login: string
  register: string
  email: string
  password: string
  logout: string
  loginWithGoogle: string
  noAccount: string
  alreadyAccount: string
  loginError: string

  // Profile
  language: string
  followedZones: string
  favoriteSpecies: string
  notLoggedIn: string
  loginToSync: string
}

const es: Translations = {
  dashboard: 'Inicio',
  zones: 'Zonas',
  species: 'Especies',
  map: 'Mapa',
  profile: 'Perfil',

  excellent: 'Excelente',
  veryGood: 'Muy bueno',
  good: 'Bueno',
  poor: 'Bajo',

  topZones: 'Mejores zonas hoy',
  conditionsToday: 'Condiciones hoy',
  noData: 'Sin datos',
  loading: 'Cargando...',

  conditions: 'Condiciones',
  temperature: 'Temperatura',
  humidity: 'Humedad',
  rainfall: 'Lluvia 14 días',
  wind: 'Viento',
  soilTemp: 'Suelo',
  updatedAt: 'Actualizado',
  inSeasonSpecies: 'Especies de temporada',

  allSpecies: 'Todas las especies',
  filterByFamily: 'Familia',
  filterByEdibility: 'Comestibilidad',
  searchSpecies: 'Buscar especie...',

  excelente: 'Excelente',
  bueno: 'Bueno',
  comestible: 'Comestible',
  precaucion: 'Precaución',
  toxico: 'Tóxico',
  mortal: 'Mortal',

  safetyWarning: 'Requiere preparación especial o puede causar reacciones. Consulta a un experto antes de consumir.',
  lethalWarning: '⚠️ ESPECIE MORTAL. No consumir bajo ninguna circunstancia.',

  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  email: 'Correo electrónico',
  password: 'Contraseña',
  logout: 'Cerrar sesión',
  loginWithGoogle: 'Continuar con Google',
  noAccount: '¿No tienes cuenta? Regístrate',
  alreadyAccount: '¿Ya tienes cuenta? Inicia sesión',
  loginError: 'Correo o contraseña incorrectos',

  language: 'Idioma',
  followedZones: 'Zonas seguidas',
  favoriteSpecies: 'Especies favoritas',
  notLoggedIn: 'No has iniciado sesión',
  loginToSync: 'Inicia sesión para sincronizar tus favoritos',
}

const ca: Translations = {
  dashboard: 'Inici',
  zones: 'Zones',
  species: 'Espècies',
  map: 'Mapa',
  profile: 'Perfil',

  excellent: 'Excel·lent',
  veryGood: 'Molt bo',
  good: 'Bo',
  poor: 'Baix',

  topZones: 'Millors zones avui',
  conditionsToday: 'Condicions avui',
  noData: 'Sense dades',
  loading: 'Carregant...',

  conditions: 'Condicions',
  temperature: 'Temperatura',
  humidity: 'Humitat',
  rainfall: 'Pluja 14 dies',
  wind: 'Vent',
  soilTemp: 'Sòl',
  updatedAt: 'Actualitzat',
  inSeasonSpecies: 'Espècies de temporada',

  allSpecies: 'Totes les espècies',
  filterByFamily: 'Família',
  filterByEdibility: 'Comestibilitat',
  searchSpecies: 'Cercar espècie...',

  excelente: 'Excel·lent',
  bueno: 'Bo',
  comestible: 'Comestible',
  precaucion: 'Precaució',
  toxico: 'Tòxic',
  mortal: 'Mortal',

  safetyWarning: 'Requereix preparació especial o pot causar reaccions. Consulta un expert abans de consumir.',
  lethalWarning: '⚠️ ESPÈCIE MORTAL. No consumir en cap circumstància.',

  login: 'Inicia sessió',
  register: 'Crea un compte',
  email: 'Correu electrònic',
  password: 'Contrasenya',
  logout: 'Tanca sessió',
  loginWithGoogle: 'Continua amb Google',
  noAccount: 'No tens compte? Registra\'t',
  alreadyAccount: 'Ja tens compte? Inicia sessió',
  loginError: 'Correu o contrasenya incorrectes',

  language: 'Idioma',
  followedZones: 'Zones seguides',
  favoriteSpecies: 'Espècies favorites',
  notLoggedIn: 'No has iniciat sessió',
  loginToSync: 'Inicia sessió per sincronitzar els teus favorits',
}

const en: Translations = {
  dashboard: 'Home',
  zones: 'Zones',
  species: 'Species',
  map: 'Map',
  profile: 'Profile',

  excellent: 'Excellent',
  veryGood: 'Very good',
  good: 'Good',
  poor: 'Poor',

  topZones: 'Best zones today',
  conditionsToday: 'Conditions today',
  noData: 'No data',
  loading: 'Loading...',

  conditions: 'Conditions',
  temperature: 'Temperature',
  humidity: 'Humidity',
  rainfall: 'Rain 14 days',
  wind: 'Wind',
  soilTemp: 'Soil',
  updatedAt: 'Updated',
  inSeasonSpecies: 'In-season species',

  allSpecies: 'All species',
  filterByFamily: 'Family',
  filterByEdibility: 'Edibility',
  searchSpecies: 'Search species...',

  excelente: 'Excellent',
  bueno: 'Good',
  comestible: 'Edible',
  precaucion: 'Caution',
  toxico: 'Toxic',
  mortal: 'Deadly',

  safetyWarning: 'Requires special preparation or may cause reactions. Consult an expert before consuming.',
  lethalWarning: '⚠️ DEADLY SPECIES. Do not consume under any circumstances.',

  login: 'Log in',
  register: 'Create account',
  email: 'Email',
  password: 'Password',
  logout: 'Log out',
  loginWithGoogle: 'Continue with Google',
  noAccount: 'No account? Sign up',
  alreadyAccount: 'Already have an account? Log in',
  loginError: 'Incorrect email or password',

  language: 'Language',
  followedZones: 'Followed zones',
  favoriteSpecies: 'Favourite species',
  notLoggedIn: 'You are not logged in',
  loginToSync: 'Log in to sync your favourites',
}

export const translations: Record<Lang, Translations> = { es, ca, en }

export function getTranslations(lang: Lang): Translations {
  return translations[lang] ?? translations.es
}
