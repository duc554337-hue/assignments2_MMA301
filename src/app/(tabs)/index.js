import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Settings2, SlidersHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import { Notice, ScreenTitle } from '../../components/Primitives';
import { getCategories, getProducts, PAGE_SIZE } from '../../services/products';
import { pagePadding, palette } from '../../theme';

export default function DiscoverScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const requestRef = useRef(null);
  const runPageRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - pagePadding * 2 - 12) / 2;

  useEffect(() => {
    runPageRef.current = async (reset = false) => {
      if (!reset && (loadingRef.current || !hasMoreRef.current)) return;
      if (reset) {
        requestRef.current?.abort();
        skipRef.current = 0;
        hasMoreRef.current = true;
        setHasMore(true);
      }

      const controller = new AbortController();
      requestRef.current = controller;
      loadingRef.current = true;
      setLoading(true);
      try {
        const skip = reset ? 0 : skipRef.current;
        const result = await getProducts({ skip, limit: PAGE_SIZE, query, category: selectedCategory, signal: controller.signal });
        if (controller.signal.aborted) return;

        skipRef.current = skip + result.products.length;
        hasMoreRef.current = skipRef.current < result.total;
        setHasMore(hasMoreRef.current);
        setTotal(result.total);
        setProducts((previous) => {
          const next = reset ? [] : previous;
          const ids = new Set(next.map((product) => product.id));
          return [...next, ...result.products.filter((product) => !ids.has(product.id))];
        });
        setError('');
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load the catalog.');
          if (reset) {
            setProducts([]);
            setTotal(0);
          }
        }
      } finally {
        if (requestRef.current === controller) {
          loadingRef.current = false;
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
  }, [query, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    runPageRef.current(true);
    return () => requestRef.current?.abort();
  }, [query, selectedCategory]);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(setCategories).catch(() => setCategories([]));
    return () => controller.abort();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={products}
        keyExtractor={(product) => String(product.id)}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => runPageRef.current?.(false)}
        onEndReachedThreshold={0.45}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); runPageRef.current?.(true); }} tintColor={palette.green} />}
        ListHeaderComponent={
          <View>
            <View style={styles.topline}>
              <View><Text style={styles.wordmark}>FIELDNOTE<Text style={styles.wordmarkDot}>.</Text></Text><Text style={styles.location}>CURATED GOODS / EVERYDAY</Text></View>
              <Pressable onPress={() => router.push('/(tabs)/settings')} style={styles.headerAction} accessibilityLabel="Settings" accessibilityRole="button"><Settings2 size={19} color={palette.ink} /></Pressable>
            </View>
            <ScreenTitle eyebrow="THE GOOD FINDS" title={'Objects with a little\nmore thought.'} subtitle="Useful things, chosen to stay." />
            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85' }} imageStyle={styles.heroImage} style={styles.hero}>
              <View style={styles.heroShade} />
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>THE OBJECT EDIT / 01</Text>
                <Text style={styles.heroTitle}>Less, but{ '\n' }better made.</Text>
                <Text style={styles.heroSub}>A fresh edit for considered living.</Text>
              </View>
            </ImageBackground>
            <View style={styles.searchWrap}>
              <Search size={18} color={palette.muted} />
              <TextInput value={searchText} onChangeText={setSearchText} placeholder="Search the collection" placeholderTextColor={palette.muted} returnKeyType="search" style={styles.searchInput} accessibilityLabel="Search products" />
              <SlidersHorizontal size={17} color={palette.green} />
            </View>
            <View style={styles.sectionLine}><Text style={styles.sectionLabel}>BROWSE BY CATEGORY</Text><Text style={styles.resultCount}>{total ? `${total} items` : ''}</Text></View>
            <FlatList
              horizontal
              data={['', ...categories.slice(0, 12)]}
              keyExtractor={(item) => item || 'all'}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const active = item === selectedCategory;
                return <Pressable onPress={() => setSelectedCategory(item)} style={[styles.categoryChip, active && styles.categoryChipActive]} accessibilityRole="button" accessibilityState={{ selected: active }}><Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item ? item.replace(/-/g, ' ') : 'Everything'}</Text></Pressable>;
              }}
            />
            <View style={styles.sectionLine}><Text style={styles.sectionLabel}>{query ? 'SEARCH RESULTS' : 'THE CURRENT EDIT'}</Text><Text style={styles.resultCount}>{products.length ? `01 — ${String(products.length).padStart(2, '0')}` : ''}</Text></View>
            {error ? <Notice tone="error">{error}</Notice> : null}
            {error && !products.length ? <Pressable onPress={() => runPageRef.current?.(true)} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable> : null}
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={loading ? <View style={styles.loading}><ActivityIndicator color={palette.green} /><Text style={styles.loadingText}>Finding the good stuff…</Text></View> : error ? null : <View style={styles.emptySearch}><Text style={styles.emptyTitle}>Nothing in this edit.</Text><Text style={styles.emptyBody}>Try another word or category.</Text></View>}
        ListFooterComponent={loading && products.length ? <ActivityIndicator style={styles.footerLoading} color={palette.green} /> : !hasMore && products.length ? <Text style={styles.endNote}>END OF COLLECTION</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  listContent: { paddingHorizontal: pagePadding, paddingBottom: 28 },
  topline: { minHeight: 55, marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: palette.line },
  wordmark: { color: palette.ink, fontSize: 16, fontWeight: '900', letterSpacing: 1.1 },
  wordmarkDot: { color: palette.coral },
  location: { marginTop: 2, color: palette.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
  headerAction: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 19 },
  hero: { height: 178, marginTop: 18, marginBottom: 16, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#5C6557' },
  heroImage: { borderRadius: 5 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 34, 28, 0.35)' },
  heroCopy: { padding: 18 },
  heroEyebrow: { color: '#F2D36E', fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  heroTitle: { marginTop: 6, color: '#FFFDF6', fontSize: 26, lineHeight: 27, fontWeight: '800' },
  heroSub: { marginTop: 6, color: '#FFFDF6', fontSize: 11 },
  searchWrap: { height: 48, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  searchInput: { flex: 1, color: palette.ink, fontSize: 13, paddingVertical: 0 },
  sectionLine: { marginTop: 22, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { color: palette.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  resultCount: { color: palette.muted, fontSize: 10, fontWeight: '600' },
  categoryList: { gap: 8, paddingBottom: 2 },
  categoryChip: { paddingVertical: 9, paddingHorizontal: 13, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 3 },
  categoryChipActive: { backgroundColor: palette.green, borderColor: palette.green },
  categoryText: { color: palette.ink, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  categoryTextActive: { color: palette.surface },
  productRow: { gap: 12, alignItems: 'stretch' },
  loading: { paddingVertical: 55, alignItems: 'center', gap: 10 },
  loadingText: { color: palette.muted, fontSize: 12 },
  emptySearch: { paddingVertical: 44, alignItems: 'center' },
  emptyTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  emptyBody: { marginTop: 6, color: palette.muted, fontSize: 12 },
  retryButton: { alignSelf: 'flex-start', marginTop: 10, marginBottom: 10, backgroundColor: palette.green, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 3 },
  retryText: { color: palette.surface, fontSize: 11, fontWeight: '800' },
  footerLoading: { marginVertical: 18 },
  endNote: { marginTop: 24, color: palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, textAlign: 'center' },
});