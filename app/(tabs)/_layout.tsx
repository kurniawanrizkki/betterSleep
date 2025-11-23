import { Tabs } from 'expo-router';
import { Home, ShoppingBag, User, Settings } from 'lucide-react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { sleepScheduleService } from '../../services/sleepSchedule';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';

export default function TabLayout() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initNotifications = async () => {
      if (user) {
        const schedule = await sleepScheduleService.getActive(user.id);
        if (schedule && schedule.reminder_enabled) {
          await notificationService.scheduleSleepReminder({
            bedtime: schedule.bedtime,
            reminderBefore: schedule.reminder_before,
            reminderType: schedule.reminder_type,
            userId: user.id,
          });
        }
      }
    };
    initNotifications();
  }, [user]);

  const showAdminTab = !adminLoading && isAdmin;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {showAdminTab && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
