import { useRouter } from 'expo-router';
import {
  BookOpen,
  Calendar,
  Music,
  Sparkles,
  Settings,
} from 'lucide-react-native';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Home/Header';
import StatsCard from '../../components/Home/StatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ Impor useTheme
import { sleepRecordsService } from '../../services/sleepRecords';
import { useAdmin } from '../../hooks/useAdmin';

// ❌ HAPUS warna hardcoded → ganti dengan useTheme()
// const colors = { ... }

const baseMainFeatures = [
  {
    icon: BookOpen,
    label: 'Gratitude Notes',
    route: '/gratitude-notes',
  },
  {
    icon: Music,
    label: 'Musik Relaksasi',
    route: '/music-relaxation',
  },
  {
    icon: Calendar,
    label: 'Jadwal Atur Tidur',
    route: '/sleep-schedule',
  },
];

const adminFeature = {
  icon: Settings,
  label: 'Admin',
  route: '/admin/admin',
};

const sleepTips = [
  'Hindari layar gadget 30 menit sebelum tidur untuk kualitas tidur yang lebih baik',
  'Jaga suhu kamar sejuk (18-20°C) untuk tidur yang optimal',
  'Buat rutinitas tidur yang konsisten setiap hari',
  'Hindari kafein dan makanan berat 4-6 jam sebelum tidur',
  'Olahraga teratur membantu tidur lebih nyenyak, tapi hindari 3 jam sebelum tidur',
  'Gunakan tempat tidur hanya untuk tidur, bukan bekerja atau menonton',
  'Coba teknik relaksasi seperti meditasi atau pernapasan dalam',
  'Pastikan kamar tidur gelap, tenang, dan nyaman',
];

const MainFeatureCard = ({ icon: Icon, label, color, isLarge = false, onPress }) => {
  const { colors } = useTheme(); // ✅ Ambil warna dari tema

  return (
    <TouchableOpacity
      style={[
        styles.mainFeatureCard,
        isLarge && styles.largeFeatureCard,
        { backgroundColor: isLarge ? color : colors.card }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon size={isLarge ? 40 : 30} color={isLarge ? colors.textLight : color} />
      <Text style={[
        styles.mainFeatureText,
        isLarge && styles.largeFeatureText,
        { color: isLarge ? colors.textLight : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { colors } = useTheme(); // ✅ Ambil warna di sini

  const [sleepData, setSleepData] = useState([]);
  const [avgSleep, setAvgSleep] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyTip, setDailyTip] = useState('');

  const features = useMemo(() => {
    if (adminLoading) return baseMainFeatures;
    if (isAdmin) return [...baseMainFeatures, adminFeature];
    return baseMainFeatures;
  }, [isAdmin, adminLoading]);

  useEffect(() => {
    if (user) {
      loadWeeklyData();
    }
    setDailyTip(sleepTips[Math.floor(Math.random() * sleepTips.length)]);
  }, [user]);

  const loadWeeklyData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const summary = await sleepRecordsService.getWeeklySummary(user.id);
      const formattedData = summary.weekData.map(day => ({
        day: day.day,
        hours: day.hours,
      }));
      setSleepData(formattedData);
      setAvgSleep(summary.average.toFixed(1));
    } catch (error: any) {
      console.error('Error loading weekly data:', error);
      setSleepData([
        { day: 'Sen', hours: 0 },
        { day: 'Sel', hours: 0 },
        { day: 'Rab', hours: 0 },
        { day: 'Kam', hours: 0 },
        { day: 'Jum', hours: 0 },
        { day: 'Sab', hours: 0 },
        { day: 'Min', hours: 0 },
      ]);
      setAvgSleep('0.0');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeeklyData();
    setDailyTip(sleepTips[Math.floor(Math.random() * sleepTips.length)]);
    setRefreshing(false);
  };

  const handleProfilePress = () => router.push('/(tabs)/profile');
  const handleFeaturePress = (route) => route && router.push(route);
  const handleStatsPress = () => router.push('/statistics-detail');

  if (loading || adminLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Memuat data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const largeFeature = features[0];
  const smallFeatures = features.slice(1);
  const adminFeatureInSmallList = smallFeatures.find(f => f.label === 'Admin');
  const actualSmallFeatures = smallFeatures.filter(f => f.label !== 'Admin');

  return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Header avgSleep={avgSleep} onProfilePress={handleProfilePress} />

        <View style={styles.contentArea}>
          {loading ? (
            <View style={[styles.statsLoadingCard, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.statsLoadingText, { color: colors.secondaryText }]}>
                Memuat statistik mingguan...
              </Text>
            </View>
          ) : (
            <StatsCard sleepData={sleepData} onPress={handleStatsPress} />
          )}

          <View style={styles.mainFeaturesGrid}>
            <View style={styles.mainFeaturesRow}>
              {largeFeature && (
                <MainFeatureCard
                  {...largeFeature}
                  color={colors.primary}
                  isLarge={true}
                  onPress={() => handleFeaturePress(largeFeature.route)}
                />
              )}

              <View style={styles.smallFeaturesCol}>
                {actualSmallFeatures.map((feature, index) => (
                  <MainFeatureCard
                    key={index}
                    {...feature}
                    color={colors.primary}
                    onPress={() => handleFeaturePress(feature.route)}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.tipCard, { backgroundColor: colors.card, borderLeftColor: colors.warning }]}>
            <View style={styles.tipHeader}>
              <Sparkles size={18} color={colors.warning} />
              <Text style={[styles.tipTitle, { color: colors.text }]}>Tips hari ini!</Text>
            </View>
            <Text style={[styles.tipText, { color: colors.secondaryText }]}>{dailyTip}</Text>
          </View>

          {adminFeatureInSmallList && (
            <TouchableOpacity
              style={[styles.adminCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push(adminFeatureInSmallList.route)}
            >
              <Settings size={28} color={colors.textLight} />
              <View style={styles.adminCardContent}>
                <Text style={[styles.adminCardTitle, { color: colors.textLight }]}>
                  Admin Dashboard
                </Text>
                <Text style={[styles.adminCardSubtext, { color: colors.textLight }]}>
                  Kelola Produk, Musik & Pengguna
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {sleepData.every(day => day.hours === 0) && !loading && (
            <View style={[styles.emptyStateCard, { backgroundColor: colors.secondaryButton, borderColor: colors.primary + '20' }]}>
              <Text style={styles.emptyStateEmoji}>😴</Text>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                Belum Ada Data Tidur
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                Mulai catat tidur Anda untuk melihat statistik dan analisis
              </Text>
              <TouchableOpacity
                style={[styles.addRecordButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/statistics-detail')}
              >
                <Text style={[styles.addRecordButtonText, { color: colors.textLight }]}>
                  Lihat Statistik
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>
);
}

// Styles tetap gunakan StyleSheet.create, tapi warna DIAPLIKASIKAN via inline style
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contentArea: {
    padding: 20,
    marginTop: -40,
  },
  statsLoadingCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  statsLoadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mainFeaturesGrid: {
    marginBottom: 16,
    paddingTop: 10,
  },
  mainFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mainFeatureCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  mainFeatureText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  largeFeatureCard: {
    width: '49%',
    height: 185,
    paddingVertical: 30,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  largeFeatureText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smallFeaturesCol: {
    width: '49%',
    justifyContent: 'space-between',
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
  },
  emptyStateCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  addRecordButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addRecordButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  adminCardContent: {
    marginLeft: 16,
  },
  adminCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  adminCardSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
});
