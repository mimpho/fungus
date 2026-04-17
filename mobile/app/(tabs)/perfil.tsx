// Profile screen — lang selector + login state
// Full implementation in feat/v8-0-auth

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Colors } from '../../constants/Colors'
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
            style={[styles.langBtn, lang === l && styles.langBtnActive]}
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
        <Text style={styles.email}>{profile.email}</Text>
      ) : (
        <>
          <Text style={styles.notLogged}>{t.notLoggedIn}</Text>
          <Text style={styles.sub}>{t.loginToSync}</Text>
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
  container: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  section: { fontSize: 13, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.coffee,
  },
  langBtnActive: { backgroundColor: Colors.coffee },
  langText: { color: Colors.muted, fontWeight: '600' },
  langTextActive: { color: Colors.cream },
  divider: { height: 1, backgroundColor: Colors.coffee + '33', marginVertical: 28 },
  email: { color: Colors.cream, fontSize: 16 },
  notLogged: { color: Colors.cream, fontSize: 16, marginBottom: 6 },
  sub: { color: Colors.muted, fontSize: 14, marginBottom: 24 },
  loginBtn: {
    backgroundColor: Colors.green, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  loginBtnText: { color: Colors.cream, fontWeight: '700', fontSize: 16 },
})
