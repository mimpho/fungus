// Background — full-screen gradient wrapper
// Native: expo-linear-gradient
// Web:    injects gradient onto document.body (React Navigation's intermediate
//         DOM wrappers are opaque on web, so setting backgroundImage on a View
//         doesn't cascade through them; body injection is the reliable fix).
//
// The root _layout.tsx renders this at the top level.
// fullScreenModal screens include their own <Background> since they slide in fresh.

import { useEffect } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '../../constants/Colors'
import { Gradient } from '../../lib/theme'

const WEB_GRADIENT =
  'linear-gradient(135deg, #2b3529 0%, #3d4536 50%, #434328 100%)'

interface BackgroundProps {
  children: React.ReactNode
  style?: object
}

export function Background({ children, style }: BackgroundProps) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const body = document.body
      body.style.minHeight = '100%'
      body.style.background = WEB_GRADIENT

      // React Navigation injects background-color: rgb(242,242,242) as inline
      // style on its wrapper divs. Inline styles can't be overridden with normal
      // CSS, but attribute selectors with !important can.
      const styleTag = document.createElement('style')
      styleTag.id = 'fungus-nav-transparent'
      styleTag.textContent = `
        div[style*="background-color: rgb(242, 242, 242)"] {
          background-color: transparent !important;
        }
      `
      document.head.appendChild(styleTag)

      return () => {
        body.style.background = ''
        document.getElementById('fungus-nav-transparent')?.remove()
      }
    }, [])

    return (
      <View style={[styles.container, styles.webContainer, style]}>
        {children}
      </View>
    )
  }

  return (
    <LinearGradient
      colors={Gradient.background.colors}
      locations={Gradient.background.locations}
      start={Gradient.background.start}
      end={Gradient.background.end}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  webContainer: {
    // Transparent so the body gradient shows through
    backgroundColor: 'transparent' as any,
  },
})
