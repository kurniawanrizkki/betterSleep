import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  textLight: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FFA726',
  danger: '#EF5350',
  lightBg: '#E8F4F8',
};

// Extended data untuk 30 hari terakhir
const generateMonthlyData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate random sleep hours dengan variasi realistis
    const hours = 6 + Math.random() * 2.5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      hours: parseFloat(hours.toFixed(1)),
      quality: hours >= 7.5 ? 'good' : hours >= 6.5 ? 'average' : 'poor',
    });
  }
  
  return data;
};

export default function StatisticsDetailScreen({ navigation }) {
  const [period, setPeriod] = useState('week'); // 'week' or 'month'
  const monthlyData = generateMonthlyData();
  
  const weeklyData = [
    { day: 'Sen', hours: 7.2, date: '2024-11-11' },
    { day: 'Sel', hours: 6.8, date: '2024-11-12' },
    { day: 'Rab', hours: 8.1, date: '2024-11-13' },
    { day: 'Kam', hours: 7.5, date: '2024-11-14' },
    { day: 'Jum', hours: 6.5, date: '2024-11-15' },
    { day: 'Sab', hours: 8.3, date: '2024-11-16' },
    { day: 'Min', hours: 7.8, date: '2024-11-17' },
  ];

  const currentData = period === 'week' ? weeklyData : monthlyData;

  // Statistik calculations
  const avgSleep = (currentData.reduce((sum, d) => sum + d.hours, 0) / currentData.length).toFixed(1);
  const maxSleep = Math.max(...currentData.map(d => d.hours)).toFixed(1);
  const minSleep = Math.min(...currentData.map(d => d.hours)).toFixed(1);
  
  const goodDays = currentData.filter(d => d.hours >= 7.5).length;
  const avgDays = currentData.filter(d => d.hours >= 6.5 && d.hours < 7.5).length;
  const poorDays = currentData.filter(d => d.hours < 6.5).length;
  
  const consistency = ((goodDays / currentData.length) * 100).toFixed(0);
  
  // Trend calculation
  const firstHalf = currentData.slice(0, Math.floor(currentData.length / 2));
  const secondHalf = currentData.slice(Math.floor(currentData.length / 2));
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.hours, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.hours, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg ? 'up' : 'down';
  const trendValue = Math.abs(secondAvg - firstAvg).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B9DC3', '#8FB3D5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistik Tidur</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          Analisis pola tidur Anda 📊
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
              7 Hari
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
              30 Hari
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Rata-rata</Text>
            <Text style={styles.overviewValue}>{avgSleep}h</Text>
            <Text style={styles.overviewSubtext}>per malam</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Konsistensi</Text>
            <Text style={[styles.overviewValue, { color: consistency >= 70 ? colors.success : colors.warning }]}>
              {consistency}%
            </Text>
            <Text style={styles.overviewSubtext}>hari baik</Text>
          </View>
        </View>

        {/* Trend Card */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Tren Tidur</Text>
            <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? '#E8F5E9' : '#FFEBEE' }]}>
              {trend === 'up' ? (
                <TrendingUp size={16} color={colors.success} />
              ) : (
                <TrendingDown size={16} color={colors.danger} />
              )}
              <Text style={[styles.trendBadgeText, { color: trend === 'up' ? colors.success : colors.danger }]}>
                {trend === 'up' ? '+' : '-'}{trendValue}h
              </Text>
            </View>
          </View>
          <Text style={styles.trendDescription}>
            {trend === 'up' 
              ? `Bagus! Durasi tidur meningkat ${trendValue} jam dibanding periode sebelumnya.`
              : `Perhatian! Durasi tidur menurun ${trendValue} jam dibanding periode sebelumnya.`
            }
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Grafik Tidur</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <View style={styles.chart}>
              {currentData.map((item, index) => {
                const maxHours = Math.max(...currentData.map(d => d.hours));
                const height = (item.hours / maxHours) * 150;
                const barColor = item.hours >= 7.5 ? colors.primary : item.hours >= 6.5 ? '#A7C7E7' : '#E0E0E0';
                
                return (
                  <View key={index} style={styles.barWrapper}>
                    <Text style={styles.barHours}>{item.hours}h</Text>
                    <View style={styles.barContainer}>
                      <View style={[styles.barFill, { height, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.barLabel}>
                      {period === 'week' ? item.day : item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Quality Distribution */}
        <View style={styles.qualityCard}>
          <Text style={styles.qualityTitle}>Distribusi Kualitas Tidur</Text>
          <View style={styles.qualityBar}>
            <View style={[styles.qualitySegment, { flex: goodDays, backgroundColor: colors.success }]} />
            <View style={[styles.qualitySegment, { flex: avgDays, backgroundColor: colors.warning }]} />
            <View style={[styles.qualitySegment, { flex: poorDays, backgroundColor: colors.danger }]} />
          </View>
          <View style={styles.qualityLegend}>
            <View style={styles.qualityLegendItem}>
              <View style={[styles.qualityDot, { backgroundColor: colors.success }]} />
              <Text style={styles.qualityLegendText}>Baik ({goodDays} hari)</Text>
            </View>
            <View style={styles.qualityLegendItem}>
              <View style={[styles.qualityDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.qualityLegendText}>Cukup ({avgDays} hari)</Text>
            </View>
            <View style={styles.qualityLegendItem}>
              <View style={[styles.qualityDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.qualityLegendText}>Kurang ({poorDays} hari)</Text>
            </View>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailStatsCard}>
          <Text style={styles.detailStatsTitle}>Detail Statistik</Text>
          <View style={styles.detailStatRow}>
            <Text style={styles.detailStatLabel}>Tidur Terlama</Text>
            <Text style={styles.detailStatValue}>{maxSleep} jam</Text>
          </View>
          <View style={styles.detailStatRow}>
            <Text style={styles.detailStatLabel}>Tidur Tersingkat</Text>
            <Text style={styles.detailStatValue}>{minSleep} jam</Text>
          </View>
          <View style={styles.detailStatRow}>
            <Text style={styles.detailStatLabel}>Target Harian</Text>
            <Text style={styles.detailStatValue}>8 jam</Text>
          </View>
          <View style={styles.detailStatRow}>
            <Text style={styles.detailStatLabel}>Hari Mencapai Target</Text>
            <Text style={styles.detailStatValue}>{currentData.filter(d => d.hours >= 8).length} hari</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>💡 Rekomendasi</Text>
          {avgSleep < 7 ? (
            <Text style={styles.recommendationText}>
              • Coba tidur 30 menit lebih awal{'\n'}
              • Kurangi aktivitas stimulan sebelum tidur{'\n'}
              • Atur jadwal tidur yang konsisten
            </Text>
          ) : (
            <Text style={styles.recommendationText}>
              • Pertahankan pola tidur yang baik!{'\n'}
              • Tetap konsisten dengan jadwal tidur{'\n'}
              • Jaga rutinitas sebelum tidur
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
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
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  periodButtonTextActive: {
    color: colors.textLight,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFF',
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
    color: colors.secondaryText,
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  overviewSubtext: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  trendCard: {
    backgroundColor: '#FFF',
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
    color: colors.text,
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
    color: colors.secondaryText,
    lineHeight: 20,
  },
  chartCard: {
    backgroundColor: '#FFF',
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
    color: colors.text,
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
    color: colors.text,
  },
  barContainer: {
    width: 32,
    height: 150,
    justifyContent: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  qualityCard: {
    backgroundColor: '#FFF',
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
    color: colors.text,
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
    color: colors.text,
  },
  detailStatsCard: {
    backgroundColor: '#FFF',
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
    color: colors.text,
    marginBottom: 16,
  },
  detailStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailStatLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  detailStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  recommendationCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});