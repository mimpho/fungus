// Tab navigator — 4 tabs: Zonas · Mapa · Especies · Perfil
// No Dashboard: Zonas (list) is the home screen.
// Map is a primary tab at the same level as the list — native map experience
// warrants its own entry point (geolocation, touch gestures, proximity queries).

import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { Font } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'
import { MushroomIcon } from '../../components/icons/MushroomIcon'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={24}
      color={focused ? Colors.cream : Colors.coffee}
    />
  )
}

export default function TabLayout() {
  const t = useAppStore((s) => s.t)

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.modal,
          borderTopColor: Colors.coffee + '33',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.cream,
        tabBarInactiveTintColor: Colors.coffee,
        tabBarLabelStyle: {
          fontFamily: Font.sansMedium,
          fontSize: 11,
        },
        headerStyle: { backgroundColor: Colors.modal },
        headerTintColor: Colors.cream,
        headerTitleStyle: {
          fontFamily: Font.sansSemiBold,
          color: Colors.cream,
        },
        // Transparent so the root gradient background shows through each screen
        sceneStyle: { backgroundColor: 'transparent' },
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
              color={focused ? Colors.cream : Colors.coffee}
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
