import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

export const TipCard = ({ colors, styles }) => (
  <View style={styles.tipCard}>
    <View style={styles.tipHeader}>
      <Sparkles size={18} color={colors.accent} />
      <Text style={styles.tipTitle}>💡 Tips Hari Ini</Text>
    </View>
    <Text style={styles.tipText}>
      Hindari layar gadget 30 menit sebelum tidur.
    </Text>
  </View>
);
