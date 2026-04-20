// Zone detail — modal screen
// Opened from the Zonas list or from the Map tab.
// Shows: hero info, meteorological score, conditions grid, description.
// Species sections (disponibles / calendario) come in feat/v8-0-species.

import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Colors, getScoreColor } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { ScoreBar } from '../../components/ui/ScoreBar'
import { Background } from '../../components/ui/Background'
import { fetchZoneWeather } from '../../services/api'
import { useZones, Zone, ZoneConditions, normaliseConditions } from '../../hooks/useZones'
import { useAppStore } from '../../store/useAppStore'

const SCORE_LABEL: Record<string, string> = {
  excellent: 'Excelente',
  good:      'Buena',
  moderate:  'Moderada',
  low:       'Baja',
}

function scoreLabel(score: number): string {
  if (score >= 85) return SCORE_LABEL.excellent
  if (score >= 70) return SCORE_LABEL.good
  if (score >= 55) return SCORE_LABEL.moderate
  return SCORE_LABEL.low
}

const FOREST_EMOJI: Record<string, string> = {
  pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒',
}

const METEO_GRID = [
  { key: 'temp',      emoji: '🌡',  label: 'Temperatura' },
  { key: 'soilTemp',  emoji: '🌱',  label: 'Suelo' },
  { key: 'rainfall',  emoji: '🌧',  label: 'Precipitación' },
  { key: 'humidity',  emoji: '💧',  label: 'Humedad' },
  { key: 'wind',      emoji: '💨',  label: 'Viento' },
  { key: 'dryDays',   emoji: '☀️',  label: 'Días secos' },
]

function formatConditionValue(key: string, c: ZoneConditions): string {
  switch (key) {
    case 'temp':
      return c.tempMin != null && c.tempMax != null
        ? `${c.tempMin}–${c.tempMax}°C` : '–'
    case 'soilTemp':  return c.soilTemp  != null ? `${c.soilTemp}°C`  : '–'
    case 'rainfall':  return c.rainfall14d != null ? `${c.rainfall14d}mm` : '–'
    case 'humidity':  return c.humidity  != null ? `${c.humidity}%`   : '–'
    case 'wind':      return c.wind      != null ? `${c.wind}km/h`    : '–'
    case 'dryDays':   return c.dryDays   != null ? `${c.dryDays}d`    : '–'
    default: return '–'
  }
}

export default function ZonaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, followedZoneIds, toggleFollow } = useAppStore(useShallow((s) => ({
    t: s.t,
    followedZoneIds: s.followedZones,
    toggleFollow: s.toggleFollow,
  })))

  // Get zone data from the shared hook (already loaded and cached in list screen)
  const { zones, conditionsMap } = useZones()
  const zone: Zone | undefined = zones.find((z) => z.id === id)

  // Real-time conditions for this zone (no cache — always fresh)
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
        // /weather/zones/:id has no score — preserve it from conditionsMap
        const cachedScore = conditionsMap[id]?.overallScore ?? 0
        setConditions({
          ...fresh,
          overallScore: fresh.overallScore || cachedScore,
        })
      })
      .catch(() => setCondError(true))
      .finally(() => setLoadingConditions(false))
  }, [id])

  const score = conditions?.overallScore ?? 0
  const scoreColor = getScoreColor(score)

  const updatedLabel = conditions?._collectedAt
    ? `Actualizado ${new Date(conditions._collectedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${new Date(conditions._collectedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    : 'Open-Meteo'

  if (!zone) {
    return (
      <Background>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.green} />
        </View>
      </Background>
    )
  }

  return (
    <Background>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <View style={styles.heroBlock}>
          <Text style={styles.forestBadge}>
            {FOREST_EMOJI[zone.forestType] ?? '🌲'} {zone.forestType}
          </Text>
          <Text style={Typography.h1}>{zone.name}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{zone.province}</Text>
            </View>
            {zone.region ? (
              <Text style={Typography.caption}>{zone.region}</Text>
            ) : null}
            <Text style={Typography.caption}>⛰ {zone.elevation}m</Text>
          </View>

          {/* Follow button */}
          <TouchableOpacity
            style={[Glass.subtle, styles.followRow]}
            onPress={() => zone && toggleFollow(zone.id)}
          >
            <Text style={styles.followStar}>{isFollowed ? '⭐' : '☆'}</Text>
            <Text style={[styles.followLabel, isFollowed && styles.followLabelActive]}>
              {isFollowed ? (t.following ?? 'Siguiendo') : (t.follow ?? 'Seguir zona')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Description ──────────────────────────────────────── */}
        {zone.description ? (
          <View style={styles.descriptionBlock}>
            <Text style={[Typography.body, styles.description]}>{zone.description}</Text>
          </View>
        ) : null}

        {/* ── Termómetro / Score ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.thermometer ?? 'Termómetro'}</Text>
          <Text style={[Typography.caption, styles.sectionHint]}>
            {t.meteoDesc ?? 'Índice de condiciones para la recolección basado en datos meteorológicos.'}
          </Text>

          {loadingConditions ? (
            <View style={[Glass.subtle, styles.scoreLoading]}>
              <ActivityIndicator size="small" color={Colors.green} />
            </View>
          ) : (
            <View style={[Glass.subtle, styles.scoreBlock]}>
              <View style={styles.scoreHeader}>
                <Text style={[styles.scoreStatus, { color: scoreColor }]}>
                  {scoreLabel(score)}
                </Text>
                <Text style={styles.scoreNumber}>
                  {score}
                  <Text style={styles.scoreMax}>/100</Text>
                </Text>
              </View>
              <ScoreBar score={score} height={8} />

              {/* Conditions grid */}
              <View style={styles.condGrid}>
                {METEO_GRID.map((item) => (
                  <View key={item.key} style={[Glass.subtle, styles.condCell]}>
                    <Text style={styles.condEmoji}>{item.emoji}</Text>
                    <Text style={styles.condLabel}>{item.label}</Text>
                    <Text style={styles.condValue}>
                      {conditions ? formatConditionValue(item.key, conditions) : '–'}
                    </Text>
                  </View>
                ))}
              </View>

              {condError ? (
                <Text style={styles.condErrorText}>⚠️ Datos no disponibles</Text>
              ) : (
                <Text style={styles.updatedLabel}>{updatedLabel}</Text>
              )}
            </View>
          )}
        </View>

        {/* ── Location ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.location ?? 'Ubicación'}</Text>
          <View style={[Glass.subtle, styles.coordsBlock]}>
            <Text style={styles.coordItem}>📍 {zone.lat?.toFixed(4)}, {zone.lng?.toFixed(4)}</Text>
            <Text style={styles.coordItem}>⛰ {zone.elevation}m s.n.m.</Text>
            <Text style={styles.coordItem}>
              {FOREST_EMOJI[zone.forestType] ?? '🌲'} {zone.forestType}
            </Text>
          </View>
          <Text style={[Typography.caption, styles.mapNote]}>
            Mapa disponible en la pestaña Mapa →
          </Text>
        </View>

        {/* ── Species placeholder ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.availableNow ?? 'Disponibles ahora'}</Text>
          <View style={[Glass.subtle, styles.comingSoon]}>
            <Text style={Typography.bodySmall}>
              🍄 Lista de especies disponible en feat/v8-0-species
            </Text>
          </View>
        </View>
      </ScrollView>
    </Background>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    padding: 8, zIndex: 10,
  },
  closeText: { fontFamily: Font.sans, color: Colors.muted, fontSize: 18 },

  // Hero
  heroBlock: { marginBottom: 24 },
  forestBadge: {
    fontFamily: Font.sansMedium,
    fontSize: 11,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  heroBadge: {
    backgroundColor: 'rgba(74,124,89,0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  heroBadgeText: { fontFamily: Font.sansMedium, fontSize: 11, color: '#6ee7b7' },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  followStar: { fontSize: 16 },
  followLabel: { fontFamily: Font.sansMedium, fontSize: 13, color: Colors.muted },
  followLabelActive: { color: '#facc15' },

  // Description
  descriptionBlock: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.coffee + '66',
    paddingLeft: 12,
    marginBottom: 24,
  },
  description: { color: 'rgba(244,235,225,0.8)' },

  // Sections
  section: { marginBottom: 28 },
  sectionLabel: {
    fontFamily: Font.sansMedium,
    fontSize: 10,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionHint: { marginBottom: 12 },

  // Score
  scoreLoading: { padding: 20, alignItems: 'center' },
  scoreBlock: { padding: 16 },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreStatus: { fontFamily: Font.sansSemiBold, fontSize: 14 },
  scoreNumber: {
    fontFamily: Font.display,
    fontSize: 28,
    color: Colors.cream,
  },
  scoreMax: {
    fontFamily: Font.sans,
    fontSize: 12,
    color: 'rgba(244,235,225,0.4)',
  },

  condGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  condCell: {
    width: '30%',
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
  },
  condEmoji: { fontSize: 22, marginBottom: 4 },
  condLabel: { fontFamily: Font.sansLight, fontSize: 10, color: Colors.muted, marginBottom: 4, textAlign: 'center' },
  condValue: { fontFamily: Font.sansSemiBold, fontSize: 13, color: Colors.cream },

  updatedLabel: { fontFamily: Font.sansLight, fontSize: 10, color: 'rgba(244,235,225,0.4)', marginTop: 10, textAlign: 'right' },
  condErrorText: { fontFamily: Font.sans, fontSize: 12, color: Colors.warning, marginTop: 8 },

  // Location
  coordsBlock: { padding: 14, gap: 6 },
  coordItem: { fontFamily: Font.sansLight, fontSize: 13, color: Colors.muted },
  mapNote: { marginTop: 8 },

  // Species placeholder
  comingSoon: { padding: 16 },
})
