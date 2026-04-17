// Register screen — scaffold
// Full implementation in feat/v8-0-auth

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Colors } from '../../constants/Colors'
import { useAppStore } from '../../store/useAppStore'
import { register, getMe, saveToken } from '../../services/api'

export default function RegisterScreen() {
  const { t, setProfile } = useAppStore(useShallow((s) => ({ t: s.t, setProfile: s.setProfile })))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister() {
    setLoading(true)
    setError(null)
    try {
      const { access_token } = await register(email, password)
      await saveToken(access_token)
      const me = await getMe()
      setProfile({ id: me.id, email: me.email, role: me.role, emailVerified: me.email_verified })
      router.replace('/(tabs)')
    } catch (e: any) {
      setError(e?.message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>{t.register}</Text>

        <TextInput
          style={styles.input}
          placeholder={t.email}
          placeholderTextColor={Colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder={t.password}
          placeholderTextColor={Colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.cream} />
            : <Text style={styles.btnText}>{t.register}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkText}>{t.alreadyAccount}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.cream, marginBottom: 32 },
  input: {
    backgroundColor: Colors.modal, borderRadius: 10,
    padding: 14, color: Colors.cream, fontSize: 16,
    borderWidth: 1, borderColor: Colors.coffee + '55',
    marginBottom: 12,
  },
  error: { color: Colors.danger, fontSize: 14, marginBottom: 8 },
  btn: {
    backgroundColor: Colors.green, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.cream, fontWeight: '700', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: Colors.coffeeLight, fontSize: 14 },
})
