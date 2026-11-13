import { useThemePreference } from '@/contexts/theme-preference';

export function useColorScheme() {
  return useThemePreference().colorScheme;
}
