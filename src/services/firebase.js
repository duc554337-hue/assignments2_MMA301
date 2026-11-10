import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  signInAnonymously,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const configured = Object.values(firebaseConfig).every(Boolean);

function getFirebaseServices() {
  if (!configured) return null;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  let auth;
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch (error) {
      if (error.code !== 'auth/already-initialized') throw error;
      auth = getAuth(app);
    }
  }

  return { auth, database: getFirestore(app) };
}

async function ensureUser(services) {
  if (services.auth.currentUser) return services.auth.currentUser;
  const credential = await signInAnonymously(services.auth);
  return credential.user;
}

export function isFirebaseConfigured() {
  return configured;
}

export async function loadCloudFavorites() {
  const services = getFirebaseServices();
  if (!services) return { favorites: [], status: 'local' };

  const user = await ensureUser(services);
  const snapshot = await getDocs(collection(services.database, 'users', user.uid, 'wishlist'));
  return {
    favorites: snapshot.docs.map((favorite) => favorite.data().product).filter(Boolean),
    status: 'connected',
  };
}

export async function saveCloudFavorite(product, favorite) {
  const services = getFirebaseServices();
  if (!services) return { status: 'local' };

  const user = await ensureUser(services);
  const favoriteRef = doc(services.database, 'users', user.uid, 'wishlist', String(product.id));
  if (favorite) await setDoc(favoriteRef, { product, updatedAt: Date.now() });
  else await deleteDoc(favoriteRef);
  return { status: 'connected' };
}

export async function getFirebaseIdToken() {
  const services = getFirebaseServices();
  if (!services) throw new Error('Configure Firebase before using the Gemini assistant.');
  const user = await ensureUser(services);
  return user.getIdToken();
}