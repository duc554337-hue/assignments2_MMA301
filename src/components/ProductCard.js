import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Heart, Star } from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import { formatPrice, palette } from '../theme';

export default function ProductCard({ product, width }) {
  const { favorites, toggleFavorite } = useStore();
  const saved = favorites.some((item) => item.id === product.id);

  return (
    <View style={[styles.card, width ? { width } : null]}>
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.title}`}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
          {product.discountPercentage > 15 && (
            <View style={styles.discount}><Text style={styles.discountText}>DEAL</Text></View>
          )}
        </View>
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.category}>{product.category?.replace(/-/g, ' ')}</Text>
          <Text numberOfLines={2} style={styles.name}>{product.title}</Text>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <View style={styles.rating}><Star size={12} color={palette.coral} fill={palette.coral} /><Text style={styles.ratingText}>{Number(product.rating).toFixed(1)}</Text></View>
          </View>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${product.title} from saved` : `Save ${product.title}`}
        onPress={() => toggleFavorite(product)}
        style={styles.favorite}
        hitSlop={6}
      >
        <Heart size={17} color={saved ? palette.coral : palette.ink} fill={saved ? palette.coral : 'transparent'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: 5, overflow: 'hidden' },
  imageWrap: { height: 148, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EBEEE8' },
  image: { width: '84%', height: '84%' },
  discount: { position: 'absolute', top: 9, left: 9, backgroundColor: palette.lemon, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 2 },
  discountText: { color: palette.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  favorite: { position: 'absolute', top: 8, right: 8, width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderRadius: 17 },
  content: { minHeight: 102, padding: 11, justifyContent: 'space-between' },
  category: { color: palette.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  name: { minHeight: 36, marginTop: 5, color: palette.ink, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  bottomRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  price: { color: palette.green, fontSize: 14, fontWeight: '900' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { color: palette.ink, fontSize: 10, fontWeight: '700' },
});