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
  Linking,
} from 'react-native';
import { ShoppingBag, Heart, Star, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { productsService, Product } from '../../services/products';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

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
      const allProducts = await productsService.getAll();
      setProducts(allProducts);

      const featured = await productsService.getFeatured(4);
      setFeaturedProducts(featured);

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
        if (isFavorited) newSet.add(productId);
        else newSet.delete(productId);
        return newSet;
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Gagal menyimpan favorit');
    }
  };

  // ✅ Improved function to open affiliate links with better error handling
  const openAffiliateLink = async (product: Product) => {
    if (!product.affiliate_link) {
      Alert.alert('Info', 'Link afiliasi tidak tersedia untuk produk ini.');
      return;
    }

    let url = product.affiliate_link.trim();
    
    // Ensure URL has proper protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log('Attempting to open URL:', url);

    try {
      const supported = await Linking.canOpenURL(url);
      console.log('URL supported:', supported);
      
      if (supported) {
        await Linking.openURL(url);
        console.log('URL opened successfully');
      } else {
        // Fallback: try to open anyway (sometimes canOpenURL returns false but openURL still works)
        try {
          await Linking.openURL(url);
          console.log('URL opened via fallback');
        } catch (innerError: any) {
          console.error('Fallback also failed:', innerError);
          Alert.alert(
            'Error', 
            'Tidak dapat membuka link ini di perangkat Anda.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error',
        `Gagal membuka link: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderFeaturedProduct = (product: Product) => {
    const isFavorite = favorites.has(product.id);

    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.featuredCard, { backgroundColor: colors.card }]}
        onPress={() => openAffiliateLink(product)}
        activeOpacity={0.8}
      >
        <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
          <TrendingUp size={14} color={colors.textLight} />
          <Text style={[styles.featuredBadgeText, { color: colors.textLight }]}>Unggulan</Text>
        </View>
        
        {product.public_image_url ? (
          <Image 
            source={{ uri: product.public_image_url }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.featuredImagePlaceholder, { backgroundColor: colors.background }]}>
            <ShoppingBag size={48} color={colors.secondaryText} />
          </View>
        )}

        <View style={styles.featuredInfo}>
          <Text style={[styles.featuredName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.featuredMeta}>
            <View style={styles.ratingContainer}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.rating}
              </Text>
            </View>
            <Text style={[styles.soldText, { color: colors.secondaryText }]}>
              {productsService.formatSoldCount(product.sold_count)} terjual
            </Text>
          </View>

          <View style={styles.featuredFooter}>
            <Text style={[styles.featuredPrice, { color: colors.primary }]}>
              {productsService.formatPrice(product.price)}
            </Text>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
            >
              <Heart
                size={18}
                color={isFavorite ? colors.danger : colors.primary}
                fill={isFavorite ? colors.danger : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProduct = (product: Product) => {
    const isFavorite = favorites.has(product.id);

    return (
      <TouchableOpacity 
        key={product.id} 
        style={[styles.productCard, { backgroundColor: colors.card }]}
        onPress={() => openAffiliateLink(product)}
        activeOpacity={0.8}
      >
        {product.public_image_url ? (
          <Image 
            source={{ uri: product.public_image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImagePlaceholder, { backgroundColor: colors.background }]}>
            <ShoppingBag size={36} color={colors.secondaryText} />
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.productMeta}>
            <View style={styles.ratingContainer}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.productRating, { color: colors.secondaryText }]}>
                {product.rating}
              </Text>
            </View>
            <Text style={[styles.productSold, { color: colors.secondaryText }]}>
              {productsService.formatSoldCount(product.sold_count)}
            </Text>
          </View>

          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              {productsService.formatPrice(product.price)}
            </Text>
            <TouchableOpacity
              style={[
                styles.productBtn,
                { 
                  borderColor: isFavorite 
                    ? colors.danger + '40' 
                    : colors.primary + '40',
                  backgroundColor: isFavorite ? colors.danger + '10' : 'transparent'
                }
              ]}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
            >
              <Heart
                size={16}
                color={isFavorite ? colors.danger : colors.primary}
                fill={isFavorite ? colors.danger + '30' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ShoppingBag size={28} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Produk Penunjang Tidur</Text>
          </View>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Memuat produk...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
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
          <View style={styles.header}>
            <ShoppingBag size={28} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Produk Penunjang Tidur</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
            Temukan produk terbaik untuk tidur berkualitas
          </Text>

          {featuredProducts.length > 0 && (
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Produk Unggulan</Text>
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

          <View style={styles.allProductsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Semua Produk</Text>
            
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <ShoppingBag size={64} color={colors.secondaryText} />
                <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                  Belum ada produk
                </Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {products.map(renderProduct)}
              </View>
            )}
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
  safeArea: {
    flex: 1,
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
  },
  headerSubtitle: {
    fontSize: 14,
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
  },
  featuredScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    padding: 16,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '700',
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
  },
  soldText: {
    fontSize: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: '800',
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
    marginTop: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  productCard: {
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
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  productSold: {
    fontSize: 12,
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
  },
  productBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
