// Zone detail — modal screen (web-parity layout)
// Opened from the Zonas list or from the Map tab.
//
// Layout mirrors the web ZoneModal:
//   1. Hero image (forest-type photo) with gradient overlay + zone name/badges
//   2. Description (border-left blockquote)
//   3. "CONDICIÓN DE RECOLECCIÓN" section
//      a. Score+bar in its own glass card
//      b. 6-cell meteo grid OUTSIDE that card (each cell has its own glass bg)
//      c. Updated label
//   4. Species placeholder (feat/v8-2-species)
//
// Species sections (disponibles / calendario) come in feat/v8-2-species.

import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'
import { Colors, getScoreColor } from '../../constants/Colors'
import { Font, useStyles } from '../../lib/theme'
import { ScoreBar } from '../../components/ui/ScoreBar'
import { fetchZoneWeather } from '../../services/api'
import { useZones, Zone, ZoneConditions, normaliseConditions } from '../../hooks/useZones'
import { useAppStore } from '../../store/useAppStore'
import { StarIcon, CloseIcon } from '../../components/icons/HeroIcons'

// ── Forest hero images ────────────────────────────────────────────────────────
// Same photos as web ZoneModal (WebP served from public/, PNG bundled for mobile)
// We bundle them directly so they work offline and in EAS builds.

const FOREST_HERO: Record<string, any> = {
  pinar:    require('../../assets/images/zones/pinar.webp'),
  hayedo:   require('../../assets/images/zones/hayedo.webp'),
  robledal: require('../../assets/images/zones/robledal.webp'),
  encinar:  require('../../assets/images/zones/encinar.webp'),
}

// Fallback if image is missing — use the forest-type icon PNG (small but branded)
const FOREST_TYPE_ICON: Record<string, any> = {
  pinar:    require('../../assets/images/icons/forest-type-pinar.png'),
  hayedo:   require('../../assets/images/icons/forest-type-hayedo.png'),
  robledal: require('../../assets/images/icons/forest-type-robledal.png'),
  encinar:  require('../../assets/images/icons/forest-type-encinar.png'),
}

// ── Meteo grid icons ──────────────────────────────────────────────────────────
// PNG icons from public/assets/images/icons/ — copied to mobile/assets/images/icons/
// These match exactly what the web uses.

const METEO_GRID = [
  {
    key: 'temp',
    icon: require('../../assets/images/icons/temperature.png'),
    label: 'Temperatura',
  },
  {
    key: 'soilTemp',
    icon: require('../../assets/images/icons/soil-moisture.png'),
    label: 'T. Suelo',
  },
  {
    key: 'rainfall',
    icon: require('../../assets/images/icons/accumulated-precipitation.png'),
    label: 'Precipit. 14d',
  },
  {
    key: 'humidity',
    icon: require('../../assets/images/icons/humidity.png'),
    label: 'Humedad',
  },
  {
    key: 'wind',
    icon: require('../../assets/images/icons/wind.png'),
    label: 'Viento',
  },
  {
    key: 'dryDays',
    icon: require('../../assets/images/icons/sunny.png'),
    label: 'Sin lluvia',
  },
]

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreLabel(score: number): string {
  if (score >= 85) return 'Excelente'
  if (score >= 70) return 'Buena'
  if (score >= 55) return 'Moderada'
  return 'Baja'
}

function formatConditionValue(key: string, c: ZoneConditions): string {
  switch (key) {
    case 'temp':
      return c.tempMin != null && c.tempMax != null
        ? `${c.tempMin}–${c.tempMax}°C` : '–'
    case 'soilTemp':  return c.soilTemp    != null ? `${c.soilTemp}°C`    : '–'
    case 'rainfall':  return c.rainfall14d != null ? `${c.rainfall14d}mm` : '–'
    case 'humidity':  return c.humidity    != null ? `${c.humidity}%`     : '–'
    case 'wind':      return c.wind        != null ? `${c.wind}km/h`      : '–'
    case 'dryDays':   return c.dryDays     != null ? `${c.dryDays}d`      : '–'
    default: return '–'
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ZonaDetailScreen() {
  const { colors, typo, glass } = useStyles()
  const insets = useSafeAreaInsets()

  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, followedZoneIds, toggleFollow } = useAppStore(useShallow((s) => ({
    t: s.t,
    followedZoneIds: s.followedZones,
    toggleFollow: s.toggleFollow,
  })))

  const { zones, conditionsMap } = useZones()
  const zone: Zone | undefined = zones.find((z) => z.id === id)

  const [conditions, setConditions] = useState<ZoneConditions | null>(
    id ? (conditionsMap[id] ?? null) : null,
  )
  const [loadingConditions, setLoadingConditions] = useState(false)
  const [condError, setCondError] = useState(false)

  const isFollowed = zone ? followedZoneIds.includes(zone.id) : false

  useEffect(() => {
    if (!id) return
    setLoadingConditions(true)
    fetchZoneWeather(id)
      .then((data) => {
        const fresh = normaliseConditions(data)
        const cachedScore = conditionsMap[id]?.overallScore ?? 0
        setConditions({ ...fresh, overallScore: fresh.overallScore || cachedScore })
      })
      .catch(() => setCondError(true))
      .finally(() => setLoadingConditions(false))
  }, [id])

  const score = conditions?.overallScore ?? 0
  const scoreColor = getScoreColor(score)

  const updatedLabel = conditions?._collectedAt
    ? `Actualizado el ${new Date(conditions._collectedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} a las ${new Date(conditions._collectedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    : 'Open-Meteo'

  if (!zone) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  const textDim    = colors.textPrimary + '99'  // ~60%
  const textSubtle = colors.textPrimary + 'CC'  // ~80%

  const heroSource = FOREST_HERO[zone.forestType] ?? FOREST_HERO.pinar

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 48 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero image ────────────────────────────────────────── */}
        <View style={styles.heroImageWrap}>
          <Image
            source={heroSource}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient overlay: top transparent → strong dark at bottom for title legibility */}
          {/* Uses fixed dark rgba so it works in both light and dark themes */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)']}
            locations={[0.2, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top-right buttons — follow + back */}
          <View style={[styles.heroButtons, { top: insets.top + 12 }]}>
            <TouchableOpacity
              style={[styles.heroBtn, isFollowed && styles.heroBtnActive]}
              onPress={() => zone && toggleFollow(zone.id)}
            >
              <StarIcon
                size={20}
                filled={isFollowed}
                color={isFollowed ? '#facc15' : 'rgba(255,255,255,0.80)'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <CloseIcon size={20} color="rgba(255,255,255,0.80)" />
            </TouchableOpacity>
          </View>

          {/* Bottom-left: zone name + badges */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{zone.name}</Text>
            <View style={styles.heroMeta}>
              <View style={[styles.heroBadge, { backgroundColor: colors.accentPositiveSubtle }]}>
                <Text style={[styles.heroBadgeText, { color: colors.accentPositive }]}>
                  {zone.province}
                </Text>
              </View>
              {zone.region ? (
                <Text style={[styles.heroMetaText, { color: textSubtle }]}>{zone.region}</Text>
              ) : null}
              <View style={styles.heroMetaItem}>
                <Image
                  source={FOREST_TYPE_ICON[zone.forestType]}
                  style={styles.heroMetaIcon}
                />
                <Text style={[styles.heroMetaText, { color: textSubtle }]}>{zone.forestType}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Image
                  source={require('../../assets/images/icons/mountain.png')}
                  style={styles.heroMetaIcon}
                />
                <Text style={[styles.heroMetaText, { color: textSubtle }]}>{zone.elevation}m</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Content ───────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Description */}
          {zone.description ? (
            <View style={[styles.descriptionBlock, { borderLeftColor: colors.borderWarm }]}>
              <Text style={[typo.body, { color: textSubtle, fontSize: 14, lineHeight: 22 }]}>
                {zone.description}
              </Text>
            </View>
          ) : null}

          {/* ── CONDICIÓN DE RECOLECCIÓN ─────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t.thermometer ?? 'Condición de recolección'}
            </Text>
            <Text style={[styles.sectionHint, { color: textDim }]}>
              {t.meteoDesc ?? 'El índice pondera datos meteorológicos en tiempo real junto al factor estacional del mes actual para calcular las condiciones de recolección.'}
            </Text>

            {/* Score card — own glass box, same as web's surface-subtle.rounded-xl.p-4 */}
            {loadingConditions ? (
              <View style={[glass.subtle, styles.scoreCard]}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : (
              <View style={[glass.subtle, styles.scoreCard]}>
                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreStatus, { color: scoreColor }]}>
                    {scoreLabel(score)}
                  </Text>
                  <Text style={[styles.scoreNumber, { color: colors.textPrimary }]}>
                    {score}
                    <Text style={[styles.scoreMax, { color: textDim }]}>/100</Text>
                  </Text>
                </View>
                <ScoreBar score={score} height={8} />
              </View>
            )}

            {/* Meteo grid — 3×2, OUTSIDE the score card (matches web layout) */}
            <View style={styles.meteoGrid}>
              {METEO_GRID.map((item) => (
                <View key={item.key} style={[glass.subtle, styles.meteoCell]}>
                  <Image source={item.icon} style={styles.meteoCellIcon} />
                  <Text style={[styles.meteoCellLabel, { color: colors.textSecondary }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.meteoCellValue, { color: colors.textPrimary }]}>
                    {conditions ? formatConditionValue(item.key, conditions) : '–'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Updated label */}
            {!loadingConditions && (
              condError ? (
                <Text style={[styles.updatedLabel, { color: Colors.warning }]}>
                  ⚠️ Datos no disponibles
                </Text>
              ) : (
                <Text style={[styles.updatedLabel, { color: textDim }]}>{updatedLabel}</Text>
              )
            )}
          </View>

          {/* ── Species placeholder ───────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t.availableNow ?? 'Disponibles ahora'}
            </Text>
            <View style={[glass.subtle, styles.comingSoon]}>
              <Text style={typo.bodySmall}>
                🍄 Lista de especies disponible en feat/v8-2-species
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const HERO_HEIGHT = 280

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroImageWrap: {
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroButtons: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  heroBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnActive: {
    backgroundColor: 'rgba(250,204,21,0.30)',
  },
  heroBtnTextActive: {
    color: '#facc15',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 60,
  },
  heroName: {
    fontFamily: Font.display,
    fontSize: 28,
    lineHeight: 34,
    color: '#f4ebe1',  // always cream — on dark gradient bg in both themes
    letterSpacing: 0.2,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  heroBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  heroBadgeText: {
    fontFamily: Font.sansMedium,
    fontSize: 11,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaIcon: {
    width: 14,
    height: 14,
  },
  heroMetaText: {
    fontFamily: Font.sans,
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: { paddingHorizontal: 16, paddingTop: 20 },

  // Description
  descriptionBlock: {
    borderLeftWidth: 2,
    paddingLeft: 14,
    marginBottom: 24,
  },

  // Sections
  section: { marginBottom: 28 },
  sectionLabel: {
    fontFamily: Font.sansMedium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionHint: {
    fontFamily: Font.sansLight,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  // Score card (glass box — score + bar only)
  scoreCard: {
    padding: 16,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreStatus: {
    fontFamily: Font.sansSemiBold,
    fontSize: 14,
  },
  scoreNumber: {
    fontFamily: Font.display,
    fontSize: 26,
  },
  scoreMax: {
    fontFamily: Font.sans,
    fontSize: 11,
  },

  // Meteo grid (outside the score card)
  meteoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  meteoCell: {
    // ~30% width with gap — mimics web's grid-cols-3
    width: '30%',
    flexGrow: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  meteoCellIcon: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  meteoCellLabel: {
    fontFamily: Font.sansLight,
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  meteoCellValue: {
    fontFamily: Font.sansSemiBold,
    fontSize: 13,
    textAlign: 'center',
  },

  // Updated label
  updatedLabel: {
    fontFamily: Font.sansLight,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },

  // Species placeholder
  comingSoon: { padding: 16 },
})
