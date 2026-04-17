// Map screen — scaffold placeholder
// MapLibre implementation in feat/v8-0-map

import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'
import { useAppStore } from '../../store/useAppStore'

export default function MapaScreen() {
  const t = useAppStore((s) => s.t)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t.map}</Text>
      <Text style={styles.sub}>MapLibre · próximamente</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 22, fontWeight: '700', color: Colors.cream },
  sub: { color: Colors.muted, fontSize: 14, marginTop: 8 },
})
