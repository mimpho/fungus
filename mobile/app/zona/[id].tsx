// Zone detail — bottom sheet modal
// Full implementation in feat/v8-0-zones

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Colors } from '../../constants/Colors'

export default function ZonaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Zona</Text>
      <Text style={styles.id}>{id}</Text>
      <Text style={styles.sub}>Detalle próximamente</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.modal, padding: 24, paddingTop: 48 },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  closeText: { color: Colors.muted, fontSize: 18 },
  label: { fontSize: 13, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  id: { fontSize: 22, fontWeight: '700', color: Colors.cream, marginBottom: 8 },
  sub: { color: Colors.muted, fontSize: 14 },
})
