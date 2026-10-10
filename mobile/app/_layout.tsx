import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond'
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../lib/theme'
import { Background } from '../components/ui/Background'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const hydrate = useAppStore((s) => s.hydrate)
  const { colors, isDark } = useStyles()

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      hydrate().finally(() => SplashScreen.hideAsync())
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Background>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor="transparent"
        translucent
      />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundPanel },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontFamily: 'DMSans_600SemiBold',
          },
          contentStyle: { backgroundColor: 'transparent' } as any,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="zona/[id]"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="especie/[id]"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: 'Crear cuenta',
            headerBackTitle: 'Atrás',
            headerTitleStyle: {
              fontFamily: 'DMSans_600SemiBold',
              color: colors.textPrimary,
            },
          }}
        />
      </Stack>
    </Background>
  )
}
