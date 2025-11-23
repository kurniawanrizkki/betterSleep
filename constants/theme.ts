// constants/theme.ts

import { DefaultTheme, Theme } from "@react-navigation/native";

export const AppColors = {
  light: {
    primary: "#5B9BD5",
    primaryDark: "#4A6FA5",
    accent: "#8AACC8",
    background: "#F7F9FC",
    card: "#FFFFFF",
    text: "#2C3E50",
    secondaryText: "#7F8C8D",
    textLight: "#FFFFFF",
    border: "#E0E0E0",
    inputBackground: "#F0F0F0",
    success: "#4CAF50",
    warning: "#FFA726",
    danger: "#EF5350",
    secondaryButton: "#E8F4F8",
    dark: false,
  },
  dark: {
    primary: "#5B9BD5",
    primaryDark: "#4A6FA5",
    accent: "#8AACC8",
    background: "#121212",
    card: "#1E1E1E",
    text: "#E0E0E0",
    secondaryText: "#A0A0A0",
    textLight: "#FFFFFF",
    border: "#333333",
    inputBackground: "#262626",
    success: "#66BB6A",
    warning: "#FFB74D",
    danger: "#EF5350",
    secondaryButton: "#2E2E2E",
    dark: true,
  },
};

// Ambil font dari tema default React Navigation agar tidak undefined
const defaultFonts = DefaultTheme.fonts;

export const AppNavigationLightTheme: Theme = {
  dark: false,
  colors: {
    primary: AppColors.light.primary,
    background: AppColors.light.background,
    card: AppColors.light.card,
    text: AppColors.light.text,
    border: AppColors.light.border,
    notification: AppColors.light.danger,
  },
  fonts: defaultFonts, // ✅ Ini mencegah error 'regular' of undefined
};

export const AppNavigationDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: AppColors.dark.primary,
    background: AppColors.dark.background,
    card: AppColors.dark.card,
    text: AppColors.dark.text,
    border: AppColors.dark.border,
    notification: AppColors.dark.danger,
  },
  fonts: defaultFonts, // ✅ Ini mencegah error 'regular' of undefined
};
