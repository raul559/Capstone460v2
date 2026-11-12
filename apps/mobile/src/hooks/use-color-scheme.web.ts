import { useSyncExternalStore } from 'react';
import { useThemePreference } from '@/contexts/theme-preference';

const subscribe = () => () => {};

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const { colorScheme } = useThemePreference();

  if (!hasHydrated) {
    return 'light';
  }

  return colorScheme;
}
