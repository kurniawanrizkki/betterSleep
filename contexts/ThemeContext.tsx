import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../constants/theme';

export type Theme = 'light' | 'dark';
export type ThemePreference = 'system' | Theme;

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  colors: typeof AppColors.light;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = '@theme_preference';

const useAppTheme = (preference: ThemePreference): Theme => {
  const systemTheme = useColorScheme() as Theme | null;
  if (preference === 'system') {
    return systemTheme || 'light';
  }
  return preference;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  const activeTheme = useAppTheme(themePreference);
  const colors = AppColors[activeTheme];

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && ['system', 'light', 'dark'].includes(stored)) {
          setThemePreferenceState(stored as ThemePreference);
        }
      } catch (e) {
        console.error("Gagal memuat preferensi tema", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreference();
  }, []);

  const setThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, preference);
      setThemePreferenceState(preference);
    } catch (e) {
      console.error("Gagal menyimpan preferensi tema", e);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference,
        colors,
        theme: activeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
