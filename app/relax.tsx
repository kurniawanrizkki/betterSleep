import { Heart, Moon, Music, Play, Waves, Wind } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

const relaxationCategories = [
    { id: 1, name: 'Musik Instrumental', icon: Music },
    { id: 2, name: 'White Noise', icon: Wind },
    { id: 3, name: 'Meditasi Napas', icon: Waves },
    { id: 4, name: 'Stretching', icon: Moon },
];

const musicRekomendasi = [
    { id: 1, title: 'Deep Sleep Ambient', duration: '30 Min', type: 'Musik Instrumental', plays: '2.4K', rating: 4.8 },
    { id: 2, title: 'Suara Hutan Tropis', duration: '60 Min', type: 'White Noise', plays: '5.1K', rating: 4.9 },
    { id: 3, title: 'Meditasi 5 Menit Dasar', duration: '5 Min', type: 'Meditasi Napas', plays: '3.2K', rating: 4.7 },
    { id: 4, title: 'Gentle Stretching', duration: '10 Min', type: 'Stretching', plays: '1.8K', rating: 4.6 },
    { id: 5, title: 'Rain & Thunder', duration: '45 Min', type: 'White Noise', plays: '6.3K', rating: 5.0 },
    { id: 6, title: 'Piano Lullabies', duration: '25 Min', type: 'Musik Instrumental', plays: '4.2K', rating: 4.8 },
];

const RelaxScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(relaxationCategories[0].name);
  const [favorites, setFavorites] = useState([]);

  const filteredItems = musicRekomendasi.filter(item => item.type === selectedCategory);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Relaksasi 🎧</Text>
          <Text style={styles.subtitle}>Temukan ketenangan Anda</Text>
        </View>
      </View>

      {/* Enhanced Category Selector with Icons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categorySelector}
        contentContainerStyle={styles.categoryContent}
      >
        {relaxationCategories.map(cat => {
          const IconComponent = cat.icon;
          const isActive = selectedCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                isActive && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.name)}
              activeOpacity={0.7}
            >
              <IconComponent 
                color={isActive ? Colors.textLight : Colors.textDark} 
                size={20} 
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  isActive && styles.categoryButtonTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredItems.length} konten tersedia
        </Text>
      </View>

      {/* Enhanced List */}
      <ScrollView 
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map(item => {
          const isFavorite = favorites.includes(item.id);
          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <View style={styles.itemIconContainer}>
                  <Play color={Colors.primary} size={20} fill={Colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemDuration}>{item.duration}</Text>
                    <View style={styles.metaDivider} />
                    <Text style={styles.itemPlays}>▶ {item.plays}</Text>
                    <View style={styles.metaDivider} />
                    <Text style={styles.itemRating}>⭐ {item.rating}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Heart 
                    color={isFavorite ? '#FF6B6B' : Colors.secondaryText} 
                    size={20}
                    fill={isFavorite ? '#FF6B6B' : 'transparent'}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton}>
                  <Play color={Colors.textLight} size={18} fill={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondaryText,
    marginTop: 4,
    fontWeight: '500',
  },
  categorySelector: {
    marginBottom: 16,
    paddingLeft: 20,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryButtonText: {
    color: Colors.textDark,
    fontWeight: '600',
    fontSize: 15,
  },
  categoryButtonTextActive: {
    color: Colors.textLight,
  },
  statsBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.accent + '10',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDuration: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  itemPlays: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  itemRating: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.secondaryText,
    marginHorizontal: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default RelaxScreen;