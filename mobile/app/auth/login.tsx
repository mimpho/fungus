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
import { Font, useStyles } from '../../lib/theme'
import { Background } from '../../components/ui/Background'
import { useAppStore } from '../../store/useAppStore'
import { login, getMe, saveToken } from '../../services/api'

export default function LoginScreen() {
  const { colors, typo } = useStyles()
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>Fungus</Text>
          <Text style={[typo.bodySmall, styles.subtitle]}>{t.login}</Text>

          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceInput,
              borderColor: colors.border,
              color: colors.textPrimary,
            }]}
            placeholder={t.email}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceInput,
              borderColor: colors.border,
              color: colors.textPrimary,
            }]}
            placeholder={t.password}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          {error && <Text style={[styles.error, { color: Colors.danger }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.green }, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.textPrimary} />
              : <Text style={[styles.btnText, { color: '#ffffff' }]}>{t.login}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.accentLight }]}>{t.noAccount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={[typo.caption, styles.skipText]}>{`Continuar sin cuenta →`}</Text>
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
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
    // color inline
  },
  subtitle: { textAlign: 'center', marginBottom: 36 },
  input: {
    // backgroundColor, borderColor, color set inline from colors.*
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    fontFamily: Font.sans,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    fontFamily: Font.sans,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    // color inline (Fixed.danger)
  },
  btn: {
    // backgroundColor inline (Fixed.green)
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: Font.sansSemiBold, fontSize: 16 /* color: '#ffffff' inline */ },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { fontFamily: Font.sans, fontSize: 14 /* color inline */ },
  skipBtn: { marginTop: 12, alignItems: 'center' },
  skipText: { textAlign: 'center' },
})
