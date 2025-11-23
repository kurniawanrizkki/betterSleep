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
import { AppColors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { ThemePreference, useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

// ✅ HAPUS mockStats

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { colors, theme, themePreference, setThemePreference } = useTheme(); 
    const styles = profileStyles(colors);
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    // ✅ State untuk statistik real
    const [stats, setStats] = useState({
        totalGratitude: 0,
        avgSleep: 0,
        lastMeditated: 'Tidak ada',
    });

    const router = useRouter();

    const themeOptions: { label: string, value: ThemePreference, icon: string }[] = [
        { label: 'Terang', value: 'light', icon: '☀️' },
        { label: 'Gelap', value: 'dark', icon: '🌙' },
        { label: 'Otomatis', value: 'system', icon: '📱' },
    ];

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                getProfile(),
                loadStats()
            ]);
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProfile = async () => {
        if (!user?.id) return;
        
        const { data, error } = await supabase
            .from('users')
            .select(`id, email, full_name, avatar_url, created_at`)
            .eq('id', user.id)
            .single();

        if (error) throw error;
        if (data) {
            setProfile(data);
            setNewFullName(data.full_name || '');
        }
    };

    // ✅ Ambil statistik real dari Supabase
    const loadStats = async () => {
        if (!user?.id) return;

        try {
            // 1. Total gratitude notes
            const { count: totalGratitude } = await supabase
                .from('gratitude_notes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // 2. Rata-rata tidur (7 hari terakhir)
            const { data: sleepRecords } = await supabase
                .from('sleep_records')
                .select('hours')
                .eq('user_id', user.id)
                .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .limit(7);

            const avgSleep = sleepRecords && sleepRecords.length > 0
                ? (sleepRecords.reduce((sum, r) => sum + r.hours, 0) / sleepRecords.length)
                : 0;

            // 3. Musik terakhir diputar
            const { data: lastMusic } = await supabase
                .from('user_music_history')
                .select('played_at')
                .eq('user_id', user.id)
                .order('played_at', { ascending: false })
                .limit(1);

            let lastMeditated = 'Tidak ada';
            if (lastMusic && lastMusic.length > 0) {
                const playedAt = new Date(lastMusic[0].played_at);
                const now = new Date();
                const diffInDays = Math.floor((now.getTime() - playedAt.getTime()) / (1000 * 60 * 60 * 24));
                lastMeditated = diffInDays === 0 
                    ? 'Hari ini' 
                    : diffInDays === 1 
                        ? 'Kemarin' 
                        : `${diffInDays} Hari Lalu`;
            }

            setStats({
                totalGratitude: totalGratitude || 0,
                avgSleep: parseFloat(avgSleep.toFixed(1)),
                lastMeditated,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const updateProfile = async () => {
        if (!newFullName.trim()) {
            Alert.alert('Error', 'Nama lengkap tidak boleh kosong');
            return;
        }

        try {
            // ❗ Perbaiki: Simpan ke tabel `users`, bukan `profiles`
            const { error } = await supabase
                .from('users')
                .update({ full_name: newFullName.trim() })
                .eq('id', user?.id);

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
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                        <User size={48} color={colors.primary} />
                    </View>
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
                                <View style={styles.editButtonsContainer}>
                                    <TouchableOpacity onPress={updateProfile} style={styles.editButton}>
                                        <Save size={18} color={colors.textLight} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => setIsEditing(false)} 
                                        style={[styles.editButton, { backgroundColor: colors.danger }]}
                                    >
                                        <X size={18} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.nameContainer}>
                                <Text style={styles.userName}>{profile?.full_name || 'Pengguna Baru'}</Text>
                                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editIconButton}>
                                    <Edit2 size={16} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.emailContainer}>
                            <Mail size={14} color={colors.secondaryText} />
                            <Text style={styles.userEmail}>{profile?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistik Anda</Text>
                    <View style={styles.statsContainer}>
                        <StatCard 
                            icon={<Heart size={20} color={colors.textLight} />}
                            iconBg={colors.success}
                            value={stats.totalGratitude.toString()}
                            label="Catatan Syukur"
                            colors={colors}
                        />
                        <StatCard 
                            icon={<Clock size={20} color={colors.textLight} />}
                            iconBg={colors.primary}
                            value={`${stats.avgSleep} Jam`}
                            label="Tidur Rata-Rata"
                            colors={colors}
                        />
                        <StatCard 
                            icon={<Moon size={20} color={colors.textLight} />}
                            iconBg={colors.warning}
                            value={stats.lastMeditated}
                            label="Meditasi Terakhir"
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Pengaturan Tampilan Section */}
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

                {/* Actions Section */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity 
                        style={styles.logoutButton} 
                        onPress={() => signOut()}
                    >
                        <View style={[styles.logoutIcon, { backgroundColor: colors.danger + '10' }]}>
                            <LogOut size={20} color={colors.danger} />
                        </View>
                        <Text style={[styles.logoutText, { color: colors.danger }]}>Keluar (Logout)</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const StatCard = ({ icon, iconBg, value, label, colors }: { 
    icon: JSX.Element, 
    iconBg: string, 
    value: string, 
    label: string, 
    colors: AppColors 
}) => (
    <View style={profileStyles(colors).statCard}>
        <View style={[profileStyles(colors).statIcon, { backgroundColor: iconBg }]}>
            {icon}
        </View>
        <Text style={profileStyles(colors).statValue}>{value}</Text>
        <Text style={profileStyles(colors).statLabel}>{label}</Text>
    </View>
);

const profileStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: {
        alignItems: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginRight: 8,
    },
    editIconButton: {
        padding: 4,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    userEmail: {
        fontSize: 13,
        color: colors.secondaryText,
    },
    editInputContainer: {
        alignItems: 'center',
        marginBottom: 6,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 8,
        minWidth: 180,
        textAlign: 'center',
    },
    editButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 8,
    },
    section: {
        marginBottom: 16,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        shadowColor: colors.dark ? colors.background : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.dark ? 0.8 : 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        letterSpacing: 0.2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        color: colors.secondaryText,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 13,
    },
    themeOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    themeOptionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 10,
        backgroundColor: colors.secondaryButton,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionButtonSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10', 
    },
    themeOptionIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    themeOptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondaryText,
    },
    themeOptionTextSelected: {
        color: colors.primary,
    },
    actionsSection: {
        marginBottom: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1.5,
        borderColor: colors.danger + '20',
        shadowColor: colors.dark ? colors.background : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.dark ? 0.8 : 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    logoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '700',
    }
});
