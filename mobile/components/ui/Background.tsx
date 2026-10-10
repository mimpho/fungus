// Background — full-screen gradient wrapper
// Native: expo-linear-gradient
// Web:    injects gradient onto document.body (React Navigation's intermediate
//         DOM wrappers are opaque on web, so setting backgroundImage on a View
//         doesn't cascade through them; body injection is the reliable fix).
//
// The root _layout.tsx renders this at the top level.
// fullScreenModal screens include their own <Background> since they slide in fresh.

import { Platform, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useStyles } from '../../lib/theme'

interface BackgroundProps {
  children: React.ReactNode
  style?: object
}

export function Background({ children, style }: BackgroundProps) {
  const { grad, colors, isDark } = useStyles()

  // Build the CSS gradient string from the same palette tokens used on native.
  // This guarantees web and native always use the same colours.
  const [a, b, c] = grad.background.colors
  const webGradient = `linear-gradient(135deg, ${a} 0%, ${b} 50%, ${c} 100%)`

  if (Platform.OS === 'web') {
    // Web (dev/preview only — real target is Android).
    // React Navigation injects opaque background-color on its wrapper divs and
    // fighting it is a losing battle. Use a solid background color instead.
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
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
