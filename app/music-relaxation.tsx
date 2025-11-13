import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Pause, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  textLight: '#FFFFFF',
};

const musicCategories = [
  {
    id: '1',
    title: 'Meditasi & Mindfulness',
    tracks: [
      { id: '1-1', name: 'Deep Breathing', duration: '10:00', color: '#A7C7E7' },
      { id: '1-2', name: 'Body Scan Meditation', duration: '15:00', color: '#8FB3D5' },
      { id: '1-3', name: 'Mindful Sleep', duration: '20:00', color: '#7BA5C9' },
    ],
  },
  {
    id: '2',
    title: 'Suara Alam',
    tracks: [
      { id: '2-1', name: 'Ocean Waves', duration: '30:00', color: '#6B9DC3' },
      { id: '2-2', name: 'Rain Sounds', duration: '45:00', color: '#5B9BD5' },
      { id: '2-3', name: 'Forest Birds', duration: '25:00', color: '#4A8AB8' },
    ],
  },
  {
    id: '3',
    title: 'Musik Instrumental',
    tracks: [
      { id: '3-1', name: 'Piano Lullaby', duration: '12:00', color: '#A7C7E7' },
      { id: '3-2', name: 'Guitar Melody', duration: '18:00', color: '#8FB3D5' },
      { id: '3-3', name: 'Soft Classical', duration: '22:00', color: '#7BA5C9' },
    ],
  },
  {
    id: '4',
    title: 'White Noise',
    tracks: [
      { id: '4-1', name: 'Pink Noise', duration: '60:00', color: '#6B9DC3' },
      { id: '4-2', name: 'Brown Noise', duration: '60:00', color: '#5B9BD5' },
      { id: '4-3', name: 'Fan Sounds', duration: '60:00', color: '#4A8AB8' },
    ],
  },
];

export default function MusicRelaxationScreen({ navigation }) {
  const [playingTrack, setPlayingTrack] = useState(null);

  const togglePlay = (trackId) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

  const renderTrack = (track) => (
    <TouchableOpacity
      key={track.id}
      style={styles.trackCard}
      onPress={() => togglePlay(track.id)}
    >
      <View style={[styles.trackIcon, { backgroundColor: track.color }]}>
        {playingTrack === track.id ? (
          <Pause size={24} color={colors.textLight} fill={colors.textLight} />
        ) : (
          <Play size={24} color={colors.textLight} fill={colors.textLight} />
        )}
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName}>{track.name}</Text>
        <Text style={styles.trackDuration}>{track.duration}</Text>
      </View>
      {playingTrack === track.id && (
        <View style={styles.playingIndicator}>
          <View style={styles.playingDot} />
          <Text style={styles.playingText}>Playing</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B9DC3', '#8FB3D5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Musik Relaksasi</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          Dengarkan musik untuk tidur lebih nyenyak 🎵
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Now Playing Section */}
        {playingTrack && (
          <View style={styles.nowPlayingCard}>
            <Text style={styles.nowPlayingLabel}>Sedang Diputar</Text>
            <Text style={styles.nowPlayingTitle}>
              {musicCategories
                .flatMap(cat => cat.tracks)
                .find(t => t.id === playingTrack)?.name}
            </Text>
            <View style={styles.waveform}>
              {[...Array(20)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveformBar,
                    { height: Math.random() * 30 + 10 }
                  ]} 
                />
              ))}
            </View>
          </View>
        )}

        {/* Music Categories */}
        {musicCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.tracksContainer}>
              {category.tracks.map(renderTrack)}
            </View>
          </View>
        ))}

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips Penggunaan</Text>
          <Text style={styles.tipsText}>
            • Gunakan headphone atau speaker berkualitas{'\n'}
            • Atur volume yang nyaman (tidak terlalu keras){'\n'}
            • Dengarkan 30-60 menit sebelum tidur{'\n'}
            • Kombinasikan dengan teknik pernapasan dalam
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  nowPlayingCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  nowPlayingLabel: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.8,
    marginBottom: 4,
  },
  nowPlayingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 16,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  waveformBar: {
    width: 3,
    backgroundColor: colors.textLight,
    borderRadius: 2,
    opacity: 0.7,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tracksContainer: {
    gap: 10,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trackIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  trackDuration: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  playingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});