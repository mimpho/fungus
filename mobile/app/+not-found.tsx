import { Link, Stack } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.cream },
  link: { marginTop: 20, paddingVertical: 12 },
  linkText: { fontSize: 14, color: Colors.coffeeLight },
})
