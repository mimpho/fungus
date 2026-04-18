// Zone detail — bottom sheet modal
// Full implementation in feat/v8-0-zones

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { Background } from '../../components/ui/Background'

export default function ZonaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <Background>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.sectionLabel}>Zona</Text>
        <Text style={Typography.h1}>{id}</Text>
        <Text style={[Typography.bodySmall, styles.sub]}>Detalle próximamente</Text>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  closeText: { fontFamily: 'DMSans_400Regular', color: Colors.muted, fontSize: 18 },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  sub: { marginTop: 8 },
})
