// Login screen — email + password
// Full implementation in feat/v8-0-auth

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Colors } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { Background } from '../../components/ui/Background'
import { useAppStore } from '../../store/useAppStore'
import { login, getMe, saveToken } from '../../services/api'

export default function LoginScreen() {
  const { t, setProfile } = useAppStore(useShallow((s) => ({ t: s.t, setProfile: s.setProfile })))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      const { access_token } = await login(email, password)
      await saveToken(access_token)
      const me = await getMe()
      setProfile({ id: me.id, email: me.email, role: me.role, emailVerified: me.email_verified })
      router.replace('/(tabs)')
    } catch {
      setError(t.loginError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Background>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Fungus</Text>
          <Text style={[Typography.bodySmall, styles.subtitle]}>{t.login}</Text>

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
            autoComplete="current-password"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.cream} />
              : <Text style={styles.btnText}>{t.login}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.linkBtn}>
            <Text style={styles.linkText}>{t.noAccount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={[Typography.caption, styles.skipText]}>Continuar sin cuenta →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Background>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  title: {
    fontFamily: Font.display,
    fontSize: 48,
    color: Colors.cream,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: { textAlign: 'center', marginBottom: 36 },
  input: {
    backgroundColor: Colors.glass,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244,235,225,0.06)',
    padding: 14,
    color: Colors.cream,
    fontFamily: Font.sans,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    fontFamily: Font.sans,
    color: Colors.danger,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: Font.sansSemiBold, color: Colors.cream, fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { fontFamily: Font.sans, color: Colors.coffeeLight, fontSize: 14 },
  skipBtn: { marginTop: 12, alignItems: 'center' },
  skipText: { textAlign: 'center' },
})
