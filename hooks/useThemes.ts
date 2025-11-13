// hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * Hook untuk mendapatkan skema warna saat ini (light atau dark).
 * Mengembalikan objek warna yang relevan berdasarkan preferensi sistem pengguna.
 */
export function useTheme() {
  // Ambil preferensi mode dari sistem operasi
  const colorScheme = useColorScheme(); 
  
  // Pilih skema warna dari Colors.ts
  const themeColors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return {
    // Gabungkan warna universal dengan skema warna spesifik
    colors: {
      ...themeColors,
      accent: Colors.accent,
      success: Colors.success,
      warning: Colors.warning,
      // Tambahkan warna universal lain jika diperlukan
    },
    colorScheme, // 'light' atau 'dark'
  };
}
