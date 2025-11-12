import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen, // Untuk Gratitude Notes
  Calendar, // Untuk Jadwal
  Moon,
  Music, // Untuk Musik Relaksasi
  Sparkles,
  Star,
  User
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const sleepData = [
  { day: 'Mon', hours: 7.2 },
  { day: 'Tue', hours: 6.8 },
  { day: 'Wed', hours: 8.1 },
  { day: 'Thu', hours: 7.5 },
  { day: 'Fri', hours: 6.5 },
  { day: 'Sat', hours: 8.3 },
  { day: 'Sun', hours: 7.8 },
];

// Data untuk kartu fitur baru
const mainFeatures = [
  { icon: BookOpen, label: 'Gratitude Notes', color: 'white' },
  { icon: Music, label: 'Musik Relaksasi', color: '#5B9BD5' },
  // { icon: Feather, label: 'Meditasi', color: '#5B9BD5' },
  { icon: Calendar, label: 'Jadwal Atur Tidur', color: '#5B9BD5' },
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

// Animated Two-Layer Cloud Wave - Smooth animation
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const TwoLayerCloudWave = () => {
  const translateX1 = useRef(new Animated.Value(0)).current;
  const translateX2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Back layer animation - ping pong (bolak-balik)
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX1, {
          toValue: -30,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(translateX1, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ])
    ).start();

    // Front layer animation - ping pong (bolak-balik) dengan timing berbeda
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX2, {
          toValue: 20,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(translateX2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ])
    ).start();
  }, []);

  return (
    <View style={{ height: 120, width: screenWidth, overflow: 'hidden' }}>
      {/* Back Layer - Animated */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: -50, // Extended left
          transform: [{ translateX: translateX1 }]
        }}
      >
        <Svg height="120" width={screenWidth + 100}>
          <Path
            d={`
              M 0,70
              C ${(screenWidth + 100) * 0.1},70 ${(screenWidth + 100) * 0.12},45 ${(screenWidth + 100) * 0.18},45
              C ${(screenWidth + 100) * 0.24},45 ${(screenWidth + 100) * 0.26},65 ${(screenWidth + 100) * 0.32},65
              C ${(screenWidth + 100) * 0.38},65 ${(screenWidth + 100) * 0.4},40 ${(screenWidth + 100) * 0.48},40
              C ${(screenWidth + 100) * 0.56},40 ${(screenWidth + 100) * 0.58},60 ${(screenWidth + 100) * 0.66},60
              C ${(screenWidth + 100) * 0.74},60 ${(screenWidth + 100) * 0.76},35 ${(screenWidth + 100) * 0.84},35
              C ${(screenWidth + 100) * 0.92},35 ${(screenWidth + 100) * 0.94},55 ${(screenWidth + 100) * 0.98},55
              C ${(screenWidth + 100) * 1.02},55 ${(screenWidth + 100) * 1.04},75 ${screenWidth + 100},75
              L ${screenWidth + 100},120
              L 0,120
              Z
            `}
            fill="#F0F4F8"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>
      
      {/* Front Layer - Animated */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: -30, // Extended left
          transform: [{ translateX: translateX2 }]
        }}
      >
        <Svg height="120" width={screenWidth + 60}>
          <Path
            d={`
              M 0,85
              C ${(screenWidth + 60) * 0.08},85 ${(screenWidth + 60) * 0.1},55 ${(screenWidth + 60) * 0.16},55
              C ${(screenWidth + 60) * 0.22},55 ${(screenWidth + 60) * 0.24},75 ${(screenWidth + 60) * 0.3},75
              C ${(screenWidth + 60) * 0.36},75 ${(screenWidth + 60) * 0.38},50 ${(screenWidth + 60) * 0.45},50
              C ${(screenWidth + 60) * 0.52},50 ${(screenWidth + 60) * 0.54},70 ${(screenWidth + 60) * 0.6},70
              C ${(screenWidth + 60) * 0.66},70 ${(screenWidth + 60) * 0.68},45 ${(screenWidth + 60) * 0.75},45
              C ${(screenWidth + 60) * 0.82},45 ${(screenWidth + 60) * 0.84},80 ${(screenWidth + 60) * 0.92},80
              C ${(screenWidth + 60) * 0.96},80 ${(screenWidth + 60) * 0.98},60 ${screenWidth + 60},60
              L ${screenWidth + 60},120
              L 0,120
              Z
            `}
            fill="#FFFFFF"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};
// Komponen baru untuk kartu fitur utama (Diubah: menerima isLarge)
const MainFeatureCard = ({ icon: Icon, label, color, isLarge = false }) => (
  <TouchableOpacity 
    style={[styles.mainFeatureCard, isLarge && styles.largeFeatureCard]}
    // Tambahkan style untuk kartu besar jika isLarge true
  >
    <Icon size={isLarge ? 40 : 30} color={color} />
    <Text style={[styles.mainFeatureText, isLarge && styles.largeFeatureText]}>{label}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const avgSleep = (sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length).toFixed(1);
  const maxHours = Math.max(...sleepData.map(d => d.hours));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER - Simple gradient + moon/stars + sleep display */}
        <LinearGradient
          colors={['#6B9DC3', '#8FB3D5', '#A7C7E7', '#C5DCF0']}
          style={styles.headerGradient}
        >
          {/* Profile Button */}
          <TouchableOpacity style={styles.profileBtn}>
            <View style={styles.profileCircle}>
              <User size={18} color={colors.primary} />
            </View>
            <Text style={styles.byProfile}>by profile</Text>
          </TouchableOpacity>

          {/* Moon, Stars & Sleep Data (NEW PLACEMENT) */}
          <View style={styles.headerContent}>
            {/* Moon & Stars */}
            <View style={styles.moonContainer}>
              <Star size={12} color="#FFD700" fill="#FFD700" style={styles.starRight} />
              <Moon size={70} color="#FFE5B4" fill="#FFE5B4" />
              <Star size={10} color="#FFD700" fill="#FFD700" style={styles.starBottom} />
            </View>
            
            {/* Sleep Display */}
            <View style={styles.headerSleepDisplay}>
              <Text style={styles.headerTitle}>Kualitas Tidur Rata-Rata</Text>
              <View style={styles.sleepDisplayRow}>
                <Text style={styles.sleepNumberHeader}>{avgSleep}</Text>
                <Text style={styles.sleepUnitHeader}>Jam</Text>
              </View>
            </View>
          </View>

          {/* Cloud Wave at bottom */}
          <View style={styles.cloudWaveContainer}>
            <TwoLayerCloudWave />
          </View>
        </LinearGradient>

        {/* CONTENT AREA */}
        <View style={styles.contentArea}>
          {/* Stats Card (7 Hari) - UNCHANGED */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Statistik 7 Hari Terakhir</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>My Target</Text>
                <Text style={styles.statValue}>8h</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Progress</Text>
                <Text style={[styles.statValue, {color: colors.success}]}>94%</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={[styles.statValue, {color: colors.success}]}>On Track</Text>
              </View>
            </View>
           <View style={styles.chart}>
              {sleepData.map((day, index) => (
                <View key={index} style={styles.bar}>
                  <View style={styles.barContainer}>
                    <View style={[
                      styles.barFill,
                      {
                        height: `${(day.hours / maxHours) * 100}%`,
                        // Biru (colors.primary) untuk On Track (>=7h) dan Biru Muda (#A7C7E7) untuk Off Track
                        backgroundColor: day.hours >= 7 ? colors.primary : '#A7C7E7' 
                      }
                    ]}>
                    </View>
                  </View>
                  {/* BARU: Teks Jam di atas barContainer */}
                  <Text style={styles.barTextNew}>{day.hours}h</Text>
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>


          {/* Main Features (NEW) - Menggantikan Activities & Menu Products */}
        <View style={styles.mainFeaturesGrid}>
          <View style={styles.mainFeaturesRow}>
            {/* Kartu Gratitude Notes (Kartu Besar di Kiri) */}
            <MainFeatureCard {...mainFeatures[0]} isLarge={true} />
            
            {/* Kartu Musik Relaksasi & Jadwal Atur Tidur (Dua Kecil di Kanan) */}
            <View style={styles.smallFeaturesCol}>
              {mainFeatures.slice(1).map((feature, index) => (
                <MainFeatureCard key={index} {...feature} />
              ))}
            </View>
          </View>
        </View>

          {/* Tips - UNCHANGED */}
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
  
  // HEADER with gradient (REVISED)
  headerGradient: {
    height: 300, // Tambah tinggi untuk konten baru
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 20, // Untuk jarak dari cloud
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40, // Jarak ke cloud wave
  },
  
  // Moon & Stars (REVISED POSITION)
  moonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // Tidak lagi absolute ke seluruh header, tapi ke headerContent
  },
  starRight: {
    position: 'absolute',
  bottom: 50,
    right: 10,
  },
  starBottom: {
    position: 'absolute',
    bottom: 50,
    right: 10,
  },
  
  // Sleep Display in Header (NEW STYLES)
  headerSleepDisplay: {
    alignItems: 'center',
    marginBottom:10 
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 5,
  },
  sleepDisplayRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sleepNumberHeader: {
    fontSize: 70,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 80,
    marginRight: 5,
  },
  sleepUnitHeader: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 10,
  },
  vmTextHeader: {
    fontSize: 11,
    color: '#D4E2F0', // Warna lebih terang untuk kontras
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  cloudWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  
  // Profile (UNTOUCHED)
  profileBtn: {
    position: 'absolute',
    top: 40, // Adjust top position for SafeAreaView/status bar
    right: 15,
    alignItems: 'center',
    zIndex: 10, // Pastikan di atas gradient
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  byProfile: {
    fontSize: 9,
    color: '#2C3E50',
    marginTop: 3,
    fontWeight: '600',
  },
  
  // Content
  contentArea: {
    padding: 20,
    marginTop: -40, // Masih perlu untuk menumpuk di atas cloud wave
  },
  
  // Wind Down Button (NEW PLACEMENT & STYLE)
  windDownBtnArea: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  windDownBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Stats Card (UNTOUCHED)
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Stats (UNTOUCHED)
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
  
  // Chart (REVISED - Bar Text placement)
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160, // Tambah tinggi untuk teks di atas bar
    gap: 10, // Tambah gap antar bar
  },
  bar: {
    flex: 1,
    alignItems: 'center',
    gap: 4, // Jarak label ke bar
  },
  barContainer: {
    width: '100%',
    height: 120, // Tinggi bar lebih besar
    justifyContent: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barTextNew: { // Text di atas bar
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
  
  // Stat boxes (UNTOUCHED)
  statBoxes: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.lightBg,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  boxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 3,
  },
  boxLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  
// Main Features (NEW SECTION)
 mainFeaturesGrid: {
    marginBottom: 16,
    paddingTop: 10,
  },
mainFeaturesRow: {
    flexDirection: 'row', // Atur dalam satu baris
    justifyContent: 'space-between',
    gap: 10,
  },
  mainFeatureCard: {
    // Styling dasar untuk kartu kecil
    width: '100%', // Di dalam smallFeaturesCol, ini akan menyesuaikan 100% dari kolom tersebut
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
    width: '49%', // Ambil setengah lebar
    height: 185, // Tinggi yang sama dengan dua kartu kecil di kanan
    paddingVertical: 30, // Padding yang lebih besar
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
  
  // Icon Circle Styles
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Container untuk dua kartu kecil di kanan
  smallFeaturesCol: {
    width: '49%', // Ambil setengah lebar
    justifyContent: 'space-between',
  },
  // Tips (UNTOUCHED)
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