import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
// IMPORT THEME
import {
  NavigationDarkTheme as AppNavigationDarkTheme,
  NavigationLightTheme as AppNavigationLightTheme,
} from '../constants/theme';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const { user, loading: authLoading } = useAuth();
  // GUNAKAN HOOK THEME BARU
  const { theme, colors } = useTheme(); 
  const segments = useSegments();
  const router = useRouter();
  
  // Pilih tema navigasi berdasarkan tema aktif
  const navTheme = theme.dark ? AppNavigationDarkTheme : AppNavigationLightTheme;

  useEffect(() => {
    if (authLoading) return;
    
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      console.log('→ Redirecting to login');
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      console.log('→ Redirecting to home');
      router.replace('/(tabs)');
    }
  }, [user, segments, authLoading]);

  // Tampilkan loading indicator dengan warna tema
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    // Terapkan tema ke NavThemeProvider
    <NavThemeProvider value={navTheme}>
      {/* Atur gaya Status Bar */}
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Slot />
    </NavThemeProvider>
  );
}

// Tambahkan ThemeProvider di lapisan terluar
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
