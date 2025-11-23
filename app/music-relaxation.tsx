import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Pause, Play, Heart } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { musicService, MusicCategoryWithTracks, MusicTrack } from '../services/music';

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  textLight: '#FFFFFF',
  danger: '#EF5350',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MusicRelaxationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<MusicCategoryWithTracks[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    loadData();

    return () => {
      // Cleanup audio on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories with tracks
      const data = await musicService.getCategoriesWithTracks();
      setCategories(data);

      // Load user favorites if logged in
      if (user) {
        const userFavorites = await musicService.getUserFavorites(user.id);
        setFavorites(new Set(userFavorites.map(t => t.id)));
      }
    } catch (error: any) {
      console.error('Error loading music data:', error);
      Alert.alert('Error', 'Gagal memuat data musik');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const togglePlay = async (track: MusicTrack) => {
    try {
      // If same track is playing, pause it
      if (playingTrack === track.id && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Stop current track if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setCurrentPosition(0);
        setCurrentDuration(0);
      }

      // Load and play new track
      if (!track.public_url) {
        Alert.alert('Error', 'URL musik tidak ditemukan');
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.public_url },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 }
      );

      soundRef.current = sound;
      setPlayingTrack(track.id);
      setIsPlaying(true);

      // Record play history
      if (user) {
        await musicService.recordPlay(user.id, track.id);
      }

      // Listen for playback status updates
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (!isSeeking) {
            setCurrentPosition(status.positionMillis / 1000);
            setCurrentDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
          }
          
          if (status.didJustFinish) {
            setPlayingTrack(null);
            setIsPlaying(false);
            setCurrentPosition(0);
            setCurrentDuration(0);
          }
        }
      });
    } catch (error: any) {
      console.error('Error playing track:', error);
      Alert.alert('Error', 'Gagal memutar musik');
    }
  };

  const toggleFavorite = async (trackId: string) => {
    if (!user) {
      Alert.alert('Info', 'Silakan login untuk menyimpan favorit');
      return;
    }

    try {
      const isFavorited = await musicService.toggleFavorite(user.id, trackId);
      
      // Update local state
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(trackId);
        } else {
          newSet.delete(trackId);
        }
        return newSet;
      });

      // Reload data to update favorites list
      await loadData();
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Gagal menyimpan favorit');
    }
  };

  const onSliderValueChange = async (value: number) => {
    if (soundRef.current) {
      setIsSeeking(true);
      setCurrentPosition(value);
    }
  };

  const onSliderSlidingComplete = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value * 1000);
      setIsSeeking(false);
    }
  };

  const getFavoriteTracks = () => {
    const allTracks = categories.flatMap(cat => cat.tracks);
    return allTracks.filter(track => favorites.has(track.id));
  };

  const renderFavoriteCard = (track: MusicTrack) => {
    const isCurrentlyPlaying = playingTrack === track.id;
    
    return (
      <TouchableOpacity
        key={track.id}
        style={styles.favoriteCard}
        onPress={() => togglePlay(track)}
        activeOpacity={0.7}
      >
        <View style={[styles.favoriteIcon, { backgroundColor: track.color }]}>
          {isCurrentlyPlaying && isPlaying ? (
            <Pause size={20} color={colors.textLight} fill={colors.textLight} />
          ) : (
            <Play size={20} color={colors.textLight} fill={colors.textLight} />
          )}
        </View>
        <Text style={styles.favoriteName} numberOfLines={2}>
          {track.name}
        </Text>
        <Text style={styles.favoriteDuration}>
          {musicService.formatDuration(track.duration)}
        </Text>
        {isCurrentlyPlaying && (
          <View style={styles.favoritePlayingBadge}>
            <View style={styles.favoritePlayingDot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrack = (track: MusicTrack) => {
    const isFavorite = favorites.has(track.id);
    const isCurrentlyPlaying = playingTrack === track.id;
    
    return (
      <View key={track.id} style={styles.trackCard}>
        <TouchableOpacity
          style={styles.trackContent}
          onPress={() => togglePlay(track)}
        >
          <View style={[styles.trackIcon, { backgroundColor: track.color }]}>
            {isCurrentlyPlaying && isPlaying ? (
              <Pause size={24} color={colors.textLight} fill={colors.textLight} />
            ) : (
              <Play size={24} color={colors.textLight} fill={colors.textLight} />
            )}
          </View>
          <View style={styles.trackInfo}>
            <Text style={styles.trackName}>{track.name}</Text>
            <Text style={styles.trackDuration}>
              {musicService.formatDuration(track.duration)}
            </Text>
          </View>
          {isCurrentlyPlaying && (
            <View style={styles.playingIndicator}>
              <View style={styles.playingDot} />
              <Text style={styles.playingText}>Playing</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {user && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(track.id)}
          >
            <Heart
              size={20}
              color={isFavorite ? colors.danger : colors.secondaryText}
              fill={isFavorite ? colors.danger : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6B9DC3', '#8FB3D5']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
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
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat musik...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6B9DC3', '#8FB3D5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Favorites Section */}
        {user && getFavoriteTracks().length > 0 && (
          <View style={styles.favoritesSection}>
            <View style={styles.favoritesSectionHeader}>
              <Heart size={20} color={colors.danger} fill={colors.danger} />
              <Text style={styles.favoritesSectionTitle}>Musik Favorit</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesScroll}
            >
              {getFavoriteTracks().map(renderFavoriteCard)}
            </ScrollView>
          </View>
        )}

        {/* Now Playing Section */}
        {playingTrack && (
          <View style={styles.nowPlayingCard}>
            <View style={styles.nowPlayingHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nowPlayingLabel}>Sedang Diputar</Text>
                <Text style={styles.nowPlayingTitle}>
                  {categories
                    .flatMap(cat => cat.tracks)
                    .find(t => t.id === playingTrack)?.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.nowPlayingPlayButton}
                onPress={() => {
                  const track = categories
                    .flatMap(cat => cat.tracks)
                    .find(t => t.id === playingTrack);
                  if (track) togglePlay(track);
                }}
              >
                {isPlaying ? (
                  <Pause size={28} color={colors.textLight} fill={colors.textLight} />
                ) : (
                  <Play size={28} color={colors.textLight} fill={colors.textLight} />
                )}
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressTime}>
                {musicService.formatDuration(Math.floor(currentPosition))}
              </Text>
              <Slider
                style={styles.progressSlider}
                minimumValue={0}
                maximumValue={currentDuration || 1}
                value={currentPosition}
                onValueChange={onSliderValueChange}
                onSlidingComplete={onSliderSlidingComplete}
                minimumTrackTintColor={colors.textLight}
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor={colors.textLight}
              />
              <Text style={styles.progressTime}>
                {musicService.formatDuration(Math.floor(currentDuration))}
              </Text>
            </View>

            {/* Waveform */}
            <View style={styles.waveform}>
              {[...Array(20)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveformBar,
                    { 
                      height: isPlaying ? Math.random() * 30 + 10 : 15,
                      opacity: isPlaying ? 0.7 : 0.3
                    }
                  ]} 
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎵</Text>
            <Text style={styles.emptyStateTitle}>Belum Ada Musik</Text>
            <Text style={styles.emptyStateText}>
              Musik relaksasi akan segera tersedia
            </Text>
          </View>
        ) : (
          <>
            {/* Music Categories */}
            {categories.map((category) => (
              <View key={category.id} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                </View>
                {category.description && (
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                )}
                <View style={styles.tracksContainer}>
                  {category.tracks.length === 0 ? (
                    <Text style={styles.noTracksText}>
                      Belum ada musik di kategori ini
                    </Text>
                  ) : (
                    category.tracks.map(renderTrack)
                  )}
                </View>
              </View>
            ))}
          </>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  favoritesSection: {
    marginBottom: 20,
  },
  favoritesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  favoritesSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  favoritesScroll: {
    paddingRight: 20,
    gap: 12,
  },
  favoriteCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  favoriteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    minHeight: 36,
  },
  favoriteDuration: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  favoritePlayingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  favoritePlayingDot: {
    width: '100%',
    height: '100%',
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
  nowPlayingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nowPlayingPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingLabel: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.8,
    marginBottom: 4,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
    flex: 1,
    marginRight: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  progressTime: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
    minWidth: 40,
  },
  progressSlider: {
    flex: 1,
    height: 40,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  tracksContainer: {
    gap: 10,
  },
  noTracksText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
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
  trackContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
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
  favoriteButton: {
    padding: 8,
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
