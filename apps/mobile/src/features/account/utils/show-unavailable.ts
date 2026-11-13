import { Alert } from 'react-native';

export function showUnavailable(feature: string) {
  Alert.alert(
    feature,
    'This feature is part of the account screen design but is not connected to an account service yet.',
  );
}
