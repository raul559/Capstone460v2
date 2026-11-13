import { Pressable, StyleSheet, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
  themeOption: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeOptionText: { fontSize: 14, fontWeight: '600' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
});
