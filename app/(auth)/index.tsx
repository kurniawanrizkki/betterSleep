import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
// IMPOR TEMA
import { AppColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext'; // Ganti useThemes jika path-nya berbeda

const LoginScreen = () => {
    const { colors } = useTheme(); // Gunakan hook tema
    const { signIn, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const styles = loginStyles(colors); // Hitung style dinamis

    const handleLogin = async () => {
        // Validation
        if (!email.trim()) {
            Alert.alert("Error", "Email tidak boleh kosong");
            return;
        }
        if (!password.trim()) {
            Alert.alert("Error", "Password tidak boleh kosong");
            return;
        }

        setLoading(true);
        try {
            await signIn(email.trim(), password.trim());
        } catch (error) {
            console.error(error);
            Alert.alert("Gagal Login", "Email atau password salah. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Google Login Error:", error);
            Alert.alert("Gagal", "Gagal login dengan Google. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Star size={48} color={colors.primary} />
                    <Text style={styles.title}>Selamat Datang Kembali!</Text>
                    <Text style={styles.subtitle}>Masuk untuk melanjutkan perjalanan kesehatan mental Anda.</Text>
                </View>

                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[
                            styles.inputWrapper,
                            emailFocused && { borderColor: colors.primary },
                            { backgroundColor: colors.inputBackground } // Tambahkan background dinamis
                        ]}>
                            <Mail size={20} color={emailFocused ? colors.primary : colors.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan email Anda"
                                placeholderTextColor={colors.secondaryText}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[
                            styles.inputWrapper,
                            passwordFocused && { borderColor: colors.primary },
                            { backgroundColor: colors.inputBackground } // Tambahkan background dinamis
                        ]}>
                            <Lock size={20} color={passwordFocused ? colors.primary : colors.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan password Anda"
                                placeholderTextColor={colors.secondaryText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.secondaryText} />
                                ) : (
                                    <Eye size={20} color={colors.secondaryText} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => { /* Handle Forgot Password */ }}>
                            <Text style={styles.forgotPassword}>Lupa Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textLight} />
                        ) : (
                            <Text style={styles.loginButtonText}>Masuk</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.separatorContainer}>
                        <View style={styles.separator} />
                        <Text style={styles.separatorText}>ATAU</Text>
                        <View style={styles.separator} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={[styles.googleButton, loading && styles.socialButtonDisabled]}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        >
                            <View style={styles.googleIconContainer}>
                                <Text style={styles.googleIcon}>G</Text>
                            </View>
                            <Text style={styles.googleButtonText}>Google</Text>
                        </TouchableOpacity>

                        {/* Apple Button (Teks disederhanakan) */}
                        <TouchableOpacity
                            style={[styles.appleButton, styles.socialButtonDisabled]}
                            disabled={true} // Nonaktifkan Apple karena tidak diimplementasikan
                        >
                            <View style={styles.appleIconContainer}>
                                <Text style={styles.appleIcon}></Text>
                            </View>
                            <Text style={styles.appleButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={styles.registerLinkContainer}>
                        <Text style={styles.registerText}>Belum punya akun?</Text>
                        <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
                            <Text style={styles.registerLink}>Daftar Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Style function yang menggunakan AppColors
const loginStyles = (colors: AppColors) => StyleSheet.create({
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
        color: colors.text, // DYNAMIC TEXT COLOR
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        color: colors.secondaryText, // DYNAMIC SECONDARY TEXT
        marginTop: 8,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text, // DYNAMIC TEXT COLOR
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
        borderColor: colors.border, // DYNAMIC BORDER COLOR
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text, // DYNAMIC TEXT COLOR
    },
    forgotPassword: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary, // DYNAMIC PRIMARY COLOR
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    loginButton: {
        backgroundColor: colors.primary, // DYNAMIC PRIMARY COLOR
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textLight, // DYNAMIC TEXT LIGHT COLOR
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    separator: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border, // DYNAMIC BORDER COLOR
    },
    separatorText: {
        marginHorizontal: 10,
        fontSize: 14,
        color: colors.secondaryText, // DYNAMIC SECONDARY TEXT
        fontWeight: '500',
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    googleButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.card, // DYNAMIC CARD COLOR
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.border, // DYNAMIC BORDER COLOR
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#DD4B39', // Tetap merah Google
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    googleIcon: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textLight,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text, // DYNAMIC TEXT COLOR
    },
    appleButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.card, // DYNAMIC CARD COLOR
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.border, // DYNAMIC BORDER COLOR
    },
    appleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.text, // DYNAMIC (Hitam di light, Putih di dark)
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    appleIcon: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.background, // DYNAMIC (Putih di light, Hitam di dark)
    },
    appleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text, // DYNAMIC TEXT COLOR
    },
    socialButtonDisabled: {
        opacity: 0.6,
    },
    registerLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 5,
    },
    registerText: {
        fontSize: 15,
        color: colors.text, // DYNAMIC TEXT COLOR
    },
    registerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primary, // DYNAMIC PRIMARY COLOR
    },
});

export default LoginScreen;