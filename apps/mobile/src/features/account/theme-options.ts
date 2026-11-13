import type { ThemePreference } from '@/providers/theme-preference';

export const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'System Default', value: 'system' },
  { label: 'Light Mode', value: 'light' },
  { label: 'Dark Mode', value: 'dark' },
];
