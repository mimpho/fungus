// Species catalogue — scaffold placeholder
// Full implementation in feat/v8-0-species

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Typography } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'

export default function EspeciesScreen() {
  const t = useAppStore((s) => s.t)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={Typography.h2}>{t.species}</Text>
      <Text style={[Typography.bodySmall, styles.placeholder]}>— {t.loading}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16 },
  placeholder: { marginTop: 12 },
})
