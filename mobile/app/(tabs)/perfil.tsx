// Profile screen — lang selector + login state
// Full implementation in feat/v8-0-auth

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Colors } from '../../constants/Colors'
import { Typography, Glass, Font } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'
import { Lang, LANGS } from '../../lib/constants'

export default function PerfilScreen() {
  // useShallow: shallow comparison so Zustand doesn't re-render on every call
  const { t, lang, setLang, profile } = useAppStore(useShallow((s) => ({
    t: s.t,
    lang: s.lang,
    setLang: s.setLang,
    profile: s.profile,
  })))

  return (
    <View style={styles.container}>
      {/* Language selector */}
      <Text style={styles.section}>{t.language}</Text>
      <View style={styles.langRow}>
        {LANGS.map((l) => (
          <TouchableOpacity
            key={l}
            style={[Glass.subtle, styles.langBtn, lang === l && styles.langBtnActive]}
            onPress={() => setLang(l as Lang)}
          >
            <Text style={[styles.langText, lang === l && styles.langTextActive]}>
              {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Auth state */}
      <View style={styles.divider} />
      {profile ? (
        <Text style={[Typography.body, styles.email]}>{profile.email}</Text>
      ) : (
        <>
          <Text style={Typography.h3}>{t.notLoggedIn}</Text>
          <Text style={[Typography.bodySmall, styles.sub]}>{t.loginToSync}</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginBtnText}>{t.login}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 24 },
  section: {
    fontFamily: Font.sansMedium,
    fontSize: 11,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: { paddingHorizontal: 20, paddingVertical: 8 },
  langBtnActive: { backgroundColor: Colors.coffee, borderColor: Colors.coffee },
  langText: { fontFamily: Font.sansMedium, color: Colors.muted },
  langTextActive: { color: Colors.cream },
  divider: { height: 1, backgroundColor: Colors.coffee + '33', marginVertical: 28 },
  email: { color: Colors.cream },
  sub: { marginBottom: 24, marginTop: 4 },
  loginBtn: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnText: { fontFamily: Font.sansSemiBold, color: Colors.cream, fontSize: 16 },
})
