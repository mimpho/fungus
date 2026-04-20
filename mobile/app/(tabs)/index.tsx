// Zonas — zone list with search + filter bottom sheet
// Home tab (index). Tapping a card navigates to zona/[id] modal.

import { useState, useMemo } from 'react'
import {
  View, Text, FlatList, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator,
  ScrollView, Pressable,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Colors } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { ZoneCard } from '../../components/ui/ZoneCard'
import { useZones, Zone } from '../../hooks/useZones'
import { useAppStore } from '../../store/useAppStore'
import { RAIN_THRESHOLD } from '../../lib/constants'

// SVG icons — paths mirrored from web src/lib/helpers.jsx
function IconSearch({ size = 16, opacity = 0.7 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke={`rgba(244,235,225,${opacity})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function IconFilter({ size = 16, opacity = 0.85 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        stroke={`rgba(244,235,225,${opacity})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function IconClose({ size = 14, opacity = 0.5 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 18L18 6M6 6l12 12"
        stroke={`rgba(244,235,225,${opacity})`}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

type SortKey = 'score' | 'alfa' | 'elevation'

const FOREST_EMOJI: Record<string, string> = {
  pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒',
}

// ── Filter section label ────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>
}

// ── Generic filter chip ─────────────────────────────────────────────────────
function Chip({
  label, active, onPress, flex,
}: { label: string; active: boolean; onPress: () => void; flex?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, flex && styles.chipFlex]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function ZonasScreen() {
  const { t, followedZoneIds, toggleFollow } = useAppStore(useShallow((s) => ({
    t: s.t,
    followedZoneIds: s.followedZones,
    toggleFollow: s.toggleFollow,
  })))

  const { zones, conditionsMap, loading, error } = useZones()

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [onlyFollowed, setOnlyFollowed] = useState(false)
  const [onlyRained, setOnlyRained] = useState(false)
  const [forestFilter, setForestFilter] = useState('')
  const [ccaaFilter, setCcaaFilter] = useState('')
  const [comarcaFilter, setComarcaFilter] = useState('')
  const [sort, setSort] = useState<SortKey>('score')

  // ── Derived lists for filter panel ───────────────────────────────────────
  const forestTypes = useMemo(
    () => [...new Set(zones.map((z) => z.forestType))].filter(Boolean).sort(),
    [zones],
  )
  const comunidades = useMemo(
    () => [...new Set(zones.map((z) => z.autonomy).filter(Boolean))].sort() as string[],
    [zones],
  )
  const comarcas = useMemo(() => {
    const pool = ccaaFilter ? zones.filter((z) => z.autonomy === ccaaFilter) : zones
    return [...new Set(pool.map((z) => z.region).filter(Boolean))].sort() as string[]
  }, [zones, ccaaFilter])

  // ── Active filter count (badge) ───────────────────────────────────────────
  const activeFilters =
    (onlyFollowed ? 1 : 0) + (onlyRained ? 1 : 0) +
    (forestFilter ? 1 : 0) + (ccaaFilter ? 1 : 0) + (comarcaFilter ? 1 : 0)

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = onlyFollowed
      ? zones.filter((z) => followedZoneIds.includes(z.id))
      : [...zones]

    if (onlyRained)
      r = r.filter((z) => (conditionsMap[z.id]?.rainfall14d ?? 0) >= RAIN_THRESHOLD)
    if (forestFilter) r = r.filter((z) => z.forestType === forestFilter)
    if (ccaaFilter) r = r.filter((z) => z.autonomy === ccaaFilter)
    if (comarcaFilter) r = r.filter((z) => z.region === comarcaFilter)

    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(
        (z) =>
          z.name.toLowerCase().includes(q) ||
          z.province.toLowerCase().includes(q) ||
          (z.region ?? '').toLowerCase().includes(q) ||
          (z.autonomy ?? '').toLowerCase().includes(q),
      )
    }

    if (sort === 'score')
      r.sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0))
    else if (sort === 'alfa')
      r.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'elevation')
      r.sort((a, b) => b.elevation - a.elevation)

    return r
  }, [zones, conditionsMap, onlyFollowed, onlyRained, forestFilter, ccaaFilter, comarcaFilter, search, sort, followedZoneIds])

  function clearAllFilters() {
    setOnlyFollowed(false)
    setOnlyRained(false)
    setForestFilter('')
    setCcaaFilter('')
    setComarcaFilter('')
    setSort('score')
  }

  const isFollowed = (z: Zone) => followedZoneIds.includes(z.id)

  // ── List header ───────────────────────────────────────────────────────────
  const ListHeader = (
    <View style={styles.header}>
      <Text style={Typography.h2}>{t.zones ?? 'Zonas'}</Text>
      <Text style={[Typography.caption, styles.countLabel]}>
        {filtered.length} zona{filtered.length !== 1 ? 's' : ''}
        {loading && <Text style={styles.loadingDot}> · {t.loading ?? 'Cargando…'}</Text>}
      </Text>

      {/* Search + Filter bar — split-pill matching web SearchFilterBar */}
      <View style={styles.searchBar}>
        {/* Left half — search input, pill only on left */}
        <View style={styles.searchInputWrap}>
          <IconSearch size={16} opacity={0.6} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar…"
            placeholderTextColor="rgba(217,205,161,0.5)"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              style={styles.clearBtn}
            >
              <IconClose size={14} opacity={0.5} />
            </TouchableOpacity>
          )}
        </View>

        {/* Right half — filter button, pill only on right */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterOpen(true)}
          activeOpacity={0.75}
        >
          <IconFilter size={16} opacity={0.8} />
          <Text style={styles.filterBtnLabel}>Filtrar</Text>
          {activeFilters > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  )

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading && zones.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={[Typography.bodySmall, styles.loadingText]}>{t.loading ?? 'Cargando…'}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(z) => z.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: z }) => (
          <ZoneCard
            zone={z}
            conditions={conditionsMap[z.id] ?? null}
            isFollowed={isFollowed(z)}
            onToggle={() => toggleFollow(z.id)}
            onPress={() => router.push(`/zona/${z.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍄</Text>
            <Text style={Typography.h3}>{t.noZones ?? 'Sin zonas'}</Text>
            <Text style={[Typography.bodySmall, styles.emptyHint]}>
              {t.adjustFilters ?? 'Prueba a ajustar los filtros'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── Filter bottom sheet (inline overlay — avoids Modal web click bugs) ── */}
      {filterOpen && (
        <View style={[StyleSheet.absoluteFill, styles.overlayRoot]} pointerEvents="box-none">
          <Pressable
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={() => setFilterOpen(false)}
          />
          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filtrar y ordenar</Text>
              <TouchableOpacity
                style={styles.sheetClose}
                onPress={() => setFilterOpen(false)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Text style={styles.sheetCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetBodyContent}
            >
              {/* MOSTRAR ── Todas / Mis zonas / Ha llovido */}
              <View style={styles.filterSection}>
                <SectionLabel label="MOSTRAR" />
                <View style={styles.chipRow}>
                  <Chip
                    label={t.allZones ?? 'Todas las zonas'}
                    active={!onlyFollowed && !onlyRained}
                    onPress={() => { setOnlyFollowed(false); setOnlyRained(false) }}
                    flex
                  />
                  <Chip
                    label={`⭐ ${t.myZones ?? 'Mis zonas'}`}
                    active={onlyFollowed}
                    onPress={() => { setOnlyFollowed(v => !v); setOnlyRained(false) }}
                    flex
                  />
                  <Chip
                    label="🌧 Ha llovido"
                    active={onlyRained}
                    onPress={() => { setOnlyRained(v => !v); setOnlyFollowed(false) }}
                    flex
                  />
                </View>
              </View>

              {/* COMUNIDAD AUTÓNOMA */}
              {comunidades.length > 0 && (
                <View style={styles.filterSection}>
                  <SectionLabel label="COMUNIDAD AUTÓNOMA" />
                  <View style={styles.chipRow}>
                    <Chip
                      label={t.todos ?? 'Todos'}
                      active={!ccaaFilter}
                      onPress={() => { setCcaaFilter(''); setComarcaFilter('') }}
                    />
                    {comunidades.map((ca) => (
                      <Chip
                        key={ca}
                        label={ca}
                        active={ccaaFilter === ca}
                        onPress={() => {
                          setCcaaFilter(ccaaFilter === ca ? '' : ca)
                          setComarcaFilter('')
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* COMARCA — only visible once a CCAA is selected */}
              {ccaaFilter !== '' && comarcas.length > 0 && (
                <View style={styles.filterSection}>
                  <SectionLabel label="COMARCA" />
                  <View style={styles.chipRow}>
                    <Chip
                      label={t.allComarcas ?? 'Todas las comarcas'}
                      active={!comarcaFilter}
                      onPress={() => setComarcaFilter('')}
                    />
                    {comarcas.map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        active={comarcaFilter === c}
                        onPress={() => setComarcaFilter(comarcaFilter === c ? '' : c)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* TIPO DE BOSQUE */}
              {forestTypes.length > 0 && (
                <View style={styles.filterSection}>
                  <SectionLabel label="TIPO DE BOSQUE" />
                  <View style={styles.chipRow}>
                    <Chip
                      label={t.todos ?? 'Todos'}
                      active={!forestFilter}
                      onPress={() => setForestFilter('')}
                    />
                    {forestTypes.map((f) => (
                      <Chip
                        key={f}
                        label={`${FOREST_EMOJI[f] ?? '🌲'} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                        active={forestFilter === f}
                        onPress={() => setForestFilter(forestFilter === f ? '' : f)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* ORDENAR POR */}
              <View style={styles.filterSection}>
                <SectionLabel label="ORDENAR POR" />
                <View style={styles.chipRow}>
                  <Chip
                    label={t.bestCondition ?? 'Mejor condición'}
                    active={sort === 'score'}
                    onPress={() => setSort('score')}
                  />
                  <Chip
                    label={t.alphabetical ?? 'A–Z'}
                    active={sort === 'alfa'}
                    onPress={() => setSort('alfa')}
                  />
                  <Chip
                    label={t.altitude ?? 'Altitud'}
                    active={sort === 'elevation'}
                    onPress={() => setSort('elevation')}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Footer actions */}
            <View style={styles.sheetFooter}>
              {activeFilters > 0 && (
                <TouchableOpacity style={styles.clearBtn2} onPress={clearAllFilters}>
                  <Text style={styles.clearBtn2Text}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterOpen(false)}
              >
                <Text style={styles.applyBtnText}>
                  Ver {filtered.length} zona{filtered.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  // List header
  header: { marginBottom: 14 },
  countLabel: { marginTop: 3, marginBottom: 12 },
  loadingDot: { color: Colors.bar },

  // Search + filter bar — split-pill (left half + right half, 4px gap)
  searchBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 0,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
    height: 52,
    // glass inline — no Glass.subtle spread to avoid borderRadius conflict
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(244,235,225,0.08)',
    // split-pill: rounded left, flat right
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: Font.sans,
    fontSize: 14,
    color: Colors.cream,
    height: 52,
    marginLeft: 10,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 18,
    height: 52,
    gap: 7,
    // glass inline
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(244,235,225,0.06)',
    // split-pill: flat left, rounded right
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
  },
  filterBtnLabel: {
    fontFamily: Font.sansMedium,
    fontSize: 14,
    color: 'rgba(244,235,225,0.85)',
  },
  badge: {
    backgroundColor: Colors.bar,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: { fontFamily: Font.sansMedium, fontSize: 10, color: Colors.cream },

  errorBanner: {
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  errorText: { fontFamily: Font.sans, fontSize: 12, color: Colors.danger },

  // Empty + loading
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyHint: { textAlign: 'center' },
  loadingText: { marginTop: 8 },

  // ── Inline overlay / bottom sheet ──────────────────────────────────────
  overlayRoot: {
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    backgroundColor: 'rgba(10,20,15,0.65)',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: '#242e22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    zIndex: 101,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontFamily: Font.display,
    fontSize: 20,
    color: Colors.cream,
    fontWeight: '600',
  },
  sheetClose: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sheetCloseText: { color: Colors.muted, fontSize: 16 },
  sheetBody: { flexShrink: 1 },
  sheetBodyContent: { paddingHorizontal: 20, paddingBottom: 8 },

  // Filter sections inside sheet
  filterSection: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: Font.sansMedium,
    fontSize: 10,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(244,235,225,0.08)',
  },
  chipFlex: { flex: 1, alignItems: 'center' },
  chipActive: {
    backgroundColor: Colors.bar,
    borderColor: Colors.bar,
  },
  chipText: {
    fontFamily: Font.sansMedium,
    fontSize: 13,
    color: 'rgba(244,235,225,0.6)',
    textAlign: 'center',
  },
  chipTextActive: {
    color: Colors.cream,
  },

  // Footer
  sheetFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  clearBtn2: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  clearBtn2Text: { fontFamily: Font.sansMedium, fontSize: 14, color: Colors.muted },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.bar,
    alignItems: 'center',
  },
  applyBtnText: { fontFamily: Font.sansMedium, fontSize: 14, color: Colors.cream },
})
