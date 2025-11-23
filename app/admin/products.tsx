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
  Image,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Edit, Trash2, Star, Upload, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext'; // ✅
import { productsService, Product } from '../../services/products';
import * as ImagePicker from 'expo-image-picker';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  affiliate_link: string;
  rating: string;
  sold_count: string;
  is_featured: boolean;
  is_active: boolean;
}

export default function AdminProductsScreen() {
  const router = useRouter();
  const { colors } = useTheme(); // ✅

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    affiliate_link: '',
    rating: '4.5',
    sold_count: '0',
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permission');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAllAdmin();
      setProducts(data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      affiliate_link: '',
      rating: '4.5',
      sold_count: '0',
      is_featured: false,
      is_active: true,
    });
    setImageUri(null);
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      affiliate_link: product.affiliate_link || '',
      rating: product.rating.toString(),
      sold_count: product.sold_count.toString(),
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setImageUri(product.public_image_url || null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Product name is required');
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      Alert.alert('Validation', 'Valid price is required');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        category_id: form.category_id || null,
        affiliate_link: form.affiliate_link.trim() || null,
        rating: parseFloat(form.rating),
        sold_count: parseInt(form.sold_count) || 0,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };

      let product: Product;

      if (editingProduct) {
        product = await productsService.update(editingProduct.id, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        product = await productsService.create(productData);
        Alert.alert('Success', 'Product created successfully');
      }

      const productId = product.id;

      if (imageUri && imageUri !== editingProduct?.public_image_url) {
        try {
          if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
            await productsService.uploadProductImage(productId, imageUri);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Warning', 'Product saved but image upload failed');
        }
      }

      setModalVisible(false);
      loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsService.delete(product.id);
              Alert.alert('Success', 'Product deleted');
              loadProducts();
            } catch (error: any) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProduct = (product: Product) => (
    <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card }]}>
      {product.public_image_url ? (
        <Image
          source={{ uri: product.public_image_url }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.productImagePlaceholder, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.secondaryText }}>No Image</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          {product.is_featured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.warning + '20' }]}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
            </View>
          )}
        </View>

        <Text style={[styles.productPrice, { color: colors.primary }]}>
          {productsService.formatPrice(product.price)}
        </Text>

        <View style={styles.productMeta}>
          <Text style={[styles.productMetaText, { color: colors.secondaryText }]}>
            ⭐ {product.rating} • {productsService.formatSoldCount(product.sold_count)} sold
          </Text>
          <Text
            style={[
              styles.productStatus,
              { color: product.is_active ? colors.success : colors.danger },
            ]}
          >
            {product.is_active ? '● Active' : '● Inactive'}
          </Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => openEditModal(product)}
          >
            <Edit size={16} color={colors.textLight} />
            <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={() => handleDelete(product)}
          >
            <Trash2 size={16} color={colors.textLight} />
            <Text style={[styles.actionButtonText, { color: colors.textLight }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Loading products...
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Products</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]} 
            onPress={openAddModal}
          >
            <Plus size={24} color={colors.textLight} />
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
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No products yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.secondaryText }]}>
                Tap + to add your first product
              </Text>
            </View>
          ) : (
            products.map(renderProduct)
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
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={[styles.imagePicker, { borderColor: colors.primary + '40' }]} onPress={pickImage}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  ) : (
                    <View style={[styles.imagePickerPlaceholder, { backgroundColor: colors.card }]}>
                      <Upload size={32} color={colors.secondaryText} />
                      <Text style={[styles.imagePickerText, { color: colors.secondaryText }]}>
                        Tap to select image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Product Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    placeholder="Enter product name"
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
                    value={form.description}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                    placeholder="Enter product description"
                    placeholderTextColor={colors.secondaryText}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Price (Rp) *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                      value={form.price}
                      onChangeText={(text) => setForm({ ...form, price: text })}
                      placeholder="0"
                      placeholderTextColor={colors.secondaryText}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                      value={form.rating}
                      onChangeText={(text) => setForm({ ...form, rating: text })}
                      placeholder="4.5"
                      placeholderTextColor={colors.secondaryText}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Affiliate Link</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={form.affiliate_link}
                    onChangeText={(text) => setForm({ ...form, affiliate_link: text })}
                    placeholder="https://..."
                    placeholderTextColor={colors.secondaryText}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Sold Count</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={form.sold_count}
                    onChangeText={(text) => setForm({ ...form, sold_count: text })}
                    placeholder="0"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.switchRow, { backgroundColor: colors.card }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Featured Product</Text>
                  <Switch
                    value={form.is_featured}
                    onValueChange={(value) => setForm({ ...form, is_featured: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.textLight}
                  />
                </View>

                <View style={[styles.switchRow, { backgroundColor: colors.card }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Active</Text>
                  <Switch
                    value={form.is_active}
                    onValueChange={(value) => setForm({ ...form, is_active: value })}
                    trackColor={{ false: colors.border, true: colors.success }}
                    thumbColor={colors.textLight}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.textLight} />
                  ) : (
                    <Text style={[styles.saveButtonText, { color: colors.textLight }]}>
                      {editingProduct ? 'Update Product' : 'Create Product'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  productCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  featuredBadge: {
    padding: 6,
    borderRadius: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productMetaText: {
    fontSize: 13,
  },
  productStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
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
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
