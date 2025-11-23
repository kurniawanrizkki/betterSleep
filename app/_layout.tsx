import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import {
  AppNavigationDarkTheme,
  AppNavigationLightTheme,
} from '../constants/theme';

// Komponen pembungkus yang selalu menyediakan NavThemeProvider
function ThemedSlot({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const navTheme = theme.dark ? AppNavigationDarkTheme : AppNavigationLightTheme;

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {children}
    </NavThemeProvider>
  );
}

function RootLayoutNav() {
  const { user, loading: authLoading } = useAuth();
  const { theme, colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, authLoading]);

  if (authLoading) {
    return (
      <ThemedSlot>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ThemedSlot>
    );
  }

  return <ThemedSlot><Slot /></ThemedSlot>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
