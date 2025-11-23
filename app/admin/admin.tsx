import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Music, Settings, BarChart3, Users } from 'lucide-react-native';
import { useAdmin } from '../../hooks/useAdmin';
import { useTheme } from '../../contexts/ThemeContext'; // ✅

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, loading } = useAdmin();
  const { colors } = useTheme(); // ✅

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Memuat...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.unauthorizedContainer}>
            <Text style={[styles.unauthorizedText, { color: colors.danger }]}>
              ⛔ Access Denied
            </Text>
            <Text style={[styles.unauthorizedSubtext, { color: colors.secondaryText }]}>
              You don't have admin privileges
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const menuItems = [
    {
      id: 'products',
      title: 'Kelola Produk',
      description: 'Tambah, edit, atau hapus produk',
      icon: ShoppingBag,
      color: colors.primary,
      route: '/admin/products',
    },
    {
      id: 'music',
      title: 'Kelola Musik',
      description: 'Kelola kategori dan track musik',
      icon: Music,
      color: colors.success,
      route: '/admin/music',
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Settings size={32} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
            Kelola konten dan pengaturan aplikasi
          </Text>

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                Total Products
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                Music Tracks
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: colors.warning }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                Active Users
              </Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                    <Icon size={28} color={item.color} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuDescription, { color: colors.secondaryText }]}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[
            styles.infoBox,
            { 
              backgroundColor: colors.primary + '20',
              borderLeftColor: colors.primary
            }
          ]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>ℹ️ Admin Access</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              Anda memiliki akses penuh untuk mengelola konten aplikasi.
              Gunakan dengan bijak!
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
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    gap: 16,
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
  },
  infoBox: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
