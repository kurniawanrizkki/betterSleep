import {
  DarkTheme as RNDarkTheme,
  DefaultTheme as RNDefaultTheme,
  Theme as RNTheme,
} from '@react-navigation/native';

// --- 1. Definisi Tipe Kustom ---

// Definisi Warna Kustom (Harus konsisten dengan semua komponen UI Anda)
export interface AppColors {
  primary: string;
  secondary: string;
  text: string;
  secondaryText: string;
  background: string;
  card: string;
  border: string;
  notification: string;
  textLight: string;
  inputBackground: string;
  danger: string;
  success: string;
  secondaryButton: string;
}

// Definisi Tema Aplikasi Kustom
export interface AppTheme {
  dark: boolean;
  colors: AppColors;
}


// --- 2. Definisi Skema Warna Kustom ---

const LightColors: AppColors = {
  primary: '#5B9BD5',
  secondary: '#8FBC8F',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  background: '#F8F8F8',
  card: '#FFFFFF',
  border: '#E0E0E0',
  notification: '#F1C40F',
  textLight: '#FFFFFF',
  inputBackground: '#FFFFFF',
  danger: '#EF5350',
  success: '#4CAF50',
  secondaryButton: '#F0F0F0',
};

const DarkColors: AppColors = {
  primary: '#7BA5C9',
  secondary: '#A8D8A8',
  text: '#FFFFFF',
  secondaryText: '#BDC3C7',
  background: '#121212',
  card: '#1E1E1E',
  border: '#333333',
  notification: '#F39C12',
  textLight: '#FFFFFF',
  inputBackground: '#282828',
  danger: '#F44336',
  success: '#66BB6A',
  secondaryButton: '#333333',
};

// --- 3. Definisi Tema Aplikasi (Digunakan oleh useTheme) ---
export const LightTheme: AppTheme = {
  dark: false,
  colors: LightColors,
};

export const DarkTheme: AppTheme = {
  dark: true,
  colors: DarkColors,
};

// --- 4. Definisi TEMA NAVIGASI (Digunakan oleh NavThemeProvider) ---
// **INI ADALAH BAGIAN KRITIS UNTUK MEMPERBAIKI ERROR 'regular' of undefined**

// Kita perpanjang (spread) tema default React Navigation untuk memastikan properti
// internal yang dibutuhkan oleh native-stack (seperti konfigurasi font) tetap ada.

export const NavigationLightTheme: RNTheme = {
  ...RNDefaultTheme, // <-- MENGAMBIL SEMUA PROPERTI STANDAR RNDefaultTheme
  colors: {
    ...RNDefaultTheme.colors, // Mengambil properti warna standar
    // Menimpa properti warna yang Anda kelola
    primary: LightColors.primary,
    background: LightColors.background,
    card: LightColors.card,
    text: LightColors.text,
    border: LightColors.border,
    notification: LightColors.notification,
  },
};

export const NavigationDarkTheme: RNTheme = {
  ...RNDarkTheme, // <-- MENGAMBIL SEMUA PROPERTI STANDAR RNDarkTheme
  colors: {
    ...RNDarkTheme.colors, // Mengambil properti warna standar
    // Menimpa properti warna yang Anda kelola
    primary: DarkColors.primary,
    background: DarkColors.background,
    card: DarkColors.card,
    text: DarkColors.text,
    border: DarkColors.border,
    notification: DarkColors.notification,
  },
};