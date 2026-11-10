import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../context/StoreContext';
import { configureNotifications } from '../services/notifications';

export default function RootLayout() {
  useEffect(() => { configureNotifications(); }, []);

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F5F4EF' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}