import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-splash-overlay';
import { useThemePreference } from '@/providers/theme-preference';

export function RootLayoutContent() {
  const { colorScheme } = useThemePreference();

  return (
    <NavigationThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="upload" />
      </Stack>
    </NavigationThemeProvider>
  );
}
