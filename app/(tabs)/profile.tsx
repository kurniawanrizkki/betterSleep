import { useRouter } from 'expo-router';
import {
  Clock,
  Edit2,
  Heart,
  LogOut,
  Mail,
  Moon,
  Save,
  User,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { supabase } from '../../lib/supabase';
// IMPORT THEME
import { AppColors } from '../../constants/theme';
import { ThemePreference, useTheme } from '../../contexts/ThemeContext';

// HAPUS hardcoded 'const colors = { ... };'

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const mockStats = {
    totalGratitude: 42,
    avgSleep: 7.5,
    lastMeditated: "2 Hari Lalu",
};

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    // Gunakan hook tema
    const { colors, theme, themePreference, setThemePreference } = useTheme(); 
    const styles = profileStyles(colors);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    const router = useRouter();

    // Data opsi tema
    const themeOptions: { label: string, value: ThemePreference, icon: string }[] = [
        { label: 'Terang', value: 'light', icon: '☀️' },
        { label: 'Gelap', value: 'dark', icon: '🌙' },
        { label: 'Otomatis', value: 'system', icon: '📱' },
    ];

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            if (!user?.id) throw new Error('No user');
            
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`id, email, full_name, avatar_url, created_at`)
                .eq('id', user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setProfile(data);
                setNewFullName(data.full_name || '');
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };
    
    const updateProfile = async () => {
        if (!newFullName.trim()) {
            Alert.alert('Error', 'Nama lengkap tidak boleh kosong');
            return;
        }

        try {
            const updates = {
                id: user?.id,
                full_name: newFullName.trim(),
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            Alert.alert('Berhasil', 'Profil berhasil diperbarui!');
            setProfile(p => p ? { ...p, full_name: newFullName.trim() } : null);
            setIsEditing(false);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Gagal Update', error.message);
            }
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    {/* Placeholder Avatar */}
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                        <User size={64} color={colors.primary} />
                    </View>
                    
                    {/* User Info */}
                    <View style={styles.userInfo}>
                        {isEditing ? (
                            <View style={styles.editInputContainer}>
                                <TextInput
                                    style={styles.nameInput}
                                    value={newFullName}
                                    onChangeText={setNewFullName}
                                    placeholder="Nama Lengkap"
                                    placeholderTextColor={colors.secondaryText}
                                />
                                <TouchableOpacity onPress={updateProfile} style={styles.editButton}>
                                    <Save size={20} color={colors.textLight} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.editButton, { backgroundColor: colors.danger }]}>
                                    <X size={20} color={colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.editInputContainer}>
                                <Text style={styles.userName}>{profile?.full_name || 'Pengguna Baru'}</Text>
                                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                                    <Edit2 size={20} color={colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.emailContainer}>
                            <Mail size={16} color={colors.secondaryText} />
                            <Text style={styles.userEmail}>{profile?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistik Anda</Text>
                    <View style={styles.statsContainer}>
                        <StatCard 
                            icon={<Heart size={24} color={colors.textLight} />}
                            iconBg={colors.success}
                            value={mockStats.totalGratitude.toString()}
                            label="Catatan Syukur"
                            colors={colors}
                        />
                        <StatCard 
                            icon={<Clock size={24} color={colors.textLight} />}
                            iconBg={colors.primary}
                            value={`${mockStats.avgSleep} Jam`}
                            label="Tidur Rata-Rata"
                            colors={colors}
                        />
                        <StatCard 
                            icon={<Moon size={24} color={colors.textLight} />}
                            iconBg={colors.warning}
                            value={mockStats.lastMeditated}
                            label="Meditasi Terakhir"
                            colors={colors}
                        />
                    </View>
                </View>

                {/* NEW: Pengaturan Tampilan Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pengaturan Tampilan</Text>
                    <View style={styles.themeOptionsContainer}>
                        {themeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.themeOptionButton,
                                    themePreference === option.value && styles.themeOptionButtonSelected,
                                ]}
                                onPress={() => setThemePreference(option.value)}
                            >
                                <Text style={styles.themeOptionIcon}>{option.icon}</Text>
                                <Text style={[
                                    styles.themeOptionText,
                                    themePreference === option.value && styles.themeOptionTextSelected,
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                {/* END: Pengaturan Tampilan Section */}

                {/* Actions Section */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity 
                        style={styles.logoutButton} 
                        onPress={() => signOut()}
                    >
                        <View style={[styles.logoutIcon, { backgroundColor: colors.danger + '10' }]}>
                            <LogOut size={24} color={colors.danger} />
                        </View>
                        <Text style={[styles.logoutText, { color: colors.danger }]}>Keluar (Logout)</Text>
                    </TouchableOpacity>
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
}

// Component Card Stat
const StatCard = ({ icon, iconBg, value, label, colors }: { icon: JSX.Element, iconBg: string, value: string, label: string, colors: AppColors }) => (
    <View style={profileStyles(colors).statCard}>
        <View style={[profileStyles(colors).statIcon, { backgroundColor: iconBg }]}>
            {icon}
        </View>
        <Text style={profileStyles(colors).statValue}>{value}</Text>
        <Text style={profileStyles(colors).statLabel}>{label}</Text>
    </View>
);

// Style function yang menggunakan AppColors
const profileStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // DYNAMIC BACKGROUND
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text, // DYNAMIC TEXT
        marginRight: 10,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    userEmail: {
        fontSize: 14,
        color: colors.secondaryText, // DYNAMIC SECONDARY TEXT
    },
    editInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nameInput: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
        paddingHorizontal: 5,
        marginRight: 10,
    },
    editButton: {
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 10,
        marginLeft: 5,
    },
    
    // Stats
    section: {
        marginBottom: 20,
        backgroundColor: colors.card, // DYNAMIC CARD
        borderRadius: 16,
        padding: 20,
        shadowColor: colors.dark ? colors.background : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.dark ? 0.8 : 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text, // DYNAMIC TEXT
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.background, // DYNAMIC BACKGROUND
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text, // DYNAMIC TEXT
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: colors.secondaryText, // DYNAMIC SECONDARY TEXT
        textAlign: 'center',
        fontWeight: '600',
    },

    // NEW STYLES UNTUK THEME TOGGLE
    themeOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    themeOptionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.secondaryButton, // DYNAMIC SECONDARY BUTTON
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionButtonSelected: {
        borderColor: colors.primary, // DYNAMIC PRIMARY
        backgroundColor: colors.primary + '10', 
    },
    themeOptionIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    themeOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.secondaryText, // DYNAMIC SECONDARY TEXT
    },
    themeOptionTextSelected: {
        color: colors.primary, // DYNAMIC PRIMARY
    },

    // Actions
    actionsSection: {
        marginBottom: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: colors.card, // DYNAMIC CARD
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 16,
        borderWidth: 2,
        borderColor: colors.danger + '20',
        shadowColor: colors.dark ? colors.background : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.dark ? 0.8 : 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    logoutIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '700',
    }
});