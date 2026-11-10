import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import ProductCard from '../../components/ProductCard';
import { Notice, ScreenTitle } from '../../components/Primitives';
import { askCatalogAssistant, isAssistantConfigured } from '../../services/assistant';
import { getProducts } from '../../services/products';
import { pagePadding, palette } from '../../theme';

export default function AssistantScreen() {
  const [intent, setIntent] = useState('recommend');
  const [need, setNeed] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [result, setResult] = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getProducts({ limit: 30, signal: controller.signal })
      .then((data) => setCatalog(data.products))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => setLoadingCatalog(false));
    return () => controller.abort();
  }, []);

  async function submitRequest() {
    if (!need.trim() || working) return;
    setWorking(true);
    setError('');
    setResult(null);
    try {
      const response = await askCatalogAssistant({ intent: `${intent}: ${need.trim()}`, products: catalog });
      setResult(response);
    } catch (requestError) {
      setError(requestError.message || 'The assistant could not complete this request.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.wordmark}>FIELDNOTE<Text style={styles.wordmarkDot}>.</Text></Text>
        <View style={styles.titleBlock}><ScreenTitle eyebrow="A CATALOG-SMART ASSISTANT" title={'The right find,\nwith a little help.'} subtitle="Tell us what you need. Recommendations are checked against today's catalog." /></View>
        {!isAssistantConfigured() ? <View style={styles.notice}><Notice>AI needs a secure Gemini proxy URL in your local environment. No model key belongs in the mobile app.</Notice></View> : null}
        {error ? <View style={styles.notice}><Notice tone="error">{error}</Notice></View> : null}

        <View style={styles.panel}>
          <Text style={styles.fieldLabel}>WHAT SHOULD WE DO?</Text>
          <View style={styles.segment}>
            {['recommend', 'compare'].map((option) => {
              const active = intent === option;
              return <Pressable key={option} onPress={() => setIntent(option)} style={[styles.segmentButton, active && styles.segmentActive]} accessibilityRole="button" accessibilityState={{ selected: active }}><Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option === 'recommend' ? 'Find a match' : 'Compare options'}</Text></Pressable>;
            })}
          </View>
          <Text style={[styles.fieldLabel, { marginTop: 20 }]}>YOUR NEED</Text>
          <TextInput value={need} onChangeText={setNeed} placeholder="A durable everyday bag under $80…" placeholderTextColor={palette.muted} multiline maxLength={180} style={styles.textArea} textAlignVertical="top" accessibilityLabel="Describe what you need" />
          <Text style={styles.characterCount}>{need.length}/180</Text>
          <Pressable disabled={!need.trim() || working || loadingCatalog || !catalog.length} onPress={submitRequest} style={[styles.submit, (!need.trim() || working || loadingCatalog || !catalog.length) && styles.submitDisabled]} accessibilityRole="button">
            {working ? <ActivityIndicator color={palette.surface} /> : <><Sparkles size={16} color={palette.surface} /><Text style={styles.submitText}>Ask the catalog</Text></>}
          </Pressable>
          <Text style={styles.catalogState}>{loadingCatalog ? 'Loading real product context…' : `${catalog.length} real products ready as context`}</Text>
        </View>

        {result ? (
          <View style={styles.results}>
            <Text style={styles.resultKicker}>A FEW GOOD OPTIONS</Text>
            <Text style={styles.summary}>{result.summary}</Text>
            {result.products.map((product) => <View key={product.id} style={styles.resultCard}><ProductCard product={product} width="100%" /></View>)}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: pagePadding, paddingTop: 22, paddingBottom: 32 },
  wordmark: { color: palette.ink, fontSize: 15, fontWeight: '900', letterSpacing: 1.1 },
  wordmarkDot: { color: palette.coral },
  titleBlock: { marginTop: 28, marginBottom: 18 },
  notice: { marginBottom: 12 },
  panel: { marginTop: 6, padding: 16, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 5 },
  fieldLabel: { color: palette.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  segment: { marginTop: 9, padding: 3, flexDirection: 'row', backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  segmentButton: { flex: 1, minHeight: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  segmentActive: { backgroundColor: palette.green },
  segmentText: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  segmentTextActive: { color: palette.surface },
  textArea: { minHeight: 100, marginTop: 9, padding: 12, color: palette.ink, fontSize: 13, lineHeight: 19, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line, borderRadius: 4 },
  characterCount: { marginTop: 6, color: palette.muted, fontSize: 10, textAlign: 'right' },
  submit: { minHeight: 46, marginTop: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green, borderRadius: 4 },
  submitDisabled: { opacity: 0.55 },
  submitText: { color: palette.surface, fontSize: 12, fontWeight: '800' },
  catalogState: { marginTop: 10, color: palette.muted, fontSize: 10, textAlign: 'center' },
  results: { marginTop: 25 },
  resultKicker: { color: palette.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  summary: { marginTop: 8, marginBottom: 14, color: palette.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  resultCard: { width: '48%', marginBottom: 12 },
});