// Background — full-screen gradient wrapper
// Mirrors the web body gradient: linear-gradient(135deg, rgb(43,53,41) → rgb(61,69,54) → rgb(67,66,28))
// Usage: wrap any screen that should render over the gradient background.
//
// The root _layout.tsx renders this once at the top level, so individual
// screens do NOT need to include it unless they have a modal presentation
// (fullScreenModal slides in fresh and needs its own background).

import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, } from '../../constants/Colors'
import { Gradient } from '../../lib/theme'

interface BackgroundProps {
  children: React.ReactNode
  style?: object
}

export function Background({ children, style }: BackgroundProps) {
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
    backgroundColor: Colors.bg, // fallback while gradient renders
  },
})
