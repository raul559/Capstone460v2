import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  preview: {
    height: 300,
    minHeight: 180,
    borderWidth: 1.5,
    borderColor: '#B8CDD6',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F7F8',
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#526873',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
