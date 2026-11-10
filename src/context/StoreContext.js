import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addItem, getCartSummary, removeItem, updateQuantity } from '../lib/cart.mjs';
import { loadCloudFavorites, saveCloudFavorite } from '../services/firebase';

const CART_KEY = 'mmaa2.cart.v1';
const FAVORITES_KEY = 'mmaa2.favorites.v1';
const StoreContext = createContext(null);

function parseStoredArray(serialized) {
  if (!serialized) return [];
  try {
    const parsed = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('loading');
  const [cloudError, setCloudError] = useState('');

  useEffect(() => {
    let active = true;

    async function restoreStore() {
      try {
        const [savedCart, savedFavorites] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
        ]);
        if (active) {
          setCart(parseStoredArray(savedCart));
          setFavorites(parseStoredArray(savedFavorites));
          setReady(true);
        }

        const cloud = await loadCloudFavorites();
        if (!active) return;
        setCloudStatus(cloud.status);
        if (cloud.status === 'connected') {
          setFavorites((local) => {
            const merged = [...cloud.favorites, ...local];
            const unique = [...new Map(merged.map((product) => [product.id, product])).values()];
            AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(unique)).catch(() => {});
            return unique;
          });
        }
      } catch (error) {
        if (active) {
          setCloudStatus('error');
          setCloudError(error.message || 'Could not sync favorites.');
        }
      }
    }

    restoreStore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, ready]);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, ready]);

  const value = useMemo(() => {
    const addToCart = (product) => setCart((items) => addItem(items, product));
    const changeQuantity = (productId, quantity) =>
      setCart((items) => updateQuantity(items, productId, quantity));
    const removeFromCart = (productId) => setCart((items) => removeItem(items, productId));
    const toggleFavorite = (product) => {
      const isSaved = favorites.some((item) => item.id === product.id);
      setFavorites((items) =>
        isSaved ? items.filter((item) => item.id !== product.id) : [...items, product],
      );
      saveCloudFavorite(product, !isSaved)
        .then((result) => setCloudStatus(result.status))
        .catch((error) => {
          setCloudStatus('error');
          setCloudError(error.message || 'Could not sync favorites.');
        });
    };

    return {
      cart,
      favorites,
      ready,
      cloudStatus,
      cloudError,
      cartSummary: getCartSummary(cart),
      addToCart,
      changeQuantity,
      removeFromCart,
      toggleFavorite,
    };
  }, [cart, favorites, ready, cloudStatus, cloudError]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider.');
  return value;
}