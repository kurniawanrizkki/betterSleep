import { Tabs } from 'expo-router';
import { Bed, ShoppingBag } from 'lucide-react-native';

const colors = {
  primary: '#4A6FA5',
  secondaryText: '#7A8B99',
  card: '#FFFFFF',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.secondaryText + '20',
          paddingVertical: 12,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Bed size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produk',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}