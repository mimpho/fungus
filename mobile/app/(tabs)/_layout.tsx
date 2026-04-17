import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { useAppStore } from '../../store/useAppStore'

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
        },
        tabBarActiveTintColor: Colors.cream,
        tabBarInactiveTintColor: Colors.coffee,
        tabBarLabelStyle: { fontSize: 11 },
        headerStyle: { backgroundColor: Colors.modal },
        headerTintColor: Colors.cream,
        headerTitleStyle: { fontWeight: '600', color: Colors.cream },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.dashboard,
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="zonas"
        options={{
          title: t.zones,
          tabBarIcon: ({ focused }) => <TabIcon name="location" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="especies"
        options={{
          title: t.species,
          tabBarIcon: ({ focused }) => <TabIcon name="leaf" focused={focused} />,
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
        name="perfil"
        options={{
          title: t.profile,
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
