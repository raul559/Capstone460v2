import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  rowSubtitle: { fontSize: 12 },
  chevron: { fontSize: 27, fontWeight: '300' },
});
