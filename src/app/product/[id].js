import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, ShoppingBag, Star } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Notice } from '../../components/Primitives';
import { useStore } from '../../context/StoreContext';
import { notifyProductAdded } from '../../services/notifications';
import { getProduct } from '../../services/products';
import { formatPrice, pagePadding, palette } from '../../theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const [productResult, setProductResult] = useState({ id: null, product: null, error: '' });
  const loading = productResult.id !== productId;
  const product = loading ? null : productResult.product;
  const error = loading ? '' : productResult.error;
  const { favorites, addToCart, toggleFavorite } = useStore();
  const saved = product ? favorites.some((item) => item.id === product.id) : false;

  useEffect(() => {
    const controller = new AbortController();
    getProduct(productId, controller.signal)
      .then((data) => setProductResult({ id: productId, product: data, error: '' }))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setProductResult({ id: productId, product: null, error: requestError.message || 'Product could not be found.' });
        }
      });
    return () => controller.abort();
  }, [productId]);

  function addProduct() {
    addToCart(product);
    notifyProductAdded(product).catch(() => {});
    Alert.alert('Added to your bag', `${product.title} is in your bag.`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.navbar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Go back" accessibilityRole="button"><ArrowLeft size={19} color={palette.ink} /></Pressable>
        <Text style={styles.wordmark}>FIELDNOTE<Text style={styles.wordmarkDot}>.</Text></Text>
        {product ? <Pressable onPress={() => toggleFavorite(product)} style={styles.iconButton} accessibilityLabel={saved ? 'Remove from saved' : 'Save product'} accessibilityRole="button"><Heart size={19} color={saved ? palette.coral : palette.ink} fill={saved ? palette.coral : 'transparent'} /></Pressable> : <View style={styles.iconButton} />}
      </View>
      {loading ? <View style={styles.loading}><ActivityIndicator color={palette.green} /></View> : error || !product ? (
        <View style={styles.error}><Notice tone="error">{error || 'This product is not available.'}</Notice><Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>Back to the collection</Text></Pressable></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: product.images?.[0] || product.thumbnail }} style={styles.image} resizeMode="contain" />
          <Text style={styles.category}>{product.category?.replace(/-/g, ' ')}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.meta}><View style={styles.rating}><Star size={15} color={palette.coral} fill={palette.coral} /><Text style={styles.ratingText}>{Number(product.rating).toFixed(1)} / 5</Text></View><Text style={styles.stock}>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</Text></View>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.detailsLine}><Text style={styles.detailsLabel}>BRAND</Text><Text style={styles.detailsValue}>{product.brand || 'Independent maker'}</Text></View>
          {product.discountPercentage ? <View style={styles.detailsLine}><Text style={styles.detailsLabel}>CURRENT OFFER</Text><Text style={styles.detailsValue}>{Number(product.discountPercentage).toFixed(0)}% off</Text></View> : null}
          <Pressable disabled={!product.stock} onPress={addProduct} style={[styles.addButton, !product.stock && styles.disabled]} accessibilityRole="button"><ShoppingBag size={17} color={palette.surface} /><Text style={styles.addText}>{product.stock ? 'Add to bag' : 'Out of stock'}</Text></Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  navbar: { height: 54, marginHorizontal: pagePadding, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: palette.line },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 19 },
  wordmark: { color: palette.ink, fontSize: 14, fontWeight: '900', letterSpacing: 1.1 },
  wordmarkDot: { color: palette.coral },
  content: { paddingHorizontal: pagePadding, paddingBottom: 28 },
  image: { width: '100%', height: 310, marginTop: 16, backgroundColor: '#EBEEE8', borderRadius: 5 },
  category: { marginTop: 21, color: palette.green, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { marginTop: 7, color: palette.ink, fontSize: 27, lineHeight: 32, fontWeight: '800' },
  meta: { marginTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  stock: { color: palette.muted, fontSize: 11 },
  price: { marginTop: 19, color: palette.green, fontSize: 25, fontWeight: '900' },
  description: { marginTop: 14, color: palette.muted, fontSize: 14, lineHeight: 22 },
  detailsLine: { minHeight: 41, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: palette.line },
  detailsLabel: { color: palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  detailsValue: { color: palette.ink, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  addButton: { minHeight: 50, marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: palette.green, borderRadius: 4 },
  addText: { color: palette.surface, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { padding: pagePadding, paddingTop: 40 },
  backButton: { marginTop: 14, padding: 12, alignSelf: 'flex-start', backgroundColor: palette.green, borderRadius: 3 },
  backText: { color: palette.surface, fontSize: 12, fontWeight: '800' },
});