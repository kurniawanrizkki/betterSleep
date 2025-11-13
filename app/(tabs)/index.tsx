import { useRouter } from 'expo-router';
import {
  BookOpen,
  Calendar,
  Music,
  Sparkles,
} from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Home/Header';
import StatsCard from '../../components/Home/StatsCard';

const sleepData = [
  { day: 'Mon', hours: 7.2 },
  { day: 'Tue', hours: 6.8 },
  { day: 'Wed', hours: 8.1 },
  { day: 'Thu', hours: 7.5 },
  { day: 'Fri', hours: 6.5 },
  { day: 'Sat', hours: 8.3 },
  { day: 'Sun', hours: 7.8 },
];

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
  const avgSleep = (sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length).toFixed(1);

  const handleProfilePress = () => {
    // Handle profile button press
    console.log('Profile pressed');
    // router.push('/profile');
  };

  const handleFeaturePress = (route) => {
    if (route) {
      router.push(route);
    }
  };

  const handleStatsPress = () => {
    router.push('/statistics-detail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER - Menggunakan komponen terpisah */}
        <Header avgSleep={avgSleep} onProfilePress={handleProfilePress} />

        {/* CONTENT AREA */}
        <View style={styles.contentArea}>
          {/* Stats Card - Menggunakan komponen terpisah dengan onPress */}
          <StatsCard sleepData={sleepData} onPress={handleStatsPress} />

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
            <Text style={styles.tipText}>
              Hindari layar gadget 30 menit sebelum tidur untuk kualitas tidur yang lebih baik
            </Text>
          </View>
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
  
  // Content
  contentArea: {
    padding: 20,
    marginTop: -40,
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
});