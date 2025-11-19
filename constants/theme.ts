import { Theme as NavigationTheme } from '@react-navigation/native';

// Definisikan tipe untuk properti warna
export interface AppColors {
  primary: string;
  text: string;
  secondaryText: string;
  background: string;
  card: string;
  border: string;
  notification: string;
  textLight: string;
  success: string;
  warning: string;
  danger: string;
  inputBackground: string;
  secondaryButton: string;
}

export interface AppTheme {
  dark: boolean;
  colors: AppColors;
}

// --- LIGHT THEME ---
const LIGHT_BASE_COLORS = {
  primary: '#5B9BD5', // Biru utama
  text: '#2C3E50',    // Teks utama gelap
  secondaryText: '#7F8C8D', // Teks sekunder
  textLight: '#FFFFFF', // Teks di atas latar belakang gelap (misal tombol)
  success: '#4CAF50',
  warning: '#FFA726',
  danger: '#EF5350',
  lightBg: '#E8F4F8',
};

export const LightTheme: AppTheme = {
  dark: false,
  colors: {
    ...LIGHT_BASE_COLORS,
    background: '#F5F9FC', // Latar belakang aplikasi terang
    card: '#FFFFFF', // Latar belakang kartu/elemen terang
    border: LIGHT_BASE_COLORS.lightBg,
    notification: LIGHT_BASE_COLORS.primary,
    inputBackground: '#FFFFFF',
    secondaryButton: LIGHT_BASE_COLORS.lightBg,
  },
};

// --- DARK THEME ---
export const DarkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: '#9BBFE0', // Primary lebih terang untuk latar gelap
    text: '#EAEAEA', // Teks utama terang
    secondaryText: '#9AAAB7', // Teks sekunder lebih terang
    background: '#121212', // Latar belakang aplikasi gelap
    card: '#1E1E1E', // Kartu lebih gelap dari latar belakang
    border: '#333333',
    notification: '#9BBFE0',
    textLight: '#121212', // Teks di atas latar belakang terang (misal tombol primary)
    success: '#66BB6A',
    warning: '#FFB74D',
    danger: '#EF5350',
    inputBackground: '#2C2C2C', // Input yang sedikit lebih terang dari card
    secondaryButton: '#2C2C2C',
  },
};

// Mappings untuk @react-navigation/native
export const NavigationLightTheme: NavigationTheme = {
  dark: LightTheme.dark,
  colors: {
    primary: LightTheme.colors.primary,
    background: LightTheme.colors.background,
    card: LightTheme.colors.card,
    text: LightTheme.colors.text,
    border: LightTheme.colors.border,
    notification: LightTheme.colors.notification,
  },
};

export const NavigationDarkTheme: NavigationTheme = {
  dark: DarkTheme.dark,
  colors: {
    primary: DarkTheme.colors.primary,
    background: DarkTheme.colors.background,
    card: DarkTheme.colors.card,
    text: DarkTheme.colors.text,
    border: DarkTheme.colors.border,
    notification: DarkTheme.colors.notification,
  },
};