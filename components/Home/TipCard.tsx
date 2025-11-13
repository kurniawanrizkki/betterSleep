// src/components/Home/TipCard.tsx
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../styles/colors';

interface TipCardProps {
  tip: string;
}

export const TipCard: React.FC<TipCardProps> = ({ tip }) => {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Sparkles size={18} color={colors.warning} />
        <Text style={styles.tipTitle}>Tips hari ini!</Text>
      </View>
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});