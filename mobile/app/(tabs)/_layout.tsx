// Tab navigator — 4 tabs: Zonas · Mapa · Especies · Perfil

import { View, Pressable, StyleSheet, Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Font, useStyles } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'
import { MushroomIcon } from '../../components/icons/MushroomIcon'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

// ── Tab bar background (theme-aware) ──────────────────────────────────────────

function TabBarBackground({ surface, isDark }: { surface: string; isDark: boolean }) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[StyleSheet.absoluteFillObject, {
          backgroundColor: surface,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any]}
      />
    )
  }
  // dimezisBlurView uses hardware bitmaps — crashes in Expo Go (software renderer).
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  return (
    <BlurView
      intensity={55}
      tint={isDark ? 'dark' : 'light'}
      experimentalBlurMethod={isExpoGo ? 'none' : 'dimezisBlurView'}
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
    >
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: surface }]} />
    </BlurView>
  )
}

// ── Tab icon ──────────────────────────────────────────────────────────────────

function TabIcon({
  name,
  focused,
  activeColor,
  inactiveColor,
}: {
  name: IoniconName
  focused: boolean
  activeColor: string
  inactiveColor: string
}) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={24}
      color={focused ? activeColor : inactiveColor}
    />
  )
}

// ── Custom tab button ─────────────────────────────────────────────────────────

function TabBarBtn({ children, style, accessibilityState, activeColor, ...rest }: any) {
  const focused = accessibilityState?.selected ?? false
  return (
    <Pressable
      {...rest}
      accessibilityState={accessibilityState}
      style={[
        style,
        styles.tabBarItem,
        focused && { backgroundColor: activeColor + '1A' }, // 10% opacity
      ]}
    >
      {children}
    </Pressable>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const t = useAppStore((s) => s.t)
  const { colors, isDark } = useStyles()
  const insets = useSafeAreaInsets()
  const tabBarHeight = 59 + insets.bottom

  // Active tab colour: golden-cream in dark, coffee-light in light
  const TAB_ACTIVE   = isDark ? 'rgb(217,206,161)' : colors.accentLight
  const TAB_INACTIVE = isDark ? colors.textPrimary  : colors.textSecondary

  return (
    <Tabs
      screenOptions={{
        // ── Tab bar ─────────────────────────────────────────────────────────
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: tabBarHeight,
        },
        tabBarBackground: () => (
          <TabBarBackground surface={colors.surfaceHeavy} isDark={isDark} />
        ),
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarLabelStyle: {
          fontFamily: Font.sansMedium,
          fontSize: 13,
        },
        tabBarButton: (props) => (
          <TabBarBtn {...props} activeColor={TAB_ACTIVE} />
        ),

        // ── Header ──────────────────────────────────────────────────────────
        headerStyle: {
          backgroundColor: colors.backgroundPanel,
          borderBottomWidth: isDark ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: Font.sansSemiBold,
          color: colors.textPrimary,
        },

        // ── Scene ────────────────────────────────────────────────────────────
        sceneStyle: { backgroundColor: 'transparent' } as any,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.zones,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="location"
              focused={focused}
              activeColor={TAB_ACTIVE}
              inactiveColor={TAB_INACTIVE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: t.map,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="map"
              focused={focused}
              activeColor={TAB_ACTIVE}
              inactiveColor={TAB_INACTIVE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="especies"
        options={{
          title: t.species,
          tabBarIcon: ({ focused }) => (
            <MushroomIcon
              size={24}
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
              filled={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t.profile,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="person"
              focused={focused}
              activeColor={TAB_ACTIVE}
              inactiveColor={TAB_INACTIVE}
            />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginVertical: 6,
    borderRadius: 12,
    paddingVertical: 2,
  },
})
