import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // ✅
import { gratitudeNotesService } from '../services/gratitudeNotes';
import { Database } from '../types/database.types';

type GratitudeNote = Database['public']['Tables']['gratitude_notes']['Row'];

export default function GratitudeNotesScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, theme } = useTheme(); // ✅

  const [notes, setNotes] = useState<GratitudeNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await gratitudeNotesService.getAll(user!.id);
      setNotes(data);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Gagal memuat catatan gratitude');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, [user]);

  const addNote = async () => {
    if (newNote.trim() === '') {
      Alert.alert('Perhatian', 'Mohon tulis catatan gratitude Anda');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'User tidak ditemukan');
      return;
    }

    setSubmitting(true);
    try {
      const note = await gratitudeNotesService.create({
        user_id: user.id,
        text: newNote.trim(),
        date: new Date().toISOString().split('T')[0],
      });
      setNotes([note, ...notes]);
      setNewNote('');
      setIsAdding(false);
      Alert.alert('Berhasil', 'Catatan gratitude berhasil ditambahkan! 🌟');
    } catch (error: any) {
      console.error('Error adding note:', error);
      Alert.alert('Error', error.message || 'Gagal menambahkan catatan');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = (note: GratitudeNote) => {
    Alert.alert(
      'Hapus Catatan',
      'Apakah Anda yakin ingin menghapus catatan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await gratitudeNotesService.delete(note.id);
              setNotes(notes.filter(n => n.id !== note.id));
              Alert.alert('Berhasil', 'Catatan berhasil dihapus');
            } catch (error: any) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Gagal menghapus catatan');
            }
          },
        },
      ]
    );
  };

  const renderNote = ({ item }: { item: GratitudeNote }) => (
    <View style={[styles.noteCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
      <View style={styles.noteHeader}>
        <Text style={[styles.noteDate, { color: colors.secondaryText }]}>{formatDate(item.date)}</Text>
        <TouchableOpacity onPress={() => deleteNote(item)}>
          <Trash2 size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.noteText, { color: colors.text }]}>{item.text}</Text>
    </View>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // ✅ Gradient header responsif
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
                onPress={() => navigation.goBack()}
              >
                <ChevronLeft size={24} color={colors.textLight} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textLight }]}>Gratitude Notes</Text>
              <View style={styles.placeholder} />
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
              Catat hal-hal baik hari ini sebelum tidur 🌙
            </Text>
          </LinearGradient>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Memuat catatan...
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
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={colors.textLight} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textLight }]}>Gratitude Notes</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
            Catat hal-hal baik hari ini sebelum tidur 🌙
          </Text>
        </LinearGradient>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {!isAdding ? (
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsAdding(true)}
            >
              <Plus size={24} color={colors.textLight} />
              <Text style={[styles.addButtonText, { color: colors.textLight }]}>
                Tambah Catatan Baru
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.addNoteForm, { backgroundColor: colors.card }]}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: colors.text,
                    backgroundColor: colors.inputBackground,
                    placeholderTextColor: colors.secondaryText,
                  }
                ]}
                placeholder="Tuliskan hal yang Anda syukuri hari ini..."
                multiline
                numberOfLines={4}
                value={newNote}
                onChangeText={setNewNote}
                autoFocus
                editable={!submitting}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton, { backgroundColor: colors.secondaryButton }]}
                  onPress={() => {
                    setIsAdding(false);
                    setNewNote('');
                  }}
                  disabled={submitting}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>
                    Batal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.formButton,
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                    submitting && styles.saveButtonDisabled
                  ]}
                  onPress={addNote}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.textLight} size="small" />
                  ) : (
                    <Text style={[styles.saveButtonText, { color: colors.textLight }]}>
                      Simpan
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.notesContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Catatan Saya ({notes.length})
            </Text>
            {notes.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Text style={styles.emptyStateEmoji}>📝</Text>
                <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                  Belum ada catatan gratitude.{'\n'}
                  Mulai tulis hal positif hari ini!
                </Text>
              </View>
            ) : (
              <FlatList
                data={notes}
                renderItem={renderNote}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notesList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                  />
                }
              />
            )}
          </View>
        </KeyboardAvoidingView>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  addNoteForm: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    fontSize: 15,
    padding: 12,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  notesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  notesList: {
    paddingBottom: 20,
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
