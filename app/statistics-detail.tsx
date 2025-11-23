import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // ✅
import { sleepRecordsService } from '../services/sleepRecords';
import { Database } from '../types/database.types';

const { width: screenWidth } = Dimensions.get('window');

type SleepRecord = Database['public']['Tables']['sleep_records']['Row'];

// ❌ Hapus semua const colors = { ... }

export default function StatisticsDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, theme } = useTheme(); // ✅

  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);

  useEffect(() => {
    if (user) {
      loadSleepRecords();
    }
  }, [user, period]);

  const loadSleepRecords = async () => {
    try {
      setLoading(true);
      const days = period === 'week' ? 7 : 30;
      const stats = await sleepRecordsService.getStatistics(user!.id, days);
      setSleepRecords(stats.records);
    } catch (error: any) {
      console.error('Error loading sleep records:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSleepRecords();
    setRefreshing(false);
  };

  const processedData = sleepRecords.map(record => {
    const date = new Date(record.date + 'T00:00:00');
    return {
      date: record.date,
      day: period === 'week' 
        ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()]
        : date.getDate(),
      hours: record.hours,
      quality: record.quality,
    };
  }).reverse();

  const avgSleep = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, d) => sum + d.hours, 0) / sleepRecords.length).toFixed(1)
    : '0.0';
  
  const maxSleep = sleepRecords.length > 0
    ? Math.max(...sleepRecords.map(d => d.hours)).toFixed(1)
    : '0.0';
  
  const minSleep = sleepRecords.length > 0
    ? Math.min(...sleepRecords.map(d => d.hours)).toFixed(1)
    : '0.0';
  
  const goodDays = sleepRecords.filter(d => d.hours >= 7.5).length;
  const avgDays = sleepRecords.filter(d => d.hours >= 6.5 && d.hours < 7.5).length;
  const poorDays = sleepRecords.filter(d => d.hours < 6.5).length;
  
  const consistency = sleepRecords.length > 0
    ? ((goodDays / sleepRecords.length) * 100).toFixed(0)
    : '0';
  
  const halfPoint = Math.floor(sleepRecords.length / 2);
  const firstHalf = sleepRecords.slice(0, halfPoint);
  const secondHalf = sleepRecords.slice(halfPoint);
  
  const firstAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, d) => sum + d.hours, 0) / firstHalf.length
    : 0;
  
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, d) => sum + d.hours, 0) / secondHalf.length
    : 0;
  
  const trend = secondAvg > firstAvg ? 'up' : 'down';
  const trendValue = Math.abs(secondAvg - firstAvg).toFixed(1);

  // ✅ Gradient disesuaikan dengan tema
  const headerGradient = theme === 'dark'
    ? ['#1A2A3A', '#253746']
    : ['#6B9DC3', '#8FB3D5'];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={headerGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.textLight} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textLight }]}>Statistik Tidur</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            Analisis pola tidur Anda 📊
          </Text>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Memuat data statistik...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={headerGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.textLight} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textLight }]}>Statistik Tidur</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            Analisis pola tidur Anda 📊
          </Text>
        </LinearGradient>

        <ScrollView 
          style={styles.content}
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
          <View style={styles.contentPadding}>
            {/* Period Selector */}
            <View style={[styles.periodSelector, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={[styles.periodButton, period === 'week' && styles.periodButtonActive(theme, colors)]}
                onPress={() => setPeriod('week')}
              >
                <Text style={[styles.periodButtonText, period === 'week' && { color: colors.textLight }]}>
                  7 Hari
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, period === 'month' && styles.periodButtonActive(theme, colors)]}
                onPress={() => setPeriod('month')}
              >
                <Text style={[styles.periodButtonText, period === 'month' && { color: colors.textLight }]}>
                  30 Hari
                </Text>
              </TouchableOpacity>
            </View>

            {sleepRecords.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Text style={styles.emptyStateEmoji}>📊</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Belum Ada Data</Text>
                <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                  Mulai catat tidur Anda untuk melihat statistik lengkap
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.overviewGrid}>
                  <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.overviewLabel, { color: colors.secondaryText }]}>Rata-rata</Text>
                    <Text style={[styles.overviewValue, { color: colors.primary }]}>{avgSleep}h</Text>
                    <Text style={[styles.overviewSubtext, { color: colors.secondaryText }]}>per malam</Text>
                  </View>
                  <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.overviewLabel, { color: colors.secondaryText }]}>Konsistensi</Text>
                    <Text style={[
                      styles.overviewValue,
                      { color: parseInt(consistency) >= 70 ? colors.success : colors.warning }
                    ]}>
                      {consistency}%
                    </Text>
                    <Text style={[styles.overviewSubtext, { color: colors.secondaryText }]}>hari baik</Text>
                  </View>
                </View>

                <View style={[styles.trendCard, { backgroundColor: colors.card }]}>
                  <View style={styles.trendHeader}>
                    <Text style={[styles.trendTitle, { color: colors.text }]}>Tren Tidur</Text>
                    <View style={[
                      styles.trendBadge,
                      { backgroundColor: trend === 'up' ? colors.success + '20' : colors.danger + '20' }
                    ]}>
                      {trend === 'up' ? (
                        <TrendingUp size={16} color={colors.success} />
                      ) : (
                        <TrendingDown size={16} color={colors.danger} />
                      )}
                      <Text style={[
                        styles.trendBadgeText,
                        { color: trend === 'up' ? colors.success : colors.danger }
                      ]}>
                        {trend === 'up' ? '+' : '-'}{trendValue}h
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.trendDescription, { color: colors.secondaryText }]}>
                    {trend === 'up' 
                      ? `Bagus! Durasi tidur meningkat ${trendValue} jam dibanding periode sebelumnya.`
                      : `Perhatian! Durasi tidur menurun ${trendValue} jam dibanding periode sebelumnya.`
                    }
                  </Text>
                </View>

                <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Grafik Tidur</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chartScrollContent}
                  >
                    <View style={styles.chart}>
                      {processedData.map((item, index) => {
                        const maxHours = Math.max(...processedData.map(d => d.hours), 8);
                        const height = (item.hours / maxHours) * 150;
                        const barColor = item.hours >= 7.5 
                          ? colors.primary 
                          : item.hours >= 6.5 
                            ? colors.accent 
                            : colors.border;
                        
                        return (
                          <View key={index} style={styles.barWrapper}>
                            <Text style={[styles.barHours, { color: colors.text }]}>{item.hours}h</Text>
                            <View style={[styles.barContainer, { backgroundColor: colors.inputBackground }]}>
                              <View style={[styles.barFill, { height, backgroundColor: barColor }]} />
                            </View>
                            <Text style={[styles.barLabel, { color: colors.secondaryText }]}>{item.day}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                <View style={[styles.qualityCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.qualityTitle, { color: colors.text }]}>Distribusi Kualitas Tidur</Text>
                  <View style={styles.qualityBar}>
                    <View style={[styles.qualitySegment, { flex: goodDays, backgroundColor: colors.success }]} />
                    <View style={[styles.qualitySegment, { flex: avgDays, backgroundColor: colors.warning }]} />
                    <View style={[styles.qualitySegment, { flex: poorDays, backgroundColor: colors.danger }]} />
                  </View>
                  <View style={styles.qualityLegend}>
                    <View style={styles.qualityLegendItem}>
                      <View style={[styles.qualityDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.qualityLegendText, { color: colors.text }]}>Baik ({goodDays} hari)</Text>
                    </View>
                    <View style={styles.qualityLegendItem}>
                      <View style={[styles.qualityDot, { backgroundColor: colors.warning }]} />
                      <Text style={[styles.qualityLegendText, { color: colors.text }]}>Cukup ({avgDays} hari)</Text>
                    </View>
                    <View style={styles.qualityLegendItem}>
                      <View style={[styles.qualityDot, { backgroundColor: colors.danger }]} />
                      <Text style={[styles.qualityLegendText, { color: colors.text }]}>Kurang ({poorDays} hari)</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.detailStatsCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.detailStatsTitle, { color: colors.text }]}>Detail Statistik</Text>
                  <View style={[styles.detailStatRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailStatLabel, { color: colors.secondaryText }]}>Tidur Terlama</Text>
                    <Text style={[styles.detailStatValue, { color: colors.text }]}>{maxSleep} jam</Text>
                  </View>
                  <View style={[styles.detailStatRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailStatLabel, { color: colors.secondaryText }]}>Tidur Tersingkat</Text>
                    <Text style={[styles.detailStatValue, { color: colors.text }]}>{minSleep} jam</Text>
                  </View>
                  <View style={[styles.detailStatRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailStatLabel, { color: colors.secondaryText }]}>Target Harian</Text>
                    <Text style={[styles.detailStatValue, { color: colors.text }]}>\>8 jam</Text>
                  </View>
                  <View style={[styles.detailStatRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailStatLabel, { color: colors.secondaryText }]}>Hari Mencapai Target</Text>
                    <Text style={[styles.detailStatValue, { color: colors.text }]}>{sleepRecords.filter(d => d.hours >= 8).length} hari</Text>
                  </View>
                </View>

                <View style={[
                  styles.recommendationCard,
                  { 
                    backgroundColor: theme === 'dark' ? colors.warning + '20' : '#FFF9E6',
                    borderLeftColor: colors.warning
                  }
                ]}>
                  <Text style={[styles.recommendationTitle, { color: colors.text }]}>💡 Rekomendasi</Text>
                  <Text style={[styles.recommendationText, { color: colors.text }]}>
                    {parseFloat(avgSleep) < 7 ? (
                      '• Coba tidur 30 menit lebih awal\n• Kurangi aktivitas stimulan sebelum tidur\n• Atur jadwal tidur yang konsisten'
                    ) : (
                      '• Pertahankan pola tidur yang baik!\n• Tetap konsisten dengan jadwal tidur\n• Jaga rutinitas sebelum tidur'
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  periodSelector: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: (theme: 'light' | 'dark', colors: any) => ({
    backgroundColor: colors.primary,
  }),
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  overviewSubtext: {
    fontSize: 12,
  },
  trendCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartScrollContent: {
    paddingRight: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    gap: 8,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 4,
    minWidth: 40,
  },
  barHours: {
    fontSize: 10,
    fontWeight: '700',
  },
  barContainer: {
    width: 32,
    height: 150,
    justifyContent: 'flex-end',
    borderRadius: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  qualityCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  qualityBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  qualitySegment: {
    height: '100%',
  },
  qualityLegend: {
    gap: 10,
  },
  qualityLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  qualityLegendText: {
    fontSize: 14,
  },
  detailStatsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailStatsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailStatLabel: {
    fontSize: 14,
  },
  detailStatValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  recommendationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
