import { Pressable, Text, View } from 'react-native';

import { styles } from '@/features/account/theme-option-row.styles';
import { useTheme } from '@/hooks/use-theme';

type ThemeOptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ThemeOptionRow({ label, selected, onPress }: ThemeOptionRowProps) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.themeOption,
        {
          backgroundColor: selected
            ? colors.backgroundSelected
            : 'transparent',
          borderColor: selected
            ? colors.accent
            : colors.border,
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.themeOptionText, { color: colors.text }]}>
        {label}
      </Text>

      <View
        style={[
          styles.radioOuter,
          {
            borderColor: selected
              ? colors.accent
              : colors.textSecondary,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.radioInner,
              { backgroundColor: colors.accent },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}
