import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type AppColorScheme = 'light' | 'dark';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  colorScheme: AppColorScheme;
  isLoaded: boolean;
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = '@skinai/theme-preference';

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | undefined>(undefined);

export function ThemePreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] =
    useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPreference() {
      try {
        const savedPreference = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          isActive &&
          (savedPreference === 'system' ||
            savedPreference === 'light' ||
            savedPreference === 'dark')
        ) {
          setPreferenceState(savedPreference);
        }
      } catch (error) {
        console.warn('Could not load theme preference:', error);
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    }

    loadPreference();

    return () => {
      isActive = false;
    };
  }, []);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);

    AsyncStorage.setItem(STORAGE_KEY, nextPreference).catch((error) => {
      console.warn('Could not save theme preference:', error);
    });
  }, []);

  const colorScheme: AppColorScheme =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value = useMemo(
    () => ({
      preference,
      colorScheme,
      isLoaded,
      setPreference,
    }),
    [preference, colorScheme, isLoaded, setPreference]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error(
      'useThemePreference must be used inside ThemePreferenceProvider'
    );
  }

  return context;
}
