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
  AppState,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { musicService, MusicCategoryWithTracks, MusicTrack } from '../services/music';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MusicRelaxationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, theme } = useTheme();

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
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        // PENTING: Konfigurasi untuk background playback
        await Audio.setAudioModeAsync({
          // iOS
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          shouldDuckAndroid: false,
          
          // Android - KUNCI UTAMA untuk background
          staysActiveInBackground: true,
          playsThroughEarpieceAndroid: false,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
      } catch (err) {
        console.warn('Gagal mengatur audio mode:', err);
      }
    };

    setupAudio();
    loadData();

    // Handle app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App kembali ke foreground - sync state
        syncPlaybackState();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      deactivateKeepAwake();
    };
  }, []);

  // Sync playback state when returning from background
  const syncPlaybackState = async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setCurrentPosition(status.positionMillis / 1000);
          setCurrentDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        }
      } catch (error) {
        console.error('Error syncing playback state:', error);
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await musicService.getCategoriesWithTracks();
      setCategories(data);

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
      // Jika track yang sama sedang diputar
      if (playingTrack === track.id && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          deactivateKeepAwake(); // Matikan keep awake saat pause
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          await activateKeepAwakeAsync(); // Aktifkan keep awake saat play
        }
        return;
      }

      // Hentikan track sebelumnya
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setCurrentPosition(0);
        setCurrentDuration(0);
        deactivateKeepAwake();
      }

      if (!track.public_url) {
        Alert.alert('Error', 'URL musik tidak ditemukan');
        return;
      }

      // Buat sound dengan konfigurasi background
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.public_url },
        { 
          shouldPlay: true,
          isLooping: false,
          // PENTING: Ini memungkinkan audio berjalan di background
          progressUpdateIntervalMillis: 1000,
        }
      );

      soundRef.current = sound;
      setPlayingTrack(track.id);
      setIsPlaying(true);
      
      // Aktifkan keep awake untuk mencegah layar mati menghentikan audio
      await activateKeepAwakeAsync();

      if (user) {
        await musicService.recordPlay(user.id, track.id);
      }

      // Update progress
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (!isSeeking) {
            setCurrentPosition(status.positionMillis / 1000);
            setCurrentDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
          }
          
          // Update playing state
          setIsPlaying(status.isPlaying);
          
          if (status.didJustFinish) {
            setPlayingTrack(null);
            setIsPlaying(false);
            setCurrentPosition(0);
            setCurrentDuration(0);
            deactivateKeepAwake();
          }
        }
      });
    } catch (error: any) {
      console.error('Error playing track:', error);
      deactivateKeepAwake();
      
      if (error.message?.includes('AudioFocusNotAcquiredException')) {
        Alert.alert(
          'Audio Sedang Digunakan',
          'Aplikasi lain sedang memutar audio. Silakan hentikan dulu, lalu coba lagi.'
        );
      } else {
        Alert.alert('Error', 'Gagal memutar musik: ' + (error.message || ''));
      }
    }
  };

  const toggleFavorite = async (trackId: string) => {
    if (!user) {
      Alert.alert('Info', 'Silakan login untuk menyimpan favorit');
      return;
    }

    try {
      const isFavorited = await musicService.toggleFavorite(user.id, trackId);
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (isFavorited) newSet.add(trackId);
        else newSet.delete(trackId);
        return newSet;
      });
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
        style={[styles.favoriteCard, { backgroundColor: colors.card }]}
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
        <Text style={[styles.favoriteName, { color: colors.text }]} numberOfLines={2}>
          {track.name}
        </Text>
        <Text style={[styles.favoriteDuration, { color: colors.secondaryText }]}>
          {musicService.formatDuration(track.duration)}
        </Text>
        {isCurrentlyPlaying && (
          <View style={styles.favoritePlayingBadge}>
            <View style={[styles.favoritePlayingDot, { backgroundColor: colors.primary }]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrack = (track: MusicTrack) => {
    const isFavorite = favorites.has(track.id);
    const isCurrentlyPlaying = playingTrack === track.id;
    return (
      <View key={track.id} style={[styles.trackCard, { backgroundColor: colors.card }]}>
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
            <Text style={[styles.trackName, { color: colors.text }]}>{track.name}</Text>
            <Text style={[styles.trackDuration, { color: colors.secondaryText }]}>
              {musicService.formatDuration(track.duration)}
            </Text>
          </View>
          {isCurrentlyPlaying && (
            <View style={styles.playingIndicator}>
              <View style={[styles.playingDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.playingText, { color: colors.primary }]}>Playing</Text>
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

  const headerGradient = theme === 'dark'
    ? ['#1A2A3A', '#253746']
    : ['#6B9DC3', '#8FB3D5'];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={styles.container}>
          <LinearGradient colors={headerGradient} style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color={colors.textLight} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textLight }]}>Musik Relaksasi</Text>
              <View style={styles.placeholder} />
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
              Dengarkan musik untuk tidur lebih nyenyak 🎵
            </Text>
          </LinearGradient>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Memuat musik...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={headerGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.textLight} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textLight }]}>Musik Relaksasi</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
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
          {user && getFavoriteTracks().length > 0 && (
            <View style={styles.favoritesSection}>
              <View style={styles.favoritesSectionHeader}>
                <Heart size={20} color={colors.danger} fill={colors.danger} />
                <Text style={[styles.favoritesSectionTitle, { color: colors.text }]}>Musik Favorit</Text>
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

          {playingTrack && (
            <View style={[styles.nowPlayingCard, { backgroundColor: colors.primary }]}>
              <View style={styles.nowPlayingHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nowPlayingLabel, { color: colors.textLight }]}>Sedang Diputar</Text>
                  <Text style={[styles.nowPlayingTitle, { color: colors.textLight }]}>
                    {categories
                      .flatMap(cat => cat.tracks)
                      .find(t => t.id === playingTrack)?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.nowPlayingPlayButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
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

              <View style={styles.progressContainer}>
                <Text style={[styles.progressTime, { color: colors.textLight }]}>
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
                <Text style={[styles.progressTime, { color: colors.textLight }]}>
                  {musicService.formatDuration(Math.floor(currentDuration))}
                </Text>
              </View>

              <View style={styles.waveform}>
                {[...Array(20)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.waveformBar,
                      { 
                        height: isPlaying ? Math.random() * 30 + 10 : 15,
                        opacity: isPlaying ? 0.7 : 0.3,
                        backgroundColor: colors.textLight,
                      }
                    ]} 
                  />
                ))}
              </View>
            </View>
          )}

          {categories.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={styles.emptyStateEmoji}>🎵</Text>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Belum Ada Musik</Text>
              <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                Musik relaksasi akan segera tersedia
              </Text>
            </View>
          ) : (
            <>
              {categories.map((category) => (
                <View key={category.id} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={[styles.categoryIcon, { color: colors.text }]}>{category.icon}</Text>
                    <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.name}</Text>
                  </View>
                  {category.description && (
                    <Text style={[styles.categoryDescription, { color: colors.secondaryText }]}>
                      {category.description}
                    </Text>
                  )}
                  <View style={styles.tracksContainer}>
                    {category.tracks.length === 0 ? (
                      <Text style={[styles.noTracksText, { color: colors.secondaryText }]}>
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

          <View style={[
            styles.tipsCard,
            { 
              backgroundColor: theme === 'dark' ? colors.warning + '20' : '#FFF9E6',
              borderLeftColor: colors.warning
            }
          ]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Tips Penggunaan</Text>
            <Text style={[styles.tipsText, { color: colors.text }]}>
              • Gunakan headphone atau speaker berkualitas{'\n'}
              • Atur volume yang nyaman (tidak terlalu keras){'\n'}
              • Dengarkan 30-60 menit sebelum tidur{'\n'}
              • Musik akan tetap berjalan di background{'\n'}
              • Kombinasikan dengan teknik pernapasan dalam
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
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
  },
  favoritesScroll: {
    paddingRight: 20,
    gap: 12,
  },
  favoriteCard: {
    width: 140,
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
    textAlign: 'center',
    minHeight: 36,
  },
  favoriteDuration: {
    fontSize: 12,
    textAlign: 'center',
  },
  favoritePlayingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  favoritePlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nowPlayingCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
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
  },
  categoryDescription: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tracksContainer: {
    gap: 10,
  },
  noTracksText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  trackDuration: {
    fontSize: 13,
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
  },
  playingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
