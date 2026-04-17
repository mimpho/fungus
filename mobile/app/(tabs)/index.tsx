// Dashboard — top zones by score today
// Phase 1 scaffold: shows placeholder UI. Data fetch implemented in feat/v8-0-dashboard.

import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { Colors } from '../../constants/Colors'
import { useAppStore } from '../../store/useAppStore'

export default function DashboardScreen() {
  const t = useAppStore((s) => s.t)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t.topZones}</Text>
      <View style={styles.placeholder}>
        <ActivityIndicator color={Colors.green} />
        <Text style={styles.placeholderText}>{t.loading}</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.cream,
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  placeholderText: {
    color: Colors.muted,
    fontSize: 15,
  },
})
