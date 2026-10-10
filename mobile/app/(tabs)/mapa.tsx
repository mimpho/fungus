// Map screen — MapLibre native map, zones as markers coloured by score
// Entry point to zone detail (same as list view, different interaction)
// Full implementation in feat/v8-0-map

import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'
import { Typography } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'

export default function MapaScreen() {
  const t = useAppStore((s) => s.t)

  return (
    <View style={styles.container}>
      <Text style={Typography.h2}>{t.map}</Text>
      <Text style={[Typography.bodySmall, styles.sub]}>MapLibre · feat/v8-0-map</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep, // Deep bg for map (no gradient — map fills this)
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: { marginTop: 8 },
})
