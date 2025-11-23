import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  Music as MusicIcon,
  Upload,
  X,
  Folder,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { musicService, MusicCategory, MusicTrack } from '../../services/music';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker'; // ✅ Impor Picker

type ViewMode = 'categories' | 'tracks';

interface CategoryForm {
  name: string;
  description: string;
  icon: string;
  sort_order: string;
  is_active: boolean;
}

interface TrackForm {
  category_id: string;
  name: string;
  description: string;
  duration: string;
  color: string;
  is_premium: boolean;
  is_active: boolean;
}

export default function AdminMusicScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>('tracks');
  const [categories, setCategories] = useState<MusicCategory[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingCategory, setEditingCategory] = useState<MusicCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    description: '',
    icon: 'music',
    sort_order: '0',
    is_active: true,
  });

  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [trackForm, setTrackForm] = useState<TrackForm>({
    category_id: '',
    name: '',
    description: '',
    duration: '0',
    color: '#5B9BD5',
    is_premium: false,
    is_active: true,
  });
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string } | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTracks, allCategories] = await Promise.all([
        musicService.getAllTracks(),
        musicService.getAllCategories(),
      ]);
      setTracks(allTracks);
      setCategories(allCategories);
      if (allCategories.length > 0 && !editingTrack) {
        setTrackForm(prev => ({ ...prev, category_id: allCategories[0].id }));
      }
    } catch (error) {
      console.error('Error loading music data:', error);
      Alert.alert('Error', 'Failed to load music data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // --- Category Handlers ---
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      icon: 'music',
      sort_order: '0',
      is_active: true,
    });
    setModalVisible(true);
  };

  const openEditCategoryModal = (category: MusicCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'music',
      sort_order: category.sort_order.toString(),
      is_active: category.is_active,
    });
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Validation', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      const categoryData = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        icon: categoryForm.icon.trim() || 'music',
        sort_order: parseInt(categoryForm.sort_order) || 0,
        is_active: categoryForm.is_active,
      };

      if (editingCategory) {
        await musicService.updateCategory(editingCategory.id, categoryData);
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await musicService.createCategory(categoryData);
        Alert.alert('Success', 'Category created successfully');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving category:', error);
      Alert.alert('Error', error.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // --- Track Handlers ---
  const openAddTrackModal = () => {
    setEditingTrack(null);
    setTrackForm({
      category_id: categories[0]?.id || '',
      name: '',
      description: '',
      duration: '0',
      color: '#5B9BD5',
      is_premium: false,
      is_active: true,
    });
    setAudioFile(null);
    setCurrentFilePath(null);
    setModalVisible(true);
  };

  const openEditTrackModal = (track: MusicTrack) => {
    setEditingTrack(track);
    setTrackForm({
      category_id: track.category_id,
      name: track.name,
      description: track.description || '',
      duration: track.duration.toString(),
      color: track.color,
      is_premium: track.is_premium,
      is_active: track.is_active,
    });
    setAudioFile(null);
    setCurrentFilePath(track.file_path);
    setModalVisible(true);
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyContents: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAudioFile({ uri: asset.uri, name: asset.name });
        Alert.alert('File Selected', asset.name);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handleSaveTrack = async () => {
    if (!trackForm.name.trim()) {
      Alert.alert('Validation', 'Track name is required');
      return;
    }
    if (!trackForm.category_id) {
      Alert.alert('Validation', 'Category is required');
      return;
    }
    if (!editingTrack && !audioFile && !currentFilePath) {
      Alert.alert('Validation', 'Audio file is required for new tracks');
      return;
    }

    setSaving(true);
    try {
      let file_path = currentFilePath;

      if (audioFile) {
        const uploadResult = await musicService.uploadAudio(audioFile.uri, audioFile.name);
        file_path = uploadResult.filePath;
      }

      if (!file_path) {
        throw new Error("Missing audio file path after upload.");
      }

      const trackData: Partial<MusicTrack> = {
        category_id: trackForm.category_id,
        name: trackForm.name.trim(),
        description: trackForm.description.trim() || null,
        duration: parseInt(trackForm.duration) || 0,
        color: trackForm.color,
        is_premium: trackForm.is_premium,
        is_active: trackForm.is_active,
        file_path,
      };

      if (editingTrack) {
        await musicService.updateTrack(editingTrack.id, trackData);
        Alert.alert('Success', 'Track updated successfully');
      } else {
        await musicService.createTrack({
          ...trackData,
          file_path,
        } as any);
        Alert.alert('Success', 'Track created successfully');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving track:', error);
      Alert.alert('Error', error.message || 'Failed to save track');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrack = (track: MusicTrack) => {
    Alert.alert(
      'Delete Track',
      `Are you sure you want to delete "${track.name}"? This will also delete the audio file.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await musicService.deleteTrack(track.id);
              Alert.alert('Success', 'Track deleted');
              loadData();
            } catch (error: any) {
              console.error('Error deleting track:', error);
              Alert.alert('Error', 'Failed to delete track');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCategory = (category: MusicCategory) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? You must ensure no tracks are linked to this category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await musicService.deleteCategory(category.id);
              Alert.alert('Success', 'Category deleted');
              loadData();
            } catch (error: any) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const renderTrackItem = (track: MusicTrack) => (
    <View key={track.id} style={[styles.listItem, { backgroundColor: colors.card }]}>
      <MusicIcon size={20} color={colors.primary} style={{ marginRight: 12 }} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={[styles.itemMeta, { color: colors.secondaryText }]}>
          {musicService.formatDuration(track.duration)} •{' '}
          {track.is_premium ? 'Premium' : 'Free'}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => openEditTrackModal(track)}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Edit size={16} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTrack(track)}
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
        >
          <Trash2 size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = (category: MusicCategory) => (
    <View key={category.id} style={[styles.listItem, { backgroundColor: colors.card }]}>
      <Folder size={20} color={colors.primary} style={{ marginRight: 12 }} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={[styles.itemMeta, { color: colors.secondaryText }]}>
          {category.sort_order}
          {category.is_active ? ' • Active' : ' • Inactive'}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => openEditCategoryModal(category)}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Edit size={16} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(category)}
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
        >
          <Trash2 size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTrackModal = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Audio File *</Text>
        <TouchableOpacity
          style={[styles.filePicker, { borderColor: colors.primary + '40' }]}
          onPress={pickAudioFile}
          disabled={saving}
        >
          {audioFile || currentFilePath ? (
            <View style={[styles.filePickerSelected, { backgroundColor: colors.primary + '10' }]}>
              <MusicIcon size={32} color={colors.success} />
              <Text style={[styles.filePickerText, { color: colors.text }]}>
                {audioFile ? audioFile.name : currentFilePath?.split('/').pop()}
              </Text>
              <Text style={[styles.filePickerSubtext, { color: colors.secondaryText }]}>
                {currentFilePath && !audioFile ? '(Current File)' : '(New File Selected)'}
              </Text>
            </View>
          ) : (
            <View style={[styles.filePickerPlaceholder, { backgroundColor: colors.card }]}>
              <Upload size={32} color={colors.secondaryText} />
              <Text style={[styles.filePickerText, { color: colors.secondaryText }]}>
                Tap to select audio file (MP3/WAV)
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ✅ DROPDOWN KATEGORI */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
        <View style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: 0 }]}>
          <Picker
            selectedValue={trackForm.category_id}
            onValueChange={(itemValue) =>
              setTrackForm({ ...trackForm, category_id: itemValue })
            }
            style={{ color: colors.text, height: 50 }}
            dropdownIconColor={colors.text}
          >
            {categories.map((category) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Track Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={trackForm.name}
          onChangeText={(text) => setTrackForm({ ...trackForm, name: text })}
          placeholder="Enter track name"
          placeholderTextColor={colors.secondaryText}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
          ]}
          value={trackForm.description}
          onChangeText={(text) => setTrackForm({ ...trackForm, description: text })}
          placeholder="Enter track description (optional)"
          placeholderTextColor={colors.secondaryText}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Duration (seconds)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={trackForm.duration}
          onChangeText={(text) => setTrackForm({ ...trackForm, duration: text })}
          placeholder="e.g., 180"
          placeholderTextColor={colors.secondaryText}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Color (Hex)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={trackForm.color}
          onChangeText={(text) => setTrackForm({ ...trackForm, color: text })}
          placeholder="#5B9BD5"
          placeholderTextColor={colors.secondaryText}
        />
      </View>

      <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Premium Track</Text>
        <Switch
          value={trackForm.is_premium}
          onValueChange={(value) => setTrackForm({ ...trackForm, is_premium: value })}
          trackColor={{ false: colors.border, true: colors.warning }}
          thumbColor={colors.textLight}
        />
      </View>

      <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Active</Text>
        <Switch
          value={trackForm.is_active}
          onValueChange={(value) => setTrackForm({ ...trackForm, is_active: value })}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.textLight}
        />
      </View>
    </>
  );

  const renderCategoryModal = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Category Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={categoryForm.name}
          onChangeText={(text) => setCategoryForm({ ...categoryForm, name: text })}
          placeholder="Enter category name"
          placeholderTextColor={colors.secondaryText}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
          ]}
          value={categoryForm.description}
          onChangeText={(text) => setCategoryForm({ ...categoryForm, description: text })}
          placeholder="Enter description (optional)"
          placeholderTextColor={colors.secondaryText}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Sort Order</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={categoryForm.sort_order}
          onChangeText={(text) => setCategoryForm({ ...categoryForm, sort_order: text })}
          placeholder="0"
          placeholderTextColor={colors.secondaryText}
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Active</Text>
        <Switch
          value={categoryForm.is_active}
          onValueChange={(value) => setCategoryForm({ ...categoryForm, is_active: value })}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.textLight}
        />
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Loading music data...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.background }]} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Music</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]} 
            onPress={viewMode === 'tracks' ? openAddTrackModal : openAddCategoryModal}
          >
            <Plus size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'tracks' && styles.toggleActive(colors.primary),
            ]}
            onPress={() => setViewMode('tracks')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'tracks' ? colors.textLight : colors.secondaryText },
              ]}
            >
              Tracks ({tracks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'categories' && styles.toggleActive(colors.primary),
            ]}
            onPress={() => setViewMode('categories')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'categories' ? colors.textLight : colors.secondaryText },
              ]}
            >
              Categories ({categories.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
          {viewMode === 'tracks' ? (
            tracks.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No tracks found. Tap + to add one.
              </Text>
            ) : (
              tracks.map(renderTrackItem)
            )
          ) : categories.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No categories found. Tap + to add one.
            </Text>
          ) : (
            categories.map(renderCategoryItem)
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {viewMode === 'tracks'
                    ? editingTrack
                      ? 'Edit Track'
                      : 'Add New Track'
                    : editingCategory
                    ? 'Edit Category'
                    : 'Add New Category'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {viewMode === 'tracks' ? renderTrackModal() : renderCategoryModal()}

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
                  onPress={viewMode === 'tracks' ? handleSaveTrack : handleSaveCategory}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.textLight} />
                  ) : (
                    <Text style={[styles.saveButtonText, { color: colors.textLight }]}>
                      {editingTrack || editingCategory ? 'Update' : 'Create'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleActive: (primaryColor: string) => ({
    backgroundColor: primaryColor,
  }),
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 50,
    fontSize: 16,
  },
  listItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filePicker: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  filePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  filePickerSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  filePickerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filePickerSubtext: {
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    // color diatur inline
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
