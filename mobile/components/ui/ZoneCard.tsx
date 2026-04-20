// ZoneCard — zone list item with score bar, conditions summary and follow toggle
// Mirrors web ZoneCard.jsx

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Colors, getScoreColor } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { ScoreBar } from './ScoreBar'
import { Zone, ZoneConditions } from '../../hooks/useZones'

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
  pinar:    '🌲',
  hayedo:   '🌳',
  robledal: '🌿',
  encinar:  '🫒',
}

interface ZoneCardProps {
  zone: Zone
  conditions: ZoneConditions | null   // null = still loading
  isFollowed: boolean
  onToggle: () => void
  onPress: () => void
}

export function ZoneCard({ zone, conditions, isFollowed, onToggle, onPress }: ZoneCardProps) {
  const loading = conditions === null
  const score = conditions?.overallScore ?? 0
  const scoreColor = getScoreColor(score)

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
      <View style={[Glass.panel, styles.card]}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={[Typography.h3, styles.name]} numberOfLines={1}>{zone.name}</Text>
            <Text style={[Typography.caption, styles.meta]}>
              {[zone.region, zone.province].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, isFollowed && styles.followBtnActive]}
            onPress={(e) => { e.stopPropagation?.(); onToggle() }}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={styles.followStar}>{isFollowed ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Forest type + elevation */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>
            {FOREST_EMOJI[zone.forestType] ?? '🌲'} {zone.forestType}
          </Text>
          <Text style={styles.tag}>⛰ {zone.elevation}m</Text>
        </View>

        {/* Score section */}
        {loading ? (
          <View style={styles.skeletonBlock}>
            <ActivityIndicator size="small" color={Colors.coffee} />
          </View>
        ) : (
          <>
            <View style={styles.scoreRow}>
              <Text style={[Typography.caption]}>Cond. recolección</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel(score)}</Text>
            </View>
            <ScoreBar score={score} />
            <View style={styles.condRow}>
              {conditions?.tempMin != null && conditions?.tempMax != null && (
                <Text style={styles.condItem}>🌡 {conditions.tempMin}–{conditions.tempMax}°C</Text>
              )}
              {conditions?.rainfall14d != null && (
                <Text style={styles.condItem}>🌧 {conditions.rainfall14d}mm</Text>
              )}
              {conditions?.humidity != null && (
                <Text style={styles.condItem}>💧 {conditions.humidity}%</Text>
              )}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleBlock: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    marginBottom: 2,
  },
  meta: {
    marginTop: 0,
  },
  followBtn: {
    padding: 4,
    borderRadius: 8,
  },
  followBtnActive: {
    backgroundColor: 'rgba(250,204,21,0.15)',
  },
  followStar: {
    fontSize: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tag: {
    fontFamily: Font.sansLight,
    fontSize: 12,
    color: Colors.muted,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreLabel: {
    fontFamily: Font.sansSemiBold,
    fontSize: 12,
  },
  condRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  condItem: {
    fontFamily: Font.sansLight,
    fontSize: 11,
    color: Colors.muted,
  },
  skeletonBlock: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
