// Background — full-screen gradient wrapper
// Native: expo-linear-gradient
// Web:    injects gradient onto document.body (React Navigation's intermediate
//         DOM wrappers are opaque on web, so setting backgroundImage on a View
//         doesn't cascade through them; body injection is the reliable fix).
//
// The root _layout.tsx renders this at the top level.
// fullScreenModal screens include their own <Background> since they slide in fresh.

import { useEffect } from 'react'
import { Platform, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useStyles } from '../../lib/theme'

const WEB_GRADIENT_DARK  = 'linear-gradient(135deg, #2b3529 0%, #3d4536 50%, #434328 100%)'
const WEB_GRADIENT_LIGHT = 'linear-gradient(135deg, rgb(240,237,230) 0%, rgb(232,226,212) 50%, rgb(224,215,190) 100%)'

interface BackgroundProps {
  children: React.ReactNode
  style?: object
}

export function Background({ children, style }: BackgroundProps) {
  const { grad, colors, isDark } = useStyles()

  if (Platform.OS === 'web') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const body = document.body
      body.style.minHeight = '100%'
      body.style.background = isDark ? WEB_GRADIENT_DARK : WEB_GRADIENT_LIGHT

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
    }, [isDark])

    return (
      <View style={[{ flex: 1, backgroundColor: 'transparent' as any }, style]}>
        {children}
      </View>
    )
  }

  return (
    <LinearGradient
      colors={grad.background.colors}
      locations={grad.background.locations}
      start={grad.background.start}
      end={grad.background.end}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      {children}
    </LinearGradient>
  )
}
