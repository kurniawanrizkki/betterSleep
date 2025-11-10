import React from 'react';
import { 
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { 
  Moon, 
  Star,
  BookOpen, 
  Music, 
  Wind,
  User,
  Sparkles,
  Calendar
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

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

// Simple Cloud Wave - ONE LAYER seperti reference
const SimpleCloudWave = () => {
  return (
    <Svg height="120" width={screenWidth} style={styles.cloudWave}>
      <Path
        d={`
          M 0,40
          C ${screenWidth * 0.2},20 ${screenWidth * 0.3},30 ${screenWidth * 0.5},25
          C ${screenWidth * 0.7},20 ${screenWidth * 0.8},35 ${screenWidth},30
          L ${screenWidth},120
          L 0,120
          Z
        `}
        fill="#FFFFFF"
      />
    </Svg>
  );
};

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
        {/* HEADER - Simple gradient + cloud */}
        <LinearGradient
          colors={['#6B9DC3', '#8FB3D5', '#A7C7E7', '#C5DCF0']}
          style={styles.headerGradient}
        >
          {/* Moon & Stars */}
          <View style={styles.skyContent}>
            <Star size={14} color="#FFD700" fill="#FFD700" style={styles.starTop} />
            <View style={styles.moonContainer}>
              <Moon size={60} color="#FFE5B4" fill="#FFE5B4" />
            </View>
            <Star size={12} color="#FFD700" fill="#FFD700" style={styles.starRight} />
            <Star size={10} color="#FFD700" fill="#FFD700" style={styles.starBottom} />
          </View>

          {/* Cloud Wave at bottom */}
          <View style={styles.cloudWaveContainer}>
            <SimpleCloudWave />
          </View>

          {/* Profile */}
          <TouchableOpacity style={styles.profileBtn}>
            <View style={styles.profileCircle}>
              <User size={18} color={colors.primary} />
            </View>
            <Text style={styles.byProfile}>by profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* CONTENT AREA */}
        <View style={styles.contentArea}>
          {/* Sleep Card */}
          <View style={styles.sleepCard}>
            <Text style={styles.cardTitle}>Kualitas Tidur Malam Ini</Text>
            
            <View style={styles.sleepDisplay}>
              <Text style={styles.sleepNumber}>{avgSleep}</Text>
              <Text style={styles.sleepUnit}>Jam</Text>
            </View>

            <Text style={styles.vmText}>Vm bisa dipake eeg</Text>

            <TouchableOpacity style={styles.windDownBtn}>
              <Text style={styles.windDownBtnText}>Mulai Wind-Down (21:00)</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Card */}
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
                        backgroundColor: day.hours >= 7 ? colors.success : colors.warning
                      }
                    ]}>
                      <Text style={styles.barText}>{day.hours}h</Text>
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Mania */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Statistik Mania</Text>
            <View style={styles.statBoxes}>
              <View style={styles.statBox}>
                <Text style={styles.boxValue}>82%</Text>
                <Text style={styles.boxLabel}>Sleep Rate</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.boxValue}>7h 2m</Text>
                <Text style={styles.boxLabel}>Sleep Time</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.boxValue}>1h</Text>
                <Text style={styles.boxLabel}>Deep Sleep</Text>
              </View>
            </View>
          </View>

          {/* Activities */}
          <View style={styles.activitiesRow}>
            <View style={styles.activityCard}>
              <Calendar size={30} color={colors.primary} />
              <Text style={styles.activityText}>Akt Jadwal</Text>
            </View>
            <View style={styles.activityCard}>
              <Music size={30} color={colors.primary} />
              <Text style={styles.activityText}>Relaksasi musik o medte</Text>
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

          {/* Menu */}
          <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>Menu Products</Text>
            <View style={styles.menuRow}>
              <View style={styles.menuItem}>
                <BookOpen size={26} color={colors.primary} />
                <Text style={styles.menuLabel}>Journal</Text>
              </View>
              <View style={styles.menuItem}>
                <Music size={26} color={colors.primary} />
                <Text style={styles.menuLabel}>Music</Text>
              </View>
              <View style={styles.menuItem}>
                <Wind size={26} color={colors.primary} />
                <Text style={styles.menuLabel}>Relax</Text>
              </View>
            </View>
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
  
  // HEADER with gradient
  headerGradient: {
    height: 280,
    position: 'relative',
  },
  skyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  moonContainer: {
    position:"absolute",
    top:120,
  },
  starTop: {
    position: 'absolute',
    top: 130,
    right:180,
  },
  starRight: {
    position: 'absolute',
    top: 130,
    right:180,
  },
  starBottom: {
    position: 'absolute',
    bottom: 80,
    left: screenWidth * 0.35,
  },
  
  // Cloud wave
  cloudWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cloudWave: {
    position: 'absolute',
    bottom: 0,
  },
  
  // Profile
  profileBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    alignItems: 'center',
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
    marginTop: -40,
  },
  
  // Cards
  sleepCard: {
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
  
  // Sleep display
  sleepDisplay: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sleepNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 70,
  },
  sleepUnit: {
    fontSize: 16,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  vmText: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  windDownBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  windDownBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  
  // Stats
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
    height: 140,
    gap: 5,
  },
  bar: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barContainer: {
    width: '100%',
    height: 110,
    justifyContent: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    paddingTop: 4,
  },
  barText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  
  // Stat boxes
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
  
  // Activities
  activitiesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activityText: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
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
  
  // Menu
  menuSection: {
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 10,
  },
  menuItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  menuLabel: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '600',
  },
});
