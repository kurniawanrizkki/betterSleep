import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ Impor useTheme

const StatsCard = ({ sleepData, onPress }) => {
  const { colors } = useTheme(); // ✅ Ambil warna dari tema

  // Hitung rata-rata tidur
  const avgSleep = sleepData.length
    ? (sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length).toFixed(1)
    : '0.0';

  // Hitung max hours untuk scaling
  const maxHours = sleepData.length ? Math.max(...sleepData.map(d => d.hours)) : 1;

  const target = 8;
  const progress = sleepData.length ? Math.round((parseFloat(avgSleep) / target) * 100) : 0;

  const getStatus = () => {
    const avg = parseFloat(avgSleep);
    if (avg >= 7.5) return { text: 'On Track', color: colors.success };
    if (avg >= 6.5) return { text: 'Good', color: colors.warning };
    return { text: 'Need Rest', color: colors.danger };
  };

  const status = getStatus();

  return (
    <TouchableOpacity
      style={[styles.statsCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Statistik 7 Hari Terakhir</Text>
        <ChevronRight size={20} color={colors.primary} />
      </View>

      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>My Target</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{target}h</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Progress</Text>
          <Text style={[styles.statValue, { color: status.color }]}>{progress}%</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Status</Text>
          <Text style={[styles.statValue, { color: status.color }]}>{status.text}</Text>
        </View>
      </View>

      <View style={styles.chart}>
        {sleepData.map((day, index) => (
          <View key={index} style={styles.bar}>
            <View style={[styles.barContainer, { backgroundColor: colors.inputBackground }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${(day.hours / (maxHours || 1)) * 100}%`,
                    backgroundColor: day.hours >= 7 ? colors.primary : colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barTextNew, { color: colors.text }]}>{day.hours}h</Text>
            <Text style={[styles.barLabel, { color: colors.secondaryText }]}>{day.day}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.viewMoreHint, { borderTopColor: colors.border }]}>
        <Text style={[styles.viewMoreText, { color: colors.primary }]}>Tap untuk lihat detail statistik</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statsCard: {
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
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
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
    borderRadius: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barTextNew: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  viewMoreHint: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});

export default StatsCard;
