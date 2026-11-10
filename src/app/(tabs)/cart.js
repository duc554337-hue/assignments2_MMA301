import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { EmptyState, ScreenTitle } from '../../components/Primitives';
import { useStore } from '../../context/StoreContext';
import { formatPrice, pagePadding, palette } from '../../theme';

function CartLine({ item, changeQuantity, removeFromCart }) {
  return (
    <View style={styles.line}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="contain" />
      <View style={styles.lineInfo}>
        <Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.controls}>
          <Pressable onPress={() => changeQuantity(item.id, item.quantity - 1)} style={styles.quantityButton} accessibilityLabel={`Decrease ${item.title} quantity`} accessibilityRole="button"><Minus size={14} color={palette.ink} /></Pressable>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Pressable onPress={() => changeQuantity(item.id, item.quantity + 1)} style={styles.quantityButton} accessibilityLabel={`Increase ${item.title} quantity`} accessibilityRole="button"><Plus size={14} color={palette.ink} /></Pressable>
        </View>
      </View>
      <View style={styles.lineRight}>
        <Text style={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</Text>
        <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeButton} accessibilityLabel={`Remove ${item.title}`} accessibilityRole="button"><Trash2 size={16} color={palette.coral} /></Pressable>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { cart, cartSummary, changeQuantity, removeFromCart } = useStore();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="READY WHEN YOU ARE" title="Your bag" subtitle={`${cartSummary.itemCount} ${cartSummary.itemCount === 1 ? 'piece' : 'pieces'} in this order.`} /></View>}
        renderItem={({ item }) => <CartLine item={item} changeQuantity={changeQuantity} removeFromCart={removeFromCart} />}
        ListEmptyComponent={<EmptyState title="Nothing in the bag yet." body="The collection is full of useful little things." action={{ label: 'Explore the collection', onPress: () => router.replace('/(tabs)') }} />}
        ListFooterComponent={cart.length ? (
          <View style={styles.summary}>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.total}>{formatPrice(cartSummary.total)}</Text></View>
            <View style={styles.totalRow}><Text style={styles.shippingLabel}>Shipping</Text><Text style={styles.shippingValue}>Calculated at checkout</Text></View>
            <Pressable onPress={() => Alert.alert('Order preview', 'This assignment demo does not collect payment. Your bag has not been changed.')} style={styles.checkout} accessibilityRole="button"><Text style={styles.checkoutText}>Review order</Text></Pressable>
            <Text style={styles.checkoutNote}>No payment is collected in this demo.</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  content: { flexGrow: 1, paddingHorizontal: pagePadding, paddingTop: 24, paddingBottom: 30 },
  header: { marginBottom: 20 },
  line: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbnail: { width: 86, height: 92, backgroundColor: '#EBEEE8', borderRadius: 4 },
  lineInfo: { flex: 1, alignSelf: 'stretch', justifyContent: 'center' },
  itemTitle: { maxWidth: 180, color: palette.ink, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  itemPrice: { marginTop: 5, color: palette.green, fontSize: 12, fontWeight: '800' },
  controls: { marginTop: 9, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10 },
  quantityButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: 3 },
  quantity: { minWidth: 15, color: palette.ink, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  lineRight: { height: 86, justifyContent: 'space-between', alignItems: 'flex-end' },
  lineTotal: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  removeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: palette.line },
  summary: { marginTop: 26, paddingTop: 18, borderTopWidth: 1, borderTopColor: palette.ink },
  totalRow: { marginBottom: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  total: { color: palette.ink, fontSize: 19, fontWeight: '900' },
  shippingLabel: { color: palette.muted, fontSize: 12 },
  shippingValue: { color: palette.muted, fontSize: 11 },
  checkout: { minHeight: 48, marginTop: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green, borderRadius: 4 },
  checkoutText: { color: palette.surface, fontSize: 13, fontWeight: '800' },
  checkoutNote: { marginTop: 8, color: palette.muted, fontSize: 10, textAlign: 'center' },
});