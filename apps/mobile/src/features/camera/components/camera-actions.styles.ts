import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#167D9A',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 22,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  useButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#245B45',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
