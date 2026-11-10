import { Tabs } from 'expo-router';
import { Heart, House, Settings2, ShoppingBag, Sparkles } from 'lucide-react-native';
import { useStore } from '../../context/StoreContext';

const colors = {
  ink: '#182824',
  muted: '#77817A',
  paper: '#FCFBF7',
  line: '#E4E3DC',
  green: '#28614A',
};

export default function TabLayout() {
  const { cartSummary } = useStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Shop',
        tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
      }} />
      <Tabs.Screen name="saved" options={{
        title: 'Saved',
        tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Bag',
        tabBarBadge: cartSummary.itemCount || undefined,
        tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
      }} />
      <Tabs.Screen name="assistant" options={{
        title: 'Studio',
        tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} />,
      }} />
    </Tabs>
  );
}