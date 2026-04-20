// ScoreBar — horizontal progress bar with colour coded by score
// Mirrors the web's progress-bar / progress-fill pattern

import { View, StyleSheet } from 'react-native'
import { getScoreColor } from '../../constants/Colors'

interface ScoreBarProps {
  score: number
  height?: number
}

export function ScoreBar({ score, height = 6 }: ScoreBarProps) {
  const color = getScoreColor(score)
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${Math.min(score, 100)}%`, backgroundColor: color, height }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 99,
  },
})
