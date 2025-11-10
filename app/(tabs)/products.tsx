import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';

// --- Imports yang Diperlukan ---
import { ShoppingBag, Heart } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

// Color Scheme - Soft Blue Theme
const colors = {
  primary: '#4A6FA5',
  primaryDark: '#2E4057',
  accent: '#8AACC8',
  background: '#E8F1F5',
  card: '#FFFFFF',
  text: '#2E4057',
  textLight: '#FFFFFF',
  secondaryText: '#7A8B99',
  success: '#66BB6A',
  warning: '#FFB74D',
};

// Data Produk
const products = [
  { id: 1, name: 'Bantal Memory Foam Premium', price: 'Rp 299.000', image: '🛏️', rating: 4.8, sold: '2.3k' },
  { id: 2, name: 'Essential Oil Lavender', price: 'Rp 149.000', image: '🧴', rating: 4.9, sold: '5.1k' },
  { id: 3, name: 'Sleep Mask Anti Cahaya', price: 'Rp 89.000', image: '😴', rating: 4.7, sold: '3.8k' },
  { id: 4, name: 'White Noise Machine', price: 'Rp 449.000', image: '🔊', rating: 4.6, sold: '1.5k' },
  { id: 5, name: 'Diffuser Aromaterapi', price: 'Rp 199.000', image: '💨', rating: 4.8, sold: '4.2k' },
  { id: 6, name: 'Herbal Sleep Tea', price: 'Rp 75.000', image: '🍵', rating: 4.5, sold: '6.7k' },
  { id: 7, name: 'Earplug Peredam Suara', price: 'Rp 45.000', image: '👂', rating: 4.4, sold: '8.1k' },
  { id: 8, name: 'Kasur Spring Bed Ortopedi', price: 'Rp 4.599.000', image: '🛏️', rating: 4.9, sold: '0.5k' },
];


export default function Products() {
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.productsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Products */}
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>
            <ShoppingBag size={28} color={colors.primary} />
            Produk Penunjang Tidur
          </Text>
          <Text style={styles.productsSubtitle}>
            Temukan produk terbaik untuk tidur berkualitas
          </Text>
        </View>

        {/* Product Grid */}
        <View style={styles.productsGrid}>
          {products.map(product => (
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>{product.image}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productRating}>⭐ {product.rating}</Text>
                  <Text style={styles.productSold}>🛒 {product.sold}</Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <TouchableOpacity style={styles.productBtn}>
                    <Heart size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  productsScrollContent: {
    padding: 20,
    paddingBottom: 40, // Ruang di bagian bawah
  },
  productsHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  productsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productsSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    // Lebar layar dikurangi padding kiri/kanan (20+20=40) dan gap (16). Lalu dibagi 2.
    width: (screenWidth - 56) / 2, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  productImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  productEmoji: {
    fontSize: 48,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    minHeight: 40,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  productRating: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  productSold: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  productBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});