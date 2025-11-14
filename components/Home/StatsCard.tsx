import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  success: '#4CAF50',
};

const StatsCard = ({ sleepData, onPress }) => {
  // Hitung rata-rata tidur
  const avgSleep = (sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length).toFixed(1);
  // Hitung max hours untuk scaling bar chart
  const maxHours = Math.max(...sleepData.map(d => d.hours));
  // Hitung target dan progress (contoh: target 8 jam)
  const target = 8;
  const progress = Math.round((avgSleep / target) * 100);
  // Tentukan status berdasarkan rata-rata tidur
  const getStatus = () => {
    if (avgSleep >= 7.5) return { text: 'On Track', color: colors.success };
    if (avgSleep >= 6.5) return { text: 'Good', color: '#FFA726' };
    return { text: 'Need Rest', color: '#EF5350' };
  };
  
  const status = getStatus();

  return (
    <TouchableOpacity 
      style={styles.statsCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Statistik 7 Hari Terakhir</Text>
        <ChevronRight size={20} color={colors.primary} />
      </View>
      
      {/* Stats Row - Target, Progress, Status */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>My Target</Text>
          <Text style={styles.statValue}>{target}h</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={[styles.statValue, {color: status.color}]}>{progress}%</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, {color: status.color}]}>{status.text}</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.chart}>
        {sleepData.map((day, index) => (
          <View key={index} style={styles.bar}>
            <View style={styles.barContainer}>
              <View style={[
                styles.barFill,
                {
                  height: `${(day.hours / maxHours) * 100}%`,
                  backgroundColor: day.hours >= 7 ? colors.primary : '#A7C7E7' 
                }
              ]}>
              </View>
            </View>
            {/* Teks Jam di atas bar */}
            <Text style={styles.barTextNew}>{day.hours}h</Text>
            {/* Label Hari */}
            <Text style={styles.barLabel}>{day.day}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.viewMoreHint}>
        <Text style={styles.viewMoreText}>Tap untuk lihat detail statistik</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  
  // Chart
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    gap: 10,
  },
  bar: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barTextNew: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  viewMoreHint: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 11,
    color: colors.primary,
    fontStyle: 'italic',
  },
});

export default StatsCard;