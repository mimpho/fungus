// HeroIcons — star and close, ported from web IC object (src/lib/helpers.jsx)
// Used in zone and species detail hero buttons.

import Svg, { Path } from 'react-native-svg'

interface IconProps {
  size?: number
  color?: string
}

interface StarIconProps extends IconProps {
  filled?: boolean
}

export function StarIcon({ size = 20, color = 'rgba(255,255,255,0.80)', filled = false }: StarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        stroke={color}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </Svg>
  )
}

export function CloseIcon({ size = 20, color = 'rgba(255,255,255,0.80)' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        stroke={color}
        d="M6 18L18 6M6 6l12 12"
      />
    </Svg>
  )
}
