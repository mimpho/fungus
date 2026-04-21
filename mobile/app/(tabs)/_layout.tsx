// Tab navigator — 4 tabs: Zonas · Mapa · Especies · Perfil
// Tab bar is positioned absolute (floats above content) with a glass-olive background
// matching the web --glass-olive variable: rgba(63,73,59,0.50) + blur(16px).
// On web the blur is achieved via CSS backdropFilter.
// On native it falls back to glassOlive80 (more opaque) since no expo-blur.

import { View, Pressable, StyleSheet, Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { Font } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'
import { MushroomIcon } from '../../components/icons/MushroomIcon'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

// Active / inactive tab colours
const TAB_ACTIVE   = 'rgb(217,206,161)'   // golden cream — active icon + label
const TAB_INACTIVE = '#f4ebe1'             // cream — inactive icon + label

// Glass-olive background with platform-aware blur
function TabBarBackground() {
  return <View style={styles.tabBarBg} />
}

// Plain icon — no wrapper; the active bg is handled by TabBarBtn below
function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={24}
      color={focused ? TAB_ACTIVE : TAB_INACTIVE}
    />
  )
}

// Custom tab button — wraps icon + label in a single Pressable so the active
// background pill covers both elements, not just the icon.
function TabBarBtn({ children, style, accessibilityState, ...rest }: any) {
  const focused = accessibilityState?.selected ?? false
  return (
    <Pressable
      {...rest}
      accessibilityState={accessibilityState}
      style={[style, styles.tabBarItem, focused && styles.tabBarItemActive]}
    >
      {children}
    </Pressable>
  )
}

export default function TabLayout() {
  const t = useAppStore((s) => s.t)

  return (
    <Tabs
      screenOptions={{
        // ── Tab bar — floats above content ──────────────────────────────────
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,         // remove Android shadow
          backgroundColor: 'transparent',
          height: 59,           // +10px over the standard 49
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarLabelStyle: {
          fontFamily: Font.sansMedium,
          fontSize: 13,
        },
        // Active background pill covers icon + label together
        tabBarButton: (props) => <TabBarBtn {...props} />,

        // ── Header ──────────────────────────────────────────────────────────
        headerStyle: {
          backgroundColor: Colors.modal,
          borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.cream,
        headerTitleStyle: {
          fontFamily: Font.sansSemiBold,
          color: Colors.cream,
        },

        // ── Scene ────────────────────────────────────────────────────────────
        sceneStyle: { backgroundColor: 'transparent' } as any,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.zones,
          tabBarIcon: ({ focused }) => <TabIcon name="location" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: t.map,
          tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} />,
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
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  // Glass-olive background for the floating tab bar.
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.glassOlive80,
    ...(Platform.OS === 'web'
      ? ({
          backgroundColor: Colors.glassOlive,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },

  // Each tab item — pill shape; active state shows the golden-cream background
  // covering both icon and label.
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginVertical: 6,
    borderRadius: 12,
    paddingVertical: 2,
  },
  tabBarItemActive: {
    backgroundColor: 'rgba(217,206,161,0.10)',
  },
})
