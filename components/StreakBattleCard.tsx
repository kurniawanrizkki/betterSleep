import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Trophy, TrendingUp, Users } from 'lucide-react-native';

interface ColorsProps {
    primary: string;
    accent: string;
    text: string;
    card: string;
    secondaryText: string;
    success: string;
}

interface StreakBattleCardProps {
  colors: ColorsProps;
  streak: number;
  battleRank: number;
  onPressBattle: () => void;
  onPressStreak: () => void;
}

const StreakBattleCard: React.FC<StreakBattleCardProps> = ({ 
    colors, 
    streak, 
    battleRank, 
    onPressBattle, 
    onPressStreak 
}) => {
  const styles = streakBattleCardStyles(colors);

  return (
    <View style={styles.cardContainer}>
      {/* Enhanced Streak Card with Gradient */}
      <TouchableOpacity 
        style={styles.streakCard} 
        onPress={onPressStreak}
        activeOpacity={0.7}
      >
        <View style={styles.cardGradientLine} />
        <View style={[styles.iconBadge, { backgroundColor: '#FF6B35' + '15' }]}>
          <Flame color="#FF6B35" size={28} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>Sleep Streak</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.cardValue, { color: '#FF6B35' }]}>{streak}</Text>
            <Text style={styles.valueUnit}>Hari</Text>
          </View>
          <View style={styles.trendRow}>
            <TrendingUp color={colors.success} size={14} />
            <Text style={[styles.trendText, { color: colors.success }]}>
              +2 dari minggu lalu
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Enhanced Battle Card */}
      <TouchableOpacity 
        style={styles.battleCard} 
        onPress={onPressBattle}
        activeOpacity={0.7}
      >
        <View style={[styles.cardGradientLine, { backgroundColor: colors.primary }]} />
        <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
          <Trophy color={colors.primary} size={28} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>Peringkat Battle</Text>
          <View style={styles.valueRow}>
            <Text style={styles.rankSymbol}>#</Text>
            <Text style={styles.cardValue}>{battleRank}</Text>
          </View>
          <View style={styles.trendRow}>
            <Users color={colors.accent} size={14} />
            <Text style={[styles.trendText, { color: colors.accent }]}>
              Top 5% pengguna
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const streakBattleCardStyles = (colors) => StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 16,
  },
  streakCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    minHeight: 160,
  },
  battleCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    minHeight: 160,
  },
  cardGradientLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FF6B35',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  valueUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondaryText,
    marginLeft: 6,
  },
  rankSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginRight: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default StreakBattleCard;