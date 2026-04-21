// ZoneCard — zone list item with score bar, conditions summary and follow toggle
// Mirrors web ZoneCard.jsx (glass-olive card, no border, shadow only)

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { Colors, getScoreColor } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { ScoreBar } from './ScoreBar'
import { Zone, ZoneConditions } from '../../hooks/useZones'

// ── Icons (SVG paths from web src/lib/helpers.jsx) ───────────────────────────

// Star — same path as IC.star in helpers.jsx
// fill='currentColor' when followed, fill='none' (outline) when not
function IconStar({
  filled,
  size = 20,
}: {
  filled: boolean
  size?: number
}) {
  const color = filled ? '#facc15' : 'rgba(244,235,225,0.45)' // yellow-400 or cream/45
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Mountain — altitude indicator (replaces the ⛰ emoji)
// Single-peak triangle silhouette, readable at 14–16px
function IconMountain({
  size = 15,
  color = Colors.muted,
}: {
  size?: number
  color?: string
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21h18L12 5 3 21z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// ── Score helpers ─────────────────────────────────────────────────────────────

const SCORE_LABEL: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Buena',
  moderate: 'Moderada',
  low: 'Baja',
}

function scoreLabel(score: number): string {
  if (score >= 85) return SCORE_LABEL.excellent
  if (score >= 70) return SCORE_LABEL.good
  if (score >= 55) return SCORE_LABEL.moderate
  return SCORE_LABEL.low
}

const FOREST_EMOJI: Record<string, string> = {
  pinar: '🌲',
  hayedo: '🌳',
  robledal: '🌿',
  encinar: '🫒',
}

// ── Component ─────────────────────────────────────────────────────────────────

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
      {/* Two-layer shadow approach for Android: outer view carries solid bg + elevation,
          inner view carries the glass rgba color. iOS uses the inner shadow directly. */}
      <View style={[Glass.panelShadow, styles.cardShadow]}>
      <View style={[Glass.panel, styles.card]}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>{zone.name}</Text>
            <Text style={styles.meta}>
              {[zone.region, zone.province].filter(Boolean).join(' · ')}
            </Text>
          </View>
          {/* Follow toggle — SVG star, no emoji to avoid OS-rendered outline */}
          <TouchableOpacity
            style={[styles.followBtn, isFollowed && styles.followBtnActive]}
            onPress={(e) => { e.stopPropagation?.(); onToggle() }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <IconStar filled={isFollowed} size={20} />
          </TouchableOpacity>
        </View>

        {/* Forest type + elevation */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>
            {FOREST_EMOJI[zone.forestType] ?? '🌲'} {zone.forestType}
          </Text>
          <View style={styles.elevationTag}>
            <IconMountain size={14} color="rgba(217,205,161,0.65)" />
            <Text style={[styles.tag, styles.elevationText]}>{zone.elevation} m</Text>
          </View>
        </View>

        {/* Score section */}
        {loading ? (
          <View style={styles.skeletonBlock}>
            <ActivityIndicator size="small" color={Colors.coffee} />
          </View>
        ) : (
          <>
            <View style={styles.scoreRow}>
              <Text style={styles.condLabel}>Cond. recolección</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel(score)}</Text>
            </View>
            <ScoreBar score={score} />
            <View style={styles.condRow}>
              {conditions?.tempMin != null && conditions?.tempMax != null && (
                <Text style={styles.condItem}>🌡 {conditions.tempMin}–{conditions.tempMax}°C</Text>
              )}
              {conditions?.rainfall14d != null && (
                <Text style={styles.condItem}>🌧 {conditions.rainfall14d} mm</Text>
              )}
              {conditions?.humidity != null && (
                <Text style={styles.condItem}>💧 {conditions.humidity}%</Text>
              )}
            </View>
          </>
        )}
      </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Outer shadow wrapper — carries elevation/shadow on a solid bg so Android
  // renders it correctly (Android can't shadow semi-transparent backgrounds).
  cardShadow: {
    marginBottom: 12,
  },
  // Inner glass layer — the actual rgba surface on top of the solid shadow bg.
  card: {
    padding: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleBlock: {
    flex: 1,
    marginRight: 10,
  },
  // Zone name — web: font-display text-xl font-semibold (Cormorant 20px)
  name: {
    fontFamily: Font.displaySemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.cream,
    marginBottom: 2,
  },
  meta: {
    fontFamily: Font.sansLight,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.muted,
  },
  followBtn: {
    padding: 6,
    borderRadius: 10,
  },
  followBtnActive: {
    backgroundColor: 'rgba(250,204,21,0.12)',
  },

  // Tags (forest type + elevation)
  tagsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  tag: {
    fontFamily: Font.sansLight,
    fontSize: 12,
    color: 'rgba(217,205,161,0.65)',  // cream/65
  },
  elevationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  elevationText: {
    marginLeft: 0,
  },

  // Score
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  condLabel: {
    fontFamily: Font.sansLight,
    fontSize: 13,
    color: 'rgba(244,235,225,0.70)',
  },
  scoreLabel: {
    fontFamily: Font.sansSemiBold,
    fontSize: 13,
  },

  // Condition pills
  condRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  condItem: {
    fontFamily: Font.sansLight,
    fontSize: 12,
    color: 'rgba(217,205,161,0.60)',
  },

  // Loading skeleton
  skeletonBlock: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
