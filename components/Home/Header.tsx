import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Star, User } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  textLight: '#FFFFFF',
};

// Animated Two-Layer Cloud Wave Component
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
          left: -50,
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
          left: -30,
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

// Main Header Component
const Header = ({ avgSleep, onProfilePress }) => {
  return (
    <LinearGradient
      colors={['#6B9DC3', '#8FB3D5', '#A7C7E7', '#C5DCF0']}
      style={styles.headerGradient}
    >
      {/* Profile Button */}
      <TouchableOpacity style={styles.profileBtn} onPress={onProfilePress}>
        <View style={styles.profileCircle}>
          <User size={18} color={colors.primary} />
        </View>
        <Text style={styles.byProfile}>by profile</Text>
      </TouchableOpacity>

      {/* Moon, Stars & Sleep Data */}
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
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    height: 300,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  
  // Moon & Stars
  moonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  
  // Sleep Display in Header
  headerSleepDisplay: {
    alignItems: 'center',
    marginBottom: 10,
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
  
  cloudWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  
  // Profile Button
  profileBtn: {
    position: 'absolute',
    top: 40,
    right: 15,
    alignItems: 'center',
    zIndex: 10,
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
});

export default Header;