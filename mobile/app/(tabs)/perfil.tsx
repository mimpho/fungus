// Profile screen — lang selector, theme switch, and login state

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'
import { Fixed } from '../../constants/Colors'
import { Font, useStyles } from '../../lib/theme'
import { useAppStore } from '../../store/useAppStore'
import { Lang, LANGS } from '../../lib/constants'
import type { ThemeMode } from '../../constants/Colors'

// ── Theme options ─────────────────────────────────────────────────────────────

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark',   label: 'Oscuro' },
  { value: 'light',  label: 'Claro'  },
  { value: 'system', label: 'Sistema' },
]

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const { colors, glass } = useStyles()

  const { t, lang, setLang, profile, themeMode, setThemeMode } = useAppStore(
    useShallow((s) => ({
      t:            s.t,
      lang:         s.lang,
      setLang:      s.setLang,
      profile:      s.profile,
      themeMode:    s.themeMode,
      setThemeMode: s.setThemeMode,
    }))
  )

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>

      {/* ── Apariencia (theme) ───────────────────────────────────────────── */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        APARIENCIA
      </Text>
      <View style={[glass.panel, styles.pillContainer]}>
        {THEME_OPTIONS.map((opt) => {
          const active = themeMode === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pillBtn,
                active && { backgroundColor: colors.accent },
              ]}
              onPress={() => setThemeMode(opt.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: active ? colors.textPrimary : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* ── Idioma (language) ────────────────────────────────────────────── */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 28 }]}>
        {t.language?.toUpperCase() ?? 'IDIOMA'}
      </Text>
      <View style={styles.langRow}>
        {LANGS.map((l) => (
          <TouchableOpacity
            key={l}
            style={[
              glass.subtle,
              styles.langBtn,
              lang === l && { backgroundColor: colors.accent },
            ]}
            onPress={() => setLang(l as Lang)}
          >
            <Text
              style={[
                styles.langText,
                { color: lang === l ? colors.textPrimary : colors.textSecondary },
              ]}
            >
              {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Auth state ───────────────────────────────────────────────────── */}
      <View style={[styles.divider, { backgroundColor: colors.borderAccent }]} />

      {profile ? (
        <Text style={[styles.email, { color: colors.textPrimary }]}>{profile.email}</Text>
      ) : (
        <>
          <Text style={[styles.notLogged, { color: colors.textPrimary }]}>{t.notLoggedIn}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>{t.loginToSync}</Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: Fixed.greenF }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.loginBtnText, { color: '#f4ebe1' }]}>{t.login}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
// Colours are passed inline — static styles here are layout + font only.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  sectionLabel: {
    fontFamily: Font.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Theme pill selector
  pillContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    gap: 4,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  pillText: {
    fontFamily: Font.sansMedium,
    fontSize: 13,
  },

  // Language selector
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: { paddingHorizontal: 20, paddingVertical: 8 },
  langText: { fontFamily: Font.sansMedium },

  divider: { height: 1, marginVertical: 28 },

  email: {
    fontFamily: Font.sans,
    fontSize: 15,
  },
  notLogged: {
    fontFamily: Font.displaySemiBold,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 6,
  },
  sub: {
    fontFamily: Font.sans,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
  },
  loginBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnText: { fontFamily: Font.sansSemiBold, fontSize: 16 },
})
