// Zones list — scaffold placeholder
// Full implementation in feat/v8-0-zones

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Colors } from '../../constants/Colors'
import { useAppStore } from '../../store/useAppStore'

export default function ZonasScreen() {
  const t = useAppStore((s) => s.t)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t.zones}</Text>
      <Text style={styles.placeholder}>— {t.loading}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.cream, marginBottom: 16 },
  placeholder: { color: Colors.muted, fontSize: 15 },
})
