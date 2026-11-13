import { Text } from 'react-native';

import { styles } from '@/features/account/components/account-appearance-options.styles';
import { ThemeOptionRow } from '@/features/account/components/theme-option-row';
import { THEME_OPTIONS } from '@/features/account/utils/theme-options';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/providers/theme-preference';

export function AccountAppearanceOptions() {
  const colors = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <>
      <Text
        style={[
          styles.appearanceDescription,
          { color: colors.textSecondary },
        ]}
      >
        Choose how SkinAI looks on your device.
      </Text>

      {THEME_OPTIONS.map((option) => (
        <ThemeOptionRow
          key={option.value}
          label={option.label}
          selected={preference === option.value}
          onPress={() => setPreference(option.value)}
        />
      ))}
    </>
  );
}
