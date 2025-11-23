import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { ShoppingBag, Heart, Star, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { productsService, Product } from '../../services/products';

const { width: screenWidth } = Dimensions.get('window');

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
  danger: '#EF5350',
};

export default function ProductsScreen() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all products
      const allProducts = await productsService.getAll();
      setProducts(allProducts);

      // Load featured products
      const featured = await productsService.getFeatured(4);
      setFeaturedProducts(featured);

      // Load user favorites if logged in
      if (user) {
        const userFavorites = await productsService.getUserFavorites(user.id);
        setFavorites(new Set(userFavorites.map(p => p.id)));
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      Alert.alert('Info', 'Silakan login untuk menyimpan favorit');
      return;
    }

    try {
      const isFavorited = await productsService.toggleFavorite(user.id, productId);
      
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Gagal menyimpan favorit');
    }
  };

  const renderFeaturedProduct = (product: Product) => {
    const isFavorite = favorites.has(product.id);

    return (
      <View key={product.id} style={styles.featuredCard}>
        <View style={styles.featuredBadge}>
          <TrendingUp size={14} color={colors.textLight} />
          <Text style={styles.featuredBadgeText}>Unggulan</Text>
        </View>
        
        {product.public_image_url ? (
          <Image 
            source={{ uri: product.public_image_url }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.featuredImagePlaceholder}>
            <ShoppingBag size={48} color={colors.secondaryText} />
          </View>
        )}

        <View style={styles.featuredInfo}>
          <Text style={styles.featuredName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.featuredMeta}>
            <View style={styles.ratingContainer}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.soldText}>
              {productsService.formatSoldCount(product.sold_count)} terjual
            </Text>
          </View>

          <View style={styles.featuredFooter}>
            <Text style={styles.featuredPrice}>
              {productsService.formatPrice(product.price)}
            </Text>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={() => toggleFavorite(product.id)}
            >
              <Heart
                size={18}
                color={isFavorite ? colors.danger : colors.primary}
                fill={isFavorite ? colors.danger : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderProduct = (product: Product) => {
    const isFavorite = favorites.has(product.id);

    return (
      <TouchableOpacity key={product.id} style={styles.productCard}>
        {product.public_image_url ? (
          <Image 
            source={{ uri: product.public_image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <ShoppingBag size={36} color={colors.secondaryText} />
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.productMeta}>
            <View style={styles.ratingContainer}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text style={styles.productRating}>{product.rating}</Text>
            </View>
            <Text style={styles.productSold}>
              {productsService.formatSoldCount(product.sold_count)}
            </Text>
          </View>

          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>
              {productsService.formatPrice(product.price)}
            </Text>
            <TouchableOpacity
              style={styles.productBtn}
              onPress={() => toggleFavorite(product.id)}
            >
              <Heart
                size={16}
                color={isFavorite ? colors.danger : colors.primary}
                fill={isFavorite ? colors.danger : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ShoppingBag size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>Produk Penunjang Tidur</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat produk...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <ShoppingBag size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>Produk Penunjang Tidur</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Temukan produk terbaik untuk tidur berkualitas
        </Text>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Produk Unggulan</Text>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredProducts.map(renderFeaturedProduct)}
            </ScrollView>
          </View>
        )}

        {/* All Products Section */}
        <View style={styles.allProductsSection}>
          <Text style={styles.sectionTitle}>Semua Produk</Text>
          
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <ShoppingBag size={64} color={colors.secondaryText} />
              <Text style={styles.emptyStateText}>Belum ada produk</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map(renderProduct)}
            </View>
          )}
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
  scrollContent: {
    paddingBottom: 40,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  featuredScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    padding: 16,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    minHeight: 44,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  soldText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  favoriteBtn: {
    padding: 8,
  },
  allProductsSection: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.secondaryText,
    marginTop: 16,
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
    width: '100%',
    height: 120,
    backgroundColor: colors.background,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
