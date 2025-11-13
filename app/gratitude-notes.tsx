import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const colors = {
  primary: '#5B9BD5',
  text: '#2C3E50',
  secondaryText: '#7F8C8D',
  textLight: '#FFFFFF',
  success: '#4CAF50',
  lightBg: '#E8F4F8',
};

export default function GratitudeNotesScreen({ navigation }) {
  const [notes, setNotes] = useState([
    { id: '1', text: 'Hari ini saya bersyukur bisa menyelesaikan pekerjaan tepat waktu', date: '2024-11-13' },
    { id: '2', text: 'Senang bisa bertemu keluarga dan makan malam bersama', date: '2024-11-12' },
  ]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addNote = () => {
    if (newNote.trim() === '') {
      Alert.alert('Perhatian', 'Mohon tulis catatan gratitude Anda');
      return;
    }

    const note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setNotes([note, ...notes]);
    setNewNote('');
    setIsAdding(false);
    Alert.alert('Berhasil', 'Catatan gratitude berhasil ditambahkan! 🌟');
  };

  const deleteNote = (id) => {
    Alert.alert(
      'Hapus Catatan',
      'Apakah Anda yakin ingin menghapus catatan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => setNotes(notes.filter(note => note.id !== id)),
        },
      ]
    );
  };

  const renderNote = ({ item }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Trash2 size={18} color="#EF5350" />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteText}>{item.text}</Text>
    </View>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

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
          <Text style={styles.headerTitle}>Gratitude Notes</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          Catat hal-hal baik hari ini sebelum tidur 🌙
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Add Note Button/Form */}
        {!isAdding ? (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
            <Plus size={24} color={colors.textLight} />
            <Text style={styles.addButtonText}>Tambah Catatan Baru</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addNoteForm}>
            <TextInput
              style={styles.textInput}
              placeholder="Tuliskan hal yang Anda syukuri hari ini..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={4}
              value={newNote}
              onChangeText={setNewNote}
              autoFocus
            />
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]}
                onPress={addNote}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes List */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Catatan Saya ({notes.length})</Text>
          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Belum ada catatan gratitude.{'\n'}
                Mulai tulis hal positif hari ini!
              </Text>
            </View>
          ) : (
            <FlatList
              data={notes}
              renderItem={renderNote}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.notesList}
            />
          )}
        </View>
      </KeyboardAvoidingView>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  addNoteForm: {
    backgroundColor: '#FFF',
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
    color: colors.text,
    padding: 12,
    backgroundColor: colors.lightBg,
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
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textLight,
  },
  notesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  notesList: {
    paddingBottom: 20,
  },
  noteCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
    color: colors.secondaryText,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
});