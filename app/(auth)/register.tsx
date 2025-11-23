import { router } from 'expo-router';
import { Moon,Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
// IMPOR TEMA
import { AppColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme(); // Gunakan hook tema
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = registerStyles(colors); // Hitung style dinamis

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'Nama lengkap tidak boleh kosong');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password tidak boleh kosong');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password.trim(), fullName.trim());
        Alert.alert('Berhasil Daftar', 'Silahkan cek email anda untuk konfirmasi');
      router.replace('/(auth)')
    } catch (error) {
        console.error(error);
        Alert.alert('Gagal Daftar', 'Gagal membuat akun. Mungkin email sudah terdaftar atau terjadi kesalahan server.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
            {/* Ganti ikon default dengan ikon yang konsisten (contoh: User) */}
            <Moon size={48} color={colors.primary} />
            <Text style={styles.title}>Daftar Akun Baru</Text>
            <Text style={styles.subtitle}>Buat akun Anda untuk memulai perjalanan menuju ketenangan.</Text>
        </View>

        <View style={styles.form}>
            {/* Nama Lengkap Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap</Text>
                <View style={styles.inputWrapper}>
                    <User size={20} color={colors.secondaryText} />
                    <TextInput
                        style={styles.input}
                        placeholder="Masukkan nama lengkap Anda"
                        placeholderTextColor={colors.secondaryText}
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                    />
                </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                    <Mail size={20} color={colors.secondaryText} />
                    <TextInput
                        style={styles.input}
                        placeholder="Masukkan email Anda"
                        placeholderTextColor={colors.secondaryText}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                    <Lock size={20} color={colors.secondaryText} />
                    <TextInput
                        style={styles.input}
                        placeholder="Minimal 6 karakter"
                        placeholderTextColor={colors.secondaryText}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Konfirmasi Password</Text>
                <View style={styles.inputWrapper}>
                    <Lock size={20} color={colors.secondaryText} />
                    <TextInput
                        style={styles.input}
                        placeholder="Ulangi password"
                        placeholderTextColor={colors.secondaryText}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.textLight} />
                ) : (
                    <Text style={styles.registerButtonText}>Daftar</Text>
                )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>Sudah punya akun?</Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                    <Text style={styles.loginLink}>Masuk Sekarang</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Style function yang menggunakan AppColors
const registerStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // DYNAMIC BACKGROUND
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text, // DYNAMIC TEXT
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText, // DYNAMIC SECONDARY TEXT
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text, // DYNAMIC TEXT
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground, // DYNAMIC INPUT BACKGROUND
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border, // DYNAMIC BORDER
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text, // DYNAMIC TEXT
  },
  registerButton: {
    backgroundColor: colors.primary, // DYNAMIC PRIMARY
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight, // DYNAMIC LIGHT TEXT
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  loginText: {
    fontSize: 15,
    color: colors.text, // DYNAMIC TEXT
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary, // DYNAMIC PRIMARY
  },
});
