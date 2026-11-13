import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  notificationRow: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  rowSubtitle: { fontSize: 12 },
});
