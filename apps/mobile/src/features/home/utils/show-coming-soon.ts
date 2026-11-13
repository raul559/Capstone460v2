import { Alert } from 'react-native';

export function showComingSoon(feature: string) {
  Alert.alert(
    `${feature} coming soon`,
    'This feature will be connected when its screen is implemented.'
  );
}
