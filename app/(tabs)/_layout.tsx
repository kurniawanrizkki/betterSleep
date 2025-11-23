import { Tabs } from 'expo-router';
import { Home, ShoppingBag, User, Settings } from 'lucide-react-native';
import { useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { sleepScheduleService } from '../../services/sleepSchedule';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';

const colors = {
  primary: '#5B9BD5',
  secondaryText: '#7F8C8D',
};

export default function TabLayout() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    // Reinitialize notifications on app start (handles device reboot)
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

  // Tentukan apakah tab Admin harus terlihat
  // Tab Admin hanya terlihat jika BUKAN loading DAN IS Admin.
  const showAdminTab = !adminLoading && isAdmin;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
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
           
   </Tabs>
  );
}
