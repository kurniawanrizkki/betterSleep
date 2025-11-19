import { useRouter } from 'expo-router';
import {
  BookOpen,
  Calendar,
  Music,
  Sparkles,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { sleepRecordsService } from '../../services/sleepRecords';

const colors = {
  card: '#FFFFFF',
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  textLight: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FFA726',
  lightBg: '#E8F4F8',
};

// Data untuk kartu fitur baru dengan Expo Router paths
const mainFeatures = [
  { 
    icon: BookOpen, 
    label: 'Gratitude Notes', 
    color: 'white',
    route: '/gratitude-notes' 
  },
  { 
    icon: Music, 
    label: 'Musik Relaksasi', 
    color: '#5B9BD5',
    route: '/music-relaxation'
  },
  { 
    icon: Calendar, 
    label: 'Jadwal Atur Tidur', 
    color: '#5B9BD5',
    route: '/sleep-schedule'
  },
];

// Random tips array
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

// Komponen untuk kartu fitur utama
const MainFeatureCard = ({ icon: Icon, label, color, isLarge = false, onPress }) => (
  <TouchableOpacity 
    style={[styles.mainFeatureCard, isLarge && styles.largeFeatureCard]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon size={isLarge ? 40 : 30} color={color} />
    <Text style={[styles.mainFeatureText, isLarge && styles.largeFeatureText]}>{label}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State untuk data dari Supabase
  const [sleepData, setSleepData] = useState([]);
  const [avgSleep, setAvgSleep] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyTip, setDailyTip] = useState('');

  // Load data saat komponen mount
  useEffect(() => {
    if (user) {
      loadWeeklyData();
    }
    // Set random tip
    setDailyTip(sleepTips[Math.floor(Math.random() * sleepTips.length)]);
  }, [user]);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      
      // Load weekly summary dari Supabase
      const summary = await sleepRecordsService.getWeeklySummary(user!.id);
      
      // Format data untuk StatsCard
      const formattedData = summary.weekData.map(day => ({
        day: day.day,
        hours: day.hours,
      }));
      
      setSleepData(formattedData);
      setAvgSleep(summary.average.toFixed(1));
      
      console.log('📊 Weekly data loaded:', {
        records: formattedData.length,
        average: summary.average,
        streak: summary.streak,
      });
    } catch (error: any) {
      console.error('Error loading weekly data:', error);
      // Fallback ke data kosong jika error
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
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeeklyData();
    // Generate new random tip
    setDailyTip(sleepTips[Math.floor(Math.random() * sleepTips.length)]);
    setRefreshing(false);
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleFeaturePress = (route) => {
    if (route) {
      router.push(route);
    }
  };

  const handleStatsPress = () => {
    router.push('/statistics-detail');
  };

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
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
        {/* HEADER - Menggunakan komponen terpisah */}
        <Header avgSleep={avgSleep} onProfilePress={handleProfilePress} />

        {/* CONTENT AREA */}
        <View style={styles.contentArea}>
          {/* Stats Card - Menggunakan komponen terpisah dengan onPress */}
          {loading ? (
            <View style={styles.statsLoadingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statsLoadingText}>Memuat statistik mingguan...</Text>
            </View>
          ) : (
            <StatsCard sleepData={sleepData} onPress={handleStatsPress} />
          )}

          {/* Main Features */}
          <View style={styles.mainFeaturesGrid}>
            <View style={styles.mainFeaturesRow}>
              {/* Kartu Gratitude Notes (Kartu Besar di Kiri) */}
              <MainFeatureCard 
                {...mainFeatures[0]} 
                isLarge={true}
                onPress={() => handleFeaturePress(mainFeatures[0].route)}
              />
              
              {/* Kartu Musik Relaksasi & Jadwal Atur Tidur (Dua Kecil di Kanan) */}
              <View style={styles.smallFeaturesCol}>
                {mainFeatures.slice(1).map((feature, index) => (
                  <MainFeatureCard 
                    key={index} 
                    {...feature}
                    onPress={() => handleFeaturePress(feature.route)}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Sparkles size={18} color={colors.warning} />
              <Text style={styles.tipTitle}>Tips hari ini!</Text>
            </View>
            <Text style={styles.tipText}>{dailyTip}</Text>
          </View>

          {/* Quick Add Sleep Record (Optional) */}
          {sleepData.every(day => day.hours === 0) && !loading && (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateEmoji}>😴</Text>
              <Text style={styles.emptyStateTitle}>Belum Ada Data Tidur</Text>
              <Text style={styles.emptyStateText}>
                Mulai catat tidur Anda untuk melihat statistik dan analisis
              </Text>
              <TouchableOpacity 
                style={styles.addRecordButton}
                onPress={() => router.push('/statistics-detail')}
              >
                <Text style={styles.addRecordButtonText}>Lihat Statistik</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    color: colors.secondaryText,
    fontWeight: '500',
  },
  
  // Content
  contentArea: {
    padding: 20,
    marginTop: -40,
  },

  // Stats Loading
  statsLoadingCard: {
    backgroundColor: colors.card,
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
    color: colors.secondaryText,
    fontWeight: '500',
  },

  // Main Features
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F8FF',
  },
  mainFeatureText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  largeFeatureCard: {
    width: '49%',
    height: 185,
    paddingVertical: 30,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  largeFeatureText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  
  // Container untuk dua kartu kecil di kanan
  smallFeaturesCol: {
    width: '49%',
    justifyContent: 'space-between',
  },

  // Tips
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    color: colors.text,
  },
  tipText: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 18,
  },

  // Empty State
  emptyStateCard: {
    backgroundColor: colors.lightBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary + '20',
    borderStyle: 'dashed',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  addRecordButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addRecordButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
});