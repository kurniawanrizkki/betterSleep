import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Moon, Star } from 'lucide-react-native';
import { useTheme } from '../hooks/useThemes';

const simulateLogin = (email, password) => {
    if (email && password) {
        return true; 
    }
    return false;
};

const LoginScreen = () => {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const styles = loginStyles(colors);

    const handleLogin = () => {
        if (simulateLogin(email, password)) {
            router.replace('/(tabs)/index'); 
        } else {
            Alert.alert("Gagal Masuk", "Silakan masukkan email dan kata sandi yang valid.");
        }
    };

    const handleGoogleLogin = () => {
        Alert.alert("Fitur Google Login", "Implementasi Google Sign-In akan terintegrasi di sini.");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Decorative Elements */}
                <View style={styles.decorativeContainer}>
                    <View style={[styles.decorativeCircle, styles.circle1]} />
                    <View style={[styles.decorativeCircle, styles.circle2]} />
                </View>

                {/* Enhanced Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Moon color={colors.primary} size={48} />
                        <View style={styles.starContainer}>
                            <Star color={colors.accent} size={16} fill={colors.accent} />
                        </View>
                    </View>
                    <Text style={styles.appTitle}>Sleep Better</Text>
                    <Text style={styles.subtitle}>Mulai Tidur Berkualitas Malam Ini ✨</Text>
                </View>

                {/* Welcome Message */}
                <View style={styles.welcomeBox}>
                    <Text style={styles.welcomeText}>Selamat datang kembali!</Text>
                </View>

                {/* Enhanced Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Alamat Email</Text>
                    <View style={[
                        styles.inputWrapper,
                        emailFocused && styles.inputWrapperFocused
                    ]}>
                        <View style={styles.inputIconContainer}>
                            <Mail color={emailFocused ? colors.accent : colors.secondaryText} size={20} />
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholder="nama@email.com"
                            placeholderTextColor={colors.secondaryText + '90'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                        />
                    </View>
                </View>

                {/* Enhanced Password Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Kata Sandi</Text>
                    <View style={[
                        styles.inputWrapper,
                        passwordFocused && styles.inputWrapperFocused
                    ]}>
                        <View style={styles.inputIconContainer}>
                            <Lock color={passwordFocused ? colors.accent : colors.secondaryText} size={20} />
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Masukkan kata sandi"
                            placeholderTextColor={colors.secondaryText + '90'}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                        <TouchableOpacity 
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff color={colors.secondaryText} size={20} />
                            ) : (
                                <Eye color={colors.secondaryText} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.forgotPasswordButton}>
                    <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
                </TouchableOpacity>

                {/* Enhanced Primary Button */}
                <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Masuk</Text>
                </TouchableOpacity>

                {/* Enhanced Separator */}
                <View style={styles.separatorContainer}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>Atau masuk dengan</Text>
                    <View style={styles.separatorLine} />
                </View>

                {/* Enhanced Social Buttons */}
                <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.googleButton} 
                        onPress={handleGoogleLogin}
                        activeOpacity={0.8}
                    >
                        <View style={styles.googleIconContainer}>
                            <Text style={styles.googleIcon}>G</Text>
                        </View>
                        <Text style={styles.googleButtonText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.appleButton}
                        activeOpacity={0.8}
                    >
                        <View style={styles.appleIconContainer}>
                            <Text style={styles.appleIcon}></Text>
                        </View>
                        <Text style={styles.appleButtonText}>Apple</Text>
                    </TouchableOpacity>
                </View>

                {/* Enhanced Register Link */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Belum punya akun? </Text>
                    <TouchableOpacity onPress={() => router.push('/register')}>
                        <Text style={styles.registerLink}>Daftar Sekarang</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const loginStyles = (colors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    decorativeContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        overflow: 'hidden',
    },
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.05,
    },
    circle1: {
        width: 200,
        height: 200,
        backgroundColor: colors.primary,
        top: -50,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        backgroundColor: colors.accent,
        top: 100,
        left: -30,
    },
    headerContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    starContainer: {
        position: 'absolute',
        top: -8,
        right: -8,
    },
    appTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.accent,
        marginTop: 8,
        fontWeight: '500',
    },
    welcomeBox: {
        backgroundColor: colors.accent + '10',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
    },
    welcomeText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWrapperFocused: {
        borderColor: colors.accent,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputIconContainer: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    eyeButton: {
        padding: 4,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: colors.accent,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: colors.accent,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.card,
        letterSpacing: 0.5,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.secondaryText + '30',
    },
    separatorText: {
        paddingHorizontal: 16,
        color: colors.secondaryText,
        fontSize: 14,
        fontWeight: '500',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    googleButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.secondaryText + '20',
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    googleIcon: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    appleButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.secondaryText + '20',
    },
    appleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    appleIcon: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    appleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    registerContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '500',
    },
    registerLink: {
        fontSize: 15,
        color: colors.accent,
        fontWeight: '800',
    },
});

export default LoginScreen;
