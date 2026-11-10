import { Platform } from 'react-native';

let Notifications = null;

try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('expo-notifications is unavailable; notification features are disabled.', error);
}

function isNotificationSupported() {
  return Platform.OS !== 'web' && !!Notifications;
}

export async function getNotificationPermission() {
  if (!isNotificationSupported()) return { granted: false, status: 'unsupported' };
  return Notifications.getPermissionsAsync();
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return { granted: false, status: 'unsupported' };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('business', {
      name: 'Order updates',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return current;
  return Notifications.requestPermissionsAsync();
}

export async function notifyProductAdded(product) {
  if (!isNotificationSupported()) return 'unsupported';
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return 'denied';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Added to your bag',
      body: `${product.title} is ready whenever you are.`,
      data: { productId: product.id, event: 'cart.added' },
    },
    trigger: null,
  });
  return 'sent';
}

export async function sendTestNotification() {
  const permission = await requestNotificationPermission();
  if (permission.status === 'unsupported') return 'unsupported';
  if (!permission.granted) return 'denied';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Market notifications are on',
      body: 'You will see local updates for cart activity.',
      data: { event: 'notification.test' },
    },
    trigger: null,
  });
  return 'sent';
}

export function configureNotifications() {
  if (!isNotificationSupported()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}