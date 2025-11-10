import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, Music, Wind, Calendar, Sparkles } from 'lucide-react-native';

export const QuickAccess = ({ colors, styles, screenWidth }) => (
  <View style={styles.quickAccess}>
    <View style={styles.sectionTitle}>
      <Sparkles size={20} color={colors.accent} />
      <Text style={styles.sectionTitleText}>Aktivitas Pra-Tidur</Text>
    </View>

    <View style={styles.quickGrid}>
      <TouchableOpacity style={styles.quickBtn}>
        <View style={[styles.quickIcon, { backgroundColor: '#8B5CF620' }]}>
          <BookOpen size={28} color="#8B5CF6" />
        </View>
        <Text style={styles.quickBtnLabel}>Gratitude Notes</Text>
        <Text style={styles.quickBtnSub}>Jurnal harian</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickBtn}>
        <View style={[styles.quickIcon, { backgroundColor: colors.accent + '30' }]}>
          <Music size={28} color={colors.primary} />
        </View>
        <Text style={styles.quickBtnLabel}>Musik Relaksasi</Text>
        <Text style={styles.quickBtnSub}>Tenangkan pikiran</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickBtn}>
        <View style={[styles.quickIcon, { backgroundColor: colors.success + '20' }]}>
          <Wind size={28} color={colors.success} />
        </View>
        <Text style={styles.quickBtnLabel}>Meditasi</Text>
        <Text style={styles.quickBtnSub}>Napas & relaksasi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickBtn}>
        <View style={[styles.quickIcon, { backgroundColor: colors.warning + '20' }]}>
          <Calendar size={28} color={colors.warning} />
        </View>
        <Text style={styles.quickBtnLabel}>Jadwal Tidur</Text>
        <Text style={styles.quickBtnSub}>Atur waktu</Text>
      </TouchableOpacity>
    </View>
  </View>
);
