import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';
// Pastikan Anda telah menginstal @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors, AppTheme, DarkTheme, LightTheme } from '../constants/theme';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: AppTheme;
  colors: AppColors;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user-theme-preference';

// Hook kustom untuk digunakan di komponen
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const systemColorScheme = useSystemColorScheme(); // Tema dari OS ('light' atau 'dark')
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(LightTheme);
  const [loading, setLoading] = useState(true);

  // Muat preferensi tema dari penyimpanan lokal
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedPreference && ['light', 'dark', 'system'].includes(storedPreference)) {
          setThemePreferenceState(storedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Hitung dan terapkan tema aktif
  useEffect(() => {
    let activeTheme: AppTheme;

    if (themePreference === 'system') {
      activeTheme = (systemColorScheme === 'dark') ? DarkTheme : LightTheme;
    } else {
      activeTheme = (themePreference === 'dark') ? DarkTheme : LightTheme;
    }

    // Mengatur gaya status bar global
    Appearance.setColorScheme(activeTheme.dark ? 'dark' : 'light');

    setCurrentTheme(activeTheme);
  }, [themePreference, systemColorScheme]);

  // Fungsi untuk memperbarui preferensi tema dan menyimpannya
  const setThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  if (loading) {
    // Tampilkan null saat loading (akan digantikan oleh RootLayoutNav saat tema dimuat)
    return null; 
  }

  const value: ThemeContextType = {
    theme: currentTheme,
    colors: currentTheme.colors,
    themePreference,
    setThemePreference,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};