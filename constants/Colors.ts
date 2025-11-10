// constants/Colors.ts (Versi Dual Mode)

const tintColorLight = '#36454F'; // Deep Indigo
const tintColorDark = '#F7F8FC'; // Background lembut untuk dark mode

export const Colors = {
  // Warna universal
  accent: '#00A389',       // Tranquil Teal (Aksen Ketenangan)
  success: '#66BB6A',      // Hijau Sukses
  warning: '#FFB74D',      // Kuning Warning

  // Skema Warna Terang (Light Mode)
  light: {
    primary: '#36454F',      // Deep Indigo (Teks & Kartu Utama)
    background: '#F7F8FC',   // Latar belakang lembut (hampir putih)
    card: '#FFFFFF',         // Latar belakang Kartu
    text: '#263238',         // Teks utama gelap
    secondaryText: '#757575',// Teks sekunder
    tint: tintColorLight,    // Warna utama (Deep Indigo)
    tabIconDefault: '#90A4AE',
    tabIconSelected: tintColorLight,
  },

  // Skema Warna Gelap (Dark Mode)
  dark: {
    primary: '#F7F8FC',      // Putih/Off-White (untuk Teks & Kartu Utama)
    background: '#121212',   // Latar belakang sangat gelap (Pure Black/Dark Grey)
    card: '#1D1D1D',         // Latar belakang Kartu gelap (sedikit lebih terang dari background)
    text: '#E0E0E0',         // Teks utama terang
    secondaryText: '#B0BEC5',// Teks sekunder
    tint: tintColorDark,     // Warna utama (Putih/Off-White)
    tabIconDefault: '#90A4AE',
    tabIconSelected: tintColorDark,
  },
};
