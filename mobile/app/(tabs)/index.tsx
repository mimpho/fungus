// Zonas — list view + map toggle
// This is the home tab (index = first tab in expo-router)
// Full implementation in feat/v8-0-zones
// Map toggle: switches between FlatList and MapLibre view within this screen

import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { Colors } from '../../constants/Colors'
import { Typography } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'

export default function ZonasScreen() {
  const t = useAppStore((s) => s.t)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={Typography.h2}>{t.zones}</Text>
      <View style={styles.placeholder}>
        <ActivityIndicator color={Colors.green} />
        <Text style={Typography.bodySmall}>{t.loading}</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16 },
  placeholder: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60, gap: 12,
  },
})
