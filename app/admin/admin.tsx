import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Music, Settings, BarChart3, Users } from 'lucide-react-native';
import { useAdmin } from '../../hooks/useAdmin';

const colors = {
  primary: '#5B9BD5',
  primaryDark: '#4A6FA5',
  text: '#2C3E50',
  textLight: '#FFFFFF',
  secondaryText: '#7F8C8D',
  background: '#F5F9FC',
  card: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FFA726',
  danger: '#EF5350',
};

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, loading } = useAdmin();

  // Protect admin route
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>⛔ Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>
            You don't have admin privileges
          </Text>
        </View>
      </SafeAreaView>
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
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Lihat statistik pengguna & produk',
      icon: BarChart3,
      color: colors.warning,
      route: '/admin/analytics',
    },
    {
      id: 'users',
      title: 'Kelola Users',
      description: 'Manage user accounts',
      icon: Users,
      color: colors.danger,
      route: '/admin/users',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Settings size={32} color={colors.primary} />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Kelola konten dan pengaturan aplikasi
        </Text>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Music Tracks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Icon size={28} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Admin Access</Text>
          <Text style={styles.infoText}>
            Anda memiliki akses penuh untuk mengelola konten aplikasi.
            Gunakan dengan bijak!
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.danger,
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: colors.secondaryText,
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
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
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
    backgroundColor: colors.card,
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
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  menuContainer: {
    gap: 16,
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
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
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
