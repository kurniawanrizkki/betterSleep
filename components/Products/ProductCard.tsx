import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';

export const ProductCard = ({ product, colors, styles }) => (
  <TouchableOpacity style={styles.productCard}>
    <View style={styles.productImage}>
      <Text style={styles.productEmoji}>{product.image}</Text>
    </View>

    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>

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
);
