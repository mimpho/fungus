// Zonas — zone list with search + filter bottom sheet
// Home tab (index). Tapping a card navigates to zona/[id] modal.
//
// Scroll behavior:
//   - Native header is HIDDEN (headerShown: false).
//   - The title row (Zonas / N zonas) is the first item in the FlatList data
//     and scrolls away naturally.
//   - The search/filter bar is the second item (index 1) and is made sticky
//     via stickyHeaderIndices={[1]} — once the title scrolls off, the bar
//     pins to the top of the screen.
//
// Bottom tab bar is absolute/floating — the list needs paddingBottom equal
// to the tab bar height so the last card is not hidden behind it.

import { useState, useMemo, useRef } from 'react'
import {
  View, Text, FlatList, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator,
  ScrollView, Pressable, Animated, PanResponder, Platform,
  useWindowDimensions,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { BlurView } from 'expo-blur'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { Tabs, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'
import { Colors } from '../../constants/Colors'
import { Typography, Font, useStyles } from '../../lib/theme'
import { ZoneCard } from '../../components/ui/ZoneCard'
import { useZones, Zone } from '../../hooks/useZones'
import { useAppStore } from '../../store/useAppStore'
import { RAIN_THRESHOLD } from '../../lib/constants'

// ── SVG icons ────────────────────────────────────────────────────────────────

function IconSearch({ size = 16, opacity = 0.7 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke={`rgba(244,235,225,${opacity})`} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconFilter({ size = 16, opacity = 0.85 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        stroke={`rgba(244,235,225,${opacity})`} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconClose({ size = 14, opacity = 0.5 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 18L18 6M6 6l12 12"
        stroke={`rgba(244,235,225,${opacity})`} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      style={open ? { transform: [{ rotate: '180deg' }] } : undefined}>
      <Path d="M6 9l6 6 6-6"
        stroke="rgba(244,235,225,0.50)" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// Comarca select — styled to match the web <select> (border box + chevron).
// Opens an inline dropdown below the trigger so it works inside the sheet ScrollView.
function ComarcaSelect({
  value, onChange, comarcas,
}: { value: string; onChange: (v: string) => void; comarcas: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <View>
      <TouchableOpacity style={selectSt.trigger} onPress={() => setOpen(o => !o)} activeOpacity={0.75}>
        <Text style={selectSt.triggerText} numberOfLines={1}>
          {value || 'Todas las comarcas'}
        </Text>
        <IconChevron open={open} />
      </TouchableOpacity>
      {open && (
        <View style={selectSt.dropdown}>
          {(['', ...comarcas] as string[]).map((c) => (
            <TouchableOpacity
              key={c || '__all__'}
              style={[selectSt.option, value === c && selectSt.optionActive]}
              onPress={() => { onChange(c); setOpen(false) }}
            >
              <Text style={[selectSt.optionText, value === c && selectSt.optionTextActive]}>
                {c || 'Todas las comarcas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const selectSt = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  triggerText: { fontFamily: Font.sans, fontSize: 15, color: Colors.cream, flex: 1 },
  dropdown: {
    marginTop: 4, borderRadius: 12, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  option: {
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionActive: { backgroundColor: 'rgba(136,123,75,0.20)' },
  optionText: { fontFamily: Font.sans, fontSize: 15, color: 'rgba(244,235,225,0.65)' },
  optionTextActive: { color: Colors.cream, fontFamily: Font.sansMedium },
})

type SortKey = 'score' | 'alfa' | 'elevation'

const FOREST_EMOJI: Record<string, string> = {
  pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒',
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>
}

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

// ── List item types ───────────────────────────────────────────────────────────
// The FlatList mixes pseudo-items (title, searchbar, empty) with real zone items.

type ListItem =
  | { itemType: 'title' }
  | { itemType: 'searchbar' }
  | { itemType: 'zone'; zone: Zone }
  | { itemType: 'empty' }

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ZonasScreen() {
  const { colors } = useStyles()

  const { t, followedZoneIds, toggleFollow } = useAppStore(useShallow((s) => ({
    t: s.t,
    followedZoneIds: s.followedZones,
    toggleFollow: s.toggleFollow,
  })))

  const { zones, conditionsMap, loading, error } = useZones()

  const { height: windowHeight } = useWindowDimensions()
  // Bottom safe area — needed to add paddingBottom so the last card is not
  // hidden behind the absolute-positioned tab bar.
  const insets = useSafeAreaInsets()
  // 59 = tab bar content height, insets.bottom = home indicator, 8 = breathing room
  // Must match tabBarHeight in _layout.tsx
  const tabBarPadding = 59 + insets.bottom + 8

  // ── Sticky detection ─────────────────────────────────────────────────────
  // Shadow on the search bar is only applied once the title row has scrolled off
  // and the bar is pinned at the top (= isSticky).
  const [isSticky, setIsSticky] = useState(false)
  const titleRowHeight = useRef(0)
  const searchBarHeight = useRef(0)

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [onlyFollowed, setOnlyFollowed] = useState(false)
  const [onlyRained, setOnlyRained] = useState(false)
  const [forestFilter, setForestFilter] = useState('')
  const [ccaaFilter, setCcaaFilter] = useState('')
  const [comarcaFilter, setComarcaFilter] = useState('')
  const [sort, setSort] = useState<SortKey>('score')

  // ── Sheet animation ───────────────────────────────────────────────────────
  const backdropAnim = useRef(new Animated.Value(0)).current
  const sheetAnim = useRef(new Animated.Value(600)).current

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 8,
      onPanResponderMove: (_, { dy }) => { if (dy > 0) sheetAnim.setValue(dy) },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 0.8) {
          closeFilter()
        } else {
          Animated.spring(sheetAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start()
        }
      },
    }),
  ).current

  function openFilter() {
    setFilterOpen(true)
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(sheetAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start()
    })
  }

  function closeFilter() {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setFilterOpen(false)
      backdropAnim.setValue(0)
      sheetAnim.setValue(600)
    })
  }

  // ── Derived filter options ────────────────────────────────────────────────
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

  const activeFilters =
    (onlyFollowed ? 1 : 0) + (onlyRained ? 1 : 0) +
    (forestFilter ? 1 : 0) + (ccaaFilter ? 1 : 0) + (comarcaFilter ? 1 : 0)

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = onlyFollowed ? zones.filter((z) => followedZoneIds.includes(z.id)) : [...zones]
    if (onlyRained) r = r.filter((z) => (conditionsMap[z.id]?.rainfall14d ?? 0) >= RAIN_THRESHOLD)
    if (forestFilter) r = r.filter((z) => z.forestType === forestFilter)
    if (ccaaFilter) r = r.filter((z) => z.autonomy === ccaaFilter)
    if (comarcaFilter) r = r.filter((z) => z.region === comarcaFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((z) =>
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
    setOnlyFollowed(false); setOnlyRained(false); setForestFilter('')
    setCcaaFilter(''); setComarcaFilter(''); setSort('score')
  }

  const isFollowed = (z: Zone) => followedZoneIds.includes(z.id)

  // ── FlatList data ─────────────────────────────────────────────────────────
  // Index 0 = title row  (scrolls away)
  // Index 1 = search bar (becomes sticky via stickyHeaderIndices={[1]})
  // Index 2+ = zone cards (or empty state at index 2 when no results)
  const listData = useMemo<ListItem[]>(() => {
    const header: ListItem[] = [{ itemType: 'title' }, { itemType: 'searchbar' }]
    if (loading && zones.length === 0) return header
    if (filtered.length === 0) return [...header, { itemType: 'empty' }]
    return [...header, ...filtered.map((z) => ({ itemType: 'zone' as const, zone: z }))]
  }, [filtered, loading, zones.length])

  // ── Render per item type ──────────────────────────────────────────────────
  function renderItem({ item }: { item: ListItem }) {
    switch (item.itemType) {

      // ── Title row — scrolls away naturally ─────────────────────────────
      case 'title':
        return (
          <View
            style={styles.titleRow}
            onLayout={(e) => { titleRowHeight.current = e.nativeEvent.layout.height }}
          >
            <Text style={styles.titleText}>{t.zones ?? 'Zonas'}</Text>
            <Text style={styles.titleCount}>
              {loading
                ? (t.loading ?? 'Cargando…')
                : `${filtered.length} zona${filtered.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        )

      // ── Search bar — always renders its natural height in the list.
      // When isSticky=true an identical bar is shown in a fixed View above the
      // FlatList (see below); this instance becomes invisible to avoid duplicate.
      case 'searchbar':
        return (
          <View
            style={[styles.stickyBar, isSticky && styles.stickyBarHidden]}
            onLayout={(e) => { searchBarHeight.current = e.nativeEvent.layout.height }}
          >
            {renderSearchBarContent(false)}
          </View>
        )

      // ── Zone card ───────────────────────────────────────────────────────
      case 'zone':
        return (
          <View style={styles.cardWrapper}>
            <ZoneCard
              zone={item.zone}
              conditions={conditionsMap[item.zone.id] ?? null}
              isFollowed={isFollowed(item.zone)}
              onToggle={() => toggleFollow(item.zone.id)}
              onPress={() => router.push(`/zona/${item.zone.id}`)}
            />
          </View>
        )

      // ── Empty state ─────────────────────────────────────────────────────
      case 'empty':
        return (
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.green} />
            ) : (
              <>
                <Text style={styles.emptyEmoji}>🍄</Text>
                <Text style={Typography.h3}>{t.noZones ?? 'Sin zonas'}</Text>
                <Text style={[Typography.bodySmall, styles.emptyHint]}>
                  {t.adjustFilters ?? 'Prueba a ajustar los filtros'}
                </Text>
              </>
            )}
          </View>
        )
    }
  }

  // ── Search bar content — shared between the in-list placeholder and the
  // fixed overlay. `pinned=true` applies the drop-shadow on the pills.
  function renderSearchBarContent(pinned: boolean) {
    return (
      <>
        <View style={[
          styles.searchBar,
          pinned && Platform.OS === 'web'
            ? ({ filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.50))' } as any)
            : null,
        ]}>
          <View style={[styles.searchInputWrap, pinned && Platform.OS !== 'web' && PILL_SHADOW]}>
            <IconSearch size={16} opacity={0.55} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar…"
              placeholderTextColor="rgba(217,205,161,0.45)"
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
          <TouchableOpacity
            style={[styles.filterBtn, pinned && Platform.OS !== 'web' && PILL_SHADOW]}
            onPress={openFilter} activeOpacity={0.75}>
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
      </>
    )
  }

  return (
    <>
      {/* Hide the native header — the title lives in the scroll content */}
      <Tabs.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <FlatList
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: tabBarPadding }]}
          data={listData}
          keyExtractor={(item) =>
            item.itemType === 'zone' ? item.zone.id : item.itemType
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            // The search bar pins when its top edge reaches viewport y=insets.top.
            // offset at that moment = titleRowHeight (insets.top terms cancel out).
            const sticky = e.nativeEvent.contentOffset.y >= titleRowHeight.current
            if (sticky !== isSticky) setIsSticky(sticky)
          }}
          scrollEventThrottle={16}
        />

        {/* ── Fixed search bar overlay — shown only when isSticky=true.
            Positioned at top=insets.top so it sits just below the status bar,
            exactly where the in-list bar was before it scrolled off. ────── */}
        {isSticky && (
          <View style={[styles.stickyBarFixed, { top: insets.top }]}
            pointerEvents="box-none">
            {renderSearchBarContent(true)}
          </View>
        )}

        {/* ── Filter bottom sheet (animated inline overlay) ─────────────── */}
        {filterOpen && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: backdropAnim, zIndex: 100 }]}
              pointerEvents="auto"
            >
              {Platform.OS === 'web' ? (
                <Pressable
                  style={[StyleSheet.absoluteFill, styles.backdrop, {
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  } as any]}
                  onPress={closeFilter}
                />
              ) : (
                <BlurView
                  intensity={25}
                  tint="dark"
                  experimentalBlurMethod={
                    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
                      ? 'none'
                      : 'dimezisBlurView'
                  }
                  style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
                >
                  <Pressable style={[StyleSheet.absoluteFill, styles.backdropOverlay]} onPress={closeFilter} />
                </BlurView>
              )}
            </Animated.View>
            <View style={styles.sheetWrapper} pointerEvents="box-none">
              <Animated.View style={{ transform: [{ translateY: sheetAnim }] }}>
                <View style={[styles.sheet, { maxHeight: windowHeight - 50 - insets.top }]}>
                  <View {...panResponder.panHandlers} style={styles.handleWrap}>
                    <View style={styles.handle} />
                  </View>
                  <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Filtrar y ordenar</Text>
                    <TouchableOpacity style={styles.sheetClose} onPress={closeFilter}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <IconClose size={16} opacity={0.6} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetBodyContent}>
                    <View style={styles.filterSection}>
                      <SectionLabel label="MOSTRAR" />
                      <View style={styles.chipRow}>
                        <Chip label={t.allZones ?? 'Todas las zonas'} active={!onlyFollowed && !onlyRained}
                          onPress={() => { setOnlyFollowed(false); setOnlyRained(false) }} flex />
                        <Chip label={`⭐ ${t.myZones ?? 'Mis zonas'}`} active={onlyFollowed}
                          onPress={() => { setOnlyFollowed(v => !v); setOnlyRained(false) }} flex />
                        <Chip label="🌧 Ha llovido" active={onlyRained}
                          onPress={() => { setOnlyRained(v => !v); setOnlyFollowed(false) }} flex />
                      </View>
                    </View>
                    {comunidades.length > 0 && (
                      <View style={styles.filterSection}>
                        <SectionLabel label="COMUNIDAD AUTÓNOMA" />
                        <View style={styles.chipRow}>
                          <Chip label="Todas" active={!ccaaFilter}
                            onPress={() => { setCcaaFilter(''); setComarcaFilter('') }} />
                          {comunidades.map((ca) => (
                            <Chip key={ca} label={ca} active={ccaaFilter === ca}
                              onPress={() => { setCcaaFilter(ccaaFilter === ca ? '' : ca); setComarcaFilter('') }} />
                          ))}
                        </View>
                      </View>
                    )}
                    <View style={styles.filterSection}>
                      <SectionLabel label="COMARCA" />
                      <ComarcaSelect
                        value={comarcaFilter}
                        onChange={setComarcaFilter}
                        comarcas={comarcas}
                      />
                    </View>
                    {forestTypes.length > 0 && (
                      <View style={styles.filterSection}>
                        <SectionLabel label="TIPO DE BOSQUE" />
                        <View style={styles.chipRow}>
                          <Chip label="Todos" active={!forestFilter} onPress={() => setForestFilter('')} />
                          {forestTypes.map((f) => (
                            <Chip key={f}
                              label={`${FOREST_EMOJI[f] ?? '🌲'} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                              active={forestFilter === f}
                              onPress={() => setForestFilter(forestFilter === f ? '' : f)} />
                          ))}
                        </View>
                      </View>
                    )}
                    <View style={styles.filterSection}>
                      <SectionLabel label="ORDENAR POR" />
                      <View style={styles.chipRow}>
                        <Chip label={t.bestCondition ?? 'Mejor condición'} active={sort === 'score'} onPress={() => setSort('score')} />
                        <Chip label={t.alphabetical ?? 'A–Z'} active={sort === 'alfa'} onPress={() => setSort('alfa')} />
                        <Chip label={t.altitude ?? 'Altitud'} active={sort === 'elevation'} onPress={() => setSort('elevation')} />
                      </View>
                    </View>
                  </ScrollView>
                  <View style={[styles.sheetFooter, { paddingBottom: tabBarPadding }]}>
                    {activeFilters > 0 && (
                      <TouchableOpacity style={styles.clearBtn2} onPress={clearAllFilters}>
                        <Text style={styles.clearBtn2Text}>Limpiar filtros</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.applyBtn} onPress={closeFilter}>
                      <Text style={styles.applyBtnText}>
                        Ver {filtered.length} zona{filtered.length !== 1 ? 's' : ''}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

// #4c5240 = web --color-search-bg (solid opaque olive-green used for search-light theme)
const PILL_BG = '#4c5240'

// Shadow applied to pills only when the bar is sticky (isSticky === true, native only).
// On web, shadow is handled via filter:drop-shadow on the searchBar wrapper.
const PILL_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.45,
  shadowRadius: 12,
  elevation: 8,
} as const
const PILL_R = 26

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  // No horizontal padding on the content container — each item manages its own.
  // This avoids double-padding on sticky items (iOS renders stickyHeaderIndices
  // items at full scroll-view width, ignoring contentContainerStyle padding).
  content: { paddingTop: 0 },

  // ── Title row (index 0 — scrolls away) ───────────────────────────────────
  titleRow: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  titleText: {
    fontFamily: Font.displaySemiBold,
    fontSize: 36,     // 28 + 2 (general) + 6 (header extra)
    lineHeight: 44,
    color: Colors.cream,
    letterSpacing: 0.2,
  },
  titleCount: {
    fontFamily: Font.sansLight,
    fontSize: 15,     // +2px
    lineHeight: 20,
    color: Colors.muted,
    marginTop: 2,
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  // stickyBar: in-list version — always renders to preserve the row height.
  // When isSticky=true it becomes invisible (opacity 0) so the fixed overlay
  // shows instead, avoiding any jump or duplicate.
  stickyBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  stickyBarHidden: {
    opacity: 0,        // invisible but still takes up space in the list
  },
  // Fixed overlay version — positioned absolutely at top=insets.top.
  stickyBarFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 20,
  },
  // Shadow applied inline (isSticky-conditional) — not in the static stylesheet
  searchBar: { flexDirection: 'row', gap: 4 },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
    height: 52,
    backgroundColor: PILL_BG,
    borderTopLeftRadius: PILL_R,
    borderBottomLeftRadius: PILL_R,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: Font.sans,
    fontSize: 16,     // +2px
    color: Colors.cream,
    height: 52,
    marginLeft: 10,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  clearBtn: { padding: 4, marginLeft: 4 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 18,
    height: 52,
    gap: 7,
    backgroundColor: PILL_BG,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: PILL_R,
    borderBottomRightRadius: PILL_R,
  },
  filterBtnLabel: {
    fontFamily: Font.sansMedium,
    fontSize: 16,     // +2px
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
  badgeText: { fontFamily: Font.sansMedium, fontSize: 12, color: Colors.cream },

  errorBanner: {
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  errorText: { fontFamily: Font.sans, fontSize: 14, color: Colors.danger },

  // ── Card wrapper — adds vertical spacing and horizontal padding for cards ──
  cardWrapper: { paddingTop: 12, paddingHorizontal: 16 },

  // ── Empty / loading state ─────────────────────────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 16, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyHint: { textAlign: 'center' },

  // ── Animated overlay / filter sheet ──────────────────────────────────────
  // backdrop: web only — solid color + CSS backdropFilter blur applied inline
  backdrop: { backgroundColor: '#232522d9' },
  // backdropOverlay: native — sits inside BlurView to add the dark tint on top of the blur
  backdropOverlay: { backgroundColor: 'rgba(35,37,34,0.55)' },
  sheetWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 101 },
  sheet: {
    // --color-modal = #30372a
    backgroundColor: '#30372a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // maxHeight set inline: windowHeight - 50 (matches web calc(-50px + 100dvh))
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4, paddingHorizontal: 20 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.20)' },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  sheetTitle: { fontFamily: Font.display, fontSize: 22, color: Colors.cream, fontWeight: '600' },
  sheetClose: { padding: 6, borderRadius: 10 },
  sheetBody: { flexShrink: 1 },
  sheetBodyContent: { paddingHorizontal: 20, paddingBottom: 8 },
  filterSection: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: Font.sansMedium, fontSize: 12, color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipFlex: { flex: 1, alignItems: 'center' },
  chipActive: { backgroundColor: Colors.bar },
  chipText: { fontFamily: Font.sansMedium, fontSize: 15, color: 'rgba(244,235,225,0.6)', textAlign: 'center' },
  chipTextActive: { color: Colors.cream },
  sheetFooter: {
    flexDirection: 'row', gap: 10, padding: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    // paddingBottom set inline (= tabBarPadding) so buttons always clear the floating tab bar
  },
  clearBtn2: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center',
  },
  clearBtn2Text: { fontFamily: Font.sansMedium, fontSize: 16, color: Colors.muted },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.bar, alignItems: 'center' },
  applyBtnText: { fontFamily: Font.sansMedium, fontSize: 16, color: Colors.cream },
})
