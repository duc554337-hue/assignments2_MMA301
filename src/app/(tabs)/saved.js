import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { EmptyState, Notice, ScreenTitle } from '../../components/Primitives';
import { useStore } from '../../context/StoreContext';
import { pagePadding, palette } from '../../theme';

export default function SavedScreen() {
  const { favorites, cloudStatus, cloudError } = useStore();
  const { width } = useWindowDimensions();
  const cardWidth = (width - pagePadding * 2 - 12) / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={favorites}
        numColumns={2}
        keyExtractor={(product) => String(product.id)}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenTitle eyebrow="YOUR SHORTLIST" title="Saved pieces" subtitle="A place for the things you want to come back to." />
            {cloudStatus === 'error' ? <View style={styles.notice}><Notice tone="error">Saved locally. Firebase sync needs attention: {cloudError}</Notice></View> : null}
            {cloudStatus === 'connected' ? <View style={styles.notice}><Notice>Wishlist synced to your anonymous Firebase account.</Notice></View> : null}
            {cloudStatus === 'local' ? <View style={styles.notice}><Notice>Saved on this device. Add Firebase settings to enable cloud sync.</Notice></View> : null}
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        ListEmptyComponent={<EmptyState title="Your shortlist is quiet." body="Tap the heart on a product to keep it here." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: pagePadding, paddingTop: 24, paddingBottom: 32 },
  header: { marginBottom: 22 },
  notice: { marginTop: 16 },
  row: { gap: 12 },
});