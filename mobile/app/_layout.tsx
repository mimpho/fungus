import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useAppStore } from '../store/useAppStore'
import { Colors } from '../constants/Colors'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    hydrate().finally(() => SplashScreen.hideAsync())
  }, [])

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.modal },
          headerTintColor: Colors.cream,
          headerTitleStyle: { color: Colors.cream },
          contentStyle: { backgroundColor: Colors.bg },
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
          options={{ title: 'Crear cuenta', headerBackTitle: 'Atrás' }}
        />
      </Stack>
    </>
  )
}
