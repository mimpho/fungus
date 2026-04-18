// Mushroom icon — ported from web IC.mushroom (src/lib/helpers.jsx)
// Two variants: outline (inactive tab) and filled (active tab),
// matching the behavior of Ionicons used in the other tabs.

import Svg, { Path } from 'react-native-svg'

interface MushroomIconProps {
  size?: number
  color?: string
  filled?: boolean
}

export function MushroomIcon({ size = 24, color = '#000', filled = false }: MushroomIconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Cap — filled */}
        <Path
          d="M12 2C7.03 2 3 6.03 3 11h18c0-4.97-4.03-9-9-9z"
          fill={color}
        />
        {/* Stem — closed path so fill works correctly */}
        <Path
          d="M9 11v8a1 1 0 001 1h4a1 1 0 001-1v-8H9Z"
          fill={color}
        />
      </Svg>
    )
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Cap — outline */}
      <Path
        d="M12 2C7.03 2 3 6.03 3 11h18c0-4.97-4.03-9-9-9z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stem — outline */}
      <Path
        d="M9 11v8a1 1 0 001 1h4a1 1 0 001-1v-8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
